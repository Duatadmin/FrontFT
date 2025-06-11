/**
 * Supabase Data Adapter
 * 
 * This module adapts the existing Supabase database structure to our application's data model.
 * It provides functions to fetch and transform data from the Supabase database according to
 * the structure described in docs/database_logic.md.
 */
import { supabase } from '../supabase';
// Import types but don't use mock data generator directly
import type { 
  WorkoutSession, 
  TrainingPlan
} from './schema.types';

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

    // Start building the query
    let query = supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId);
      
    // Filter for completed sessions
    query = query.eq('session_completed', true);
    
    // Add date range filters if provided
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
    
    // Execute the query
    const { data, error } = await query.order('session_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching workout sessions:', error);
      return {
        data: null,
        error: {
          code: 'FETCH_ERROR',
          message: `Failed to fetch workout sessions: ${error.message}`,
          missingData: 'workout_sessions',
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
    
    // Process the data (parse JSON fields if needed)
    try {
      const processedData = data.map(session => {
        // Validate required fields
        if (!session.id) {
          console.warn('Session missing ID:', session);
        }
        
        if (!session.session_date && !session.created_at) {
          console.warn('Session missing timestamp:', session);
        }
        
        // Process JSON fields
        let completed_exercises = session.completed_exercises;
        let metrics = session.metrics;
        let metadata = session.metadata;
        
        try {
          if (typeof completed_exercises === 'string') {
            completed_exercises = JSON.parse(completed_exercises);
          }
        } catch (e) {
          console.warn(`Invalid completed_exercises JSON for session ${session.id}:`, e);
          completed_exercises = {};
        }
        
        try {
          if (typeof metrics === 'string') {
            metrics = JSON.parse(metrics);
          }
        } catch (e) {
          console.warn(`Invalid metrics JSON for session ${session.id}:`, e);
          metrics = {};
        }
        
        try {
          if (typeof metadata === 'string') {
            metadata = JSON.parse(metadata);
          }
        } catch (e) {
          console.warn(`Invalid metadata JSON for session ${session.id}:`, e);
          metadata = {};
        }
        
        return {
          ...session,
          completed_exercises,
          metrics,
          metadata
        };
      });
      
      console.log(`Successfully fetched ${processedData.length} workout sessions`);
      return {
        data: processedData,
        error: null,
        success: true
      };
    } catch (parseErr) {
      console.error('Error processing workout sessions data:', parseErr);
      return {
        data: null,
        error: {
          code: 'DATA_PROCESSING_ERROR',
          message: 'Failed to process workout sessions data',
          missingData: 'valid JSON structure',
          affectedModule: 'workout history',
          originalError: parseErr
        },
        success: false
      };
    }
  } catch (err) {
    console.error('Error in fetchWorkoutSessions:', err);
    return {
      data: null,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: `Unexpected error fetching workout sessions: ${err instanceof Error ? err.message : String(err)}`,
        missingData: 'workout_sessions',
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
      .from('workout_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching workout session:', error);
      return null;
    }
    
    // Process the data (parse JSON fields if needed)
    return {
      ...data,
      completed_exercises: typeof data.completed_exercises === 'string' 
        ? JSON.parse(data.completed_exercises) 
        : data.completed_exercises,
      metrics: typeof data.metrics === 'string'
        ? JSON.parse(data.metrics)
        : data.metrics,
      metadata: typeof data.metadata === 'string'
        ? JSON.parse(data.metadata)
        : data.metadata
    };
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
        .from('training_plans')
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
    
    // Fallback: Check if there are any workout_sessions with plan metadata
    const { data: workouts, error: workoutsError } = await supabase
      .from('workout_sessions')
      .select('metadata,session_date')
      .eq('user_id', userId)
      .eq('session_completed', true)
      .order('session_date', { ascending: false })
      .limit(20);
    
    if (workoutsError || !workouts?.length) {
      return null;
    }
    
    // Look for workouts with plan metadata
    for (const workout of workouts) {
      const metadata = typeof workout.metadata === 'string'
        ? JSON.parse(workout.metadata)
        : workout.metadata;
      
      if (metadata?.source === 'plan' && metadata?.plan_id) {
        // Found a workout from a plan, use this as a pseudo training plan
        // Create a training plan object from the workout metadata
        const trainingPlan: TrainingPlan = {
          id: metadata.plan_id as string,
          user_id: userId,
          name: (metadata.plan_name as string) || 'Current Plan',
          description: (metadata.plan_description as string) || '',
          active: true,
          days: metadata.days || {},
          start_date: metadata.start_date || new Date().toISOString(),
          end_date: metadata.end_date,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        return trainingPlan;
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
