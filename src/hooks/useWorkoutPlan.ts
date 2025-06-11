import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useUserStore } from '@/lib/stores/useUserStore'; // Import useUserStore
import { fetchPlanRows, type WorkoutFullViewRow } from '@/api/workoutPlanService';
import { rowsToPlanTree, type WorkoutPlan } from '@/utils/rowsToPlanTree';

// Define a type for the hook's return value for clarity
export type UseWorkoutPlanResult = UseQueryResult<WorkoutPlan | null, Error>;

/**
 * Custom hook to fetch and transform workout plan data.
 * Uses TanStack Query for data fetching, caching, and state management.
 * Fetches raw plan rows using fetchPlanRows and transforms them into a nested structure
 * using rowsToPlanTree.
 *
 * @param planId The ID of the workout plan to fetch. Can be null or undefined if no plan is selected.
 * @returns An object containing the query state (data, isLoading, error, etc.).
 *          The `data` property will be the transformed WorkoutPlan object or null.
 */
export const useWorkoutPlan = (): UseWorkoutPlanResult => { // planId prop removed
  const { user } = useUserStore.getState(); // Get user from store
  const userId = user?.id;

  return useQuery<WorkoutFullViewRow[], Error, WorkoutPlan | null, readonly [string, string | null | undefined]>({
    queryKey: ['userActivePlan', userId] as const, // Updated queryKey
    queryFn: async () => {
      if (!userId) {
        // If userId is not available, return an empty array.
        // The query is also disabled via the `enabled` option.
        return [];
      }
      return fetchPlanRows(userId);
    },
    select: rowsToPlanTree, // Transforms the fetched data
    staleTime: 1000 * 60, // 1 minute
    enabled: !!userId, // Only run the query if userId is truthy
    // Optional: Add other TanStack Query options as needed, e.g.,
    // refetchOnWindowFocus: false,
    // retry: 1, // Number of retries on failure
  });
};
