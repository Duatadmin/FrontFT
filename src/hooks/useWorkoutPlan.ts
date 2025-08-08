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
  const user = useUserStore((state) => state.user); // Subscribe to user state changes
  const isLoading = useUserStore((state) => state.isLoading);
  const userId = user?.id;

  const query = useQuery<WorkoutFullViewRow[], Error, WorkoutPlan | null, readonly [string, string | null | undefined]>({
    queryKey: ['userActivePlan', userId] as const, // Updated queryKey
    queryFn: async ({ signal }) => {
      if (!userId) {
        // If userId is not available, return an empty array.
        // The query is also disabled via the `enabled` option.
        return [];
      }
      console.log('[useWorkoutPlan] Fetching plan for user:', userId);
      return fetchPlanRows(userId);
    },
    select: rowsToPlanTree, // Transforms the fetched data
    staleTime: 1000 * 60, // 1 minute
    enabled: !isLoading && !!userId, // Only run the query if auth is loaded and userId is truthy
    retry: (failureCount, error: any) => {
      const name = error?.name || '';
      const msg = (error?.message || '').toLowerCase();
      // Do not retry on aborts/cancellations
      if (name === 'AbortError' || msg.includes('aborted') || msg.includes('cancelled')) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // REMOVED: Auth state listener - handled globally in main.tsx
  // Having multiple listeners causes race conditions and connection pool exhaustion

  return query;
};
