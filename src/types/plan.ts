// src/types/plan.ts

export interface PlanOverview {
  id: string;
  name: string;
  split_type: string;
  goal_type: string;
  status: 'active' | 'inactive' | 'completed' | 'archived';
  completion_pct: number;
  total_weeks: number;
  total_sessions: number;
  sessions_completed: number;
  week_start: string | null;
  next_session_date: string | null;
  // Add other properties as needed based on full data structure
}
