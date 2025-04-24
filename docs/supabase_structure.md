# Supabase Database Structure & Frontend Integration

## Database Schema Overview

The application uses a Supabase database with the following core tables:

### 1. `users`
- Primary user account data
- Contains basic profile information
- Referenced by all other tables via `user_id` foreign key

### 2. `workout_sessions`
- Records of all user workouts
- Contains exercise data, metrics, and timestamps
- Key fields: `completed_exercises` (JSONB), `metrics` (JSONB), `metadata` (JSONB)
- Powers the Training Diary and Dashboard analytics

### 3. `training_plans`
- User's workout programs
- Includes day-by-day exercise schedules
- Key fields: `days` (JSONB mapping days to exercises), `active` (boolean)
- Used in Program tabs and for workout recommendations

### 4. `goals`
- Fitness goals and targets
- Tracks progress toward specific metrics
- Categories include: strength, endurance, weight, habit, other
- Used in Goals tab and for progress tracking

### 5. `weekly_reflections`
- Weekly summaries of workout performance
- Includes metrics, challenges, and future planning
- Key fields: `challenges` (JSONB), `wins` (JSONB)
- Powers the Weekly Review tab in Training Diary

### 6. `progress_photos`
- User's progress tracking photos
- Linked to specific dates for comparison
- Used in the Progress tab for visual tracking

## Frontend Component Integration

The following components and modules interact with the Supabase database:

### Data Providers (Stores)

1. **useUserStore** (`src/lib/stores/useUserStore.ts`)
   - Manages user authentication and session
   - Interacts with Supabase Auth and the `users` table
   - Provides user context to all authenticated components

2. **useProgramStore** (`src/lib/stores/useProgramStore.ts`)
   - Manages workout programs and goals
   - Fetches from `training_plans` and `goals` tables
   - Used by Program tab components

3. **useDiaryStore** (`src/lib/stores/useDiaryStore.ts`)
   - Manages workout sessions, reflections, and related data
   - Interacts with multiple tables: `workout_sessions`, `weekly_reflections`, `progress_photos`
   - Powers the entire Training Diary section

4. **useDashboardData** (`src/dashboard/useDashboardData.ts`)
   - Aggregates metrics for the dashboard
   - Queries `workout_sessions` for metrics, volume, and PRs
   - Drives all dashboard visualizations

### Custom Hooks

The application uses SWR hooks for data fetching with automatic revalidation:

1. **useCurrentUser** - Fetches and caches current user data
2. **useWorkoutSessions** - Fetches workout data with filtering
3. **useCurrentTrainingPlan** - Fetches the active training program
4. **useGoals** - Fetches and caches user fitness goals
5. **useCurrentWeekReflection** - Fetches weekly summary data
6. **useProgressPhotos** - Retrieves progress tracking photos
7. **useWorkoutStreak** - Calculates workout consistency streak

### Key Components

1. **Dashboard Components**
   - `/src/pages/EnhancedDashboard.tsx`
   - `/src/pages/MobileDashboard.tsx`
   - Visualize workout data aggregated from `workout_sessions`

2. **Diary Components**
   - `/src/pages/EnhancedDiaryPage.tsx`
   - `/src/components/diary/tabs/*`
   - Display workout history, reflections, and progress

3. **Program Components**
   - `/src/components/programs/current/CurrentProgramTab.tsx`
   - Display active program from `training_plans`
   - Show goals and progress from the `goals` table

## Data Flow Architecture

The application follows a consistent pattern for Supabase data integration:

1. **Data Fetching**:
   - Components request data via Zustand stores or SWR hooks
   - Requests are made through the unified Supabase client
   - Data is cached appropriately to minimize database queries

2. **State Management**:
   - Zustand stores provide global state
   - SWR provides caching and revalidation
   - Components receive data as props or via hooks

3. **Error Handling**:
   - All Supabase operations include proper error handling
   - Fallback to mock data in development environment
   - User-friendly error messages via toast notifications

4. **Optimistic Updates**:
   - UI updates immediately before database confirmation
   - Rolled back if the operation fails
   - Improves perceived performance

## Mock Data Integration

For development and testing purposes, the application includes a comprehensive mock data system:

- Located in `src/lib/mockData/index.ts`
- Generates realistic data matching the database schema
- Used as fallback when database connection fails
- Automatically used in development environment

## Database Authentication

User authentication is managed through Supabase Auth:

- Email/password authentication
- Session management with JWT tokens
- Automatic token refresh
- User data tied to authenticated ID

## Deployment Considerations

When deploying the application:

1. Ensure environment variables are properly set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. Database migrations should be handled through Supabase console

3. Row-level security (RLS) policies ensure users only access their own data
