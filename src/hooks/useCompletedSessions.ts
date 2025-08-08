import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useUserStore } from '@/lib/stores/useUserStore';
import { fetchCompletedSessions } from '@/api/workoutPlanService';
import { rowsToSessionHistory, type CompletedSession } from '@/utils/rowsToSessionHistory';
import { supabase } from '@/lib/supabase';


export type UseCompletedSessionsResult = UseQueryResult<CompletedSession[], Error>;

/**
 * Custom hook to fetch and transform completed workout sessions.
 */
export const useCompletedSessions = (): UseCompletedSessionsResult => {
  const user = useUserStore((state) => state.user);
  const isLoading = useUserStore((state) => state.isLoading);
  const userId = user?.id;

  const query = useQuery({
    queryKey: ['completedSessions', userId],
    queryFn: async ({ signal }) => {
      console.log('[useCompletedSessions] Fetching with userId:', userId);
      if (!userId) {
        return [];
      }
      const rows = await fetchCompletedSessions(userId, { signal: signal as AbortSignal, timeoutMs: 12000 });
      console.log('[useCompletedSessions] Raw rows from Supabase:', rows);
      return rows;
    },
    select: (rows) => {
      const processedSessions = rowsToSessionHistory(rows);
      console.log('[useCompletedSessions] Processed sessions:', processedSessions);
      return processedSessions;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !isLoading && !!userId, // Only fetch when auth is loaded and userId exists
    retry: (failureCount, error: any) => {
      const name = error?.name || '';
      const msg = (error?.message || '').toLowerCase();
      // Do not retry on aborts/cancellations
      if (name === 'AbortError' || msg.includes('aborted') || msg.includes('cancelled')) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Listen for auth state changes and refetch
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('[useCompletedSessions] Token refreshed, refetching sessions');
        // Add a small delay to let the new token propagate
        setTimeout(() => {
          query.refetch();
        }, 100);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [query]);

  return query;
};
