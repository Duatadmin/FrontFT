import { createClient, SupabaseClient } from '@supabase/supabase-js';
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

export const supabase: SupabaseClient<Database> = createClient<Database>(supabaseUrl, supabaseAnonKey); // Typed client

// Helper to get the current user ID
export const getCurrentUserId = async (): Promise<string | null> => {
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting user session:', error);
    return null;
  }
  
  return data.session?.user?.id || null;
};

// Flag to track if we've checked table existence
let checkedTables = false;
let missingTables = false;

// Check if the workout_sessions table exists in the database
export const checkRequiredTables = async (): Promise<boolean> => {
  if (checkedTables) {
    return !missingTables;
  }
  
  try {
    // Try to query the workout_sessions table directly
    const { data: _data, error } = await supabase
      .from('workout_sessions')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Error checking workout_sessions table:', error);
      missingTables = true;
      checkedTables = true;
      return false;
    }
    
    // If we get here, the workout_sessions table exists
    console.log('workout_sessions table exists');
    checkedTables = true;
    missingTables = false;
    return true;
  } catch (err) {
    console.error('Error checking tables:', err);
    missingTables = true;
    checkedTables = true;
    return false;
  }
};

// Helper to check if we should use mock data
export const isMockData = async (): Promise<boolean> => {
  // Check if we're explicitly using mock data
  const useMockDataEnv = import.meta.env.VITE_USE_MOCK_DATA as string | undefined;
  if (useMockDataEnv === 'true') {
    console.log('Using mock data based on environment variable VITE_USE_MOCK_DATA');
    return true;
  }
  
  // Check if workout_sessions table exists
  const workoutSessionsExist = await checkRequiredTables();
  
  // If workout_sessions table doesn't exist, use mock data
  if (!workoutSessionsExist) {
    console.log('workout_sessions table is missing, using mock data');
    return true;
  }
  
  console.log('Using real data from Supabase');
  return false;
};

// Error handling wrapper for Supabase queries
export const handleSupabaseError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred with the database connection';
};
