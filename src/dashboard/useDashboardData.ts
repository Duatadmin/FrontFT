import { useState, useEffect } from 'react';
import { isMockData, getCurrentUserId } from '../lib/supabase';
import { fetchWorkoutSessions, calculateWorkoutStats } from '../lib/supabase/dataAdapter';
import type { WorkoutSession } from '../lib/supabase/schema.types';

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
  // Added for full dashboard mock data compatibility
  volumeChart: { date: string; value: number }[];
  prTimeline: { name: string; value: number }[];
  activityBreakdown: { name: string; value: number; color: string }[];
}

// Mock data generator for development purposes
const generateMockData = (): DashboardData => {
  // Generate mock data
  return {
    recentWorkouts: [
      {
        id: '1',
        user_id: 'user123',
        focus_area: 'Upper Body',
        session_completed: true,
        session_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        metrics: { total_volume: 5000, total_duration_minutes: 45 },
        completed_exercises: { 'bench-press': [{ set: 1, reps: 10, weight: 135 }] },
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
        metadata: {}
      },
      {
        id: '2',
        user_id: 'user123',
        focus_area: 'Lower Body',
        session_completed: true,
        session_date: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
        metrics: { total_volume: 7500, total_duration_minutes: 60 },
        completed_exercises: { 'squat': [{ set: 1, reps: 8, weight: 225 }] },
        created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        metadata: {}
      },
    ],
    monthlyStats: {
      workoutCount: 12,
      totalVolume: 60000,
      streakDays: 3,
      completionRate: 0.85
    },
    currentProgram: {
      id: 'program1',
      name: 'Strength Builder',
      description: 'A program focused on building strength',
      active: true,
      user_id: 'user123',
      days: {},
      start_date: '',
      created_at: '',
      updated_at: ''
    },
    upcomingWorkouts: [
      {
        id: 'upcoming1',
        name: 'Upper Body Push',
        scheduledFor: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        duration: 60
      }
    ],
    // Added mock chart data for dashboard parity
    volumeChart: [
      { date: '2025-06-01', value: 5000 },
      { date: '2025-06-02', value: 6000 },
      { date: '2025-06-03', value: 7000 },
      { date: '2025-06-04', value: 8000 },
      { date: '2025-06-05', value: 9000 },
    ],
    prTimeline: [
      { name: 'Bench Press', value: 120 },
      { name: 'Squat', value: 200 },
      { name: 'Deadlift', value: 250 },
    ],
    activityBreakdown: [
      { name: 'Strength', value: 60, color: '#AFFF00' },
      { name: 'Cardio', value: 30, color: '#84CC16' },
      { name: 'Mobility', value: 10, color: '#A3E635' },
    ],
  };

};

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
  const [dataSource, setDataSource] = useState<'real' | 'mock'>('real');

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        setError({
          code: 'AUTH_ERROR',
          message: 'Missing data: user_id. Cannot render dashboard.',
          missingData: 'user_id',
          affectedModule: 'dashboard'
        });
        setData(generateMockData());
        setDataSource('mock');
        return;
      }

      // Check if we should use mock data
      const useMock = await isMockData();
      
      if (useMock) {
        // Use mock data
        console.log('Using mock dashboard data');
        const mockData = generateMockData();
        setData(mockData);
        setDataSource('mock');
      } else {
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
              message: `Missing data: ${workoutsResult.error.missingData}. Cannot render recent workouts.`,
              missingData: workoutsResult.error.missingData,
              affectedModule: 'recent workouts'
            });
          } else {
            setError({
              code: 'DATA_ERROR',
              message: 'Missing data: workout_sessions. Cannot render recent workouts.',
              missingData: 'workout_sessions',
              affectedModule: 'recent workouts'
            });
          }
          
          // Fallback to mock data
          setData(generateMockData());
          setDataSource('mock');
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
        
        setData(dashboardData);
        setDataSource('real');
        console.log('Dashboard successfully populated with real Supabase data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError({
        code: 'UNEXPECTED_ERROR',
        message: `Unexpected error: ${err instanceof Error ? err.message : String(err)}`,
        affectedModule: 'dashboard'
      });
      
      // Fallback to mock data on error
      setData(generateMockData());
      setDataSource('mock');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    dataSource,
    refetch: fetchData
  };
}
