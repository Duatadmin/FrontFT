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
