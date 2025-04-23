import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import createLogger from '../utils/logger';

const logger = createLogger('useProgramStore');

// Exercise definition
export interface ProgramExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  load?: number;
  rpe?: number;
  notes?: string;
}

// Day structure for training plan
export interface ProgramDay {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday
  focus: string;
  exercises: ProgramExercise[];
}

// Training plan definition
export interface TrainingPlan {
  id: string;
  user_id: string;
  name: string;
  goal_type: 'strength' | 'hypertrophy' | 'endurance' | 'weight_loss' | 'general';
  days: ProgramDay[];
  start_date: string;
  active: boolean;
  created_at: string;
  updated_at?: string;
}

// Goal definition
export interface Goal {
  id: string;
  user_id: string;
  type: 'strength' | 'endurance' | 'body_composition' | 'benchmark';
  metric: string;
  target_value: number;
  unit: string;
  deadline: string;
  completed_at?: string;
  inserted_at: string;
  progress?: number; // Computed client-side
}

// Program state interface
export interface ProgramState {
  currentProgram?: TrainingPlan;
  goals: Goal[];
  loading: {
    program: boolean;
    goals: boolean;
    templates: boolean;
  };
  error: {
    program: string | null;
    goals: string | null;
    templates: string | null;
  };
  activeTab: 'current' | 'goals' | 'templates';
  
  // Actions
  setActiveTab: (tab: 'current' | 'goals' | 'templates') => void;
  fetchCurrentProgram: (userId: string) => Promise<void>;
  fetchGoals: (userId: string) => Promise<void>;
  createGoal: (goalInput: Omit<Goal, 'id' | 'inserted_at' | 'progress'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  completeGoal: (id: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  createPlan: (planInput: Omit<TrainingPlan, 'id' | 'created_at'>) => Promise<void>;
  updatePlan: (id: string, updates: Partial<TrainingPlan>) => Promise<void>;
  setActivePlan: (id: string, userId: string) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
}

// For mock data in dev mode
const generateMockGoals = (userId: string): Goal[] => {
  const now = new Date();
  const oneMonthLater = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const twoMonthsLater = new Date(now.getFullYear(), now.getMonth() + 2, now.getDate());
  const threeMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
  
  return [
    {
      id: 'goal-1',
      user_id: userId,
      type: 'strength',
      metric: 'Bench press 1RM',
      target_value: 100,
      unit: 'kg',
      deadline: oneMonthLater.toISOString().split('T')[0],
      inserted_at: now.toISOString(),
      progress: 0.7, // 70% complete
    },
    {
      id: 'goal-2',
      user_id: userId,
      type: 'body_composition',
      metric: 'Body weight',
      target_value: 80,
      unit: 'kg',
      deadline: twoMonthsLater.toISOString().split('T')[0],
      inserted_at: now.toISOString(),
      progress: 0.4, // 40% complete
    },
    {
      id: 'goal-3',
      user_id: userId,
      type: 'endurance',
      metric: '5K run time',
      target_value: 25,
      unit: 'minutes',
      deadline: threeMonthsLater.toISOString().split('T')[0],
      inserted_at: now.toISOString(),
      progress: 0.2, // 20% complete
    },
    {
      id: 'goal-4',
      user_id: userId,
      type: 'benchmark',
      metric: 'Pull-ups',
      target_value: 15,
      unit: 'reps',
      deadline: twoMonthsLater.toISOString().split('T')[0],
      completed_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5).toISOString(),
      inserted_at: now.toISOString(),
      progress: 1, // 100% complete
    },
  ];
};

// Generate mock current program
const generateMockCurrentProgram = (userId: string): TrainingPlan => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14); // Started 2 weeks ago
  
  return {
    id: 'plan-1',
    user_id: userId,
    name: '5x5 Strength Program',
    goal_type: 'strength',
    days: [
      {
        dayOfWeek: 1, // Monday
        focus: 'Upper body',
        exercises: [
          { id: 'ex-1', name: 'Bench Press', sets: 5, reps: 5, load: 80 },
          { id: 'ex-2', name: 'Barbell Row', sets: 5, reps: 5, load: 70 },
          { id: 'ex-3', name: 'Overhead Press', sets: 3, reps: 8, load: 50 },
        ],
      },
      {
        dayOfWeek: 3, // Wednesday
        focus: 'Lower body',
        exercises: [
          { id: 'ex-4', name: 'Squat', sets: 5, reps: 5, load: 100 },
          { id: 'ex-5', name: 'Deadlift', sets: 3, reps: 5, load: 120 },
          { id: 'ex-6', name: 'Leg Press', sets: 3, reps: 10, load: 150 },
        ],
      },
      {
        dayOfWeek: 5, // Friday
        focus: 'Full body',
        exercises: [
          { id: 'ex-7', name: 'Bench Press', sets: 5, reps: 5, load: 82.5 },
          { id: 'ex-8', name: 'Squat', sets: 5, reps: 5, load: 105 },
          { id: 'ex-9', name: 'Pull-ups', sets: 3, reps: 8, load: 0 },
        ],
      },
    ],
    start_date: startDate.toISOString().split('T')[0],
    active: true,
    created_at: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() - 1).toISOString(),
  };
};

