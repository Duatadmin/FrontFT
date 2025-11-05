// Zustand store for workout plan optimistic updates
import { create } from 'zustand';
import type { WorkoutPlan, WorkoutSet } from '@/utils/rowsToPlanTree';

// Define the state structure
interface WorkoutState {
  activePlan: WorkoutPlan | null;
  setInitialPlan: (plan: WorkoutPlan) => void;
  updateSetOptimistically: (
    // planId: string, // Removed - store uses activePlan.planId
    weekId: string,
    sessionId: string,
    exerciseId: string, // or exerciseRowId if more unique
    setId: string,
    updatedData: Partial<Pick<WorkoutSet, 'repsDone' | 'weightKg' | 'rpe' | 'recordedAt'>>
  ) => { success: boolean; originalSet?: WorkoutSet };
  // Potentially a revert action if needed, though often optimistic updates are just re-fetched
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  activePlan: null,

  setInitialPlan: (plan) => set({ activePlan: plan }),

  updateSetOptimistically: (weekId, sessionId, exerciseId, setId, updatedData) => { // planId parameter removed
    const currentPlan = get().activePlan;
    if (!currentPlan) { // Removed planId check, activePlan is the source of truth
      console.warn('Optimistic update: Active plan not found in store.');
      return { success: false };
    }

    let originalSetData: WorkoutSet | undefined;
    let updateSucceeded = false;

    const updatedWeeks = currentPlan.weeks.map(week => {
      if (week.weekId !== weekId) return week;
      return {
        ...week,
        sessions: week.sessions.map(session => {
          if (session.sessionId !== sessionId) return session;
          return {
            ...session,
            exercises: session.exercises.map(exercise => {
              // Assuming exercise.id is the unique identifier for an exercise within a session
              // If exerciseRowId is globally unique and preferred, adjust logic
              // Use exercise.exerciseId for comparison if it's guaranteed to be the unique ID passed as exerciseId parameter.
// Or, if exerciseRowId is the globally unique key used for updates, ensure it's passed and used here.
// For now, assuming exercise.exerciseId is the one intended for matching the 'exerciseId' parameter.
if (exercise.exerciseId !== exerciseId && exercise.exerciseRowId !== exerciseId) return exercise; // Check both possible IDs if exerciseId param could be either
              return {
                ...exercise,
                sets: exercise.sets.map(setObj => {
                  if (setObj.id !== setId) return setObj;
                  originalSetData = { ...setObj }; // Store a copy of the original set
                  updateSucceeded = true;
                  return {
                    ...setObj,
                    ...updatedData,
                    recordedAt: updatedData.recordedAt || new Date().toISOString(), // Ensure recordedAt is updated
                  };
                }),
              };
            }),
          };
        }),
      };
    });

    if (updateSucceeded) {
      set({ activePlan: { ...currentPlan, planId: currentPlan.planId, weeks: updatedWeeks } });
      return { success: true, originalSet: originalSetData };
    }
    
    console.warn('Optimistic update: Set not found within the specified path.');
    return { success: false };
  },
}));

// This export ensures the file is treated as a module.
export {};
