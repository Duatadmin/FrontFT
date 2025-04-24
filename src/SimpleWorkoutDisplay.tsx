import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase/client';
import './workout-details.css';

// Test user ID for development
const TEST_USER_ID = '792ee0b8-5ba2-40a5-8f35-ab1bff798908';

const SimpleWorkoutDisplay: React.FC = () => {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        
        // Direct query to workout_sessions table
        const { data, error } = await supabase
          .from('workout_sessions')
          .select('*')
          .eq('user_id', TEST_USER_ID)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching workouts:', error);
          setError(`Error fetching workouts: ${error.message}`);
          return;
        }
        
        console.log('Fetched workouts:', data);
        setWorkouts(data || []);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkouts();
  }, []);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading workout data...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p className="font-bold">Error loading workout data</p>
        <p>{error}</p>
        <p className="mt-2">
          Missing data: workout_sessions. Cannot render workout history.
        </p>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
        <p className="font-bold">No workout data found</p>
        <p>No workout sessions were found for this user.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Workout Sessions</h2>
      <p className="mb-4">Showing {workouts.length} workout sessions from Supabase</p>
      
      <div className="space-y-4">
        {workouts.map(workout => {
          // Parse JSON fields
          let completedExercises = workout.completed_exercises || {};
          if (typeof completedExercises === 'string') {
            try {
              completedExercises = JSON.parse(completedExercises);
            } catch (e) {
              console.warn(`Invalid completed_exercises JSON for session ${workout.id}:`, e);
              completedExercises = {};
            }
          }
          
          let metrics = workout.metrics || {};
          if (typeof metrics === 'string') {
            try {
              metrics = JSON.parse(metrics);
            } catch (e) {
              console.warn(`Invalid metrics JSON for session ${workout.id}:`, e);
              metrics = {};
            }
          }
          
          let metadata = workout.metadata || {};
          if (typeof metadata === 'string') {
            try {
              metadata = JSON.parse(metadata);
            } catch (e) {
              console.warn(`Invalid metadata JSON for session ${workout.id}:`, e);
              metadata = {};
            }
          }
          
          const isExpanded = expandedWorkout === workout.id;
          
          return (
            <div 
              key={workout.id} 
              className={`border border-gray-200 rounded-md bg-white p-4 shadow-sm cursor-pointer transition-all duration-200 ${isExpanded ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'}`}
              onClick={() => setExpandedWorkout(isExpanded ? null : workout.id)}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold">{workout.focus_area || 'Workout'}</h3>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  {workout.status}
                </span>
              </div>
              
              <p className="text-sm text-gray-500 mb-2">
                {formatDate(workout.completed_at || workout.created_at)}
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <p>{metrics.duration || metrics.total_duration_minutes || 'N/A'} min</p>
                </div>
                <div>
                  <span className="text-gray-500">Total Volume:</span>
                  <p>{metrics.total_volume || 'N/A'}</p>
                </div>
              </div>
              
              {/* Expandable section with detailed workout information */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 workout-details">
                  <h4 className="font-bold text-blue-800 mb-2">Workout Details</h4>
                  
                  {/* Basic workout info */}
                  <div className="mb-4 p-3 bg-blue-50 rounded">
                    <h5 className="font-semibold mb-1">Session Information</h5>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">ID:</span>
                        <p className="truncate">{workout.id}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">User ID:</span>
                        <p className="truncate">{workout.user_id}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <p>{formatDate(workout.created_at)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Completed:</span>
                        <p>{formatDate(workout.completed_at)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Focus Area:</span>
                        <p>{workout.focus_area || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <p>{workout.status}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Metrics */}
                  {Object.keys(metrics).length > 0 && (
                    <div className="mb-4 p-3 bg-green-50 rounded">
                      <h5 className="font-semibold mb-1">Metrics</h5>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        {Object.entries(metrics).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-gray-500">{key.replace(/_/g, ' ')}:</span>
                            <p>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Completed Exercises */}
                  {Object.keys(completedExercises).length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-semibold mb-2">Completed Exercises</h5>
                      <div className="space-y-4">
                        {Object.entries(completedExercises).map(([exerciseName, sets]: [string, any]) => (
                          <div key={exerciseName} className="p-3 border border-gray-200 rounded">
                            <h6 className="font-bold">{exerciseName.replace(/-/g, ' ')}</h6>
                            
                            {Array.isArray(sets) && sets.length > 0 ? (
                              <table className="w-full mt-2 text-sm">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="py-1 px-2 text-left">Set</th>
                                    <th className="py-1 px-2 text-left">Reps</th>
                                    <th className="py-1 px-2 text-left">Weight</th>
                                    {sets[0].rpe !== undefined && <th className="py-1 px-2 text-left">RPE</th>}
                                    {sets[0].tempo !== undefined && <th className="py-1 px-2 text-left">Tempo</th>}
                                    {sets[0].rest !== undefined && <th className="py-1 px-2 text-left">Rest</th>}
                                  </tr>
                                </thead>
                                <tbody>
                                  {sets.map((set: any, index: number) => (
                                    <tr key={index} className="border-t border-gray-200">
                                      <td className="py-1 px-2">{set.set || index + 1}</td>
                                      <td className="py-1 px-2">{set.reps || 'N/A'}</td>
                                      <td className="py-1 px-2">{set.weight ? `${set.weight} ${set.unit || 'kg'}` : 'N/A'}</td>
                                      {sets[0].rpe !== undefined && <td className="py-1 px-2">{set.rpe || 'N/A'}</td>}
                                      {sets[0].tempo !== undefined && <td className="py-1 px-2">{set.tempo || 'N/A'}</td>}
                                      {sets[0].rest !== undefined && <td className="py-1 px-2">{set.rest ? `${set.rest}s` : 'N/A'}</td>}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p className="text-sm text-gray-500 mt-1">No set data available</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Metadata */}
                  {Object.keys(metadata).length > 0 && (
                    <div className="mb-4 p-3 bg-yellow-50 rounded">
                      <h5 className="font-semibold mb-1">Metadata</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(metadata).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-gray-500">{key.replace(/_/g, ' ')}:</span>
                            <p>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Raw JSON data for debugging */}
                  <details className="mt-4">
                    <summary className="text-sm text-gray-500 cursor-pointer">View Raw JSON Data</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                      {typeof workout === 'object' ? JSON.stringify(workout, null, 2) : ''}
                    </pre>
                  </details>
                </div>
              )}
              
              {/* Display any missing data warnings */}
              {(!workout.id || !workout.user_id || (!workout.completed_at && !workout.created_at)) && (
                <p className="mt-2 text-xs text-red-500">
                  Missing data: 
                  {!workout.id ? ' id' : ''}
                  {!workout.user_id ? ' user_id' : ''}
                  {(!workout.completed_at && !workout.created_at) ? ' timestamp' : ''}
                </p>
              )}
              
              {!isExpanded && (
                <div className="mt-2 text-xs text-blue-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Click to view detailed workout information
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimpleWorkoutDisplay;
