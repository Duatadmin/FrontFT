import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useUserStore } from '@/lib/stores/useUserStore';
import { fetchCompletedSessions } from '@/api/workoutPlanService';
import { rowsToSessionHistory, type CompletedSession } from '@/utils/rowsToSessionHistory';

export type UseCompletedSessionsResult = UseQueryResult<CompletedSession[], Error>;

/**
 * Custom hook to fetch and transform completed workout sessions.
 */
export const useCompletedSessions = (): UseCompletedSessionsResult => {
  const { user } = useUserStore.getState();
  const userId = user?.id;

  return useQuery({
    queryKey: ['completedSessions', userId],
    queryFn: async () => {
      console.log('[useCompletedSessions] Fetching with userId:', userId);
      if (!userId) {
        return [];
      }
      const rows = await fetchCompletedSessions(userId);
      console.log('[useCompletedSessions] Raw rows from Supabase:', rows);
      return rows;
    },
    select: (rows) => {
      const processedSessions = rowsToSessionHistory(rows);
      console.log('[useCompletedSessions] Processed sessions:', processedSessions);
      return processedSessions;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId,
  });
};
