import { createClient } from '@supabase/supabase-js';
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

// Removed timeoutFetch wrapper - it was causing AbortController memory leaks
// Supabase has its own timeout and retry logic built in

// Removed HybridStorage - using default localStorage

// Create Supabase client with minimal configuration
// No singleton pattern, no complex storage, just basics
export const supabase = createClient<DatabaseFixed>(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

// Expose Supabase client globally in development for easier debugging
if (import.meta.env.MODE !== 'production' && typeof window !== 'undefined') {
  // @ts-ignore – attach client to window
  (window as any).supabase = supabase;
  console.log('[DevHelper] window.supabase is now available');
}

// REMOVED: Global auth logger - redundant with main.tsx listener
// Having multiple global listeners causes performance issues

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

// Simple helper to get the current user ID
export const getCurrentUserId = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
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
