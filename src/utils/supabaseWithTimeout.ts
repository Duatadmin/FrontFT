import { supabase } from '@/lib/supabase';

/**
 * Simple wrapper for Supabase queries
 * 
 * NOTE: Timeout handling was causing more problems than it solved.
 * Supabase doesn't support AbortController properly, and artificial timeouts
 * were just masking the real issue (duplicate auth listeners causing race conditions).
 * 
 * Now this is just a pass-through that respects external abort signals.
 */
export async function supabaseQueryWithTimeout<T>(
  queryBuilder: (signal: AbortSignal) => any,
  timeoutMs: number = 60000, // Increased to 60s, but mostly ignored
  externalSignal?: AbortSignal
): Promise<{ data: T | null; error: any }> {
  // Check if external signal is already aborted
  if (externalSignal?.aborted) {
    return { data: null, error: new Error('Query aborted by external signal') };
  }

  try {
    // Just execute the query directly
    // Supabase has its own internal timeouts and retry logic
    const controller = new AbortController();
    
    // Link external signal if provided
    if (externalSignal) {
      externalSignal.addEventListener('abort', () => controller.abort(), { once: true });
    }
    
    const result = await queryBuilder(controller.signal);
    return result;
  } catch (error) {
    return { data: null, error };
  }
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