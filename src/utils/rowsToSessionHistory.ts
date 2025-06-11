import { type WorkoutFullViewRow } from '@/api/workoutPlanService';

// Defines the shape of the data that the UI will consume.
// This is the single source of truth for these types.

export type SessionSet = {
  setId: string;
  setNo: number;
  repsDone: number | null;
  weightKg: number | null;
  rpe: number | null;
};

export type SessionExercise = {
  exerciseRowId: string;
  exerciseName: string;
  sets: SessionSet[];
};

export type CompletedSession = {
  sessionId: string;
  sessionDate: string;
  sessionTitle: string;
  focusArea: string | null;
  durationMinutes: number | null;
  exercises: SessionExercise[];
};

/**
 * Transforms a flat array of workout_full_view rows into a structured array of completed sessions.
 * @param rows The raw rows from the Supabase view.
 * @returns A structured array of completed sessions with nested exercises and sets.
 */
export const rowsToSessionHistory = (rows: WorkoutFullViewRow[]): CompletedSession[] => {
  if (!rows || rows.length === 0) {
    return [];
  }

  const sessionMap = new Map<string, CompletedSession>();

  for (const row of rows) {
    // Core data must exist to build the session history.
    // A session must have an ID and a date to be useful.
    if (!row.session_id || !row.session_date) {
      console.warn('Skipping row due to missing session_id or session_date:', row);
      continue;
    }

    // Find or create the session.
    let session = sessionMap.get(row.session_id);
    if (!session) {
      session = {
        sessionId: row.session_id,
        sessionDate: row.session_date,
        // Use day_label or focus_area as the title, with a fallback.
        sessionTitle: row.day_label || row.focus_area || 'Completed Workout',
        focusArea: row.focus_area,
        durationMinutes: row.duration_minutes,
        exercises: [],
      };
      sessionMap.set(row.session_id, session);
    }

    // If we have exercise data, add it to the session.
    if (row.exercise_row_id && row.exercise_name) {
      let exercise = session.exercises.find(ex => ex.exerciseRowId === row.exercise_row_id);
      if (!exercise) {
        exercise = {
          exerciseRowId: row.exercise_row_id,
          exerciseName: row.exercise_name,
          sets: [],
        };
        session.exercises.push(exercise);
      }

      // Add the set to the exercise if it exists.
      if (row.set_id && typeof row.set_no === 'number') {
        exercise.sets.push({
          setId: row.set_id,
          setNo: row.set_no,
          repsDone: row.reps_done,
          weightKg: row.weight_kg,
          rpe: row.rpe,
        });
      }
    }


  }

  return Array.from(sessionMap.values());
};
