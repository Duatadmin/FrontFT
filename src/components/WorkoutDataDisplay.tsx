import React, { useState, useEffect } from 'react';
import { fetchWorkoutSessions } from '../lib/supabase/dataAdapter';
import { getCurrentUserId } from '../lib/supabase/client';
import type { WorkoutSession } from '../lib/supabase/schema.types';

// Test user ID for development
const TEST_USER_ID = '792ee0b8-5ba2-40a5-8f35-ab1bff798908';

const WorkoutDataDisplay: React.FC = () => {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{
    code: string;
    message: string;
    missingData?: string;
    affectedModule?: string;
  } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);



  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user ID
        const currentUserId = await getCurrentUserId();
        setUserId(currentUserId || TEST_USER_ID);
        
        if (!currentUserId && !TEST_USER_ID) {
          setError({
            code: 'AUTH_ERROR',
            message: 'Missing data: user_id. Cannot fetch workout data.',
            missingData: 'user_id',
            affectedModule: 'workout display'
          });
          return;
        }
        
        // Fetch workout sessions for the user
        const result = await fetchWorkoutSessions(
          currentUserId || TEST_USER_ID,
          undefined,
          undefined,
          undefined
        );
        
        if (!result.success || !result.data) {
          setError(result.error || {
            code: 'DATA_ERROR',
            message: 'Missing data: workout_sessions. Cannot display workout data.',
            missingData: 'workout_sessions',
            affectedModule: 'workout display'
          });
          return;
        }
        
        setWorkouts(result.data);
        
        // Log data verification
        result.data.forEach(workout => {
          console.log(`Verified workout data - ID: ${workout.id}, User: ${workout.user_id}, Date: ${workout.completed_at || workout.created_at}`);
          
          // Check for required fields
          const missingFields: string[] = [];
          if (!workout.id) missingFields.push('id');
          if (!workout.user_id) missingFields.push('user_id');
          if (!workout.completed_at && !workout.created_at) missingFields.push('timestamp');
          if (!workout.focus_area) missingFields.push('focus_area');
          
          if (missingFields.length > 0) {
            console.warn(`Missing data in workout: ${missingFields.join(', ')}`);
          }
        });
        
      } catch (err) {
        console.error('Error fetching workout data:', err);
        setError({
          code: 'UNEXPECTED_ERROR',
          message: `Unexpected error: ${err instanceof Error ? err.message : String(err)}`,
          affectedModule: 'workout display'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      console.warn(`Invalid date format: ${dateString}`);
      return 'Invalid date';
    }
  };
  
  const getDuration = (workout: WorkoutSession) => {
    try {
      const metrics = workout.metrics || {};
      if (typeof metrics === 'object') {
        // Try different possible field names for duration
        const duration = (metrics as any).duration || 
                         (metrics as any).total_duration || 
                         (metrics as any).total_duration_minutes || 
                         0;
        return `${duration} min`;
      }
      return 'N/A';
    } catch (e) {
      console.warn(`Error getting duration for workout ${workout.id}:`, e);
      return 'N/A';
    }
  };
  
  const getExerciseCount = (workout: WorkoutSession) => {
    try {
      const exercises = workout.completed_exercises || {};
      if (typeof exercises === 'object') {
        if (Array.isArray(exercises)) {
          return exercises.length;
        } else {
          return Object.keys(exercises).length;
        }
      }
      return 0;
    } catch (e) {
      console.warn(`Error getting exercise count for workout ${workout.id}:`, e);
      return 0;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px] flex-col">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p>Loading workout data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
        <div className="flex mb-2">
          <strong className="font-bold mr-2">Error loading workout data</strong>
        </div>
        <p>
          {error.message}
          {error.missingData && (
            <span className="block mt-2 font-bold">
              Missing data: {error.missingData}
            </span>
          )}
          {error.affectedModule && (
            <span className="block mt-1">
              Affected module: {error.affectedModule}
            </span>
          )}
        </p>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4">
        <strong className="font-bold mr-2">No workout data found</strong>
        <p>
          No workout sessions were found for this user. Start a new workout to see data here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Your Workout Sessions</h2>
        <p className="text-sm text-gray-500">
          User ID: {userId?.substring(0, 8)}...
        </p>
      </div>
      
      <p className="mb-4">
        Showing {workouts.length} workout sessions from Supabase
      </p>
      
      <div className="space-y-4">
        {workouts.map(workout => (
          <div key={workout.id} className="border border-gray-200 rounded-md bg-white shadow-sm">
            <div className="p-4 pb-0">
              <div className="flex justify-between items-center">
                <h3 className="font-bold">{workout.focus_area || 'Workout'}</h3>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">{workout.status}</span>
              </div>
              <p className="text-sm text-gray-500">
                {formatDate(workout.completed_at || workout.created_at)}
              </p>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-bold">{getDuration(workout)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Exercises</p>
                  <p className="font-bold">{getExerciseCount(workout)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ID</p>
                  <p className="text-xs truncate">{workout.id}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutDataDisplay;
