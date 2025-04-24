/**
 * Unified Supabase Client
 * 
 * This is the single source of truth for Supabase connection in the application.
 * It provides the authenticated client, helper functions, and proper error handling.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './schema.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Check your .env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Create a single instance of the Supabase client
export const supabase: SupabaseClient<Database> = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper to get the current user ID with fallback for development
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting user session:', error);
      // Use the specific test user ID in development
      return import.meta.env.DEV ? '792ee0b8-5ba2-40a5-8f35-ab1bff798908' : null;
    }
    
    return data.session?.user?.id || (import.meta.env.DEV ? '792ee0b8-5ba2-40a5-8f35-ab1bff798908' : null);
  } catch (err) {
    console.error('Error in getCurrentUserId:', err);
    return import.meta.env.DEV ? '792ee0b8-5ba2-40a5-8f35-ab1bff798908' : null;
  }
};

// Flag to track if we've checked table existence
let checkedTables = false;
let missingTables = false;

// The primary table we need for the app to function
const primaryTable = 'workout_sessions';

// Check if the workout_sessions table exists in the database
export const checkRequiredTables = async (): Promise<boolean> => {
  if (checkedTables) {
    return !missingTables;
  }
  
  try {
    // Try to query the workout_sessions table directly
    const { data, error } = await supabase
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
  const useMockData = import.meta.env.VITE_USE_MOCK_DATA as string | undefined;
  if (useMockData === 'true') {
    console.log('Using mock data based on environment variable');
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
