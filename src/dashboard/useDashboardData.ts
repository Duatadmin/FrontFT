/**
 * @deprecated This hook is deprecated. Please use useDashboardDataQuery from './useDashboardDataQuery' instead.
 * The new hook uses React Query for better request management, caching, and automatic cleanup.
 * 
 * Migration example:
 * ```typescript
 * // Old:
 * import { useDashboardData } from '../dashboard/useDashboardData';
 * 
 * // New:
 * import { useDashboardData } from '../dashboard/useDashboardDataQuery';
 * ```
 * 
 * The interface remains the same, so it's a drop-in replacement.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { getCurrentUserId, supabase } from '../lib/supabase';
import { fetchWorkoutSessions, calculateWorkoutStats } from '../lib/supabase/dataAdapter';
import type { WorkoutSession } from '../lib/supabase/schema.types';
import { useUserStore } from '../lib/stores/useUserStore';

// Define dashboard data types
export type TimeRange = 'weekly' | 'monthly' | 'yearly' | 'all';

export interface DashboardStats {
  workoutCount: number;
  totalVolume: number;
  streakDays: number;
  completionRate: number;
}

export interface DashboardData {
  recentWorkouts: WorkoutSession[];
  monthlyStats: DashboardStats;
  currentProgram: any | null;
  upcomingWorkouts: any[];
  // Chart data properties (will be empty arrays when no data)
  volumeChart: { date: string; value: number }[];
  prTimeline: { name: string; value: number }[];
  activityBreakdown: { name: string; value: number; color: string }[];
}

export interface DashboardError {
  code: string;
  message: string;
  missingData?: string;
  affectedModule?: string;
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<DashboardError | null>(null);
  const { isLoading: authLoading, user: authUser } = useUserStore();
  // SIMPLIFIED: No AbortController, no complex state tracking
  const fetchData = useCallback(async () => {
    // Don't fetch if auth is still loading
    if (authLoading) {
      console.log('[useDashboardData] Auth still loading, waiting...');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        setError({
          code: 'AUTH_ERROR',
          message: 'User is not authenticated. Please log in to view dashboard.',
          missingData: 'user_id',
          affectedModule: 'dashboard'
        });
        setData(null);
        return;
      }
        // Fetch real data from Supabase using our data adapter
        console.log('Fetching real dashboard data from Supabase for user:', userId);
        
        // Get recent workouts (last 5)
        const workoutsResult = await fetchWorkoutSessions(
          userId,
          undefined,
          undefined,
          undefined
        );
        
        if (!workoutsResult.success || !workoutsResult.data) {
          if (workoutsResult.error) {
            setError({
              code: workoutsResult.error.code,
              message: workoutsResult.error.message,
              missingData: workoutsResult.error.missingData,
              affectedModule: 'recent workouts'
            });
          } else {
            setError({
              code: 'DATA_ERROR',
              message: 'Failed to fetch workout sessions.',
              missingData: 'workout_sessions',
              affectedModule: 'recent workouts'
            });
          }
          
          setData(null);
          return;
        }
        
        const recentWorkouts = workoutsResult.data;
        console.log(`Successfully fetched ${recentWorkouts.length} recent workouts`);
        
        
        // Log what data we're using for each workout
        recentWorkouts.forEach(workout => {
          console.log(`Using workout data - ID: ${workout.id}, Date: ${workout.session_date || workout.created_at}, Focus: ${workout.focus_area}`);
          
          // Validate critical fields
          if (!workout.id) {
            console.warn('Missing data: workout_id in a workout session');
          }
          
          if (!workout.session_date && !workout.created_at) {
            console.warn(`Missing data: timestamp for workout ${workout.id}`);
          }
          
          if (!workout.focus_area) {
            console.warn(`Missing data: focus_area for workout ${workout.id}`);
          }
        });
        
        // Calculate stats for the current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
        
        
        // Get monthly statistics
        const stats = await calculateWorkoutStats(userId, startOfMonth, endOfMonth);
        
        // Construct dashboard data
        const dashboardData: DashboardData = {
          recentWorkouts: recentWorkouts.slice(0, 5), // Limit to 5 most recent
          monthlyStats: {
            workoutCount: stats.totalWorkouts,
            totalVolume: stats.totalVolume,
            streakDays: 0, // Would need additional logic to calculate
            completionRate: 0 // Would need additional logic to calculate
          },
          currentProgram: null, // Will be populated by the program store
          upcomingWorkouts: [], // Would need additional logic to generate
          // Ensure all properties from DashboardData are present
          volumeChart: [], // Initialize as empty or with actual data if available
          prTimeline: [],  // Initialize as empty or with actual data if available
          activityBreakdown: [] // Initialize as empty or with actual data if available
        };
        
        // Final abort check before setting data
        if (abortController.signal.aborted) {
          console.log('[useDashboardData] Request aborted before setting data');
          return;
        }
        
        setData(dashboardData);
        console.log('Dashboard successfully populated with real Supabase data');
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError({
        code: 'UNEXPECTED_ERROR',
        message: `Failed to load dashboard data: ${err instanceof Error ? err.message : 'Unknown error'}`,
        affectedModule: 'dashboard'
      });
      
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [authLoading]);

  useEffect(() => {
    // Only fetch when auth is ready
    if (!authLoading) {
      fetchData();
    }
    
    // No cleanup needed anymore
  }, [authLoading, fetchData]); // Use fetchData as dependency since it's memoized
  
  // REMOVED: Auth state listener - handled globally in main.tsx
  // Having multiple listeners causes accumulation and performance issues

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}
