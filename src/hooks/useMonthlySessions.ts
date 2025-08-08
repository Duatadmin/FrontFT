import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useUserStore } from '@/lib/stores/useUserStore';
import { fetchMonthlySessions } from '@/api/workoutPlanService';
import { rowsToSessionHistory, type CompletedSession } from '@/utils/rowsToSessionHistory';

export type UseMonthlySessionsResult = UseQueryResult<CompletedSession[], Error>;

/**
 * Custom hook to fetch completed workout sessions for a specific month.
 * @param year The full year.
 * @param month The month (0-11).
 */
export const useMonthlySessions = (year: number, month: number): UseMonthlySessionsResult => {
  const user = useUserStore((state) => state.user);
  const isLoading = useUserStore((state) => state.isLoading);
  const userId = user?.id;

  const query = useQuery({
    // The query key is an array that uniquely identifies this query.
    // When year, month, or userId changes, react-query will refetch the data.
    queryKey: ['monthlySessions', userId, year, month],
    queryFn: async () => {
      if (!userId) {
        console.log('[useMonthlySessions] No user ID, returning empty array.');
        return [];
      }
      console.log(`[useMonthlySessions] Fetching sessions for ${year}-${month + 1}`);
      const rows = await fetchMonthlySessions(userId, year, month);
      console.log(`[useMonthlySessions] Fetched ${rows.length} sessions.`);
      // The rowsToSessionHistory function expects a different structure for sessionTitle and durationMinutes.
      // We need to adapt the transformation or the data source. For now, we'll pass it as is
      // and correct the SessionCard display later if needed.
      // The key is to get the data structure right.
      const transformedData = rowsToSessionHistory(rows);
      return transformedData;
    },
    // staleTime helps prevent unnecessary refetches. Data is considered fresh for 5 minutes.
    staleTime: 1000 * 60 * 5, // 5 minutes
    // The query will only run if auth is loaded and userId is available.
    enabled: !isLoading && !!userId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // REMOVED: Auth state listener - handled globally in main.tsx
  // Having multiple listeners causes accumulation and performance issues

  return query;
};
