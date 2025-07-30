import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Cookies from 'js-cookie';
import { Database } from './supabase/schema.types'; // Added Database type import

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

export const supabase: SupabaseClient<Database> = createClient<Database>(
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
  // First check if we can get the user from the store (if it's already loaded)
  const { default: useUserStore } = await import('./stores/useUserStore');
  const store = useUserStore.getState();
  
  // If the store is still loading, wait for it to complete (with timeout)
  if (store.isLoading) {
    console.log('[getCurrentUserId] Waiting for auth initialization...');
    
    // Subscribe to store changes and wait for isLoading to become false
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.warn('[getCurrentUserId] Timeout waiting for auth, checking session directly');
        supabase.auth.getSession().then(({ data, error }) => {
          if (error) {
            console.error('[getCurrentUserId] Error getting session after timeout:', error);
            resolve(null);
          } else {
            resolve(data.session?.user?.id || null);
          }
        });
      }, 5000); // 5 second timeout
      
      const unsubscribe = useUserStore.subscribe(
        (state) => state.isLoading,
        (isLoading) => {
          if (!isLoading) {
            clearTimeout(timeout);
            unsubscribe();
            const currentState = useUserStore.getState();
            
            // If user is in the store, use it directly
            if (currentState.user) {
              console.log('[getCurrentUserId] Auth initialized, returning user from store');
              resolve(currentState.user.id);
            } else {
              // Otherwise fall back to checking the session
              console.log('[getCurrentUserId] Auth initialized, no user in store, checking session');
              supabase.auth.getSession().then(({ data, error }) => {
                if (error) {
                  console.error('[getCurrentUserId] Error getting session:', error);
                  resolve(null);
                } else {
                  resolve(data.session?.user?.id || null);
                }
              });
            }
          }
        }
      );
    });
  }
  
  // If not loading, check if user is already in the store
  if (store.user) {
    console.log('[getCurrentUserId] Returning user from store (already loaded)');
    return store.user.id;
  }
  
  // Fall back to getting session directly
  console.log('[getCurrentUserId] No user in store, checking session directly');
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('[getCurrentUserId] Error getting session:', error);
    return null;
  }
  
  return data.session?.user?.id || null;
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
