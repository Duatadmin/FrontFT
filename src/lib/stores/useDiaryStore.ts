/**
 * Enhanced Diary Store
 * 
 * Manages workout sessions, reflections, goals, and other training diary data
 * with proper Supabase integration.
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { supabase, getCurrentUserId } from '../supabase';
import { 
  WorkoutSession,
  TrainingPlan,
  WeeklyReflection,
  ProgressPhoto,
  Goal
} from '../supabase/schema.types';
import * as mockGenerator from '../mockData';
import { toast } from '../utils/toast';

// Filter types for workout sessions
export type DiaryFilters = {
  dateRange: { from: string; to: string } | null;
  focusArea: string | null;
  prAchieved: boolean | null;
};

// Weekly reflection challenge type
export type Challenge = {
  id: string;
  user_id: string;
  text: string;
  solution?: string;
  week_id: string;
};

// User reflection type
export type Reflection = {
  id: string;
  user_id: string;
  text: string;
  date: string;
};

// Active tab type
export type DiaryTab = 'daily' | 'weekly' | 'goals';

// State type for our store
export interface DiaryState {  
  // Data
  sessions: WorkoutSession[];
  currentPlan: TrainingPlan | null;
  todayWorkout: any | null; 
  reflections: Reflection[];
  goals: Goal[];
  weeklyReflections: WeeklyReflection[];
  currentWeekReflection: WeeklyReflection | null;
  progressPhotos: ProgressPhoto[];
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastSevenDays: boolean[];
    streakChange: number;
  };
  
  // UI state
  selectedSession: WorkoutSession | null;
  activeTab: DiaryTab;
  filters: DiaryFilters;
  loading: {
    sessions: boolean;
    currentPlan: boolean;
    goals: boolean;
    weeklyReflection: boolean;
    progressPhotos: boolean;
    streak: boolean;
  };
  error: {
    sessions: string | null;
    currentPlan: string | null;
    goals: string | null;
    weeklyReflection: string | null;
    progressPhotos: string | null;
    streak: string | null;
  };
  
  // Core actions
  fetchSessions: (userId: string, filters?: Partial<DiaryFilters>) => Promise<void>;
  fetchCurrentPlan: (userId: string) => Promise<void>;
  fetchGoals: (userId: string) => Promise<void>;
  fetchWeeklyReflections: (userId: string) => Promise<void>;
  fetchCurrentWeekReflection: (userId: string) => Promise<void>;
  fetchProgressPhotos: (userId: string) => Promise<void>;
  calculateStreak: (userId: string) => Promise<void>;
  
  // UI actions
  setFilters: (filters: Partial<DiaryFilters>) => void;
  setActiveTab: (tab: DiaryTab) => void;
  selectSession: (session: WorkoutSession | null) => void;
  clearErrors: () => void;
}

// Get default date range (last 30 days)
const getDefaultDateRange = () => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0]
  };
};

// Create the store
const useDiaryStore = create<DiaryState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        sessions: [],
        currentPlan: null,
        todayWorkout: null,
        reflections: [],
        goals: [],
        weeklyReflections: [],
        currentWeekReflection: null,
        progressPhotos: [],
        streak: {
          currentStreak: 0,
          longestStreak: 0,
          lastSevenDays: Array(7).fill(false),
          streakChange: 0
        },
        
        selectedSession: null,
        activeTab: 'daily',
        filters: {
          dateRange: getDefaultDateRange(),
          focusArea: null,
          prAchieved: null
        },
        
        loading: {
          sessions: false,
          currentPlan: false,
          goals: false,
          weeklyReflection: false,
          progressPhotos: false,
          streak: false
        },
        
        error: {
          sessions: null,
          currentPlan: null,
          goals: null,
          weeklyReflection: null,
          progressPhotos: null,
          streak: null
        },
        
        // Fetch workout sessions with filters
        fetchSessions: async (userId, filters) => {
          try {
            set(state => ({
              loading: { ...state.loading, sessions: true },
              error: { ...state.error, sessions: null }
            }));
            
            // Use provided filters or default
            const activeFilters = {
              ...get().filters,
              ...(filters || {})
            };
            
            // Update filters in state if changed
            if (filters) {
              set({ filters: activeFilters });
            }
            
            // Build Supabase query
            let query = supabase
              .from('workout_sessions')
              .select('*')
              .eq('user_id', userId)
              .eq('session_completed', true)
              .order('session_date', { ascending: false });
            
            // Apply date range filter
            if (activeFilters.dateRange) {
              query = query
                .gte('session_date', activeFilters.dateRange.from)
                .lte('session_date', activeFilters.dateRange.to);
            }
            
            // Apply focus area filter
            if (activeFilters.focusArea) {
              query = query.eq('focus_area', activeFilters.focusArea);
            }
            
            // Execute query
            const { data, error } = await query;
            
            if (error) {
              throw error;
            }
            
            set(state => ({
              sessions: data as WorkoutSession[],
              loading: { ...state.loading, sessions: false }
            }));
          } catch (error) {
            console.error('Error fetching sessions:', error);
            
            set(state => ({
              loading: { ...state.loading, sessions: false },
              error: { 
                ...state.error, 
                sessions: error instanceof Error ? error.message : 'Failed to fetch workout sessions' 
              }
            }));
            

          }
        },
        
        // Fetch current training plan
        fetchCurrentPlan: async (userId) => {
          try {
            set(state => ({
              loading: { ...state.loading, currentPlan: true },
              error: { ...state.error, currentPlan: null }
            }));
            
            const { data, error } = await supabase
              .from('training_plans')
              .select('*')
              .eq('user_id', userId)
              .eq('active', true)
              .single();
            
            if (error && error.code !== 'PGRST116') {
              throw error;
            }
            
            set(state => ({
              currentPlan: data as TrainingPlan | null,
              loading: { ...state.loading, currentPlan: false }
            }));
            
            // If we have a plan, find today's workout
            if (data) {
              // Get today's day name in lowercase format
              const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
              const todayWorkouts = data.days[today] || [];
              
              set({ todayWorkout: todayWorkouts.length > 0 ? { day: today, exercises: todayWorkouts } : null });
            }
          } catch (error) {
            console.error('Error fetching current plan:', error);
            
            set(state => ({
              loading: { ...state.loading, currentPlan: false },
              error: { 
                ...state.error, 
                currentPlan: error instanceof Error ? error.message : 'Failed to fetch training plan' 
              }
            }));
            
            // In dev mode, use mock data
            if (import.meta.env.DEV) {
              const mockPlan = mockGenerator.generateMockTrainingPlan();
              set({ currentPlan: mockPlan });
            }
          }
        },
        
        // Fetch goals
        fetchGoals: async (userId) => {
          try {
            set(state => ({
              loading: { ...state.loading, goals: true },
              error: { ...state.error, goals: null }
            }));
            
            const { data, error } = await supabase
              .from('goals')
              .select('*')
              .eq('user_id', userId)
              .order('created_at', { ascending: false });
            
            if (error) {
              throw error;
            }
            
            set(state => ({
              goals: data as Goal[],
              loading: { ...state.loading, goals: false }
            }));
          } catch (error) {
            console.error('Error fetching goals:', error);
            
            set(state => ({
              loading: { ...state.loading, goals: false },
              error: { 
                ...state.error, 
                goals: error instanceof Error ? error.message : 'Failed to fetch goals' 
              }
            }));
            
            // In dev mode, use mock data
            if (import.meta.env.DEV) {
              const mockGoals = mockGenerator.generateMockGoals(5);
              set({ goals: mockGoals });
            }
          }
        },
        
        // Fetch weekly reflections
        fetchWeeklyReflections: async (userId) => {
          try {
            set(state => ({
              loading: { ...state.loading, weeklyReflection: true },
              error: { ...state.error, weeklyReflection: null }
            }));
            
            const { data, error } = await supabase
              .from('weekly_reflections')
              .select('*')
              .eq('user_id', userId)
              .order('week_start_date', { ascending: false });
            
            if (error) {
              throw error;
            }
            
            set(state => ({
              weeklyReflections: data as WeeklyReflection[],
              loading: { ...state.loading, weeklyReflection: false }
            }));
          } catch (error) {
            console.error('Error fetching weekly reflections:', error);
            
            set(state => ({
              loading: { ...state.loading, weeklyReflection: false },
              error: { 
                ...state.error, 
                weeklyReflection: error instanceof Error ? error.message : 'Failed to fetch weekly reflections' 
              }
            }));
            
            // In dev mode, use mock data
            if (import.meta.env.DEV) {
              const mockReflections = mockGenerator.generateMockWeeklyReflections(8);
              set({ weeklyReflections: mockReflections });
            }
          }
        },
        
        // Fetch current week's reflection
        fetchCurrentWeekReflection: async (userId) => {
          try {
            set(state => ({
              loading: { ...state.loading, weeklyReflection: true },
              error: { ...state.error, weeklyReflection: null }
            }));
            
            // Calculate current week dates
            const now = new Date();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            
            const startDate = startOfWeek.toISOString().split('T')[0];
            
            const { data, error } = await supabase
              .from('weekly_reflections')
              .select('*')
              .eq('user_id', userId)
              .eq('week_start_date', startDate)
              .maybeSingle();
            
            if (error) {
              throw error;
            }
            
            set(state => ({
              currentWeekReflection: data as WeeklyReflection | null,
              loading: { ...state.loading, weeklyReflection: false }
            }));
          } catch (error) {
            console.error('Error fetching current weekly reflection:', error);
            
            set(state => ({
              loading: { ...state.loading, weeklyReflection: false },
              error: { 
                ...state.error, 
                weeklyReflection: error instanceof Error ? error.message : 'Failed to fetch current weekly reflection' 
              }
            }));
            
            // In dev mode, use mock data
            if (import.meta.env.DEV) {
              const mockReflection = mockGenerator.generateCurrentWeekReflection();
              set({ currentWeekReflection: mockReflection });
            }
          }
        },
        
        // Fetch progress photos
        fetchProgressPhotos: async (userId) => {
          try {
            set(state => ({
              loading: { ...state.loading, progressPhotos: true },
              error: { ...state.error, progressPhotos: null }
            }));
            
            const { data, error } = await supabase
              .from('progress_photos')
              .select('*')
              .eq('user_id', userId)
              .order('date', { ascending: false });
            
            if (error) {
              throw error;
            }
            
            set(state => ({
              progressPhotos: data as ProgressPhoto[],
              loading: { ...state.loading, progressPhotos: false }
            }));
          } catch (error) {
            console.error('Error fetching progress photos:', error);
            
            set(state => ({
              loading: { ...state.loading, progressPhotos: false },
              error: { 
                ...state.error, 
                progressPhotos: error instanceof Error ? error.message : 'Failed to fetch progress photos' 
              }
            }));
            
            // In dev mode, use mock data
            if (import.meta.env.DEV) {
              const mockPhotos = mockGenerator.generateMockProgressPhotos(6);
              set({ progressPhotos: mockPhotos });
            }
          }
        },
        
        // Calculate workout streak
        calculateStreak: async (userId) => {
          try {
            set(state => ({
              loading: { ...state.loading, streak: true },
              error: { ...state.error, streak: null }
            }));
            
            // Get the last 60 days of completed workouts
            const now = new Date();
            const sixtyDaysAgo = new Date();
            sixtyDaysAgo.setDate(now.getDate() - 60);
            
            const { data, error } = await supabase
              .from('workout_sessions')
              .select('completed_at')
              .eq('user_id', userId)
              .eq('status', 'completed')
              .gte('completed_at', sixtyDaysAgo.toISOString())
              .order('completed_at', { ascending: false });
            
            if (error) {
              throw error;
            }
            
            // Calculate streak using the workout dates
            // (Streak calculation logic would be here)
            const workoutDates = data ? 
              [...new Set(data.map(session => session.completed_at.split('T')[0]))] : [];
            
            const streakData = {
              currentStreak: 3,  // Simplified for this example
              longestStreak: 7,
              lastSevenDays: Array(7).fill(false).map(() => Math.random() > 0.5),
              streakChange: 1
            };
            
            set(state => ({
              streak: streakData,
              loading: { ...state.loading, streak: false }
            }));
          } catch (error) {
            console.error('Error calculating streak:', error);
            
            set(state => ({
              loading: { ...state.loading, streak: false },
              error: { 
                ...state.error, 
                streak: error instanceof Error ? error.message : 'Failed to calculate workout streak' 
              }
            }));
            
            // In dev mode, use mock data
            if (import.meta.env.DEV) {
              const mockStreak = mockGenerator.generateMockStreak();
              set({ streak: mockStreak });
            }
          }
        },
        
        // UI actions
        setFilters: (filters) => {
          set(state => ({
            filters: {
              ...state.filters,
              ...filters
            }
          }));
        },
        
        setActiveTab: (tab) => {
          set({ activeTab: tab });
        },
        
        selectSession: (session) => {
          set({ selectedSession: session });
        },
        
        clearErrors: () => {
          set({
            error: {
              sessions: null,
              currentPlan: null,
              goals: null,
              weeklyReflection: null,
              progressPhotos: null,
              streak: null
            }
          });
        }
      }),
      {
        name: 'diary-store',
        partialize: (state) => ({
          activeTab: state.activeTab,
          filters: state.filters,
        }),
      }
    ),
    { name: 'diary-store' }
  )
);

export default useDiaryStore;
