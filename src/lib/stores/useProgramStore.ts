import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { supabase, getCurrentUserId } from '../supabase';
import { toast } from '../utils/toast';
import { Goal as DBGoal } from '../supabase/schema.types'; // Removed TrainingPlan as DBTrainingPlan

// Import the getCurrentUserId from our unified client

// Type definitions imported from schema

// Re-export types from schema.types.ts for backwards compatibility
// This line (export type TrainingPlan = DBTrainingPlan;) is replaced by the interface below
export interface TrainingPlan {
  plan_id: string; 
  user_id: string;
  split_type: string | null;
  goal: string | null;
  level: string | null;
  plan_status: string | null;
  // Add any other essential plan-level fields that constitute 'current plan' metadata
}
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
export const useProgramStore = create<ProgramState>()(devtools(persist((set, _get) => ({
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
          .from('workout_full_view')
          // Select specific plan-level fields. Adjust these fields as necessary.
          .select('plan_id, user_id, split_type, goal, level, plan_status') 
          .eq('user_id', userId)
          // IMPORTANT: Replace 'active' with the actual value from your 'plan_status' column that denotes an active plan.
          .eq('plan_status', 'active') 
          .maybeSingle(); // Use maybeSingle as a plan might not exist or to prevent errors if query setup could return multiple
        if (error) {
          console.warn('Supabase error fetching plan, falling back to mock data:', error);
          throw error; 
        }
        if (!data) {
          console.log('No active plan found, using mock data');
          set({ 
            currentPlan: null,
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
          currentPlan: null,
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
        currentPlan: null,
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
          goals: data || [],
          goalsLoading: false
        });
      } catch (supabaseError) {
        // If any error occurs with Supabase, use mock data
        console.log('Using mock goals data due to Supabase error or development mode');
        set({ 
          goals: [],
          goalsLoading: false,
          goalsError: import.meta.env.DEV ? null : 'Connection error: Using sample goals data' 
        });
        
        if (!import.meta.env.DEV) {
          toast.info('Using sample goals data while we reconnect.');
        }
      }
    } catch (error) {
      console.error('Unexpected error in fetchGoals:', error);
      
      // Set error state without fallback data
      set({ 
        goals: [],
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
