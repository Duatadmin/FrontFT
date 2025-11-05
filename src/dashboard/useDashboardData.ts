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
        
        // Populate volume chart data (last 30 days)
        const volumeChartData: { date: string; value: number }[] = [];
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);
        
        // Group workouts by date and calculate daily volume
        const dailyVolume = new Map<string, number>();
        recentWorkouts.forEach(workout => {
          const date = new Date(workout.session_date || workout.created_at);
          if (date >= last30Days) {
            const dateKey = date.toISOString().split('T')[0];
            const currentVolume = dailyVolume.get(dateKey) || 0;
            
            // Calculate volume from completed exercises
            let workoutVolume = 0;
            if (workout.completed_exercises) {
              Object.values(workout.completed_exercises).forEach((sets: any) => {
                if (Array.isArray(sets)) {
                  sets.forEach((set: any) => {
                    if (set.weight && set.reps) {
                      workoutVolume += set.weight * set.reps;
                    }
                  });
                }
              });
            }
            
            dailyVolume.set(dateKey, currentVolume + workoutVolume);
          }
        });
        
        // Convert to chart format
        Array.from(dailyVolume.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .forEach(([date, volume]) => {
            volumeChartData.push({
              date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              value: Math.round(volume)
            });
          });
        
        // Populate PR timeline (placeholder for now - would need more complex logic)
        const prTimelineData: { name: string; value: number }[] = [];
        
        // Populate activity breakdown by focus area
        const activityBreakdownData: { name: string; value: number; color: string }[] = [];
        const focusAreaCounts = new Map<string, number>();
        
        recentWorkouts.forEach(workout => {
          if (workout.focus_area) {
            const count = focusAreaCounts.get(workout.focus_area) || 0;
            focusAreaCounts.set(workout.focus_area, count + 1);
          }
        });
        
        const colors: Record<string, string> = {
          'Upper Body': '#84cc16',
          'Lower Body': '#8b5cf6',
          'Full Body': '#06b6d4',
          'Core': '#f59e0b',
          'Cardio': '#ef4444',
          'Other': '#6b7280'
        };
        
        Array.from(focusAreaCounts.entries()).forEach(([area, count]) => {
          activityBreakdownData.push({
            name: area,
            value: count,
            color: colors[area] || '#6b7280'
          });
        });
        
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
          // Now populated with real data
          volumeChart: volumeChartData,
          prTimeline: prTimelineData,
          activityBreakdown: activityBreakdownData
        };
        
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
