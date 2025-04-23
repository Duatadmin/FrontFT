import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import supabase, { WorkoutSession, TrainingPlan } from '../lib/supabaseClient';
// Import mock data generators for development
import { generateMockSessions, generateMockTrainingPlan } from '../lib/mockDiaryData';
import { 
  generateMockGoals, 
  generateMockWeeklyReflections, 
  generateCurrentWeekReflection, 
  generateMockProgressPhotos, 
  generateMockReflections,
  calculateMockStreak
} from '../lib/mockDiaryEnhancedData';

// Filter types for workout sessions
export type DiaryFilters = {
  dateRange: { from: string; to: string } | null;
  focusArea: string | null;
  prAchieved: boolean | null;
};

// Goal types
export type Goal = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_date: string;
  type: 'short_term' | 'long_term';
  progress: number;
  created_at: string;
  completed: boolean;
};

// For backward compatibility
export type FitnessGoal = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  unit: string;
  category: 'strength' | 'endurance' | 'weight' | 'habit' | 'other';
  target_date?: string;
  created_at: string;
  completed: boolean;
  completed_at?: string;
};

// Weekly reflection type
export type Challenge = {
  id: string;
  user_id: string;
  text: string;
  solution?: string;
  week_id: string;
};

export type Reflection = {
  id: string;
  user_id: string;
  text: string;
  date: string;
};

export type WeeklyReflection = {
  id: string;
  user_id: string;
  week_start_date: string;
  week_end_date: string;
  planned_sessions: number;
  completed_sessions: number;
  total_volume: number;
  new_prs: number;
  cardio_minutes: number;
  avg_mood: number;
  avg_sleep: number;
  avg_soreness: number;
  challenges: Challenge[];
  wins: string[];
  next_week_focus: string;
  next_week_session_target: number;
  created_at: string;
  updated_at: string;
};

// Progress photo type
export type ProgressPhoto = {
  id: string;
  user_id: string;
  url: string;
  caption?: string;
  description?: string; // For backward compatibility
  date: string;
};

// Active tab type
export type DiaryTab = 'daily' | 'weekly' | 'goals';

// State type for our store
export interface DiaryState {  
  // Reflections array
  reflections: Reflection[];
  
  // Data
  sessions: WorkoutSession[];
  currentPlan: TrainingPlan | null;
  todayWorkout: any | null; // The workout for today from the training plan
  goals: Goal[];
  weeklyReflections: WeeklyReflection[];
  currentWeekReflection: WeeklyReflection | null;
  progressPhotos: ProgressPhoto[];
  streak: {
    currentStreak: number; // Current consecutive days
    longestStreak: number; // Longest streak ever achieved
    lastSevenDays: boolean[]; // Activity for the last 7 days
    streakChange: number; // Change since last check (for animations)
  }; // Consecutive days with completed workouts
  
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
  
  // Actions
  // Sessions and plans
  fetchSessions: (userId: string, filters?: Partial<DiaryFilters>) => Promise<void>;
  fetchCurrentPlan: (userId: string) => Promise<void>;
  markSessionCompleted: (userId: string, sessionData: Partial<WorkoutSession>) => Promise<void>;
  
  // Goals
  fetchGoals: (userId: string) => Promise<void>;
  addGoal: (goal: Goal) => void;
  updateGoal: (goal: Goal) => void;
  removeGoal: (goalId: string, userId: string) => void;
  
  // Reflections
  addReflection: (reflection: Reflection) => void;
  updateReflection: (reflection: Reflection) => void;
  removeReflection: (reflectionId: string, userId: string) => void;
  
  // Challenges
  addChallenge: (challenge: Challenge) => void;
  updateChallenge: (challenge: Challenge) => void;
  removeChallenge: (challengeId: string, userId: string) => void;
  
  // Photos
  fetchProgressPhotos: (userId: string) => Promise<void>;
  addProgressPhoto: (photo: ProgressPhoto) => void;
  removeProgressPhoto: (photoId: string, userId: string) => void;

  // Streak
  calculateStreak: (userId: string) => void;
  
  // Weekly reflections
  fetchWeeklyReflections: (userId: string) => Promise<void>;
  fetchCurrentWeekReflection: (userId: string) => Promise<void>;
  updateWeeklyReflection: (reflection: WeeklyReflection, userId: string) => Promise<void>;
  
  // UI actions
  setFilters: (filters: Partial<DiaryFilters>) => void;
  setActiveTab: (tab: DiaryTab) => void;
  selectSession: (session: WorkoutSession | null) => void;
  clearErrors: () => void;
}

// Import enhanced diary actions
import { createEnhancedDiaryActions } from './enhancedDiaryActions';

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

// Find today's workout from a training plan
const getTodayWorkout = (plan: TrainingPlan | null): any | null => {
  if (!plan || !plan.days) return null;
  
  const today = new Date();
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  // Find the workout for today
  return plan.days[dayOfWeek] || null;
};

