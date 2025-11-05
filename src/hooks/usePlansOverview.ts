import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { supabase, getCurrentUserId } from '@/lib/supabase';
import { PlanOverview } from '@/types/plan';
import { useUserStore } from '@/lib/stores/useUserStore';

/**
 * Fetches all training plans for the current user
 */
const fetchPlansOverview = async (): Promise<PlanOverview[]> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    console.log('[usePlansOverview] No user ID available');
    return [];
  }

  try {
    // Fetch all training plans for the user
    const { data: plans, error } = await supabase
      .from('modular_training_plan')
      .select(`
        id,
        name,
        split_type,
        goal,
        status,
        created_at,
        start_date,
        end_date,
        sessions_completed,
        total_sessions,
        week_start
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[usePlansOverview] Error fetching plans:', error);
      throw error;
    }

    if (!plans || plans.length === 0) {
      console.log('[usePlansOverview] No plans found for user');
      return [];
    }

    // Transform the data to match PlanOverview interface
    const plansOverview: PlanOverview[] = plans.map(plan => {
      const totalWeeks = plan.end_date && plan.start_date
        ? Math.ceil((new Date(plan.end_date).getTime() - new Date(plan.start_date).getTime()) / (7 * 24 * 60 * 60 * 1000))
        : 0;

      const completionPct = plan.total_sessions > 0
        ? Math.round((plan.sessions_completed / plan.total_sessions) * 100)
        : 0;

      return {
        id: plan.id,
        name: plan.name || 'Untitled Plan',
        split_type: plan.split_type || 'unknown',
        goal_type: plan.goal || 'general',
        status: plan.status || 'inactive',
        completion_pct: completionPct,
        total_weeks: totalWeeks,
        total_sessions: plan.total_sessions || 0,
        sessions_completed: plan.sessions_completed || 0,
        week_start: plan.week_start,
        next_session_date: null, // Would need additional logic to calculate
      };
    });

    console.log(`[usePlansOverview] Successfully fetched ${plansOverview.length} plans`);
    return plansOverview;
  } catch (error) {
    console.error('[usePlansOverview] Error in fetchPlansOverview:', error);
    throw error;
  }
};

/**
 * Custom hook to fetch all training plans for the current user
 * Uses TanStack Query for caching and state management
 */
export const usePlansOverview = (): UseQueryResult<PlanOverview[], Error> => {
  const { isLoading: authLoading, user: authUser } = useUserStore();
  
  const query = useQuery<PlanOverview[], Error>({
    queryKey: ['plansOverview', authUser?.id],
    queryFn: fetchPlansOverview,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !authLoading && !!authUser, // Only fetch when auth is ready and user exists
  });

  // REMOVED: Auth state listener - handled globally in main.tsx
  // Having multiple listeners causes accumulation and performance issues

  return query;
};