-- Migration to add goals table to Supabase
-- Run this using the Supabase CLI or through the SQL editor in the Supabase dashboard

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  type text not null,
  metric text not null,
  target_value numeric not null,
  unit text,
  deadline date,
  completed_at timestamptz,
  progress numeric,
  inserted_at timestamptz default now()
);

-- Add comments to the table and columns
comment on table public.goals is 'Fitness goals for users to track progress';
comment on column public.goals.id is 'Primary key';
comment on column public.goals.user_id is 'User who owns this goal (references auth.users)';
comment on column public.goals.type is 'Goal type (strength, endurance, body_composition, benchmark)';
comment on column public.goals.metric is 'What is being measured (e.g., bench press 1RM, body weight, 5k time)';
comment on column public.goals.target_value is 'Target numeric value to achieve';
comment on column public.goals.unit is 'Unit of measurement (kg, lbs, minutes, etc)';
comment on column public.goals.deadline is 'Target date to achieve the goal';
comment on column public.goals.completed_at is 'When the goal was completed';
comment on column public.goals.progress is 'Current progress toward the goal (0-1)';
comment on column public.goals.inserted_at is 'When the goal was created';

-- Enable row-level security
alter table goals enable row level security;

-- Create RLS policy for users to manage their own goals
create policy "Users can CRUD own goals"
  on goals 
  using (auth.uid() = user_id);

-- Grant access to authenticated users
grant select, insert, update, delete on public.goals to authenticated;

-- Add to realtime publication if needed
-- alter publication supabase_realtime add table goals;

-- Create view for goals with calculated fields (for dashboard/reports)
create or replace view user_goal_summaries as
select
  user_id,
  count(*) as total_goals,
  count(*) filter (where completed_at is not null) as completed_goals,
  count(*) filter (where deadline < current_date and completed_at is null) as overdue_goals,
  json_agg(json_build_object(
    'id', id,
    'type', type,
    'metric', metric,
    'target_value', target_value,
    'unit', unit,
    'deadline', deadline,
    'completed_at', completed_at,
    'progress', progress
  )) as goals
from goals
group by user_id;

-- Grant access to the view
grant select on user_goal_summaries to authenticated;
