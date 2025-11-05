import { StateCreator } from 'zustand';
import type { Goal, WeeklyReflection, ProgressPhoto, Challenge } from './diaryTypes';
import { DiaryState } from './useDiaryStore'; // Import the main state type
import {
  generateMockGoals,
  generateMockWeeklyReflections,
  generateCurrentWeekReflection,
  generateMockProgressPhotos,
  calculateMockStreak,
} from '../lib/mockDiaryEnhancedData';

// This defines the shape of the slice that will be created.
// It's separated for clarity and to be used in the main store type.
export type EnhancedDiaryActions = {
  fetchGoals: (userId: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'completed'>, userId: string) => Promise<void>;
  updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;

  fetchWeeklyReflections: (userId: string) => Promise<void>;
  fetchCurrentWeekReflection: (userId: string) => Promise<void>;
  saveWeeklyReflection: (reflection: Partial<WeeklyReflection>, userId: string) => Promise<void>;

  fetchProgressPhotos: (userId: string) => Promise<void>;
  addProgressPhoto: (photo: Omit<ProgressPhoto, 'id' | 'user_id'>, userId: string) => Promise<void>;
  removeProgressPhoto: (photoId: string, userId: string) => Promise<void>; // Added

  // Challenges
  addChallenge: (challenge: Omit<Challenge, 'id' | 'user_id' | 'week_id'>, userId: string, weekId: string) => Promise<void>; // Added
  removeChallenge: (challengeId: string, userId: string) => Promise<void>; // Added
  updateChallenge: (challengeId: string, updates: Partial<Omit<Challenge, 'id' | 'user_id' | 'week_id'>>, userId: string) => Promise<void>; // Added

  calculateStreak: () => Promise<void>;
  markSessionCompleted: (sessionId: string) => Promise<void>;
};

/**
 * This portion of the state creator handles enhanced diary features like goals, reflections, and progress tracking.
 * It is designed to be merged into the main useDiaryStore.
 * Using mock data for now.
 */
export const createEnhancedDiaryActions: StateCreator<
  DiaryState,
  [],
  [],
  EnhancedDiaryActions
