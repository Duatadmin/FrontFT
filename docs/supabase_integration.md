# Supabase Database Integration Documentation

## Database Schema Overview

The application uses Supabase as its backend database with the following structure:

### Primary Tables

1. **users** - Stores user profile information
   - `id` (UUID): Primary key
   - `created_at` (timestamp): Auto-filled by Supabase

2. **workout_sessions** - Stores workout session data
   - `id` (UUID): Primary key
   - `user_id` (UUID): Foreign key to users.id
   - `status` (text): "active" or "completed"
   - `focus_area` (text): Primary focus of the workout
   - `completed_exercises` (JSONB): Contains all exercise data
   - `metrics` (JSONB): Performance metrics
   - `created_at`, `updated_at`, `completed_at` (timestamps)
   - `metadata` (JSONB): Additional session metadata

3. **training_plans** - Stores user training programs
   - `id` (UUID): Primary key
   - `user_id` (UUID): Foreign key to users.id
   - `name` (text): Program name
   - `description` (text): Program description
   - `days` (JSONB): Map of day -> exercise_ids
   - `start_date`, `end_date` (text): Program duration
   - `active` (boolean): Whether this is the active program
   - `created_at`, `updated_at` (timestamps)

4. **goals** - Stores user fitness goals
   - `id` (UUID): Primary key
   - `user_id` (UUID): Foreign key to users.id
   - `title` (text): Goal title
   - `description` (text): Goal description
   - `target_value` (number): Target value to achieve
   - `current_value` (number): Current progress value
   - `unit` (text): Measurement unit
   - `deadline` (text): Target date
   - `category` (text): Goal category
   - `status` (text): "not_started", "in_progress", "completed", "failed"
   - `created_at`, `completed_at` (timestamps)

## Frontend Components and Supabase Dependencies

### Components Using Supabase Data

1. **Dashboard Components**
   - `EnhancedDashboard.tsx` / `MobileDashboard.tsx`
   - Currently using mock data in `useDashboardData.ts`
   - Should connect to workout_sessions table for real workout data

2. **Diary Components**
   - `EnhancedDiaryPage.tsx` / `DiaryPage.tsx`
   - Connected via `useDiaryStore.ts`
   - Uses workout_sessions table for tracking completed workouts

3. **Program Components**
   - `CurrentProgramTab.tsx`
   - Connected via `useProgramStore.ts` 
   - Uses training_plans table to display active programs

### Zustand Stores as Data Providers

1. **useProgramStore.ts**
   - Fetches current training plan from training_plans table
   - Fetches user goals from goals table
   - Provides methods to create/update/delete programs and goals

2. **useDiaryStore.ts**
   - Fetches workout sessions from workout_sessions table
   - Manages workout data, filters, and UI state
   - Contains enhanced diary features (reflections, photos, etc.)

3. **useUserStore.ts**
   - Currently using mock user data without actual Supabase auth
   - Needs to be connected to Supabase auth

## Integration Issues and Improvements

1. **Duplicate Supabase Client Files**
   - `src/lib/supabase.ts` and `src/lib/supabaseClient.ts` contain redundant code
   - Should be consolidated into a single client file

2. **Inconsistent Type Definitions**
   - Different type definitions for the same database entities
   - Should be centralized in a single types file

3. **Overreliance on Mock Data**
   - Most components fallback to mock data but should prioritize real data
   - Mock data should only be used when Supabase connection fails

4. **Missing Real-time Subscriptions**
   - No Supabase real-time subscriptions implemented for collaborative features
   - Should add subscriptions for shared workouts or trainer feedback

5. **User Authentication**
   - Currently using mock authentication
   - Should implement proper Supabase Auth integration

## Implementation Recommendations

1. **Unified Supabase Client**
   - Create a single source of truth for Supabase connection
   - Use proper error handling and typing

2. **Typed Schema Definitions**
   - Generate or maintain consistent types that match the actual Supabase schema
   - Use these types across all frontend components

3. **SWR Integration**
   - Implement SWR for data fetching with proper caching
   - Create custom hooks for each data entity (useWorkouts, usePrograms, etc.)

4. **Optimistic Updates**
   - Implement optimistic UI updates for better user experience
   - Update Zustand stores immediately, then sync with Supabase

5. **Error Handling and Offline Support**
   - Add robust error handling for all Supabase operations
   - Implement offline support with local storage fallbacks
