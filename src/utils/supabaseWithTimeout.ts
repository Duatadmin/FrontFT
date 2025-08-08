import { supabase } from '@/lib/supabase';

/**
 * Wrapper for Supabase queries with timeout handling
 * Prevents queries from hanging indefinitely
 */
export async function supabaseQueryWithTimeout<T>(
  queryBuilder: () => any,
  timeoutMs: number = 10000
): Promise<{ data: T | null; error: any }> {
  return new Promise((resolve) => {
    let timeoutId: NodeJS.Timeout;
    let resolved = false;

    // Set timeout
    timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.error('[supabaseQueryWithTimeout] Query timed out after', timeoutMs, 'ms');
        resolve({
          data: null,
          error: new Error(`Query timed out after ${timeoutMs}ms`)
        });
      }
    }, timeoutMs);

    // Execute query
    queryBuilder()
      .then((result: any) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve(result);
        }
      })
      .catch((error: any) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve({ data: null, error });
        }
      });
  });
}

/**
 * Helper to check if Supabase client is ready
 */
export async function waitForSupabaseReady(maxWaitMs: number = 5000): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitMs) {
    try {
      // Try to get the session - if this works, Supabase is ready
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error) {
        console.log('[waitForSupabaseReady] Supabase is ready, session:', !!session);
        return true;
      }
    } catch (e) {
      // Supabase not ready yet
    }
    
    // Wait 100ms before trying again
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.error('[waitForSupabaseReady] Timeout waiting for Supabase to be ready');
  return false;
}