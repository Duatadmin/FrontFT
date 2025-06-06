import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { supabase, getCurrentUserId } from '../supabase';
import { toast } from '../utils/toast';
import { TrainingPlan as DBTrainingPlan, Goal as DBGoal } from '../supabase/schema.types';

// Import the getCurrentUserId from our unified client

// Mock data for development or when Supabase connection fails
const MOCK_TRAINING_PLAN: TrainingPlan = {
  id: 'mock-plan-001',
  user_id: 'mock-user-123',
  name: 'Strength Building Program',
  description: '12-week progressive overload program focused on compound movements and strength development',
  days: {
    monday: ['Bench Press', 'Overhead Press', 'Tricep Extensions'],
    tuesday: [], // Rest Day
    wednesday: ['Squats', 'Deadlifts', 'Lunges'],
    thursday: ['Pull-ups', 'Rows', 'Bicep Curls'],
    friday: [], // Rest Day
    saturday: ['Full Body Circuit', 'Core Work'],
    sunday: ['Active Recovery', 'Mobility']
  },
  start_date: '2025-03-15',
  end_date: '2025-06-07',
  active: true, // Add active property
  created_at: '2025-03-14T08:30:00Z',
  updated_at: '2025-04-22T13:45:00Z'
};

// Fallback mock data for goals with properly typed status values
const MOCK_GOALS: Goal[] = [
  {
    id: 'goal-001',
    user_id: 'mock-user-123',
    title: 'Increase bench press',
    description: 'Reach 225lbs on bench press',
    target_value: 225,
    current_value: 185,
    unit: 'lbs',
    category: 'strength', // Add category property
    deadline: '2025-06-30',
    created_at: '2025-03-10T09:00:00Z',
    status: 'in_progress'
  },
  {
    id: 'goal-002',
    user_id: 'mock-user-123',
    title: 'Body fat percentage',
    description: 'Reduce body fat to 15%',
    target_value: 15,
    current_value: 20,
    unit: '%',
    category: 'weight', // Add category property
    deadline: '2025-07-15',
    created_at: '2025-03-15T14:30:00Z',
    status: 'in_progress'
  }
];

// Re-export types from schema.types.ts for backwards compatibility
export type TrainingPlan = DBTrainingPlan;
export type Goal = DBGoal;

interface ProgramState {
  currentPlan: TrainingPlan | null;
  goals: Goal[];
  isLoading: boolean;
  goalsLoading: boolean;
  error: string | null;
  goalsError: string | null;
  activeTab: 'current' | 'goals' | 'templates';
  fetchCurrentPlan: () => Promise<void>;
  fetchGoals: () => Promise<void>;
  setActiveTab: (tab: 'current' | 'goals' | 'templates') => void;
}

// Create a Zustand store for program data
export const useProgramStore = create<ProgramState>()(devtools(persist((set, get) => ({
  // State
  currentPlan: null,
  goals: [],
  isLoading: false,
  goalsLoading: false,
  error: null,
  goalsError: null,
  activeTab: 'current',
  
  // Set active tab
  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },
  fetchCurrentPlan: async () => {
    set({ isLoading: true, error: null });
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        console.error('No user ID available');
        set({ 
          error: 'Authentication required. Please log in.',
          isLoading: false 
        });
        return;
      }
      try {
        const { data, error } = await supabase
          .from('training_plans')
          .select('*')
          .eq('user_id', userId)
          .eq('active', true)
          .single();
        if (error) {
          console.warn('Supabase error fetching plan, falling back to mock data:', error);
          throw error; 
        }
        if (!data) {
          console.log('No active plan found, using mock data');
          set({ 
            currentPlan: MOCK_TRAINING_PLAN,
            isLoading: false
          });
          return;
        }
        set({ 
          currentPlan: data,
          isLoading: false
        });
      } catch (supabaseError) {
        // If any error occurs with Supabase, use mock data
        console.log('Using mock data due to Supabase error or development mode');
        set({ 
          currentPlan: MOCK_TRAINING_PLAN,
          isLoading: false,
          error: import.meta.env.DEV ? null : 'Connection error: Using sample data' 
        });
        
        if (!import.meta.env.DEV) {
          toast.info('Using sample training data while we reconnect.');
        }
      }
    } catch (error) {
      console.error('Unexpected error in fetchCurrentPlan:', error);
      
      // Handle unexpected errors
      toast.error('Failed to load your training plan. Using sample data instead.');
      
      // Fallback to mock data
      set({ 
        currentPlan: MOCK_TRAINING_PLAN,
        isLoading: false,
        error: 'Failed to load your training plan. Using sample data instead.'
      });
    }
  },
  
  // Fetch user's goals
  fetchGoals: async () => {
    try {
      set({ goalsLoading: true, goalsError: null });
      
      // Get current user ID
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('No user ID available for goals');
        set({ 
          goalsError: 'Authentication required. Please log in.',
          goalsLoading: false 
        });
        return;
      }
      
      try {
        // Query goals for the user
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', userId);
        
        if (error) {
          console.warn('Supabase error fetching goals, falling back to mock data:', error);
          throw error;
        }
        
        // Set the goals in state
        set({ 
          goals: data || MOCK_GOALS,
          goalsLoading: false
        });
      } catch (supabaseError) {
        // If any error occurs with Supabase, use mock data
        console.log('Using mock goals data due to Supabase error or development mode');
        set({ 
          goals: MOCK_GOALS,
          goalsLoading: false,
          goalsError: import.meta.env.DEV ? null : 'Connection error: Using sample goals data' 
        });
        
        if (!import.meta.env.DEV) {
          toast.info('Using sample goals data while we reconnect.');
        }
      }
    } catch (error) {
      console.error('Unexpected error in fetchGoals:', error);
      
      // Fallback to mock data
      set({ 
        goals: MOCK_GOALS,
        goalsLoading: false,
        goalsError: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
      }),
      {
        name: 'program-store',
        partialize: (state) => ({
          activeTab: state.activeTab
        }),
      }
    ),
    { name: 'program-store' }
  ));
