import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useEffect } from 'react';
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

// Define a type for the hook's return value for clarity
export type UseDashboardDataQueryResult = UseQueryResult<DashboardData, DashboardError>;

/**
 * Fetches dashboard data using React Query
 * This replaces the old useDashboardData hook with proper request management
 */
async function fetchDashboardData(userId: string): Promise<DashboardData> {
  console.log('[useDashboardDataQuery] Fetching dashboard data for user:', userId);
  
  // Get recent workouts (last 5)
  const workoutsResult = await fetchWorkoutSessions(
    userId,
    undefined,
    undefined,
    undefined
  );
  
  if (!workoutsResult.success || !workoutsResult.data) {
    throw {
      code: workoutsResult.error?.code || 'DATA_ERROR',
      message: workoutsResult.error?.message || 'Failed to fetch workout sessions.',
      missingData: workoutsResult.error?.missingData || 'workout_sessions',
      affectedModule: 'recent workouts'
    } as DashboardError;
  }
  
  const recentWorkouts = workoutsResult.data;
  console.log(`[useDashboardDataQuery] Successfully fetched ${recentWorkouts.length} recent workouts`);
  
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
  
  console.log('[useDashboardDataQuery] Dashboard data fetched successfully');
  return dashboardData;
}

/**
 * Custom hook to fetch and manage dashboard data using React Query
 * Provides automatic request deduplication, caching, and proper cleanup
 */
export function useDashboardDataQuery(): UseDashboardDataQueryResult {
  const user = useUserStore((state) => state.user);
  const isLoading = useUserStore((state) => state.isLoading);
  const userId = user?.id;

  const query = useQuery<DashboardData, DashboardError>({
    queryKey: ['dashboardData', userId],
    queryFn: async () => {
      if (!userId) {
        throw {
          code: 'AUTH_ERROR',
          message: 'User is not authenticated. Please log in to view dashboard.',
          missingData: 'user_id',
          affectedModule: 'dashboard'
        } as DashboardError;
      }
      
      return fetchDashboardData(userId);
    },
    // Only run the query if auth is loaded and userId is truthy
    enabled: !isLoading && !!userId,
    // Consider data stale after 1 minute
    staleTime: 1000 * 60,
    // Cache data for 5 minutes
    gcTime: 1000 * 60 * 5,
    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.code === 'AUTH_ERROR') {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // REMOVED: Auth state listener - handled globally in main.tsx
  // Having multiple listeners causes accumulation and performance issues
  // The global listener in main.tsx will invalidate queries on TOKEN_REFRESHED

  return query;
}

// Export a helper to get the exact same interface as the old hook
export function useDashboardData() {
  const query = useDashboardDataQuery();
  
  return {
    data: query.data || null,
    loading: query.isLoading,
    error: query.error || null,
    refetch: query.refetch
  };
}