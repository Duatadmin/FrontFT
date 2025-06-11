-- This script creates the tables for workout sessions, exercises, and sets,
-- and then creates the 'workout_full_view' which joins them all together.
-- Run this script AFTER 'db_schema_fix.sql'.

-- 1. Create workout_sessions table
CREATE TABLE public.workout_sessions (
    session_id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    plan_id uuid REFERENCES public.training_plans(plan_id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    session_date date,
    day_label text,
    day_of_week text,
    focus_area text,
    session_number integer,
    overall_difficulty integer,
    duration_minutes integer,
    session_completed boolean DEFAULT false,
    session_state jsonb,
    week_id uuid,
    week_number integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own workout sessions"
ON public.workout_sessions
FOR ALL USING (auth.uid() = user_id);

-- 2. Create workout_exercises table
CREATE TABLE public.workout_exercises (
    exercise_row_id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    session_id uuid REFERENCES public.workout_sessions(session_id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_id uuid,
    exercise_name text,
    muscle_group text,
    sets_planned integer,
    rep_scheme text,
    rir integer,
    equipment text,
    tier text,
    order_in_session integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own workout exercises"
ON public.workout_exercises
FOR ALL USING (auth.uid() = user_id);

-- 3. Create workout_sets table
CREATE TABLE public.workout_sets (
    set_id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    exercise_row_id uuid REFERENCES public.workout_exercises(exercise_row_id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    set_no integer,
    reps_done integer,
    weight_kg numeric,
    rpe numeric,
    recorded_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own workout sets"
ON public.workout_sets
FOR ALL USING (auth.uid() = user_id);

-- 4. Create the workout_full_view
CREATE OR REPLACE VIEW public.workout_full_view AS
SELECT
    tp.plan_id,
    tp.user_id,
    tp.split_type,
    tp.goal,
    tp.level,
    tp.plan_status,
    ws.week_id,
    ws.week_number,
    ws.session_id,
    ws.day_label,
    ws.session_date,
    ws.day_of_week,
    ws.focus_area,
    ws.session_number,
    ws.overall_difficulty,
    ws.duration_minutes,
    ws.session_completed,
    ws.session_state,
    we.exercise_row_id,
    we.exercise_id,
    we.exercise_name,
    we.muscle_group,
    we.sets_planned,
    we.rep_scheme,
    we.rir,
    we.equipment,
    we.tier,
    we.order_in_session,
    w_set.set_id,
    w_set.set_no,
    w_set.reps_done,
    w_set.weight_kg,
    w_set.rpe,
    w_set.recorded_at
FROM
    public.training_plans tp
LEFT JOIN
    public.workout_sessions ws ON tp.plan_id = ws.plan_id
LEFT JOIN
    public.workout_exercises we ON ws.session_id = we.session_id
LEFT JOIN
    public.workout_sets w_set ON we.exercise_row_id = w_set.exercise_row_id;
