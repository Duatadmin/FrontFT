/**
 * Supabase Data Adapter
 * 
 * This module adapts the existing Supabase database structure to our application's data model.
 * It provides functions to fetch and transform data from the Supabase database according to
 * the structure described in docs/database_logic.md.
 */
import { supabase } from '../supabase';
// Import types but don't use mock data generator directly
import type { Tables, WorkoutSession } from "./schema.types";

// Manually define the TrainingPlan type based on the modular_training_plan table.
// This is a workaround because the alias is missing from the generated schema.types.ts file.
export type TrainingPlan = Tables<"modular_training_plan">;

/**
 * Error type for workout data operations
 */
export interface WorkoutDataError {
  code: string;
  message: string;
  missingData?: string;
  affectedModule?: string;
  originalError?: any;
}

/**
 * Result type for workout data operations
 */
export interface WorkoutDataResult<T> {
  data: T | null;
  error: WorkoutDataError | null;
  success: boolean;
}

/**
 * Fetches workout sessions for a user within a date range
 */
export async function fetchWorkoutSessions(
  userId: string,
  startDate?: string,
  endDate?: string,
  focusArea?: string
): Promise<WorkoutDataResult<WorkoutSession[]>> {
  try {
    if (!userId) {
      return {
        data: null,
        error: {
          code: 'MISSING_USER_ID',
          message: 'User ID is required to fetch workout sessions',
          missingData: 'user_id',
          affectedModule: 'workout history'
        },
        success: false
      };
    }

    // Start building the query against workout_full_view
    let query = supabase
      .from('workout_full_view') // Target the correct view
      .select(`
        session_id, 
        user_id, 
        session_date, 
        day_label,
        day_of_week,
        focus_area,
        session_number,
        overall_difficulty,
        duration_minutes,
        session_completed,
        session_state,
        plan_id,
        week_id
      `)
      .eq('user_id', userId);
      
    // Filter for completed sessions using the boolean field
    query = query.eq('session_completed', true);
    
    // Add date range filters if provided, using session_date
    if (startDate) {
      query = query.gte('session_date', startDate);
    }
    
    if (endDate) {
      query = query.lte('session_date', endDate);
    }
    
    // Add focus area filter if provided
    if (focusArea) {
      query = query.eq('focus_area', focusArea);
    }
    
    // Execute the query, order by session_date
    const { data, error } = await query.order('session_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching workout sessions from workout_full_view:', error);
      return {
        data: null,
        error: {
          code: 'FETCH_ERROR',
          message: `Failed to fetch workout sessions: ${error.message}`,
          missingData: 'workout_full_view_data',
          affectedModule: 'workout history',
          originalError: error
        },
        success: false
      };
    }
    
    if (!data || data.length === 0) {
      return {
        data: [],
        error: null,
        success: true
      };
    }
    
    // Process the data (map to WorkoutSession type, handle session_state)
    try {
      const processedData = data.map(row => {
        const session: Partial<WorkoutSession> = {
            id: row.session_id,
            user_id: row.user_id,
            session_date: row.session_date,
            created_at: row.session_date, // Use session_date as created_at for now
            // updated_at: undefined, // workout_full_view doesn't have a clear session updated_at; recorded_at is for sets
            focus_area: row.focus_area,
            session_completed: row.session_completed, // Correctly maps to the expected property

            // day_label: row.day_label, // Not in WorkoutSession type
            // day_of_week: row.day_of_week, // Not in WorkoutSession type, needs mapping if type is number
            // session_number: row.session_number, // Not in WorkoutSession type
            // overall_difficulty: row.overall_difficulty, // Not in WorkoutSession type
            // duration_minutes: row.duration_minutes, // Not in WorkoutSession type
            // plan_id: row.plan_id, // Not in WorkoutSession type
            // week_id: row.week_id, // Not in WorkoutSession type

            completed_exercises: {},
            metrics: {},
            metadata: {}
        };

        if (row.session_state) {
            try {
                const state = typeof row.session_state === 'string' 
                    ? JSON.parse(row.session_state) 
                    : row.session_state;
                
                session.completed_exercises = state.completed_exercises || {};
                session.metrics = state.metrics || {};
                session.metadata = state.metadata || {};
            } catch (e) {
                console.warn(`Invalid session_state JSON for session ${row.session_id}:`, e);
            }
        }
        
        return session as WorkoutSession;
      });

      // Deduplicate sessions based on session_id, as workout_full_view might return multiple rows per session
      const uniqueSessions = Array.from(new Map(processedData.map(s => [s.id, s])).values());
      
      console.log(`Successfully fetched ${uniqueSessions.length} unique workout sessions from workout_full_view`);
      return {
        data: uniqueSessions,
        error: null,
        success: true
      };
    } catch (parseErr) {
      console.error('Error processing workout sessions data from workout_full_view:', parseErr);
      return {
        data: null,
        error: {
          code: 'DATA_PROCESSING_ERROR',
          message: 'Failed to process workout sessions data',
          missingData: 'valid JSON structure in session_state',
          affectedModule: 'workout history',
          originalError: parseErr
        },
        success: false
      };
    }
  } catch (err) {
    console.error('Error in fetchWorkoutSessions (workout_full_view):', err);
    return {
      data: null,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: `Unexpected error fetching workout sessions: ${err instanceof Error ? err.message : String(err)}`,
        missingData: 'workout_full_view_data',
        affectedModule: 'workout history',
        originalError: err
      },
      success: false
    };
  }
}

