import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { createEnhancedDiaryActions, EnhancedDiaryActions } from './enhancedDiaryActions';
import type {
  WorkoutSession,
  WorkoutSet,
  TrainingPlan,
  DiaryFilters,
  DiaryTab,
  Goal,
  WeeklyReflection,
  ProgressPhoto,
  Streak,
  WorkoutFullViewRow,
} from './diaryTypes';

// Define the shape of the data part of the state
type DiaryDataState = {
  sessions: WorkoutSession[];
  currentPlan: TrainingPlan | null;
  todayWorkout: WorkoutSession | null;
  goals: Goal[];
  weeklyReflections: WeeklyReflection[];
  currentWeekReflection: WeeklyReflection | null;
  progressPhotos: ProgressPhoto[];
  streak: Streak;
  selectedSession: WorkoutSession | null;
  activeTab: DiaryTab;
  filters: DiaryFilters;
  loading: Record<string, boolean>;
  error: Record<string, string | null>;
};

// Define the shape of the actions created in this file
type DiaryActions = {
  fetchSessions: (userId: string) => Promise<void>;
  fetchCurrentPlan: (userId: string) => Promise<void>;
  setFilters: (filters: Partial<DiaryFilters>) => void;
  setActiveTab: (tab: DiaryTab) => void;
  selectSession: (session: WorkoutSession | null) => void;
  clearErrors: () => void;
};

// The master state combines data and all actions
export type DiaryState = DiaryDataState & DiaryActions & EnhancedDiaryActions;

const getDefaultDateRange = () => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return { from: from.toISOString().split('T')[0], to: to.toISOString().split('T')[0] };
};

const initialState: DiaryDataState = {
  sessions: [],
  currentPlan: null,
  todayWorkout: null,
  goals: [],
  weeklyReflections: [],
  currentWeekReflection: null,
  progressPhotos: [],
  streak: { currentStreak: 0, longestStreak: 0, lastSevenDays: Array(7).fill(false), streakChange: 0 },
  selectedSession: null,
  activeTab: 'daily',
  filters: { dateRange: getDefaultDateRange(), focusArea: null, prAchieved: null },
  loading: { sessions: false, currentPlan: false, goals: false, weeklyReflection: false, progressPhotos: false, streak: false },
  error: { sessions: null, currentPlan: null, goals: null, weeklyReflection: null, progressPhotos: null, streak: null },
};

const useDiaryStore = create<DiaryState>()(
  devtools(
    persist(
      (set, get, api) => ({
        ...initialState,

        fetchSessions: async (userId: string) => {
          if (!userId) return;
          set(state => ({ ...state, loading: { ...state.loading, sessions: true }, error: { ...state.error, sessions: null } }));

          try {
            const { data, error } = await supabase
              .from('workout_full_view')
              .select('*')
              .eq('user_id', userId)
              .order('session_date', { ascending: false })
              .order('order_in_session', { ascending: true })
              .order('set_no', { ascending: true });

            if (error) throw new Error(error.message);

            const sessionsMap = new Map<string, WorkoutSession>();

            for (const row of (data as WorkoutFullViewRow[]) || []) {
              if (!row.session_id) continue;

              let session = sessionsMap.get(row.session_id);
              if (!session) {
                session = {
                  session_id: row.session_id,
                  session_date: row.session_date,
                  day_label: row.day_label,
                  day_of_week: row.day_of_week,
                  focus_area: row.focus_area,
                  session_number: row.session_number,
                  overall_difficulty: row.overall_difficulty,
                  duration_minutes: row.duration_minutes,
                  session_completed: row.session_completed,
                  session_state: row.session_state,
                  exercises: [],
                  week_id: row.week_id,
                  week_number: row.week_number,
                  plan_id: row.plan_id,
                };
                sessionsMap.set(row.session_id, session);
              }

              if (row.exercise_row_id) {
                let exercise = session.exercises.find(e => e.exercise_row_id === row.exercise_row_id);
                if (!exercise) {
                  exercise = {
                    exercise_row_id: row.exercise_row_id,
                    exercise_id: row.exercise_id,
                    exercise_name: row.exercise_name,
                    muscle_group: row.muscle_group,
                    sets_planned: row.sets_planned,
                    rep_scheme: row.rep_scheme,
                    rir: row.rir,
                    equipment: row.equipment,
                    tier: row.tier,
                    order_in_session: row.order_in_session,
                    sets: [],
                  };
                  session.exercises.push(exercise);
                }

                if (row.set_id) {
                  const workoutSet: WorkoutSet = {
                    set_id: row.set_id,
                    set_no: row.set_no,
                    reps_done: row.reps_done,
                    weight_kg: row.weight_kg,
                    rpe: row.rpe,
                    recorded_at: row.recorded_at,
                  };
                  if (!exercise.sets.some(s => s.set_id === workoutSet.set_id)) {
                    exercise.sets.push(workoutSet);
                  }
                }
              }
            }

            const sessions = Array.from(sessionsMap.values());
            set(state => ({ ...state, sessions, loading: { ...state.loading, sessions: false } }));

          } catch (e) {
            const err = e as Error;
            console.error('Error fetching sessions:', err);
            set(state => ({
              ...state,
              loading: { ...state.loading, sessions: false },
              error: { ...state.error, sessions: err.message },
            }));
          }
        },

        fetchCurrentPlan: async (userId: string) => {
          if (!userId) return;
          set(state => ({ ...state, loading: { ...state.loading, currentPlan: true }, error: { ...state.error, currentPlan: null } }));
          try {
            const { data, error } = await supabase
              .from('training_plans')
              .select('*')
              .eq('user_id', userId)
              .eq('plan_status', 'active')
              .single();

            if (error && error.code !== 'PGRST116') {
                throw new Error(error.message);
            }
            
            set(state => ({ ...state, currentPlan: data as TrainingPlan | null, loading: { ...state.loading, currentPlan: false } }));

          } catch (e) {
            const err = e as Error;
            console.error('Error fetching current plan:', err);
            set(state => ({
              ...state,
              loading: { ...state.loading, currentPlan: false },
              error: { ...state.error, currentPlan: err.message },
            }));
          }
        },

        setFilters: (filters: Partial<DiaryFilters>) => set(state => ({ ...state, filters: { ...state.filters, ...filters } })),
        setActiveTab: (tab: DiaryTab) => set(state => ({ ...state, activeTab: tab })),
        selectSession: (session: WorkoutSession | null) => set(state => ({ ...state, selectedSession: session })),
        clearErrors: () => set(state => ({ ...state, error: initialState.error })),

        ...createEnhancedDiaryActions(set, get, api),
      }),
      {
        name: 'diary-store',
        version: 2,
        partialize: (state: DiaryState) => {
          const {
            loading,
            error,
            sessions,
            currentPlan,
            todayWorkout,
            selectedSession,
            fetchSessions,
            fetchCurrentPlan,
            setFilters,
            setActiveTab,
            selectSession,
            clearErrors,
            fetchGoals,
            addGoal,
            updateGoal,
            deleteGoal,
            fetchWeeklyReflections,
            fetchCurrentWeekReflection,
            saveWeeklyReflection,
            fetchProgressPhotos,
            addProgressPhoto,
            calculateStreak,
            markSessionCompleted,
            ...rest
          } = state;
          return rest;
        },
      }
    )
  )
);

export default useDiaryStore;
