import { supabase } from '@/lib/supabase';

/**
 * Wrapper for Supabase queries with timeout handling
 * Prevents queries from hanging indefinitely
 */
export async function supabaseQueryWithTimeout<T>(
  queryBuilder: (signal: AbortSignal) => any,
  timeoutMs: number = 10000,
  externalSignal?: AbortSignal
): Promise<{ data: T | null; error: any }> {
  return new Promise((resolve) => {
    let timeoutId: NodeJS.Timeout;
    let settled = false;

    const controller = new AbortController();
    // Link external signal if provided
    if (externalSignal) {
      if (externalSignal.aborted) controller.abort();
      else externalSignal.addEventListener('abort', () => controller.abort(), { once: true });
    }

    // Set timeout that aborts the underlying request
    timeoutId = setTimeout(() => {
      if (!settled) {
        console.error('[supabaseQueryWithTimeout] Query timed out after', timeoutMs, 'ms');
        controller.abort();
      }
    }, timeoutMs);

    // Execute query with our abort signal
    Promise.resolve(queryBuilder(controller.signal))
      .then((result: any) => {
        if (!settled) {
          settled = true;
          clearTimeout(timeoutId);
          resolve(result);
        }
      })
      .catch((error: any) => {
        if (!settled) {
          settled = true;
          clearTimeout(timeoutId);
          resolve({ data: null, error });
        }
      });
  });
}

/**
 * Helper to check if Supabase client is ready
 */
export async function waitForSupabaseReady(maxWaitMs: number = 8000): Promise<boolean> {
  const start = Date.now();
  let attempt = 0;

  while (Date.now() - start < maxWaitMs) {
    attempt++;
    try {
      // Use a more forgiving timeout to accommodate refresh/network after standby
      const { data: { session }, error } = await getSessionWithTimeout(Math.min(3000, maxWaitMs));
      if (!error) {
        console.log('[waitForSupabaseReady] Ready on attempt', attempt, 'session:', !!session);
        return true;
      }
    } catch {
      // Ignore and retry
    }
    const delay = Math.min(250 * attempt, 750);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  console.warn('[waitForSupabaseReady] Gave up after', Date.now() - start, 'ms');
  return false;
}

/**
 * Generic timeout wrapper for async calls (throws on timeout)
 */
export async function callWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number = 10000,
  label: string = 'call'
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      console.error(`[supabaseWithTimeout] ${label} timed out after ${timeoutMs} ms`);
      reject(new Error(`${label} timed out`));
    }, timeoutMs);

    fn()
      .then((res) => {
        clearTimeout(timeoutId);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        reject(err);
      });
  });
}

/**
 * Timeout-protected auth.getSession
 */
export function getSessionWithTimeout(timeoutMs: number = 6000) {
  return callWithTimeout(() => supabase.auth.getSession(), timeoutMs, 'getSession');
}

/**
 * Timeout-protected auth.refreshSession
 */
export function refreshSessionWithTimeout(timeoutMs: number = 8000) {
  return callWithTimeout(() => supabase.auth.refreshSession(), timeoutMs, 'refreshSession');
}