/**
 * Fetches a specific workout session by ID
 */
export async function fetchWorkoutSessionById(
  userId: string,
  sessionId: string
): Promise<WorkoutSession | null> {
  try {
    const { data, error } = await supabase
      .from('workout_full_view')
      .select(`
        session_id, 
        user_id, 
        session_date, 
        focus_area,
        session_completed,
        session_state
      `)
      .eq('user_id', userId)
      .eq('session_id', sessionId);
    
    if (error) {
      console.error('Error fetching workout session by ID:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log(`No data found for session ID: ${sessionId}`);
      return null;
    }
    
    // All rows belong to the same session, so we can take session details from the first row
    const firstRow = data[0];
    const session: Partial<WorkoutSession> = {
        id: firstRow.session_id,
        user_id: firstRow.user_id,
        session_date: firstRow.session_date,
        created_at: firstRow.session_date,
        focus_area: firstRow.focus_area,
        session_completed: firstRow.session_completed,
        completed_exercises: {},
        metrics: {},
        metadata: {}
    };

    if (firstRow.session_state) {
        try {
            const state = typeof firstRow.session_state === 'string' 
                ? JSON.parse(firstRow.session_state) 
                : firstRow.session_state;
            
            session.completed_exercises = state.completed_exercises || {};
            session.metrics = state.metrics || {};
            session.metadata = state.metadata || {};
        } catch (e) {
            console.warn(`Invalid session_state JSON for session ${firstRow.session_id}:`, e);
        }
    }
    
    return session as WorkoutSession;

  } catch (err) {
    console.error('Error in fetchWorkoutSessionById:', err);
    return null;
  }
}

/**
 * Calculates workout statistics for a date range
 */
export async function calculateWorkoutStats(
  userId: string,
  startDate: string,
  endDate: string
) {
  try {
    // Fetch workouts for the date range
    const workoutsResult = await fetchWorkoutSessions(userId, startDate, endDate);
    
    if (!workoutsResult.success || !workoutsResult.data) {
      console.log(`Missing data: workout_sessions. Cannot render workout statistics.`);
      return {
        totalWorkouts: 0,
        totalVolume: 0,
        prCount: 0,
        averageDuration: 0
      };
    }
    
    const workouts = workoutsResult.data;
    
    // Calculate statistics
    const totalWorkouts = workouts.length;
    
    const totalVolume = workouts.reduce((sum, workout) => {
      const metrics = workout.metrics || {};
      // Use type assertion to safely access the property
      const volume = typeof metrics === 'object' && metrics ? (metrics as any).total_volume || 0 : 0;
      return sum + volume;
    }, 0);
    
    const prCount = workouts.reduce((count, workout) => {
      const metadata = workout.metadata || {};
      // Use type assertion to safely access the property
      const prAchieved = typeof metadata === 'object' && metadata ? (metadata as any).pr_achieved : false;
      return count + (prAchieved ? 1 : 0);
    }, 0);
    
    const totalDuration = workouts.reduce((sum, workout) => {
      const metrics = workout.metrics || {};
      // Use type assertion to safely access the property
      const duration = typeof metrics === 'object' && metrics ? (metrics as any).total_duration_minutes || 0 : 0;
      return sum + duration;
    }, 0);
    
    const averageDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0;
    
    return {
      totalWorkouts,
      totalVolume,
      prCount,
      averageDuration
    };
  } catch (err) {
    console.error('Error calculating workout stats:', err);
    return {
      totalWorkouts: 0,
      totalVolume: 0,
      prCount: 0,
      averageDuration: 0
    };
  }
}

// ... (rest of the code remains the same)

/**
 * Fetches workout data grouped by week for a user within a date range
 */
export async function fetchWorkoutsByWeek(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Record<string, WorkoutSession[]>> {
  try {
    const workoutsResult = await fetchWorkoutSessions(userId, startDate, endDate);
    
    if (!workoutsResult.success || !workoutsResult.data) {
      console.log(`Missing data: workout_sessions. Cannot render weekly workout breakdown.`);
      return {};
    }
    
    const workouts = workoutsResult.data;
    
    // Group workouts by week
    const workoutsByWeek: Record<string, WorkoutSession[]> = {};
    
    workouts.forEach(workout => {
      const date = workout.session_date || workout.created_at;
      if (!date) {
        console.warn(`Missing data: timestamp for workout ${workout.id}. Cannot categorize by week.`);
        return;
      }
      
      // Get the week start date (Monday)
      const workoutDate = new Date(date);
      const day = workoutDate.getDay();
      const diff = workoutDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
      const weekStart = new Date(workoutDate.setDate(diff));
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!workoutsByWeek[weekKey]) {
        workoutsByWeek[weekKey] = [];
      }
      
      workoutsByWeek[weekKey].push(workout);
    });
    
    return workoutsByWeek;
  } catch (err) {
    console.error('Error fetching workouts by week:', err);
    return {};
  }
}

/**
 * Fetches the current active training plan for a user
 */
export async function fetchActiveTrainingPlan(userId: string): Promise<TrainingPlan | null> {
  try {
    // Try to fetch from training_plans table if it exists
    try {
      const { data, error } = await supabase
        .from('modular_training_plan')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .single();
      
      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('Training plans table may not exist:', err);
    }
    
    // Fallback: Check if there are any sessions with plan metadata in the new view
    const { data: workouts, error: workoutsError } = await supabase
      .from('workout_full_view')
      .select('session_state, session_date')
      .eq('user_id', userId)
      .eq('session_completed', true)
      .order('session_date', { ascending: false })
      .limit(20);
    
    if (workoutsError || !workouts?.length) {
      return null;
    }
    
    // Look for workouts with plan metadata inside session_state
    for (const workout of workouts) {
      if (!workout.session_state) continue;

      const session_state = typeof workout.session_state === 'string'
        ? JSON.parse(workout.session_state)
        : workout.session_state;
      
      const metadata = session_state?.metadata;

      if (metadata?.source === 'plan' && metadata?.plan_id) {
        // Found a workout from a plan, use this as a pseudo training plan
        return {
          id: metadata.plan_id,
          user_id: userId,
          created_at: workout.session_date, // Use the session date as a proxy
          // ... other fields are unknown from this context
        } as TrainingPlan;
      }
    }
    
    return null;
  } catch (err) {
    console.error('Error fetching active training plan:', err);
    return null;
  }
}

/**
 * Checks if the database has the workout_sessions table and adapts accordingly
 */
export async function checkDatabaseStructure() {
  try {
    // Check if we can access workout_sessions directly
    const { data: _testData, error: testError } = await supabase
      .from('workout_sessions')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.warn('Cannot access workout_sessions table:', testError);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error checking database structure:', err);
    return false;
  }
}

/**
 * Adapts the database structure to our application's data model
 * This is the main entry point for the data adapter
 */
export async function adaptDatabaseStructure() {
  const hasWorkoutSessionsTable = await checkDatabaseStructure();
  
  if (!hasWorkoutSessionsTable) {
    console.warn('Database does not have the workout_sessions table, using mock data');
    return false;
  }
  
  console.log('Successfully connected to workout_sessions table');
  return true;
}
