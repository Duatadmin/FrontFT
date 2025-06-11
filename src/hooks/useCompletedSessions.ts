import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useUserStore } from '@/lib/stores/useUserStore';
import { fetchCompletedSessions, type WorkoutFullViewRow } from '@/api/workoutPlanService';
import { rowsToSessionHistory, type CompletedSession } from '@/utils/rowsToSessionHistory';

export type UseCompletedSessionsResult = UseQueryResult<CompletedSession[], Error>;

/**
 * Custom hook to fetch and transform completed workout sessions.
 */
export const useCompletedSessions = (): UseCompletedSessionsResult => {
  const { user } = useUserStore.getState();
  const userId = user?.id;

  return useQuery<WorkoutFullViewRow[], Error, CompletedSession[]>({ 
    queryKey: ['completedSessions', userId],
    queryFn: async () => {
      if (!userId) {
        return [];
      }
      return fetchCompletedSessions(userId);
    },
    select: rowsToSessionHistory,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId,
  });
};
