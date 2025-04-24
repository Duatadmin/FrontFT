import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import { Calendar, Clock, Dumbbell, ChevronDown } from 'lucide-react';
import useDiaryStore from '../../store/useDiaryStore';
import useUserStore from '../../store/useUserStore';

const WorkoutDisplayCard: React.FC = () => {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const { user } = useUserStore();
  const { selectSession } = useDiaryStore();

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        
        // Use a specific test user ID directly to avoid the mock user ID from the store
        const TEST_USER_ID = '792ee0b8-5ba2-40a5-8f35-ab1bff798908';
        
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
        
        setWorkouts(data || []);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkouts();
  }, [user]);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  const handleWorkoutClick = (workout: any) => {
    // If using the expandable UI
    setExpandedWorkout(expandedWorkout === workout.id ? null : workout.id);
    
    // Or if integrating with the session drawer
    // selectSession(workout);
  };

  if (loading) {
    return (
      <div className="bg-background-card rounded-2xl shadow-card p-6 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-background-surface rounded-full"></div>
          <div className="h-6 w-48 bg-background-surface rounded-md"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-background-surface/50 rounded-xl p-4">
              <div className="h-5 w-40 bg-background-surface rounded-md mb-3"></div>
              <div className="flex gap-4">
                <div className="h-4 w-24 bg-background-surface rounded-md"></div>
                <div className="h-4 w-24 bg-background-surface rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
        <h3 className="text-lg font-medium mb-2">Workout History Unavailable</h3>
        <p className="text-text-secondary mb-4 text-sm">{error}</p>
        <button 
          onClick={() => {
            setLoading(true);
            setError(null);
            const TEST_USER_ID = '792ee0b8-5ba2-40a5-8f35-ab1bff798908';
            supabase
              .from('workout_sessions')
              .select('*')
              .eq('user_id', TEST_USER_ID)
              .order('created_at', { ascending: false })
              .then(({ data, error }) => {
                if (error) {
                  setError(`Error fetching workouts: ${error.message}`);
                } else {
                  setWorkouts(data || []);
                }
                setLoading(false);
              });
          }}
          className="bg-accent-violet hover:bg-accent-violet/90 text-white px-4 py-2 rounded-lg text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="bg-background-card rounded-2xl shadow-card p-6 text-center">
        <div className="mx-auto h-16 w-16 bg-background-surface rounded-full flex items-center justify-center mb-4">
          <Dumbbell className="text-text-tertiary" size={24} />
        </div>
        <h3 className="text-lg font-medium mb-2">No Workout History</h3>
        <p className="text-text-secondary mb-4 text-sm">You haven't logged any workouts yet. Start your fitness journey today!</p>
        <button className="bg-accent-violet hover:bg-accent-violet/90 text-white px-4 py-2 rounded-lg text-sm">
          Record First Workout
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background-card rounded-2xl shadow-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Dumbbell className="text-accent-violet" size={24} />
        <h2 className="text-lg font-semibold">Workout History</h2>
      </div>
      <p className="text-text-secondary mb-4 text-sm">
        {workouts.length} {workouts.length === 1 ? 'workout' : 'workouts'} found
      </p>
      
      <div className="space-y-3">
        {workouts.map(workout => {
          // Parse JSON fields
          let completedExercises = workout.completed_exercises || {};
          if (typeof completedExercises === 'string') {
            try {
              completedExercises = JSON.parse(completedExercises);
            } catch (e) {
              completedExercises = {};
            }
          }
          
          let metrics = workout.metrics || {};
          if (typeof metrics === 'string') {
            try {
              metrics = JSON.parse(metrics);
            } catch (e) {
              metrics = {};
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
              className="bg-background-surface/50 rounded-xl p-4 hover:bg-background-surface/70 transition-colors cursor-pointer border border-border-light"
              onClick={() => handleWorkoutClick(workout)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-text">{workout.focus_area || 'Workout'}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary mt-1">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {date}
                    </div>
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {typeof duration === 'number' ? `${duration}m` : duration}
                    </div>
                    <div className="flex items-center">
                      <Dumbbell size={14} className="mr-1" />
                      {exerciseCount} exercises
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    workout.status === 'completed' 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-amber-500/20 text-amber-500'
                  }`}>
                    {workout.status}
                  </span>
                  <div className={`ml-2 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown size={16} className="text-text-tertiary" />
                  </div>
                </div>
              </div>
              
              {/* Expandable section with detailed workout information */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-border-light">
                  <h4 className="font-medium text-text mb-2">Workout Details</h4>
                  
                  {/* Metrics */}
                  {Object.keys(metrics).length > 0 && (
                    <div className="mb-3 p-3 bg-background-surface rounded-lg">
                      <h5 className="text-sm font-medium mb-1 text-text">Metrics</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        {Object.entries(metrics).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-text-secondary">{key.replace(/_/g, ' ')}:</span>
                            <p className="text-text">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Completed Exercises */}
                  {Object.keys(completedExercises).length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium mb-1 text-text">Completed Exercises</h5>
                      <div className="space-y-2">
                        {Object.entries(completedExercises).map(([exerciseName, sets]: [string, any]) => (
                          <div key={exerciseName} className="p-3 bg-background-surface rounded-lg">
                            <div className="font-medium text-text">{exerciseName}</div>
                            {Array.isArray(sets) && (
                              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                                {sets.map((set: any, index: number) => (
                                  <div key={index} className="bg-background p-2 rounded-md text-text-secondary">
                                    Set {index + 1}: {set.weight || 0}kg × {set.reps || 0}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkoutDisplayCard;
