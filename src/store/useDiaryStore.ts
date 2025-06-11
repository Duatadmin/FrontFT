import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createEnhancedDiaryActions, EnhancedDiaryActions } from './enhancedDiaryActions';
import type {
  WorkoutSession,
  TrainingPlan,
  DiaryFilters,
  DiaryTab,
  Goal,
  WeeklyReflection,
  ProgressPhoto,
  Streak,
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
  loading: { goals: false, weeklyReflection: false, progressPhotos: false, streak: false },
  error: { goals: null, weeklyReflection: null, progressPhotos: null, streak: null },
};

const useDiaryStore = create<DiaryState>()(
  devtools(
    persist(
      (set, get, api) => ({
        ...initialState,

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
