# Fitness Tracker - Test User & Supabase Integration

## Overview

This project provides tools for creating synthetic test users with realistic workout data and integrating with Supabase as the backend database for the Fitness Tracker application. It includes:

1. A test user generator service that creates realistic workout data spanning one year
2. Comprehensive documentation on the Supabase database schema
3. Example code for querying and manipulating workout data
4. API endpoints for testing and data retrieval

## Database Schema

### Primary Tables

#### `users`

Stores basic user profile information.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `UUID` | Primary key |
| `created_at` | `timestamp` | Auto-filled by Supabase |

#### `workout_sessions`

Stores all workout session data, including completed exercises, metrics, and timestamps.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `UUID` | Primary key |
| `user_id` | `UUID` | Foreign key to `users.id` |
| `status` | `text` | "active" or "completed" |
| `focus_area` | `text` | Primary focus of the workout |
| `completed_exercises` | `JSONB` | Contains all exercise data |
| `metrics` | `JSONB` | Performance metrics for the session |
| `created_at` | `timestamp` | When the session started |
| `updated_at` | `timestamp` | Last update time |
| `completed_at` | `timestamp` | When the session was completed |
| `metadata` | `JSONB` | Additional session metadata |

### Data Structures

#### `completed_exercises` (JSONB)

```json
{
  "exercise_id_1": [
    {
      "set_number": 1,
      "reps": 10,
      "weight": 50,
      "rpe": 7
    },
    // Additional sets
  ],
  // Additional exercises
}
```

#### `metrics` (JSONB)

```json
{
  "start_time": "2025-02-24T15:00:00",
  "end_time": "2025-02-24T16:00:00",
  "total_duration_minutes": 60,
  "total_volume": 2500
}
```

#### `metadata` (JSONB)

```json
{
  "source": "custom", // or "plan"
  "plan_id": "uuid-of-training-plan", // if source is "plan"
  "is_deload": false,
  "overall_difficulty": 8
}
```

## Setup & Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-key
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR, CRITICAL
```

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/fitness-tracker.git
cd fitness-tracker

# Install dependencies
pip install -r requirements.txt
```

## Usage

### Generating Test User Data

Start the service:

```bash
python main.py
```

Create a test user with a year of workout data:

```bash
# Using curl
curl -X POST http://localhost:8000/seed-test-user

# Using PowerShell
Invoke-WebRequest -Method POST -Uri http://localhost:8000/seed-test-user
```

### Retrieving Workout Data

Get a random week of workout data for a specific user:

```bash
# Replace USER_ID with the actual UUID
curl -X GET http://localhost:8000/get-random-week/USER_ID

# Using PowerShell
Invoke-WebRequest -Method GET -Uri http://localhost:8000/get-random-week/USER_ID
```

## Generated Data Patterns

The synthetic workout data follows realistic patterns including:

- **Progressive Weight Increases**: Weights increase gradually over time based on exercise-specific progression rates
- **Deload Weeks**: Every ~7 weeks, weights are reduced to 50-60% for recovery
- **Rest Weeks**: Complete rest every 12 weeks
- **Training Split**: Logical 3-day rotation (Lower Body, Upper Push, Upper Pull)
- **Realistic Metrics**: Sets, reps, and RPE values that follow realistic patterns
- **Random Variation**: Small variations in weights and reps to simulate real-world conditions

## Querying Workout Data

### Example: Fetching a Full Workout Week

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project-url.supabase.co',
  'your-anon-key'
);

async function fetchWorkoutWeek(userId, startDate, endDate) {
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
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/seed-test-user` | POST | Creates a test user and generates a year of workout data |
| `/get-random-week/{user_id}` | GET | Retrieves a random week of workout data for the specified user |

## Important Notes

### Data Integrity

- All timestamps are stored in ISO 8601 format
- The `completed_at` field is the authoritative timestamp for when a workout was completed
- For workouts in progress, use `created_at` to determine when they were started

### Workout Status

- Only sessions with `status = "completed"` represent fully recorded workouts
- Sessions with `status = "active"` are in progress and may have partial data

### JSON Fields

- `completed_exercises` and `metrics` may be returned as JSON strings or objects
- Always check the type and parse if necessary before accessing properties

## Customization

To customize the generated data, modify the following constants in `main.py`:

- `EXERCISES`: List of exercises with initial/max weights and progression rates
- `WORKOUT_PREFERENCES`: Training frequency and exercise parameters

## Security Considerations

- The Supabase anon key is intended for browser-side use and has limited permissions
- All tables have Row-Level Security (RLS) policies enabled
- Users can only access their own data through RLS policies
- For production, ensure proper authentication is implemented

## Testing

To verify the data generation and retrieval:

1. Generate a test user with the `/seed-test-user` endpoint
2. Note the returned user ID
3. Use the `/get-random-week/{user_id}` endpoint to retrieve workout data
4. Verify that the data follows the expected structure and patterns

## Additional Resources

- [Supabase Documentation](https://supabase.io/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [PostgreSQL JSON Functions](https://www.postgresql.org/docs/current/functions-json.html)

test user id = 792ee0b8-5ba2-40a5-8f35-ab1bff798908

Update

1. Stored Column
Added a computed column to extract workout volume directly from JSON:

sql

ALTER TABLE workout_sessions
ADD COLUMN total_volume_kg NUMERIC
GENERATED ALWAYS AS ((metrics->>'total_volume')::NUMERIC) STORED;
2. Materialized Weekly KPI View
Created a fast-read table for weekly analytics (volume + PR count):

sql

CREATE MATERIALIZED VIEW mv_weekly_kpi AS
SELECT
  user_id,
  date_trunc('week', completed_at) AS week,
  SUM(total_volume_kg) AS volume,
  COUNT(*) FILTER (
    WHERE (metrics->>'is_pr')::BOOLEAN IS TRUE
  ) AS prs
FROM workout_sessions
WHERE status = 'completed'
GROUP BY 1, 2;
Indexed for performance:

sql

CREATE UNIQUE INDEX ON mv_weekly_kpi (user_id, week);