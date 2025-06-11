import { WorkoutFullViewRow } from '@/api/workoutPlanService';

// Define the structure for a single Set
export interface WorkoutSet {
  setId: string;
  setNo: number;
  repsDone: number | null;
  weightKg: number | null;
  rpe: number | null;
}

// Define the structure for a single Exercise within a Session
export interface SessionExercise {
  exerciseRowId: string;
  exerciseName: string;
  sets: WorkoutSet[];
}

// Define the structure for a single completed Session
export interface CompletedSession {
  sessionId: string;
  sessionDate: string;
  dayLabel: string | null;
  focusArea: string | null;
  overallDifficulty: number | null;
  durationMinutes: number | null;
  exercises: SessionExercise[];
}

/**
 * Transforms a flat array of workout_full_view rows into a structured array of completed sessions.
 * Each session contains a list of exercises, and each exercise contains a list of sets.
 * @param rows The flat array of rows from Supabase.
 * @returns A structured array of CompletedSession objects.
 */
export const rowsToSessionHistory = (rows: WorkoutFullViewRow[]): CompletedSession[] => {
  if (!rows || rows.length === 0) {
    return [];
  }

  const sessionMap = new Map<string, CompletedSession>();
  const exerciseMap = new Map<string, SessionExercise>();

  rows.forEach(row => {
    if (!row.session_id || !row.exercise_row_id || !row.set_id) {
      return; // Skip rows with missing critical IDs
    }

    // Get or create the session
    let session = sessionMap.get(row.session_id);
    if (!session) {
      session = {
        sessionId: row.session_id,
        sessionDate: row.session_date!,
        dayLabel: row.day_label,
        focusArea: row.focus_area,
        overallDifficulty: row.overall_difficulty,
        durationMinutes: row.duration_minutes,
        exercises: [],
      };
      sessionMap.set(row.session_id, session);
    }

    // Get or create the exercise within the session
    let exercise = exerciseMap.get(row.exercise_row_id);
    if (!exercise) {
      exercise = {
        exerciseRowId: row.exercise_row_id,
        exerciseName: row.exercise_name!,
        sets: [],
      };
      exerciseMap.set(row.exercise_row_id, exercise);
      session.exercises.push(exercise);
    }

    // Add the set to the exercise
    exercise.sets.push({
      setId: row.set_id,
      setNo: row.set_no!,
      repsDone: row.reps_done,
      weightKg: row.weight_kg,
      rpe: row.rpe,
    });
  });

  return Array.from(sessionMap.values());
};
