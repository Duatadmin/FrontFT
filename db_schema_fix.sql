-- This script creates the 'training_plans' table and sets up
-- Row Level Security (RLS) policies to ensure users can only
-- access their own data.

-- 1. Create the training_plans table
CREATE TABLE public.training_plans (
  plan_id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  name text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  split_type text,
  goal text,
  level text,
  plan_status text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Enable Row Level Security on the table
ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for SELECT, INSERT, UPDATE, and DELETE

-- Users can view their own training plans
CREATE POLICY "Users can view their own plans." 
ON public.training_plans
FOR SELECT USING (auth.uid() = user_id);

-- Users can create new training plans for themselves
CREATE POLICY "Users can create their own plans." 
ON public.training_plans
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own training plans
CREATE POLICY "Users can update their own plans." 
ON public.training_plans
FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own training plans
CREATE POLICY "Users can delete their own plans." 
ON public.training_plans
FOR DELETE USING (auth.uid() = user_id);
