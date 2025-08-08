import { createClient } from '@supabase/supabase-js';
import Cookies from 'js-cookie';
import type { Database as GenDatabase } from './supabase/schema.types'; // Generated types

// Fix PostgrestVersion type mismatch between generated types and supabase-js
type DatabaseFixed = Omit<GenDatabase, '__InternalSupabase'> & {
  __InternalSupabase: { PostgrestVersion: '12' }
};

// Type definitions (moved from supabaseClient.ts)
export type TrainingPlan = {
  id: string;
  user_id: string;
  name: string;
  days: Record<string, any>; // jsonb type in Supabase
};

export type WorkoutSession = {
  id: string;
  user_id: string;
  training_plan_id: string;
  timestamp: string;
  duration_minutes: number;
  exercises_completed: string[];
  total_sets: number;
  total_reps: number;
  overall_difficulty: number;
  user_feedback: string;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = 'Missing Supabase credentials. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.';
  console.error(errorMessage);
  throw new Error(errorMessage);
}

// Global fetch wrapper with timeout and no-store to avoid hanging requests after standby
const DEFAULT_FETCH_TIMEOUT_MS = 12000;

function timeoutFetchFactory(defaultTimeoutMs = DEFAULT_FETCH_TIMEOUT_MS) {
  return async function timeoutFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutMs = defaultTimeoutMs;
    const timeoutId = setTimeout(() => {
      try {
        const url = typeof input === 'string' ? input : (input as Request).url ?? String(input);
        console.error(`[supabase:fetch] Aborting request after ${timeoutMs}ms`, url);
      } catch {}
      controller.abort();
    }, timeoutMs);

    // If caller supplied a signal, link it so either aborts the request
    if (init?.signal) {
      const externalSignal = init.signal as AbortSignal;
      if (externalSignal.aborted) {
        controller.abort();
      } else {
        externalSignal.addEventListener('abort', () => controller.abort(), { once: true });
      }
    }

    try {
      const finalInit: RequestInit = {
        ...init,
        // Merge/override with our combined signal
        signal: controller.signal,
        // Avoid returning cached/opaque responses from SW or HTTP cache
        cache: 'no-store'
      };
      return await fetch(input as any, finalInit);
    } finally {
      clearTimeout(timeoutId);
    }
  };
}

const timeoutFetch = timeoutFetchFactory();

export const HybridStorage = {
  getItem: (k: string) => Cookies.get(k) ?? (typeof window !== 'undefined' ? window.localStorage.getItem(k) : null),
  setItem: (k: string, v: string) => {
    Cookies.set(k, v, { sameSite: 'Lax', secure: true });
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(k, v);
      } catch (error) {
        console.warn(`[HybridStorage] Error setting localStorage item ${k}:`, error);
      }
    }
  },
  removeItem: (k: string) => { 
    Cookies.remove(k); 
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(k); 
      } catch (error) {
        console.warn(`[HybridStorage] Error removing localStorage item ${k}:`, error);
      }
    }
  }
};

export const supabase = createClient<DatabaseFixed>(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      storage: HybridStorage,
      flowType: 'pkce',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    global: {
      // Ensure all Supabase requests are time-limited and skip caches
      fetch: timeoutFetch,
    },
  }
); // Typed client

// Expose Supabase client globally in development for easier debugging
if (import.meta.env.MODE !== 'production' && typeof window !== 'undefined') {
  // @ts-ignore – attach client to window
  (window as any).supabase = supabase;
  console.log('[DevHelper] window.supabase is now available');
}

// Global Auth State Change Logger
if (typeof window !== 'undefined' && !(globalThis as any).__SB_AUTH_SUB__) {
  console.log('[AUTH] Subscribing to onAuthStateChange');
  (globalThis as any).__SB_AUTH_SUB__ = supabase.auth.onAuthStateChange(
    (event, session) => {
      console.log(
        '[AUTH] event:', event,
        'session status:', session ? 'exists' : 'null',
        'access_token:', session?.access_token?.slice(0, 10) + (session?.access_token ? '...' : ''),
        'user_id:', session?.user?.id
      );
    }
  ).data.subscription;
  if (!(globalThis as any).__SB_AUTH_SUB__) {
    console.error('[AUTH] Failed to subscribe to onAuthStateChange!');
  }
}

// DevTools Helper to show current session
if (typeof window !== 'undefined') {
  (window as any).__showSession = async () => {
    console.log('[DevHelper] __showSession() called');
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('[DevHelper] Error getting session:', error);
      return { error };
    }
    console.log('[DevHelper] Current session:', data.session);
    return data.session;
  };
  console.log('[DevHelper] __showSession() is now available in the console.');
}

// Helper to get the current user ID
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    // First try to get from the session directly
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      // Check if it's a network/temp error vs auth error
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        console.warn('[getCurrentUserId] Network error getting session, will retry:', error);
        // Try once more after a brief delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        const retry = await supabase.auth.getSession();
        if (retry.data?.session?.user?.id) {
          return retry.data.session.user.id;
        }
      }
      console.error('[getCurrentUserId] Error getting session:', error);
      // Clear subscription cache on auth errors
      const { default: useUserStore } = await import('./stores/useUserStore');
      const store = useUserStore.getState();
      if (store.subscriptionStatus?.isActive) {
        console.warn('[getCurrentUserId] Clearing subscription status due to auth error');
        sessionStorage.removeItem('subscription_status');
        store.subscriptionStatus = null;
      }
      return null;
    }
    
    // If no session, try to refresh it (session might have expired)
    if (!data.session) {
      console.log('[getCurrentUserId] No session found, attempting refresh...');
      const { data: refreshData } = await supabase.auth.refreshSession();
      if (refreshData.session?.user?.id) {
        console.log('[getCurrentUserId] Session refreshed successfully');
        return refreshData.session.user.id;
      }
      // Clear subscription cache if no valid session
      const { default: useUserStore } = await import('./stores/useUserStore');
      const store = useUserStore.getState();
      if (store.subscriptionStatus?.isActive) {
        console.warn('[getCurrentUserId] Clearing subscription status - no valid session');
        sessionStorage.removeItem('subscription_status');
        store.subscriptionStatus = null;
      }
      return null;
    }
    
    const userId = data.session.user.id;
    
    // Sync with store if needed
    const { default: useUserStore } = await import('./stores/useUserStore');
    const store = useUserStore.getState();
    
    if (!store.user || store.user.id !== userId) {
      console.log('[getCurrentUserId] Syncing store with session user');
      store.user = data.session.user;
      store.isAuthenticated = true;
    }
    
    return userId;
  } catch (err) {
    console.error('[getCurrentUserId] Unexpected error:', err);
    return null;
  }
};

// Helper to check if required tables exist in the database
export const checkRequiredTables = async (): Promise<boolean> => {
  try {
    // Try to query the workout_sessions table directly
    const { data: _data, error } = await supabase
      .from('workout_sessions')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Error checking workout_sessions table:', error);
      return false;
    }
    
    // If we get here, the workout_sessions table exists
    console.log('workout_sessions table exists');
    return true;
  } catch (err) {
    console.error('Error checking tables:', err);
    return false;
  }
};

// Error handling wrapper for Supabase queries
export const handleSupabaseError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred with the database connection';
};
