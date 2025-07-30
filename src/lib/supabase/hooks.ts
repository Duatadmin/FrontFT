/**
 * Supabase SWR Hooks
 * 
 * Custom hooks that use SWR for data fetching with proper caching,
 * revalidation, and error handling when working with Supabase data.
 */
import useSWR from 'swr';
import { useCallback, useEffect } from 'react';
import { supabase, getCurrentUserId, handleSupabaseError } from '../supabase';
import { useUserStore } from '../stores/useUserStore';
import { 
  TrainingPlan, 
  WorkoutSession, 
  Goal,
  ProgressPhoto, 
  WeeklyReflection,
  User
} from './schema.types';

// Type for SWR responses from Supabase
interface SupabaseResponse<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  mutate: () => void;
}

// Helper to create a date range filter
export const createDateRangeFilter = (from: string, to: string) => {
  return {
    gte: from,
    lte: to
  };
};

/**
 * Hook to fetch the current user's data
 */
export const useCurrentUser = (): SupabaseResponse<User> => {
  const { isLoading: authLoading, user: authUser } = useUserStore();
  
  const fetcher = useCallback(async () => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }, []);
  
  const { data, error, isLoading, mutate } = useSWR(
    authLoading ? null : 'current-user', // Don't fetch while auth is loading
    fetcher
  );
  
  // Revalidate when auth state changes
  useEffect(() => {
    if (!authLoading && authUser) {
      mutate();
    }
  }, [authLoading, authUser, mutate]);
  
  return {
    data,
    error: error ? (error as Error).message : null,
    isLoading: authLoading || isLoading,
    mutate
  };
};

/**
 * Hook to fetch workout sessions for a user with filters
 */
export const useWorkoutSessions = (
  dateRange?: { from: string; to: string },
  focusArea?: string
): SupabaseResponse<WorkoutSession[]> => {
  const { isLoading: authLoading, user: authUser } = useUserStore();
  
  const fetcher = useCallback(async () => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) return [];
      
      let query = supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('session_completed', true)
        .order('session_date', { ascending: false });
      
      // Apply date range filter if provided
      if (dateRange) {
        query = query
          .gte('session_date', dateRange.from)
          .lte('session_date', dateRange.to);
      }
      
      // Apply focus area filter if provided
      if (focusArea) {
        query = query.eq('focus_area', focusArea);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }, [dateRange, focusArea]);
  
  const { data, error, isLoading, mutate } = useSWR(
    authLoading ? null : ['workout-sessions', dateRange?.from, dateRange?.to, focusArea].join('-'),
    fetcher
  );
  
  // Revalidate when auth state changes
  useEffect(() => {
    if (!authLoading && authUser) {
      mutate();
    }
  }, [authLoading, authUser, mutate]);
  
  return {
    data: data || null,
    error: error ? (error as Error).message : null,
    isLoading: authLoading || isLoading,
    mutate
  };
};

/**
 * Hook to fetch the current active training plan
 */
export const useCurrentTrainingPlan = (): SupabaseResponse<TrainingPlan> => {
  const fetcher = useCallback(async () => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('modular_training_plan')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }, []);
  
  const { data, error, isLoading, mutate } = useSWR('current-training-plan', fetcher);
  
  return {
    data,
    error: error ? (error as Error).message : null,
    isLoading,
    mutate
  };
};

// TODO: This hook is deprecated and needs to be refactored for the new modular schema.
// The 'goals' table no longer exists.
// export const useGoals = (): SupabaseResponse<Goal[]> => {
//   const fetcher = useCallback(async () => {
//     try {
//       const userId = await getCurrentUserId();
//       if (!userId) return null;
//
//       const { data, error } = await supabase
//         .from('goals')
//         .select('*')
//         .eq('user_id', userId);
//
//       if (error) throw error;
//       return data;
//     } catch (error) {
//       throw new Error(handleSupabaseError(error));
//     }
//   }, []);
//
//   const { data, error, isLoading, mutate } = useSWR('goals', fetcher);
//
//   return { data, error: error?.message || null, isLoading, mutate };
// };

