import { StateCreator } from 'zustand';
import supabase from '../lib/supabaseClient';
import type { FitnessGoal, WeeklyReflection, ProgressPhoto, DiaryTab } from './useDiaryStore';
import type { WorkoutSession } from '../lib/supabaseClient';

// Define the DiaryState type locally to avoid circular dependency
interface DiaryState {
  sessions: any[];
  currentPlan: any | null;
  todayWorkout: any | null;
  goals: FitnessGoal[];
  weeklyReflections: WeeklyReflection[];
  currentWeekReflection: WeeklyReflection | null;
  progressPhotos: ProgressPhoto[];
  streak: number;
  selectedSession: any | null;
  activeTab: DiaryTab;
  filters: any;
  loading: Record<string, boolean>;
  error: Record<string, string | null>;
  [key: string]: any; // Allow other properties for actions
}
import { 
  generateMockGoals, 
  generateMockWeeklyReflections, 
  generateCurrentWeekReflection,
  generateMockProgressPhotos,
  calculateMockStreak 
} from '../lib/mockDiaryEnhancedData';

/**
 * Actions for the enhanced diary features
 * This file contains the implementations for actions related to goals, reflections, and progress tracking
 */

// Create the actions using a factory pattern to inject into the main store
export const createEnhancedDiaryActions: StateCreator<DiaryState, [], [], Partial<DiaryState>> = (set, get) => ({
  // Goals actions
  fetchGoals: async (userId: string) => {
    try {
      set((state: DiaryState) => ({
        loading: { ...state.loading, goals: true },
        error: { ...state.error, goals: null }
      }));
      
      // For development, use mock data
      if (process.env.NODE_ENV === 'development') {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Generate mock goals
        const mockGoals = generateMockGoals(userId);
        
        set({ 
          goals: mockGoals,
          loading: { ...get().loading, goals: false }
        });
        return;
      }
      
      // Real Supabase query for production
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      set({ 
        goals: data as FitnessGoal[],
        loading: { ...get().loading, goals: false }
      });
    } catch (error) {
      console.error('Error fetching goals:', error);
      set((state: DiaryState) => ({
        loading: { ...state.loading, goals: false },
        error: { ...state.error, goals: error instanceof Error ? error.message : 'Failed to fetch goals' }
      }));
    }
  },
  
  addGoal: async (userId: string, goal: FitnessGoal) => {
    try {
      set((state: DiaryState) => ({
        loading: { ...state.loading, goals: true },
        error: { ...state.error, goals: null }
      }));
      
      const newGoal: Omit<FitnessGoal, 'id'> = {
        user_id: userId,
        title: goal.title,
        description: goal.description,
        target_value: goal.target_value,
        current_value: goal.current_value,
        unit: goal.unit,
        category: goal.category,
        target_date: goal.target_date,
        created_at: new Date().toISOString(),
        completed: goal.completed || false,
        completed_at: goal.completed ? new Date().toISOString() : undefined
      };
      
      // For development, use mock data
      if (process.env.NODE_ENV === 'development') {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create mock goal with ID
        const mockGoal: FitnessGoal = {
          ...newGoal,
          id: `goal-${Date.now()}`
        };
        
        set((state: DiaryState) => ({ 
          goals: [mockGoal, ...state.goals],
          loading: { ...state.loading, goals: false }
        }));
        return;
      }
      
      // Real Supabase query for production
      const { data, error } = await supabase
        .from('goals')
        .insert(newGoal)
        .select()
        .single();
      
      if (error) throw error;
      
      set((state: DiaryState) => ({ 
        goals: [data as FitnessGoal, ...state.goals],
        loading: { ...state.loading, goals: false }
      }));
    } catch (error) {
      console.error('Error adding goal:', error);
      set((state: DiaryState) => ({
        loading: { ...state.loading, goals: false },
        error: { ...state.error, goals: error instanceof Error ? error.message : 'Failed to add goal' }
      }));
    }
  },
  
  updateGoal: async (goalId: string, updates: Partial<FitnessGoal>) => {
    try {
      set((state: DiaryState) => ({
        loading: { ...state.loading, goals: true },
        error: { ...state.error, goals: null }
      }));
      
      // For development, use mock data
      if (process.env.NODE_ENV === 'development') {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update the goal in the state
        set((state: DiaryState) => ({ 
          goals: state.goals.map(goal => 
            goal.id === goalId ? { ...goal, ...updates } : goal
          ),
          loading: { ...state.loading, goals: false }
        }));
        return;
      }
      
      // Real Supabase query for production
      const { error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', goalId);
      
      if (error) throw error;
      
      // Update the goal in the state
      set((state: DiaryState) => ({ 
        goals: state.goals.map(goal => 
          goal.id === goalId ? { ...goal, ...updates } : goal
        ),
        loading: { ...state.loading, goals: false }
      }));
    } catch (error) {
      console.error('Error updating goal:', error);
      set((state: DiaryState) => ({
        loading: { ...state.loading, goals: false },
        error: { ...state.error, goals: error instanceof Error ? error.message : 'Failed to update goal' }
      }));
    }
  },
  
  deleteGoal: async (goalId: string) => {
    try {
      set((state: DiaryState) => ({
        loading: { ...state.loading, goals: true },
        error: { ...state.error, goals: null }
      }));
      
      // For development, use mock data
      if (process.env.NODE_ENV === 'development') {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Remove the goal from the state
        set((state: DiaryState) => ({ 
          goals: state.goals.filter(goal => goal.id !== goalId),
          loading: { ...state.loading, goals: false }
        }));
        return;
      }
      
      // Real Supabase query for production
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);
      
      if (error) throw error;
      
      // Remove the goal from the state
      set((state: DiaryState) => ({ 
        goals: state.goals.filter(goal => goal.id !== goalId),
        loading: { ...state.loading, goals: false }
      }));
    } catch (error) {
      console.error('Error deleting goal:', error);
      set((state: DiaryState) => ({
        loading: { ...state.loading, goals: false },
        error: { ...state.error, goals: error instanceof Error ? error.message : 'Failed to delete goal' }
      }));
    }
  },
  
  // Weekly reflection actions
  fetchCurrentWeekReflection: async (userId: string) => {
    try {
      set((state: DiaryState) => ({
        loading: { ...state.loading, weeklyReflection: true },
        error: { ...state.error, weeklyReflection: null }
      }));
      
      // For development, use mock data
      if (process.env.NODE_ENV === 'development') {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Generate current week reflection and historical reflections
        const currentWeekReflection = generateCurrentWeekReflection(userId);
        const weeklyReflections = generateMockWeeklyReflections(userId);
        
        set({ 
          currentWeekReflection,
          weeklyReflections,
          loading: { ...get().loading, weeklyReflection: false }
        });
        return;
      }
      
      // Get current week's start and end dates
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Calculate week start (previous Sunday)
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - dayOfWeek);
      weekStart.setHours(0, 0, 0, 0);
      
      // Calculate week end (next Saturday)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      // Real Supabase query for production - get current week's reflection
      const { data: currentWeekData, error: currentWeekError } = await supabase
        .from('weekly_reflections')
        .select('*')
        .eq('user_id', userId)
        .gte('week_start_date', weekStart.toISOString())
        .lte('week_end_date', weekEnd.toISOString())
        .single();
      
      if (currentWeekError && currentWeekError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        throw currentWeekError;
      }
      
      // Real Supabase query for production - get all reflections
      const { data: allReflectionsData, error: allReflectionsError } = await supabase
        .from('weekly_reflections')
        .select('*')
        .eq('user_id', userId)
        .order('week_start_date', { ascending: false });
      
      if (allReflectionsError) throw allReflectionsError;
      
      set({ 
        currentWeekReflection: currentWeekData as WeeklyReflection || null,
        weeklyReflections: allReflectionsData as WeeklyReflection[] || [],
        loading: { ...get().loading, weeklyReflection: false }
      });
    } catch (error) {
      console.error('Error fetching weekly reflection:', error);
      set((state: DiaryState) => ({
        loading: { ...state.loading, weeklyReflection: false },
        error: { ...state.error, weeklyReflection: error instanceof Error ? error.message : 'Failed to fetch weekly reflection' }
      }));
    }
  },
  
  saveWeeklyReflection: async (userId: string, reflection: Partial<WeeklyReflection>) => {
    try {
      set((state: DiaryState) => ({
        loading: { ...state.loading, weeklyReflection: true },
        error: { ...state.error, weeklyReflection: null }
      }));
      
      // Get current week's reflection to check if it exists
      const currentReflection = get().currentWeekReflection;
      
      // If no current week reflection exists yet, we need to create a new one
      if (!currentReflection) {
        // Get current week's start and end dates
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Calculate week start (previous Sunday)
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);
        
        // Calculate week end (next Saturday)
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        // Create new reflection with default values
        const newReflection: Omit<WeeklyReflection, 'id'> = {
          user_id: userId,
          week_start_date: weekStart.toISOString(),
          week_end_date: weekEnd.toISOString(),
          planned_sessions: reflection.planned_sessions || 0,
          completed_sessions: reflection.completed_sessions || 0,
          total_volume: reflection.total_volume || 0,
          new_prs: reflection.new_prs || 0,
          cardio_minutes: reflection.cardio_minutes || 0,
          avg_mood: reflection.avg_mood || 0,
          avg_sleep: reflection.avg_sleep || 0,
          avg_soreness: reflection.avg_soreness || 0,
          challenges: reflection.challenges || [],
          wins: reflection.wins || [],
          next_week_focus: reflection.next_week_focus || '',
          next_week_session_target: reflection.next_week_session_target || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // For development, use mock data
        if (import.meta.env.DEV) {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Create mock reflection with ID
          const mockReflection: WeeklyReflection = {
            ...newReflection,
            id: `reflection-${Date.now()}`
          };
          
          set((state: DiaryState) => ({ 
            currentWeekReflection: mockReflection,
            weeklyReflections: [mockReflection, ...state.weeklyReflections],
            loading: { ...state.loading, weeklyReflection: false }
          }));
          return;
        }
        
        // Real Supabase query for production - create new reflection
        const { data: newData, error: newError } = await supabase
          .from('weekly_reflections')
          .insert(newReflection)
          .select()
          .single();
        
        if (newError) throw newError;
        
        set((state: DiaryState) => ({ 
          currentWeekReflection: newData as WeeklyReflection,
          weeklyReflections: [newData as WeeklyReflection, ...state.weeklyReflections],
          loading: { ...state.loading, weeklyReflection: false }
        }));
      } else {
        // Update existing reflection
        const updatedReflection = {
          ...reflection,
          updated_at: new Date().toISOString()
        };
        
        // For development, use mock data
        if (import.meta.env.DEV) {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Update the reflection in the state
          const updated = { ...currentReflection, ...updatedReflection };
          
          set((state: DiaryState) => ({ 
            currentWeekReflection: updated,
            weeklyReflections: state.weeklyReflections.map(r => 
              r.id === currentReflection.id ? updated : r
            ),
            loading: { ...state.loading, weeklyReflection: false }
          }));
          return;
        }
        
        // Real Supabase query for production - update existing reflection
        const { error: updateError } = await supabase
          .from('weekly_reflections')
          .update(updatedReflection)
          .eq('id', currentReflection.id);
        
        if (updateError) throw updateError;
        
        // Update the reflection in the state
        const updated = { ...currentReflection, ...updatedReflection };
        
        set((state: DiaryState) => ({ 
          currentWeekReflection: updated,
          weeklyReflections: state.weeklyReflections.map(r => 
            r.id === currentReflection.id ? updated : r
          ),
          loading: { ...state.loading, weeklyReflection: false }
        }));
      }
    } catch (error) {
      console.error('Error saving weekly reflection:', error);
      set((state: DiaryState) => ({
        loading: { ...state.loading, weeklyReflection: false },
        error: { ...state.error, weeklyReflection: error instanceof Error ? error.message : 'Failed to save weekly reflection' }
      }));
    }
  },
  
  // Progress photos actions
  fetchProgressPhotos: async (userId: string) => {
    try {
      set((state: DiaryState) => ({
        loading: { ...state.loading, progressPhotos: true },
        error: { ...state.error, progressPhotos: null }
      }));
      
      // For development, use mock data
      if (process.env.NODE_ENV === 'development') {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Generate mock progress photos
        const mockPhotos = generateMockProgressPhotos(userId);
        
        set({ 
          progressPhotos: mockPhotos,
          loading: { ...get().loading, progressPhotos: false }
        });
        return;
      }
      
      // Real Supabase query for production
      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      set({ 
        progressPhotos: data as ProgressPhoto[],
        loading: { ...get().loading, progressPhotos: false }
      });
    } catch (error) {
      console.error('Error fetching progress photos:', error);
      set((state: DiaryState) => ({
        loading: { ...state.loading, progressPhotos: false },
        error: { ...state.error, progressPhotos: error instanceof Error ? error.message : 'Failed to fetch progress photos' }
      }));
    }
  },
  
  addProgressPhoto: async (userId: string, photo: ProgressPhoto) => {
    try {
      set((state: DiaryState) => ({
        loading: { ...state.loading, progressPhotos: true },
        error: { ...state.error, progressPhotos: null }
      }));
      
      const newPhoto: Omit<ProgressPhoto, 'id'> = {
        user_id: userId,
        url: photo.url,
        caption: photo.caption,
        date: new Date().toISOString()
      };
      
      // For development, use mock data
      if (process.env.NODE_ENV === 'development') {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create mock photo with ID
        const mockPhoto: ProgressPhoto = {
          ...newPhoto,
          id: `photo-${Date.now()}`
        };
        
        set((state: DiaryState) => ({ 
          progressPhotos: [mockPhoto, ...state.progressPhotos],
          loading: { ...state.loading, progressPhotos: false }
        }));
        return;
      }
      
      // Real Supabase query for production
      const { data, error } = await supabase
        .from('progress_photos')
        .insert(newPhoto)
        .select()
        .single();
      
      if (error) throw error;
      
      set((state: DiaryState) => ({ 
        progressPhotos: [data as ProgressPhoto, ...state.progressPhotos],
        loading: { ...state.loading, progressPhotos: false }
      }));
    } catch (error) {
      console.error('Error adding progress photo:', error);
      set((state: DiaryState) => ({
        loading: { ...state.loading, progressPhotos: false },
        error: { ...state.error, progressPhotos: error instanceof Error ? error.message : 'Failed to add progress photo' }
      }));
    }
  },
  
  deleteProgressPhoto: async (photoId: string) => {
    try {
      set((state: DiaryState) => ({
        loading: { ...state.loading, progressPhotos: true },
        error: { ...state.error, progressPhotos: null }
      }));
      
      // For development, use mock data
      if (process.env.NODE_ENV === 'development') {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Remove the photo from the state
        set((state: DiaryState) => ({ 
          progressPhotos: state.progressPhotos.filter(photo => photo.id !== photoId),
          loading: { ...state.loading, progressPhotos: false }
        }));
        return;
      }
      
      // Real Supabase query for production
      const { error } = await supabase
        .from('progress_photos')
        .delete()
        .eq('id', photoId);
      
      if (error) throw error;
      
      // Remove the photo from the state
      set((state: DiaryState) => ({ 
        progressPhotos: state.progressPhotos.filter(photo => photo.id !== photoId),
        loading: { ...state.loading, progressPhotos: false }
      }));
    } catch (error) {
      console.error('Error deleting progress photo:', error);
      set((state: DiaryState) => ({
        loading: { ...state.loading, progressPhotos: false },
        error: { ...state.error, progressPhotos: error instanceof Error ? error.message : 'Failed to delete progress photo' }
      }));
    }
  },
  
  // Streak calculation
  calculateStreak: async (userId: string) => {
    try {
      // For development, use mock data
      if (process.env.NODE_ENV === 'development') {
        // Use current sessions to calculate streak
        const sessions = get().sessions;
        const streak = calculateMockStreak(sessions);
        
        set({ streak });
        return;
      }
      
      // Real Supabase query for production
      // Get all sessions in the last 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('timestamp')
        .eq('user_id', userId)
        .gte('timestamp', ninetyDaysAgo.toISOString())
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      // Calculate streak from the data
      // Group sessions by day
      const sessionsByDay = (data as { timestamp: string }[]).reduce((acc, session) => {
        const date = new Date(session.timestamp);
        const dateString = date.toISOString().split('T')[0];
        
        if (!acc[dateString]) {
          acc[dateString] = 1;
        }
        
        return acc;
      }, {} as Record<string, number>);
      
      // Calculate streak
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let currentDate = new Date(today);
      
      // Check if there's a session today to start the streak
      const todayString = today.toISOString().split('T')[0];
      
      if (sessionsByDay[todayString]) {
        streak = 1;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        currentDate.setDate(currentDate.getDate() - 1);
      }
      
      // Check consecutive days backwards
      while (true) {
        const currentDateString = currentDate.toISOString().split('T')[0];
        
        if (!sessionsByDay[currentDateString]) break;
        
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }
      
      set({ streak });
    } catch (error) {
      console.error('Error calculating streak:', error);
      // Don't update loading or error state for streak calculation
      // as it's not a critical feature
    }
  },
  
  // UI actions
  setActiveTab: (tab: 'daily' | 'weekly' | 'goals') => {
    set({ activeTab: tab });
  },
  
  // Session actions
  markSessionCompleted: async (userId: string, sessionData: Partial<WorkoutSession>) => {
    try {
      set((state: DiaryState) => ({
        loading: { ...state.loading, sessions: true },
        error: { ...state.error, sessions: null }
      }));
      
      const newSession = {
        user_id: userId,
        timestamp: new Date().toISOString(),
        ...sessionData
      };
      
      // For development, use mock data
      if (process.env.NODE_ENV === 'development') {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create mock session with ID
        const mockSession = {
          ...newSession,
          id: `session-${Date.now()}`
        };
        
        set((state: DiaryState) => ({ 
          sessions: [mockSession, ...state.sessions],
          loading: { ...state.loading, sessions: false }
        }));
        
        // Recalculate streak
        get().calculateStreak(userId);
        
        return;
      }
      
      // Real Supabase query for production
      const { data, error } = await supabase
        .from('workout_sessions')
        .insert(newSession)
        .select()
        .single();
      
      if (error) throw error;
      
      set((state: DiaryState) => ({ 
        sessions: [data, ...state.sessions],
        loading: { ...state.loading, sessions: false }
      }));
      
      // Recalculate streak
      get().calculateStreak(userId);
    } catch (error) {
      console.error('Error marking session as completed:', error);
      set((state: DiaryState) => ({
        loading: { ...state.loading, sessions: false },
        error: { ...state.error, sessions: error instanceof Error ? error.message : 'Failed to mark session as completed' }
      }));
    }
  }
});
