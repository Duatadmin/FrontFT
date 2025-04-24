-- Fitness Tracker Database Setup Script
-- Run this in your Supabase SQL Editor to create all required tables

-- Users table (may already exist in Supabase)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nickname TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Workout Sessions table
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('active', 'completed')),
  focus_area TEXT,
  completed_exercises JSONB DEFAULT '{}'::jsonb,
  metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  total_volume_kg NUMERIC GENERATED ALWAYS AS ((metrics->>'total_volume')::NUMERIC) STORED
);

-- Training Plans table
CREATE TABLE IF NOT EXISTS public.training_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT false,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('active', 'completed', 'abandoned')),
  progress NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Progress Photos table
CREATE TABLE IF NOT EXISTS public.progress_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Weekly Reflections table
CREATE TABLE IF NOT EXISTS public.weekly_reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reflections ENABLE ROW LEVEL SECURITY;

-- Create policies to allow users to only see their own data
CREATE POLICY users_policy ON public.users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY workout_sessions_policy ON public.workout_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY training_plans_policy ON public.training_plans
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY goals_policy ON public.goals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY progress_photos_policy ON public.progress_photos
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY weekly_reflections_policy ON public.weekly_reflections
  FOR ALL USING (auth.uid() = user_id);

-- Create a function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER workout_sessions_updated_at
  BEFORE UPDATE ON public.workout_sessions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER training_plans_updated_at
  BEFORE UPDATE ON public.training_plans
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER weekly_reflections_updated_at
  BEFORE UPDATE ON public.weekly_reflections
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Insert test user if it doesn't exist
INSERT INTO public.users (id, nickname, email, created_at)
VALUES 
  ('792ee0b8-5ba2-40a5-8f35-ab1bff798908', 'TestUser', 'test@example.com', now())
ON CONFLICT (id) DO NOTHING;

-- Create a materialized view for weekly KPIs
CREATE MATERIALIZED VIEW IF NOT EXISTS public.weekly_workout_stats AS
SELECT
  user_id,
  date_trunc('week', completed_at) AS week_start,
  COUNT(*) AS workout_count,
  SUM((metrics->>'total_volume')::numeric) AS total_volume,
  COUNT(CASE WHEN metadata->>'pr_achieved' = 'true' THEN 1 END) AS pr_count
FROM
  public.workout_sessions
WHERE
  status = 'completed'
GROUP BY
  user_id, date_trunc('week', completed_at);

-- Create index for the materialized view
CREATE INDEX IF NOT EXISTS weekly_workout_stats_user_week_idx ON public.weekly_workout_stats (user_id, week_start);

-- Create a refresh function for the materialized view
CREATE OR REPLACE FUNCTION refresh_weekly_workout_stats()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.weekly_workout_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to refresh the materialized view when workout_sessions changes
CREATE TRIGGER refresh_weekly_workout_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.workout_sessions
FOR EACH STATEMENT EXECUTE FUNCTION refresh_weekly_workout_stats();

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON public.users TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_sessions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_plans TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.progress_photos TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_reflections TO anon, authenticated;
GRANT SELECT ON public.weekly_workout_stats TO anon, authenticated;
