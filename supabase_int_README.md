# Supabase Integration for Jarvis Chat PWA

This document outlines how the Jarvis Chat PWA connects to the Supabase backend, detailing the setup, relevant database schema, security considerations, and example queries.

---

## 1. 📦 Installation & Client Setup

Install the official Supabase client library:

```bash
npm install @supabase/supabase-js
```

Create a `.env` file in the root of the `pwa` project and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Initialize the Supabase client. Typically, this is done in a dedicated file (e.g., `src/lib/supabaseClient.ts`):

```ts
import { createClient } from '@supabase/supabase-js'

// Ensure environment variables are loaded correctly (Vite uses import.meta.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be defined in environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 2. 🗃️ Schema Overview (Relevant Tables)

The PWA primarily interacts with the following Supabase tables:

### `users`

Stores basic user profile information.

| Field           | Type      | Notes                                 |
|-----------------|-----------|---------------------------------------|
| `id`            | `UUID`    | Primary key (usually Supabase Auth UID) |
| `created_at`    | `timestamp`| Auto-filled by Supabase               |
| `nickname`      | `text`    | Display name                          |
| `fitness_level` | `text`    | e.g. "beginner", "intermediate"       |
| `goals`         | `text[]`  | Array of fitness goals, e.g. `{"strength", "mobility"}` |
| `preferences`   | `jsonb`   | Optional user-defined config          |

### `training_plans`

Defines the structure of a user's workout plan.

| Field          | Type       | Notes                         |
|----------------|------------|-------------------------------|
| `id`           | `UUID`     | Primary key                   |
| `user_id`      | `UUID`     | Foreign key to `users.id`     |
| `created_at`   | `timestamp`| Plan creation time            |
| `name`         | `text`     | e.g. "Upper Body Push"        |
| `days`         | `jsonb`    | Map of training days to exercise keys |

**Example `days` JSON:**

```json
{
  "monday": ["bench_press", "triceps_dips"],
  "thursday": ["shoulder_press", "pushups"]
}
```

### `workout_sessions`

Logs completed workout sessions.

| Field                | Type        | Notes                                  |
|----------------------|-------------|----------------------------------------|
| `id`                 | `UUID`      | Primary key                            |
| `user_id`            | `UUID`      | Foreign key to `users.id`              |
| `training_plan_id`   | `UUID`      | Foreign key to `training_plans.id`     |
| `timestamp`          | `timestamp` | When the workout was completed         |
| `duration_minutes`   | `integer`   | Workout length                         |
| `exercises_completed`| `text[]`    | List of finished exercise keys         |
| `total_sets`         | `integer`   | Number of sets completed               |
| `total_reps`         | `integer`   | Number of reps completed               |
| `overall_difficulty` | `int`       | User's perceived difficulty (1–10)     |
| `user_feedback`      | `text`      | Optional freeform feedback             |

---

## 3. 🔐 Security Notes

- **Public Key Usage**: The `VITE_SUPABASE_ANON_KEY` is a public key intended for browser-side use. It does **not** grant broad access.
- **Row-Level Security (RLS)**:
    - All relevant tables (`users`, `training_plans`, `workout_sessions`, etc.) **must** have RLS enabled in Supabase.
    - Policies are configured to ensure that authenticated users can only perform operations (SELECT, INSERT, UPDATE, DELETE) on rows that are associated with their own `user_id`.
    - For example, a user can only `SELECT` rows from `workout_sessions` where the `user_id` column matches their authenticated session UID.

---

## 4. 🔧 Example Queries (Frontend Usage)

These examples assume you have initialized the `supabase` client as shown in section 1 and have the authenticated user's ID (`userId`).

### Get User's Workout History

Fetches all workout sessions for a specific user, ordered by most recent.

```ts
import { supabase } from './lib/supabaseClient'; // Adjust path as needed

async function fetchWorkoutHistory(userId: string) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*') // Select all columns
    .eq('user_id', userId) // Filter by user ID
    .order('timestamp', { ascending: false }); // Newest first

  if (error) {
    console.error('Error fetching workout history:', error);
    return null;
  }
  return data;
}
```

### Get Active Training Plan

Fetches the most recently created training plan for a specific user. Adjust logic if multiple active plans are possible.

```ts
import { supabase } from './lib/supabaseClient'; // Adjust path as needed

async function fetchActiveTrainingPlan(userId: string) {
  const { data, error } = await supabase
    .from('training_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false }) // Assuming newest is active
    .limit(1) // Get only one plan
    .single(); // Return a single object or null, not an array

  if (error) {
    console.error('Error fetching training plan:', error);
    return null;
  }
  return data;
}
```

---

This README provides a foundational understanding for developers working on the PWA's Supabase integration. Refer to the official Supabase documentation for more advanced features and concepts. 