// Create the store
const useProgramStore = create<ProgramState>((set, get) => ({
  currentProgram: undefined,
  goals: [],
  loading: {
    program: false,
    goals: false,
    templates: false,
  },
  error: {
    program: null,
    goals: null,
    templates: null,
  },
  activeTab: 'current',
  
  // Set active tab
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  // Fetch current active program
  fetchCurrentProgram: async (userId: string) => {
    try {
      set((state) => ({
        ...state,
        loading: { ...state.loading, program: true },
        error: { ...state.error, program: null },
      }));
      
      logger.debug('Fetching current program for user', { userId });
      
      if (import.meta.env.DEV) {
        // In development, use mock data
        logger.info('Using mock current program data');
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        set((state) => ({
          ...state,
          currentProgram: generateMockCurrentProgram(userId),
          loading: { ...state.loading, program: false },
        }));
        return;
      }
      
      // In production, fetch from Supabase
      const { data, error } = await supabase
        .from('training_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .single();
      
      if (error) {
        logger.error('Error fetching current program', error);
        set((state) => ({
          ...state,
          error: { ...state.error, program: error.message },
          loading: { ...state.loading, program: false },
        }));
        return;
      }
      
      set((state) => ({
        ...state,
        currentProgram: data as TrainingPlan,
        loading: { ...state.loading, program: false },
      }));
    } catch (error) {
      logger.error('Unexpected error fetching current program', error);
      set((state) => ({
        ...state,
        error: { ...state.error, program: (error as Error).message },
        loading: { ...state.loading, program: false },
      }));
    }
  },
  
  // Fetch goals
  fetchGoals: async (userId: string) => {
    try {
      set((state) => ({
        ...state,
        loading: { ...state.loading, goals: true },
        error: { ...state.error, goals: null },
      }));
      
      logger.debug('Fetching goals for user', { userId });
      
      if (import.meta.env.DEV) {
        // In development, use mock data
        logger.info('Using mock goals data');
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        set((state) => ({
          ...state,
          goals: generateMockGoals(userId),
          loading: { ...state.loading, goals: false },
        }));
        return;
      }
      
      // In production, fetch from Supabase
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('deadline', { ascending: true });
      
      if (error) {
        logger.error('Error fetching goals', error);
        set((state) => ({
          ...state,
          error: { ...state.error, goals: error.message },
          loading: { ...state.loading, goals: false },
        }));
        return;
      }
      
      // Calculate progress for each goal
      const goalsWithProgress = data.map((goal: Goal) => {
        // In a real app, this would involve more complex logic based on PR data
        // For now, we'll generate a random progress value for demo purposes
        return {
          ...goal,
          progress: goal.completed_at ? 1 : Math.random() * 0.9, // 0-90% if not completed, 100% if completed
        };
      });
      
      set((state) => ({
        ...state,
        goals: goalsWithProgress,
        loading: { ...state.loading, goals: false },
      }));
    } catch (error) {
      logger.error('Unexpected error fetching goals', error);
      set((state) => ({
        ...state,
        error: { ...state.error, goals: (error as Error).message },
        loading: { ...state.loading, goals: false },
      }));
    }
  },
  
  // Create a new goal
  createGoal: async (goalInput) => {
    try {
      // Validate input
      if (!goalInput.user_id || !goalInput.metric || !goalInput.target_value) {
        throw new Error('Missing required goal fields');
      }
      
      logger.debug('Creating new goal', goalInput);
      
      // Create a temporary ID for optimistic update
      const tempId = `goal-${Date.now()}`;
      const timestamp = new Date().toISOString();
      
      // Create optimistic goal object
      const newGoal: Goal = {
        id: tempId,
        inserted_at: timestamp,
        progress: 0,
        ...goalInput,
      };
      
      // Optimistic update
      set((state) => ({
        ...state,
        goals: [...state.goals, newGoal],
      }));
      
      if (import.meta.env.DEV) {
        // In development, just simulate the API call
        logger.info('Using mock create goal', { goal: newGoal });
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        return;
      }
      
      // In production, insert into Supabase
      const { data, error } = await supabase
        .from('goals')
        .insert([{
          user_id: goalInput.user_id,
          type: goalInput.type,
          metric: goalInput.metric,
          target_value: goalInput.target_value,
          unit: goalInput.unit,
          deadline: goalInput.deadline,
        }])
        .select()
        .single();
      
      if (error) {
        logger.error('Error creating goal', error);
        // Remove optimistic update on error
        set((state) => ({
          ...state,
          goals: state.goals.filter(g => g.id !== tempId),
          error: { ...state.error, goals: error.message },
        }));
        return;
      }
      
      // Update with the real goal data
      set((state) => ({
        ...state,
        goals: state.goals.map(g => 
          g.id === tempId ? { ...data, progress: 0 } as Goal : g
        ),
      }));
    } catch (error) {
      logger.error('Unexpected error creating goal', error);
      set((state) => ({
        ...state,
        error: { ...state.error, goals: (error as Error).message },
      }));
    }
  },
  
  // Update an existing goal
  updateGoal: async (id, updates) => {
    try {
      logger.debug('Updating goal', { id, updates });
      
      // Optimistic update
      set((state) => ({
        ...state,
        goals: state.goals.map(g => 
          g.id === id ? { ...g, ...updates } : g
        ),
      }));
      
      if (import.meta.env.DEV) {
        // In development, just simulate the API call
        logger.info('Using mock update goal', { id, updates });
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        return;
      }
      
      // In production, update in Supabase
      const { error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id);
      
      if (error) {
        logger.error('Error updating goal', error);
        // Revert optimistic update on error
        set((state) => ({
          ...state,
          error: { ...state.error, goals: error.message },
        }));
        
        // Re-fetch goals to ensure consistency
        const userId = get().goals.find(g => g.id === id)?.user_id;
        if (userId) {
          get().fetchGoals(userId);
        }
      }
    } catch (error) {
      logger.error('Unexpected error updating goal', error);
      set((state) => ({
        ...state,
        error: { ...state.error, goals: (error as Error).message },
      }));
    }
  },
  
  // Mark a goal as complete
  completeGoal: async (id) => {
    try {
      logger.debug('Completing goal', { id });
      
      const completedAt = new Date().toISOString();
      
      // Optimistic update
      set((state) => ({
        ...state,
        goals: state.goals.map(g => 
          g.id === id ? { ...g, completed_at: completedAt, progress: 1 } : g
        ),
      }));
      
      if (import.meta.env.DEV) {
        // In development, just simulate the API call
        logger.info('Using mock complete goal', { id });
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        return;
      }
      
      // In production, update in Supabase
      const { error } = await supabase
        .from('goals')
        .update({ completed_at: completedAt })
        .eq('id', id);
      
      if (error) {
        logger.error('Error completing goal', error);
        // Revert optimistic update on error
        set((state) => ({
          ...state,
          error: { ...state.error, goals: error.message },
        }));
        
        // Re-fetch goals to ensure consistency
        const userId = get().goals.find(g => g.id === id)?.user_id;
        if (userId) {
          get().fetchGoals(userId);
        }
      }
    } catch (error) {
      logger.error('Unexpected error completing goal', error);
      set((state) => ({
        ...state,
        error: { ...state.error, goals: (error as Error).message },
      }));
    }
  },
  
  // Delete a goal
  deleteGoal: async (id) => {
    try {
      logger.debug('Deleting goal', { id });
      
      // Save goal for potential restore
      const goalToDelete = get().goals.find(g => g.id === id);
      
      if (!goalToDelete) {
        logger.warn('Goal not found for deletion', { id });
        return;
      }
      
      // Optimistic update
      set((state) => ({
        ...state,
        goals: state.goals.filter(g => g.id !== id),
      }));
      
      if (import.meta.env.DEV) {
        // In development, just simulate the API call
        logger.info('Using mock delete goal', { id });
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        return;
      }
      
      // In production, delete from Supabase
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);
      
      if (error) {
        logger.error('Error deleting goal', error);
        // Restore goal on error
        set((state) => ({
          ...state,
          goals: [...state.goals, goalToDelete],
          error: { ...state.error, goals: error.message },
        }));
      }
    } catch (error) {
      logger.error('Unexpected error deleting goal', error);
      set((state) => ({
        ...state,
        error: { ...state.error, goals: (error as Error).message },
      }));
    }
  },
  
  // Create a new training plan
  createPlan: async (planInput) => {
    try {
      // Validate input
      if (!planInput.user_id || !planInput.name || !planInput.days || planInput.days.length === 0) {
        throw new Error('Missing required plan fields');
      }
      
      logger.debug('Creating new training plan', planInput);
      
      // Create a temporary ID for optimistic update
      const tempId = `plan-${Date.now()}`;
      const timestamp = new Date().toISOString();
      
      // Create optimistic plan object
      const newPlan: TrainingPlan = {
        id: tempId,
        created_at: timestamp,
        ...planInput,
      };
      
      // Optimistic update if setting as active
      if (planInput.active) {
        set((state) => ({
          ...state,
          currentProgram: newPlan,
        }));
      }
      
      if (import.meta.env.DEV) {
        // In development, just simulate the API call
        logger.info('Using mock create plan', { plan: newPlan });
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        return;
      }
      
      // In production, insert into Supabase and handle active status
      // If setting as active, first deactivate any other active plans
      if (planInput.active) {
        await supabase
          .from('training_plans')
          .update({ active: false })
          .eq('user_id', planInput.user_id)
          .eq('active', true);
      }
      
      // Insert the new plan
      const { data, error } = await supabase
        .from('training_plans')
        .insert([{
          user_id: planInput.user_id,
          name: planInput.name,
          goal_type: planInput.goal_type,
          days: planInput.days,
          start_date: planInput.start_date,
          active: planInput.active,
        }])
        .select()
        .single();
      
      if (error) {
        logger.error('Error creating plan', error);
        // Remove optimistic update on error
        if (planInput.active) {
          set((state) => ({
            ...state,
            currentProgram: undefined,
            error: { ...state.error, program: error.message },
          }));
        }
        return;
      }
      
      // Update with the real plan data if active
      if (planInput.active) {
        set((state) => ({
          ...state,
          currentProgram: data as TrainingPlan,
        }));
      }
    } catch (error) {
      logger.error('Unexpected error creating plan', error);
      set((state) => ({
        ...state,
        error: { ...state.error, program: (error as Error).message },
      }));
    }
  },
  
  // Update an existing plan
  updatePlan: async (id, updates) => {
    try {
      logger.debug('Updating plan', { id, updates });
      
      // Optimistic update if it's the current program
      if (get().currentProgram?.id === id) {
        set((state) => ({
          ...state,
          currentProgram: state.currentProgram ? { ...state.currentProgram, ...updates } : undefined,
        }));
      }
      
      if (import.meta.env.DEV) {
        // In development, just simulate the API call
        logger.info('Using mock update plan', { id, updates });
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        return;
      }
      
      // In production, update in Supabase
      const { error } = await supabase
        .from('training_plans')
        .update(updates)
        .eq('id', id);
      
      if (error) {
        logger.error('Error updating plan', error);
        // Re-fetch to ensure consistency
        if (get().currentProgram?.id === id) {
          const userId = get().currentProgram.user_id;
          get().fetchCurrentProgram(userId);
        }
        
        set((state) => ({
          ...state,
          error: { ...state.error, program: error.message },
        }));
      }
    } catch (error) {
      logger.error('Unexpected error updating plan', error);
      set((state) => ({
        ...state,
        error: { ...state.error, program: (error as Error).message },
      }));
    }
  },
  
  // Set a plan as active
  setActivePlan: async (id, userId) => {
    try {
      logger.debug('Setting plan as active', { id, userId });
      
      if (import.meta.env.DEV) {
        // In development, just simulate the API call
        logger.info('Using mock set active plan', { id, userId });
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        
        // Update optimistically in mock mode
        const mockPlan = generateMockCurrentProgram(userId);
        mockPlan.id = id;
        
        set((state) => ({
          ...state,
          currentProgram: mockPlan,
        }));
        
        return;
      }
      
      // In production:
      // 1. Deactivate current active plan
      await supabase
        .from('training_plans')
        .update({ active: false })
        .eq('user_id', userId)
        .eq('active', true);
      
      // 2. Activate the selected plan
      const { error } = await supabase
        .from('training_plans')
        .update({ active: true })
        .eq('id', id);
      
      if (error) {
        logger.error('Error setting active plan', error);
        set((state) => ({
          ...state,
          error: { ...state.error, program: error.message },
        }));
        return;
      }
      
      // 3. Fetch the newly activated plan
      get().fetchCurrentProgram(userId);
    } catch (error) {
      logger.error('Unexpected error setting active plan', error);
      set((state) => ({
        ...state,
        error: { ...state.error, program: (error as Error).message },
      }));
    }
  },
  
  // Delete a plan
  deletePlan: async (id) => {
    try {
      logger.debug('Deleting plan', { id });
      
      // Check if deleting the current program
      const isCurrentProgram = get().currentProgram?.id === id;
      
      // Save for potential restore
      const planToDelete = isCurrentProgram ? get().currentProgram : undefined;
      
      // Optimistic update
      if (isCurrentProgram) {
        set((state) => ({
          ...state,
          currentProgram: undefined,
        }));
      }
      
      if (import.meta.env.DEV) {
        // In development, just simulate the API call
        logger.info('Using mock delete plan', { id });
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        return;
      }
      
      // In production, delete from Supabase
      const { error } = await supabase
        .from('training_plans')
        .delete()
        .eq('id', id);
      
      if (error) {
        logger.error('Error deleting plan', error);
        // Restore on error
        if (isCurrentProgram && planToDelete) {
          set((state) => ({
            ...state,
            currentProgram: planToDelete,
            error: { ...state.error, program: error.message },
          }));
        }
      }
    } catch (error) {
      logger.error('Unexpected error deleting plan', error);
      set((state) => ({
        ...state,
        error: { ...state.error, program: (error as Error).message },
      }));
    }
  },
}));

export default useProgramStore;
