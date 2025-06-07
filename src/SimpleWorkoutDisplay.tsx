import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import './workout-details.css';

// Import icons
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar mr-1">
    <path d="M8 2v4"></path>
    <path d="M16 2v4"></path>
    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
    <path d="M3 10h18"></path>
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock mr-1">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const DumbbellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dumbbell mr-1">
    <path d="M14.4 14.4 9.6 9.6"></path>
    <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"></path>
    <path d="m21.5 21.5-1.4-1.4"></path>
    <path d="M3.9 3.9 2.5 2.5"></path>
    <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z"></path>
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
    <path d="m6 9 6 6 6-6"></path>
  </svg>
);

// Test user ID for development
import useCurrentUser from '@/lib/stores/useUserStore';

const SimpleWorkoutDisplay: React.FC = () => {
  const currentUser = useCurrentUser();
  // Support both { user: { id } } and { id } shapes
  const userId = (currentUser && typeof currentUser === 'object')
    ? (currentUser.user?.id || currentUser.id)
    : undefined;
  if (!userId) return null;

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
          .eq('user_id', userId)
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
    return (
      <div className="workout-history">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Your Workout Sessions</h2>
        
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading workout data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workout-history">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Your Workout Sessions</h2>
        
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded mb-4">
          <h3 className="text-lg font-semibold text-red-800">Error Loading Data</h3>
          <p className="mt-1 text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="workout-history">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Your Workout Sessions</h2>
        
        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded mb-4">
          <h3 className="text-lg font-semibold text-amber-800">No Workout Data Found</h3>
          <p className="mt-1 text-gray-700">No workout sessions were found for the test user.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="workout-history">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Your Workout Sessions</h2>
      
      <p className="mb-4 text-gray-600">Showing {workouts.length} workout sessions from Supabase</p>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="hidden md:flex py-3 px-5 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
          <div className="w-1/3">Workout</div>
          <div className="w-1/4">Date</div>
          <div className="w-1/4">Duration</div>
          <div className="w-1/4">Volume</div>
        </div>
        
        <div className="divide-y divide-gray-200">
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
            const exerciseCount = Object.keys(completedExercises).length;
            const duration = metrics.duration || metrics.total_duration_minutes || 'N/A';
            const volume = metrics.total_volume || 'N/A';
            const date = formatDate(workout.completed_at || workout.created_at);
            
            return (
              <div 
                key={workout.id} 
                className={`relative py-4 px-5 cursor-pointer hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-blue-50/30' : ''}`}
                onClick={() => setExpandedWorkout(isExpanded ? null : workout.id)}
                role="row"
                tabIndex={0}
                aria-label={`Workout session on ${date}`}
              >
                {/* Mobile view */}
                <div className="md:hidden">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium">{workout.focus_area || 'Workout'}</div>
                    <div className="text-gray-500 text-sm flex items-center">
                      <CalendarIcon />{date}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                    <div className="flex items-center">
                      <ClockIcon />{typeof duration === 'number' ? `${duration}m` : duration}
                    </div>
                    <div className="flex items-center">
                      <DumbbellIcon />{exerciseCount} exercises
                    </div>
                    <div className="flex items-center ml-auto">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${workout.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {workout.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Desktop view */}
                <div className="hidden md:flex items-center">
                  <div className="w-1/3">
                    <div className="font-medium">{workout.focus_area || 'Workout'}</div>
                    <div className="text-sm text-gray-500 mt-1 flex items-center">
                      <DumbbellIcon />{exerciseCount} exercises
                    </div>
                  </div>
                  
                  <div className="w-1/4 text-gray-600 flex items-center">
                    <CalendarIcon />{date}
                  </div>
                  
                  <div className="w-1/4 text-gray-600 flex items-center">
                    <ClockIcon />{typeof duration === 'number' ? `${duration}m` : duration}
                  </div>
                  
                  <div className="w-1/4 flex items-center justify-between">
                    <span className="text-gray-600">{volume}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${workout.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {workout.status}
                    </span>
                  </div>
                </div>
                
                {/* Expand/collapse indicator */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 md:flex items-center justify-center hidden">
                  <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDownIcon />
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
    </div>
  );
};

export default SimpleWorkoutDisplay;
