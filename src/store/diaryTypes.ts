// @/store/diaryTypes.ts

/**
 * This file contains all the type definitions for the diary feature,
 * based on the backend's workout_full_view and other related tables.
 * It serves as a single source of truth for data structures.
 */

// #region Main Workout Types (from workout_full_view)

/**
 * Represents a single, flat row from the workout_full_view.
 * All fields are non-optional but can be null.
 */
export type WorkoutFullViewRow = {
  plan_id: string | null;
  user_id: string | null;
  split_type: string | null;
  goal: string | null;
  level: string | null;
  plan_status: string | null;
  week_start: string | null;
  week_id: string | null;
  week_number: number | null;
  week_start_date: string | null;
  session_id: string | null;
  day_label: string | null;
  session_date: string | null;
  day_of_week: string | null;
  focus_area: string | null;
  session_number: number | null;
  overall_difficulty: number | null;
  duration_minutes: number | null;
  session_completed: boolean | null;
  session_state: any | null; // JSONB
  exercise_row_id: string | null;
  exercise_id: string | null;
  exercise_name: string | null;
  muscle_group: string | null;
  sets_planned: number | null;
  rep_scheme: string | null;
  rir: number | null;
  equipment: string | null;
  tier: string | null;
  order_in_session: number | null;
  set_id: string | null;
  set_no: number | null;
  reps_done: number | null;
  weight_kg: number | null;
  rpe: number | null;
  recorded_at: string | null;
};

/**
 * Represents a single set within an exercise, structured for the client.
 * Properties are non-optional but can be null.
 */
export type WorkoutSet = {
  set_id: string;
  set_no: number | null;
  reps_done: number | null;
  weight_kg: number | null;
  rpe: number | null;
  recorded_at: string | null;
};

/**
 * Represents a single exercise within a session, containing its sets.
 * Properties are non-optional but can be null.
 */
export type WorkoutExercise = {
  exercise_row_id: string;
  exercise_id: string | null;
  exercise_name: string | null;
  muscle_group: string | null;
  sets_planned: number | null;
  rep_scheme: string | null;
  rir: number | null;
  equipment: string | null;
  tier: string | null;
  order_in_session: number | null;
  sets: WorkoutSet[];
};

/**
 * Represents a complete workout session, with nested exercises and sets.
 * Properties are non-optional but can be null.
 */
export type WorkoutSession = {
  session_id: string;
  session_date: string | null;
  day_label: string | null;
  day_of_week: string | null;
  focus_area: string | null;
  session_number: number | null;
  overall_difficulty: number | null;
  duration_minutes: number | null;
  session_completed: boolean | null;
  session_state: any | null; // JSONB
  exercises: WorkoutExercise[];
  week_id: string | null;
  week_number: number | null;
  plan_id: string | null;
};

/**
 * Represents a user's training plan.
 */
export type TrainingPlan = {
  plan_id: string;
  user_id: string | null;
  split_type: string | null;
  goal: string | null;
  level: string | null;
  plan_status: string | null;
};

// #endregion

// #region Enhanced Diary Feature Types

export type DiaryFilters = {
  dateRange: { from: string; to: string } | null;
  focusArea: string | null;
  prAchieved: boolean | null;
};

export type Goal = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_date: string;
  type: 'short_term' | 'long_term';
  progress: number;
  created_at: string;
  completed: boolean;
};

// Legacy type for goals, kept for potential migration.
export type FitnessGoal = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_value: number;
  current_value: number;
  unit: string;
  category: 'strength' | 'endurance' | 'weight' | 'habit' | 'other';
  target_date: string | null;
  created_at: string;
  completed: boolean;
  completed_at: string | null;
};

export type Challenge = {
  id: string;
  user_id: string;
  text: string;
  solution: string | null;
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

export type ProgressPhoto = {
  id: string;
  user_id: string;
  url: string;
  caption: string | null;
  description: string | null;
  date: string;
};

export type DiaryTab = 'daily' | 'weekly' | 'goals';

export type Streak = {
  currentStreak: number;
  longestStreak: number;
  lastSevenDays: boolean[];
  streakChange: number;
};

// #endregion
