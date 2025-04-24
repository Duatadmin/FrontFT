import { useState, useEffect } from 'react';
import { isMockData, getCurrentUserId } from '../lib/supabase/client';
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
        status: 'completed',
        completed_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
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
        status: 'completed',
        completed_at: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
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
    ]
  };
};

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('No user ID available');
      }

      // Check if we should use mock data
      const useMock = await isMockData();
      
      if (useMock) {
        // Use mock data
        console.log('Using mock dashboard data');
        const mockData = generateMockData();
        setData(mockData);
      } else {
        // Fetch real data from Supabase using our data adapter
        console.log('Fetching real dashboard data from Supabase');
        
        // Get recent workouts (last 5)
        const recentWorkouts = await fetchWorkoutSessions(
          userId,
          undefined,
          undefined,
          undefined
        );
        
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
          upcomingWorkouts: [] // Would need additional logic to generate
        };
        
        setData(dashboardData);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Fallback to mock data on error
      setData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}