// Create the store
const useDiaryStore = create<DiaryState>()(
  devtools(
    persist<DiaryState>(
      (set, get) => ({
        // Initial state
        sessions: [],
        currentPlan: null,
        todayWorkout: null,
        selectedSession: null,
        goals: generateMockGoals(),
        weeklyReflections: generateMockWeeklyReflections(),
        currentWeekReflection: generateCurrentWeekReflection(),
        progressPhotos: generateMockProgressPhotos(),
        reflections: generateMockReflections(),
        streak: {
          currentStreak: 0,
          longestStreak: 0,
          lastSevenDays: Array(7).fill(false),
          streakChange: 0
        },
        activeTab: 'daily' as DiaryTab,
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
        } as {
          sessions: boolean;
          currentPlan: boolean;
          goals: boolean;
          weeklyReflection: boolean;
          progressPhotos: boolean;
          streak: boolean;
        },
        error: {
          sessions: null,
          currentPlan: null,
          goals: null,
          weeklyReflection: null,
          progressPhotos: null,
          streak: null
        } as {
          sessions: string | null;
          currentPlan: string | null;
          goals: string | null;
          weeklyReflection: string | null;
          progressPhotos: string | null;
          streak: string | null;
        },
      // Core diary actions
      fetchSessions: async (userId: string, filters?: Partial<DiaryFilters>) => {
        try {
          set(state => ({
            loading: { ...state.loading, sessions: true },
            error: { ...state.error, sessions: null }
          }));
          
          const currentFilters = filters ? { ...get().filters, ...filters } : get().filters;
          set({ filters: currentFilters });
          
          // For development, use mock data instead of Supabase queries
          if (process.env.NODE_ENV === 'development') {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Generate mock sessions
            let mockSessions = generateMockSessions(30);
            
            // Apply filters to mock data
            if (currentFilters.dateRange) {
              const fromDate = new Date(`${currentFilters.dateRange.from}T00:00:00.000Z`).getTime();
              const toDate = new Date(`${currentFilters.dateRange.to}T23:59:59.999Z`).getTime();
              
              mockSessions = mockSessions.filter(session => {
                const sessionDate = new Date(session.timestamp).getTime();
                return sessionDate >= fromDate && sessionDate <= toDate;
              });
            }
            
            if (currentFilters.focusArea) {
              mockSessions = mockSessions.filter(session => 
                session.exercises_completed.some(ex => 
                  ex.toLowerCase().includes(currentFilters.focusArea!.toLowerCase())
                )
              );
            }
            
            if (currentFilters.prAchieved) {
              // Mock PR filter - in a real app this would check a PR flag or calculation
              mockSessions = mockSessions.filter(session => 
                session.id.charCodeAt(0) % 3 === 0 // Just a random way to filter some items
              );
            }
            
            set({ 
              sessions: mockSessions,
              loading: { ...get().loading, sessions: false }
            });
            return;
          }
          
          // Real Supabase query for production
          let query = supabase
            .from('workout_sessions')
            .select('*')
            .eq('user_id', userId)
            .order('timestamp', { ascending: false });
          
          // Apply date range filter
          if (currentFilters.dateRange) {
            query = query
              .gte('timestamp', `${currentFilters.dateRange.from}T00:00:00.000Z`)
              .lte('timestamp', `${currentFilters.dateRange.to}T23:59:59.999Z`);
          }
          
          // Apply focus area filter if specified
          if (currentFilters.focusArea) {
            query = query.contains('exercises_completed', [currentFilters.focusArea]);
          }
          
          // For PR achieved, we'd need a custom RPC or function
          // This is a TODO as mentioned in the requirements
          
          const { data, error } = await query;
          
          if (error) throw error;
          
          set({ 
            sessions: data as WorkoutSession[],
            loading: { ...get().loading, sessions: false }
          });
        } catch (error) {
          console.error('Error fetching workout sessions:', error);
          set(state => ({
            loading: { ...state.loading, sessions: false },
            error: { ...state.error, sessions: error instanceof Error ? error.message : 'Failed to fetch sessions' }
          }));
        }
      },
      
      fetchCurrentPlan: async (userId: string) => {
        try {
          set(state => ({
            loading: { ...state.loading, currentPlan: true },
            error: { ...state.error, currentPlan: null }
          }));
          
          // For development, use mock data instead of Supabase query
          if (import.meta.env as any.DEV) {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 600));
            
            // Generate mock training plan
            const mockPlan = generateMockTrainingPlan();
            const todayWorkout = getTodayWorkout(mockPlan);
            
            set({ 
              currentPlan: mockPlan,
              todayWorkout,
              loading: { ...get().loading, currentPlan: false }
            });
            return;
          }
          
          // Real Supabase query for production
          const { data, error } = await supabase
            .from('training_plans')
            .select('*')
            .eq('user_id', userId)
            .limit(1)
            .single();
          
          if (error) throw error;
          
          const plan = data as TrainingPlan;
          const todayWorkout = getTodayWorkout(plan);
          
          set({ 
            currentPlan: plan,
            todayWorkout,
            loading: { ...get().loading, currentPlan: false }
          });
        } catch (error) {
          console.error('Error fetching current plan:', error);
          set(state => ({
            loading: { ...state.loading, currentPlan: false },
            error: { ...state.error, currentPlan: error instanceof Error ? error.message : 'Failed to fetch training plan' }
          }));
        }
      },
      
      setFilters: (filters) => {
        set(state => ({
          filters: { ...state.filters, ...filters }
        }));
        // Automatically refetch with new filters if we have a userId
        // In a real app, you'd probably get this from another store or auth context
        const mockUserId = 'current-user-id'; // This would come from auth in a real app
        get().fetchSessions(mockUserId);
      },
      
      setActiveTab: (tab) => {
        set({ activeTab: tab });
      },
      
      selectSession: (session) => {
        set({ selectedSession: session });
      },
      
      clearErrors: () => set(() => ({
        error: {
          sessions: null,
          currentPlan: null,
          goals: null,
          weeklyReflection: null,
          progressPhotos: null,
          streak: null
        }
      })),
      
      // Add all enhanced diary actions 
      ...createEnhancedDiaryActions(set, get)
    }),
    {
      name: 'diary-store',
      // Only persist certain parts of the state
      partialize: (state) => ({
        activeTab: state.activeTab,
        filters: state.filters,
        streak: state.streak
      })
    }),
    { name: 'diary-store' }
  )
);

export default useDiaryStore;