// TODO: This hook is deprecated and needs to be refactored for the new modular schema.
// The 'weekly_reflections' table no longer exists.
// export const useCurrentWeekReflection = (): SupabaseResponse<WeeklyReflection> => {
//   const fetcher = useCallback(async () => {
//     try {
//       const userId = await getCurrentUserId();
//       if (!userId) return null;
//
//       const today = new Date();
//       const startOfWeek = new Date(
//         today.setDate(today.getDate() - today.getDay())
//       );
//       const endOfWeek = new Date(
//         today.setDate(today.getDate() - today.getDay() + 6)
//       );
//
//       const { data, error } = await supabase
//         .from('weekly_reflections')
//         .select('*')
//         .eq('user_id', userId)
//         .gte('week_start_date', startOfWeek.toISOString())
//         .lte('week_start_date', endOfWeek.toISOString())
//         .single();
//
//       if (error && error.code !== 'PGRST116') throw error;
//       return data;
//     } catch (error) {
//       throw new Error(handleSupabaseError(error));
//     }
//   }, []);
//
//   const { data, error, isLoading, mutate } = useSWR(
//     'currentWeekReflection',
//     fetcher
//   );
//
//   return { data, error: error?.message || null, isLoading, mutate };
// };

// TODO: This hook is deprecated and needs to be refactored for the new modular schema.
// The 'progress_photos' table no longer exists.
// export const useProgressPhotos = (): SupabaseResponse<ProgressPhoto[]> => {
//   const fetcher = useCallback(async () => {
//     try {
//       const userId = await getCurrentUserId();
//       if (!userId) return null;
//
//       const { data, error } = await supabase
//         .from('progress_photos')
//         .select('*')
//         .eq('user_id', userId)
//         .order('created_at', { ascending: false });
//
//       if (error) throw error;
//       return data;
//     } catch (error) {
//       throw new Error(handleSupabaseError(error));
//     }
//   }, []);
//
//   const { data, error, isLoading, mutate } = useSWR('progressPhotos', fetcher);
//
//   return { data, error: error?.message || null, isLoading, mutate };
// };

/**
 * Hook to calculate user's workout streak
 */
export const useWorkoutStreak = (): SupabaseResponse<{
  currentStreak: number;
  longestStreak: number;
  lastSevenDays: boolean[];
}> => {
  const fetcher = useCallback(async () => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) return { currentStreak: 0, longestStreak: 0, lastSevenDays: Array(7).fill(false) };
      
      // Get the last 60 days of completed workouts to calculate streaks
      const now = new Date();
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(now.getDate() - 60);
      
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('session_date')
        .eq('user_id', userId)
        .eq('session_completed', true)
        .gte('session_date', sixtyDaysAgo.toISOString())
        .order('session_date', { ascending: false });

      if (error) throw error;

      // Prepare workout dates - one per day (just need unique dates)
      const workoutDates: string[] = data
        ? [...new Set(data.map((session: { session_date: string }) => session.session_date.split('T')[0]))]
        : [];
      
      // Calculate current streak
      let currentStreak = 0;
      const today = now.toISOString().split('T')[0];
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];
      
      // Check if there's a workout today or yesterday to start the streak
      if (workoutDates.includes(today) || workoutDates.includes(yesterdayString)) {
        currentStreak = 1;
        
        // If workout was yesterday, start counting from there
        let checkDate = workoutDates.includes(today) ? today : yesterdayString;
        
        // Count consecutive days
        for (let i = 1; i < 60; i++) {
          const prevDate = new Date(checkDate);
          prevDate.setDate(prevDate.getDate() - 1);
          const prevDateStr = prevDate.toISOString().split('T')[0];
          
          if (workoutDates.includes(prevDateStr)) {
            currentStreak++;
            checkDate = prevDateStr;
          } else {
            break;
          }
        }
      }
      
      // Calculate longest streak
      let longestStreak = 0;
      let currentRun = 0;
      const sortedDates: string[] = [...workoutDates].sort();
      
      for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0) {
          currentRun = 1;
        } else {
          const prevDate = new Date(sortedDates[i - 1]);
          prevDate.setDate(prevDate.getDate() + 1);
          const expectedDate = prevDate.toISOString().split('T')[0];
          
          if (sortedDates[i] === expectedDate) {
            currentRun++;
          } else {
            longestStreak = Math.max(longestStreak, currentRun);
            currentRun = 1;
          }
        }
      }
      longestStreak = Math.max(longestStreak, currentRun);
      
      // Calculate last 7 days
      const lastSevenDays = Array(7).fill(false);
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date();
        checkDate.setDate(now.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        lastSevenDays[i] = workoutDates.includes(dateStr);
      }
      
      return {
        currentStreak,
        longestStreak,
        lastSevenDays
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }, []);
  
  const { data, error, isLoading, mutate } = useSWR('workout-streak', fetcher);
  
  return {
    data: data || { currentStreak: 0, longestStreak: 0, lastSevenDays: Array(7).fill(false) },
    error: error ? (error as Error).message : null,
    isLoading,
    mutate
  };
};
