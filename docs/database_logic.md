 Fetching a Full Workout Week from Supabase
Source of Truth
The core table for completed workout data is the workout_sessions table in Supabase. This table stores all workout session data, including completed exercises, metrics, and timestamps. When a user completes a workout, the session is marked as "completed" and contains the full history of exercises performed.

Database Schema Structure
Primary Tables
workout_sessions - Main table storing all workout data
id: String (UUID) - Primary key
user_id: String - Foreign key to users table
status: String - "active" or "completed"
focus_area: String - Primary focus of the workout
completed_exercises: JSONB - Contains all exercise data
metrics: JSONB - Performance metrics for the session
created_at: Timestamp - When the session started
updated_at: Timestamp - Last update time
completed_at: Timestamp - When the session was completed
metadata: JSONB - Additional session metadata (including source, plan_id)
users - Contains user profiles
id: String - Primary key
Data Structure
The completed_exercises field is a JSONB object with the following structure:

json
CopyInsert
{
  "exercise_id_1": [
    {
      "set": 1,
      "reps": 10,
      "weight": 50,
      "timestamp": "2025-02-24T15:30:00",
      "rpe": 7 // Optional
    },
    // Additional sets
  ],
  // Additional exercises
}
The metrics field contains workout performance data:

json
CopyInsert
{
  "start_time": "2025-02-24T15:00:00",
  "end_time": "2025-02-24T16:00:00",
  "total_duration_minutes": 60,
  "total_volume": 2500
}
Data Access Path
To fetch a full workout week from two months ago:

Identify the date range:
Calculate the start and end dates for the week of interest (two months ago)
Query completed workout sessions:
Filter by user_id to get the specific user's data
Filter by status = "completed" to get only completed workouts
Filter by date range using the completed_at timestamp
Order by completed_at (ascending) to get chronological order
Process the data:
Parse each session's completed_exercises and metrics fields
Group sessions by day if necessary
Sample Query
Using the Supabase JavaScript Client
typescript
CopyInsert
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project-url.supabase.co',
  'your-anon-key'
);

async function fetchWorkoutWeek(userId: string) {
  // Calculate date range (two months ago, full week)
  const today = new Date();
  const twoMonthsAgo = new Date(today);
  twoMonthsAgo.setMonth(today.getMonth() - 2);
  
  // Find the beginning of that week (Sunday)
  const startOfWeek = new Date(twoMonthsAgo);
  startOfWeek.setDate(twoMonthsAgo.getDate() - twoMonthsAgo.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Find the end of that week (Saturday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  // Format dates for Supabase query
  const startDate = startOfWeek.toISOString();
  const endDate = endOfWeek.toISOString();
  
  // Query Supabase
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('completed_at', startDate)
    .lte('completed_at', endDate)
    .order('completed_at', { ascending: true });
    
  if (error) {
    console.error('Error fetching workout data:', error);
    return null;
  }
  
  // Process the data (parse JSON fields)
  return data.map(session => ({
    ...session,
    completed_exercises: typeof session.completed_exercises === 'string' 
      ? JSON.parse(session.completed_exercises) 
      : session.completed_exercises,
    metrics: typeof session.metrics === 'string'
      ? JSON.parse(session.metrics)
      : session.metrics
  }));
}
SQL Query (for reference)
sql
CopyInsert
SELECT *
FROM workout_sessions
WHERE user_id = 'user_123'
AND status = 'completed'
AND completed_at >= '2025-02-24T00:00:00.000Z'
AND completed_at <= '2025-03-02T23:59:59.999Z'
ORDER BY completed_at ASC;
Key Assumptions and Implementation Notes
Timestamps:
All timestamps are stored in ISO 8601 format
The completed_at field is the authoritative timestamp for when a workout was completed
For workouts in progress, use created_at to determine when they were started
Workout Status:
Only sessions with status = "completed" represent fully recorded workouts
Sessions with status = "active" are in progress and may have partial data
JSON Fields:
completed_exercises and metrics may be returned as JSON strings or objects
Always check the type and parse if necessary before accessing properties
Data Integrity:
Some older records might have different structures or missing fields
Include null checks and defaults for robust error handling
Pagination:
If a user has many workouts, consider implementing pagination
Use Supabase's .range() method for large result sets
Workout Source:
The metadata.source field indicates whether a workout came from a plan ("plan") or was custom ("custom")
For plan-linked workouts, metadata.plan_id references the original plan
This approach provides a complete view of a user's workout history for any specific week, enabling frontend developers to build dashboards, progress trackers, or recap features