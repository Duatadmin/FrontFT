import type { WorkoutFullViewRow } from '@/api/workoutPlanService';

// -------------------------------------------------------------------------------------
// Type Definitions for the Nested Workout Plan Structure
// Based on docs/workout_plan_SQL.md (section 7)
// -------------------------------------------------------------------------------------

export interface WorkoutSet {
  id: string; // set_id
  setNo: number | null;
  repsDone: number | null;
  weightKg: number | null;
  rpe: number | null;
  recordedAt: string | null; // recorded_at
}

export interface WorkoutExercise {
  exerciseRowId: string; // exercise_row_id
  exerciseId: string | null; // exercise_id (e.g., from an exercise database)
  name: string | null;
  muscleGroup: string | null;
  setsPlanned: number | null;
  repScheme: string | null;
  rir: number | null;
  equipment: string | null;
  tier: string | null;
  orderInSession: number | null;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  sessionId: string; // session_id
  dayLabel: string | null;
  sessionDate: string | null; // session_date
  dayOfWeek: string | null;
  focusArea: string | null;
  sessionNumber: number | null;
  overallDifficulty: number | null;
  durationMinutes: number | null;
  sessionCompleted: boolean | null;
  sessionState: any | null; // session_state (JSONB)
  exercises: WorkoutExercise[];
}

export interface WorkoutWeek {
  weekId: string; // week_id
  weekNumber: number | null;
  weekStartDate: string | null; // week_start_date
  // weekStart: string | null; // week_start (original column, week_start_date is preferred for clarity)
  sessions: WorkoutSession[];
}

export interface WorkoutPlan {
  planId: string; // plan_id
  userId: string | null;
  splitType: string | null;
  goal: string | null;
  level: string | null;
  planStatus: string | null;
  weeks: WorkoutWeek[];
}

// -------------------------------------------------------------------------------------
// Transformation Function: rowsToPlanTree
// Based on docs/workout_plan_SQL.md (section 8)
// -------------------------------------------------------------------------------------

export const rowsToPlanTree = (rows: WorkoutFullViewRow[] | null | undefined): WorkoutPlan | null => {
  if (!rows || rows.length === 0) {
    return null;
  }

  // Ensure planId is consistent and exists, pick the first one.
  // All rows should belong to the same plan for this function.
  const firstRowPlanId = rows[0]?.plan_id;
  if (!firstRowPlanId) {
      console.warn('rowsToPlanTree: No plan_id found in the first row or rows array is invalid.');
      return null;
  }

  const plan: WorkoutPlan = {
    planId: firstRowPlanId,
    userId: rows[0]?.user_id ?? null,
    splitType: rows[0]?.split_type ?? null,
    goal: rows[0]?.goal ?? null,
    level: rows[0]?.level ?? null,
    planStatus: rows[0]?.plan_status ?? null,
    weeks: [],
  };

  const weekMap = new Map<string, WorkoutWeek>();
  const sessionMap = new Map<string, WorkoutSession>();
  const exerciseMap = new Map<string, WorkoutExercise>();

  rows.forEach(r => {
    if (!r.plan_id || r.plan_id !== plan.planId) {
        console.warn(`Skipping row with mismatched plan_id: expected ${plan.planId}, got ${r.plan_id}`);
        return; // Skip rows not belonging to the main plan_id
    }

    // WEEK
    if (r.week_id && !weekMap.has(r.week_id)) {
      const week: WorkoutWeek = {
        weekId: r.week_id,
        weekNumber: r.week_number ?? null,
        weekStartDate: r.week_start_date ?? null,
        sessions: [],
      };
      weekMap.set(r.week_id, week);
      plan.weeks.push(week);
    }

    // SESSION
    const currentWeek = r.week_id ? weekMap.get(r.week_id) : null;
    if (currentWeek && r.session_id && !sessionMap.has(r.session_id)) {
      const session: WorkoutSession = {
        sessionId: r.session_id,
        dayLabel: r.day_label ?? null,
        sessionDate: r.session_date ?? null,
        dayOfWeek: r.day_of_week ?? null,
        focusArea: r.focus_area ?? null,
        sessionNumber: r.session_number ?? null,
        overallDifficulty: r.overall_difficulty ?? null,
        durationMinutes: r.duration_minutes ?? null,
        sessionCompleted: r.session_completed ?? null,
        sessionState: r.session_state ?? null,
        exercises: [],
      };
      sessionMap.set(r.session_id, session);
      currentWeek.sessions.push(session);
    }

    // EXERCISE
    const currentSession = r.session_id ? sessionMap.get(r.session_id) : null;
    if (currentSession && r.exercise_row_id && !exerciseMap.has(r.exercise_row_id)) {
      const exercise: WorkoutExercise = {
        exerciseRowId: r.exercise_row_id,
        exerciseId: r.exercise_id ?? null,
        name: r.exercise_name ?? null,
        muscleGroup: r.muscle_group ?? null,
        setsPlanned: r.sets_planned ?? null,
        repScheme: r.rep_scheme ?? null,
        rir: r.rir ?? null,
        equipment: r.equipment ?? null,
        tier: r.tier ?? null,
        orderInSession: r.order_in_session ?? null,
        sets: [],
      };
      exerciseMap.set(r.exercise_row_id, exercise);
      currentSession.exercises.push(exercise);
    }

    // SET (only add if set_id exists, indicating an actual set rather than just planned exercise)
    const currentExercise = r.exercise_row_id ? exerciseMap.get(r.exercise_row_id) : null;
    if (currentExercise && r.set_id) {
      // Prevent duplicate sets if data isn't perfectly clean
      if (!currentExercise.sets.find(s => s.id === r.set_id)) {
        currentExercise.sets.push({
          id: r.set_id,
          setNo: r.set_no ?? null,
          repsDone: r.reps_done ?? null,
          weightKg: r.weight_kg ?? null,
          rpe: r.rpe ?? null,
          recordedAt: r.recorded_at ?? null,
        });
      }
    }
  });

  // Sort weeks, sessions, exercises, and sets by their respective order/number fields
  plan.weeks.sort((a, b) => (a.weekNumber ?? 0) - (b.weekNumber ?? 0));
  plan.weeks.forEach(week => {
    week.sessions.sort((a, b) => (a.sessionNumber ?? 0) - (b.sessionNumber ?? 0));
    week.sessions.forEach(session => {
      session.exercises.sort((a, b) => (a.orderInSession ?? 0) - (b.orderInSession ?? 0));
      session.exercises.forEach(exercise => {
        exercise.sets.sort((a, b) => (a.setNo ?? 0) - (b.setNo ?? 0));
      });
    });
  });

  return plan;
};
