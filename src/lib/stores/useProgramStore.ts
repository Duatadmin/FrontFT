import { create } from 'zustand';
import { supabase, getCurrentUserId } from '../supabase';
import { toast } from '../utils/toast';

// Mock data for development or when Supabase connection fails
const MOCK_TRAINING_PLAN = {
  id: 'mock-plan-001',
  user_id: 'user-123',
  name: 'Strength Building Program',
  description: '12-week progressive overload program focused on compound movements and strength development',
  days: {
    monday: ['Bench Press', 'Overhead Press', 'Tricep Extensions'],
    tuesday: ['Rest Day'],
    wednesday: ['Squats', 'Deadlifts', 'Lunges'],
    thursday: ['Pull-ups', 'Rows', 'Bicep Curls'],
    friday: ['Rest Day'],
    saturday: ['Full Body Circuit', 'Core Work'],
    sunday: ['Active Recovery', 'Mobility']
  },
  start_date: '2025-03-15',
  end_date: '2025-06-07',
  created_at: '2025-03-14T08:30:00Z',
  updated_at: '2025-04-22T13:45:00Z'
};

export interface TrainingPlan {
  id: string;
  user_id: string;
  name: string;
  description: string;
  days: { 
    [key: string]: string[] // map of day -> exercise_ids
  };
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

interface ProgramState {
  currentPlan: TrainingPlan | null;
  isLoading: boolean;
  error: Error | null;
  fetchCurrentPlan: () => Promise<void>;
}

// Create a Zustand store for program data
export const useProgramStore = create<ProgramState>((set) => ({
  currentPlan: null,
  isLoading: false,
  error: null,
  
  fetchCurrentPlan: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Check if we're in development mode
      const isDev = import.meta.env.DEV;
      let userId;
      
      try {
        userId = await getCurrentUserId();
      } catch (authError) {
        console.warn('Auth error, using mock data:', authError);
        if (isDev) {
          // In development, use mock data if auth fails
          console.log('Using mock training plan data in development mode');
          set({ currentPlan: MOCK_TRAINING_PLAN as TrainingPlan, isLoading: false });
          return;
        } else {
          throw new Error('Authentication failed');
        }
      }
      
      if (!userId) {
        if (isDev) {
          // In development, use mock data if no user
          console.log('No user authenticated, using mock data in development mode');
          set({ currentPlan: MOCK_TRAINING_PLAN as TrainingPlan, isLoading: false });
          return;
        } else {
          throw new Error('User not authenticated');
        }
      }
      
      try {
        const { data, error } = await supabase
          .from('training_plans')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (!data) {
          console.log('No training plan found for user');
          if (isDev) {
            // Use mock data if no plan found in development
            console.log('Using mock training plan data in development mode');
            set({ currentPlan: MOCK_TRAINING_PLAN as TrainingPlan, isLoading: false });
            return;
          } else {
            set({ currentPlan: null, isLoading: false });
            return;
          }
        }
        
        // Verify days field integrity
        if (!data.days || Object.keys(data.days).length === 0) {
          console.warn('Training plan has no scheduled days');
        }
        
        set({ currentPlan: data as TrainingPlan, isLoading: false });
      } catch (dbError) {
        // Handle database errors
        console.error('Database error:', dbError);
        if (isDev) {
          // Use mock data on DB errors in development
          console.log('Using mock training plan data due to database error');
          set({ currentPlan: MOCK_TRAINING_PLAN as TrainingPlan, isLoading: false });
          return;
        } else {
          throw dbError;
        }
      }
    } catch (error) {
      console.error('Error fetching training plan:', error);
      set({ error: error as Error, isLoading: false });
      toast.error('Failed to load your training plan');
      
      // As a last resort fallback in development, use mock data
      if (import.meta.env.DEV) {
        console.log('Error occurred, falling back to mock data');
        set({ 
          currentPlan: MOCK_TRAINING_PLAN as TrainingPlan, 
          isLoading: false,
          // Keep the error so UI can still show there was an issue
          error: error as Error 
        });
      }
    }
  }
}));