> = (set, get) => ({
  // #region Goals
  fetchGoals: async (userId) => {
    set(state => ({ ...state, loading: { ...state.loading, goals: true } }));
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockGoals = generateMockGoals(userId);
    set(state => ({ ...state, goals: mockGoals, loading: { ...state.loading, goals: false } }));
  },

  addGoal: async (goal, userId) => {
    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      progress: 0,
      completed: false,
    };
    set(state => ({ ...state, goals: [...state.goals, newGoal] }));
  },

  updateGoal: async (goalId, updates) => {
    set(state => ({
      ...state,
      goals: state.goals.map(g => (g.id === goalId ? { ...g, ...updates } : g)),
    }));
  },

  deleteGoal: async (goalId) => {
    set(state => ({ ...state, goals: state.goals.filter(g => g.id !== goalId) }));
  },
  // #endregion

  // #region Reflections
  fetchWeeklyReflections: async (userId) => {
    set(state => ({ ...state, loading: { ...state.loading, weeklyReflection: true } }));
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockReflections = generateMockWeeklyReflections(userId);
    set(state => ({ ...state, weeklyReflections: mockReflections, loading: { ...state.loading, weeklyReflection: false } }));
  },

  fetchCurrentWeekReflection: async (userId) => {
    set(state => ({ ...state, loading: { ...state.loading, weeklyReflection: true } }));
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockReflection = generateCurrentWeekReflection(userId);
    set(state => ({ ...state, currentWeekReflection: mockReflection, loading: { ...state.loading, weeklyReflection: false } }));
  },

  saveWeeklyReflection: async (reflection, userId) => {
    const current = get().currentWeekReflection;
    if (current) {
      const updated = { ...current, ...reflection, updated_at: new Date().toISOString() };
      set(state => ({
        ...state,
        currentWeekReflection: updated,
        weeklyReflections: state.weeklyReflections.map(r => r.id === current.id ? updated : r)
      }));
    } else {
      // Handle creating a new one if it doesn't exist
      console.log('Creating new weekly reflection - logic to be implemented for user:', userId);
    }
  },
  // #endregion

  // #region Progress Photos
  fetchProgressPhotos: async (userId) => {
    set(state => ({ ...state, loading: { ...state.loading, progressPhotos: true } }));
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockPhotos = generateMockProgressPhotos(userId);
    set(state => ({ ...state, progressPhotos: mockPhotos, loading: { ...state.loading, progressPhotos: false } }));
  },

  addProgressPhoto: async (photo, userId) => {
    const newPhoto: ProgressPhoto = {
      ...photo,
      id: `photo-${Date.now()}`,
      user_id: userId,
    };
    set(state => ({ ...state, progressPhotos: [...state.progressPhotos, newPhoto] }));
  },
  // #endregion

  removeProgressPhoto: async (photoId, userId) => {
    console.log(`Mock removeProgressPhoto for photoId: ${photoId}, userId: ${userId}`);
    set(state => ({
      ...state,
      progressPhotos: state.progressPhotos.filter(p => p.id !== photoId),
    }));
  },
  // #endregion

  // #region Challenges
  addChallenge: async (challenge, userId, weekId) => {
    const newChallenge: Challenge = {
      ...challenge,
      id: `challenge-${Date.now()}`,
      user_id: userId,
      week_id: weekId,
    };
    console.log('Mock addChallenge:', newChallenge);
    // Assuming weeklyReflections[0] is the target for now, or currentWeekReflection
    set(state => {
      const reflectionToUpdate = state.currentWeekReflection || (state.weeklyReflections.length > 0 ? state.weeklyReflections[0] : null);
      if (reflectionToUpdate) {
        const updatedReflection = {
          ...reflectionToUpdate,
          challenges: [...(reflectionToUpdate.challenges || []), newChallenge],
        };
        return {
          ...state,
          currentWeekReflection: state.currentWeekReflection ? updatedReflection : state.currentWeekReflection,
          weeklyReflections: state.weeklyReflections.map(r => r.id === updatedReflection.id ? updatedReflection : r),
        };
      }
      return state; // Or handle error: no reflection to add challenge to
    });
  },

  removeChallenge: async (challengeId, userId) => {
    console.log(`Mock removeChallenge for challengeId: ${challengeId}, userId: ${userId}`);
    set(state => {
      const reflectionToUpdate = state.currentWeekReflection || (state.weeklyReflections.length > 0 ? state.weeklyReflections[0] : null);
      if (reflectionToUpdate) {
        const updatedReflection = {
          ...reflectionToUpdate,
          challenges: (reflectionToUpdate.challenges || []).filter(c => c.id !== challengeId),
        };
        return {
          ...state,
          currentWeekReflection: state.currentWeekReflection ? updatedReflection : state.currentWeekReflection,
          weeklyReflections: state.weeklyReflections.map(r => r.id === updatedReflection.id ? updatedReflection : r),
        };
      }
      return state;
    });
  },

  updateChallenge: async (challengeId, updates, userId) => {
    console.log(`Mock updateChallenge for challengeId: ${challengeId}, userId: ${userId}`, updates);
    set(state => {
      const reflectionToUpdate = state.currentWeekReflection || (state.weeklyReflections.length > 0 ? state.weeklyReflections[0] : null);
      if (reflectionToUpdate) {
        const updatedReflection = {
          ...reflectionToUpdate,
          challenges: (reflectionToUpdate.challenges || []).map(c => 
            c.id === challengeId ? { ...c, ...updates } : c
          ),
        };
        return {
          ...state,
          currentWeekReflection: state.currentWeekReflection ? updatedReflection : state.currentWeekReflection,
          weeklyReflections: state.weeklyReflections.map(r => r.id === updatedReflection.id ? updatedReflection : r),
        };
      }
      return state;
    });
  },
  // #endregion

  // #region Streaks & Completion
  calculateStreak: async () => {
    set(state => ({ ...state, loading: { ...state.loading, streak: true } }));
    const mockStreak = calculateMockStreak(get().sessions);
    set(state => ({ ...state, streak: mockStreak, loading: { ...state.loading, streak: false } }));
  },

  markSessionCompleted: async (sessionId) => {
    set(state => ({
      ...state,
      sessions: state.sessions.map(s =>
        s.session_id === sessionId ? { ...s, session_completed: true } : s
      ),
    }));
  },
  // #endregion
});
