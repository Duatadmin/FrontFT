import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

// Define a type for a single row from the workout_full_view
// This should align with the columns in your docs/plan_full_view.md
export type WorkoutFullViewRow = Database['public']['Views']['workout_full_view']['Row'];

/**
 * Fetches all rows for a given plan_id from the workout_full_view.
 * @param planId The ID of the plan to fetch.
 * @returns A promise that resolves to an array of WorkoutFullViewRow.
 * @throws Will throw an error if the Supabase query fails.
 */
export const fetchPlanRows = async (userId: string): Promise<WorkoutFullViewRow[]> => {
  if (!userId) {
    console.error('fetchPlanRows: userId is required');
    // Consider throwing an error or returning a more specific error object
    // depending on how TanStack Query and the calling code should handle this.
    return [];
  }

  const { data, error } = await supabase
    .from('workout_full_view')
    .select('*')
    .eq('user_id', userId)
    .eq('plan_status', 'active'); // Assuming 'active' is the status for the current plan

  if (error) {
    console.error('Error fetching active plan rows for userId:', userId, error);
    // Re-throw the error so it can be caught and handled by TanStack Query's error state
    throw error;
  }

  // Ensure 'data' is not null; if it is, return an empty array.
  return data || [];
};

/**
 * Fetches completed workout sessions for a given user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of completed session rows.
 * @throws Will throw an error if the Supabase query fails.
 */
export const fetchCompletedSessions = async (userId: string): Promise<WorkoutFullViewRow[]> => {
  if (!userId) {
    console.error('fetchCompletedSessions: userId is required');
    return [];
  }

  const { data, error } = await supabase
    .from('workout_full_view')
    .select('*')
    .eq('user_id', userId)
    .eq('session_completed', true)
    .order('session_date', { ascending: false });

  if (error) {
    console.error('Error fetching completed sessions for userId:', userId, error);
    throw error;
  }

  return data || [];
};

/**
 * Fetches completed workout sessions for a given user within a specific month.
 * @param userId The ID of the user.
 * @param year The full year (e.g., 2024).
 * @param month The month (0-11, where 0 is January).
 * @returns A promise that resolves to an array of completed session rows for that month.
 * @throws Will throw an error if the Supabase query fails.
 */
export const fetchMonthlySessions = async (userId: string, year: number, month: number): Promise<WorkoutFullViewRow[]> => {
  if (!userId) {
    console.error('fetchMonthlySessions: userId is required');
    return [];
  }

  // Calculate the start and end dates for the given month
  const startDate = new Date(year, month, 1).toISOString();
  const endDate = new Date(year, month + 1, 0).toISOString();

  const { data, error } = await supabase
    .from('workout_full_view')
    .select('*')
    .eq('user_id', userId)
    .eq('session_completed', true)
    .gte('session_date', startDate)
    .lte('session_date', endDate)
    .order('session_date', { ascending: true });

  if (error) {
    console.error(`Error fetching sessions for ${year}-${month + 1} for userId:`, userId, error);
    throw error;
  }

  return data || [];
};

