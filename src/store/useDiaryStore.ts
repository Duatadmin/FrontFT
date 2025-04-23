import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import supabase, { WorkoutSession, TrainingPlan } from '../lib/supabaseClient';
// Import mock data generators for development
import { generateMockSessions, generateMockTrainingPlan } from '../lib/mockDiaryData';

// Filter types for workout sessions
export type DiaryFilters = {
  dateRange: { from: string; to: string } | null;
  focusArea: string | null;
  prAchieved: boolean | null;
};

// State type for our store
interface DiaryState {
  // Data
  sessions: WorkoutSession[];
  currentPlan: TrainingPlan | null;
  todayWorkout: any | null; // The workout for today from the training plan
  // UI state
  selectedSession: WorkoutSession | null;
  filters: DiaryFilters;
  loading: {
    sessions: boolean;
    currentPlan: boolean;
  };
  error: {
    sessions: string | null;
    currentPlan: string | null;
  };
  // Actions
  fetchSessions: (userId: string, filters?: Partial<DiaryFilters>) => Promise<void>;
  fetchCurrentPlan: (userId: string) => Promise<void>;
  setFilters: (filters: Partial<DiaryFilters>) => void;
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
    (set, get) => ({
      // Initial state
      sessions: [],
      currentPlan: null,
      todayWorkout: null,
      selectedSession: null,
      filters: {
        dateRange: getDefaultDateRange(),
        focusArea: null,
        prAchieved: null
      },
      loading: {
        sessions: false,
        currentPlan: false
      },
      error: {
        sessions: null,
        currentPlan: null
      },
      
      // Actions
      fetchSessions: async (userId, filters) => {
        try {
          set(state => ({
            loading: { ...state.loading, sessions: true },
            error: { ...state.error, sessions: null }
          }));
          
          const currentFilters = filters ? { ...get().filters, ...filters } : get().filters;
          set({ filters: currentFilters });
          
          // For development, use mock data instead of Supabase queries
          if (import.meta.env.DEV) {
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
      
      fetchCurrentPlan: async (userId) => {
        try {
          set(state => ({
            loading: { ...state.loading, currentPlan: true },
            error: { ...state.error, currentPlan: null }
          }));
          
          // For development, use mock data instead of Supabase query
          if (import.meta.env.DEV) {
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
      
      selectSession: (session) => {
        set({ selectedSession: session });
      },
      
      clearErrors: () => {
        set({
          error: { sessions: null, currentPlan: null }
        });
      }
    }),
    { name: 'diary-store' }
  )
);

export default useDiaryStore;
