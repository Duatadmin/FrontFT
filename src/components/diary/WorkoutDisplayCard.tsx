import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import { Calendar, Clock, Dumbbell, ChevronDown, Award, Flame, BarChart3 } from 'lucide-react';
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
  
  const formatTime = (timeString?: string) => {
    if (!timeString) return 'N/A';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
    } catch (e) {
      return 'Invalid time';
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
      <div className="bg-background-card/80 backdrop-blur-xl rounded-2xl shadow-card p-6 animate-pulse border border-white/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-background-surface/80 rounded-full flex items-center justify-center">
            <div className="w-5 h-5 bg-background-surface/50 rounded-full"></div>
          </div>
          <div className="h-7 w-48 bg-background-surface/80 rounded-lg"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-background-surface/30 backdrop-blur-md rounded-xl p-5 border border-white/5">
              <div className="h-6 w-40 bg-background-surface/50 rounded-lg mb-4"></div>
              <div className="flex flex-wrap gap-4 mb-3">
                <div className="h-4 w-24 bg-background-surface/50 rounded-md"></div>
                <div className="h-4 w-24 bg-background-surface/50 rounded-md"></div>
                <div className="h-4 w-24 bg-background-surface/50 rounded-md"></div>
              </div>
              <div className="mt-4 h-10 w-full bg-background-surface/30 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 text-center shadow-lg">
        <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-4">
          <Flame className="text-red-400" size={28} />
        </div>
        <h3 className="text-xl font-semibold mb-3 text-text">Workout History Unavailable</h3>
        <p className="text-text-secondary mb-5 text-sm max-w-md mx-auto">{error}</p>
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
          className="bg-accent-violet hover:bg-accent-violet/90 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-accent-violet/20 transform hover:-translate-y-0.5"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="bg-background-card/80 backdrop-blur-xl rounded-2xl shadow-card p-8 text-center border border-white/5">
        <div className="mx-auto h-20 w-20 bg-background-surface/50 rounded-full flex items-center justify-center mb-5 shadow-inner">
          <Dumbbell className="text-accent-violet" size={32} />
        </div>
        <h3 className="text-xl font-semibold mb-3 text-text">No Workout History</h3>
        <p className="text-text-secondary mb-6 text-sm max-w-md mx-auto">You haven't logged any workouts yet. Start your fitness journey today!</p>
        <button className="bg-accent-violet hover:bg-accent-violet/90 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-accent-violet/20 transform hover:-translate-y-0.5">
          Record First Workout
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background-card/80 backdrop-blur-xl rounded-2xl shadow-card p-6 border border-white/5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-accent-violet/10 rounded-full flex items-center justify-center">
          <Dumbbell className="text-accent-violet" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text">Workout History</h2>
          <p className="text-text-secondary text-sm">
            {workouts.length} {workouts.length === 1 ? 'workout' : 'workouts'} found
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
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
              className="bg-background-surface/30 backdrop-blur-md rounded-2xl p-5 hover:bg-background-surface/40 transition-all duration-300 cursor-pointer border border-white/5 group shadow-sm hover:shadow-md"
              onClick={() => handleWorkoutClick(workout)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-text group-hover:text-accent-violet transition-colors">{workout.focus_area || 'Workout'}</h3>
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-secondary mt-2">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1.5 text-accent-violet/70" />
                      {date}
                    </div>
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1.5 text-accent-violet/70" />
                      <span className="font-medium text-accent-violet">{typeof duration === 'number' ? `${duration}m` : duration}</span>
                    </div>
                    <div className="flex items-center">
                      <Dumbbell size={14} className="mr-1.5 text-accent-violet/70" />
                      <span>{exerciseCount} exercises</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    workout.status === 'completed' 
                      ? 'bg-green-500/20 text-green-500 border border-green-500/30' 
                      : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                  }`}>
                    {workout.status}
                  </span>
                  <div className={`flex items-center justify-center w-7 h-7 rounded-full bg-background-surface/50 group-hover:bg-accent-violet/10 transition-all duration-300 ${isExpanded ? 'bg-accent-violet/10' : ''}`}>
                    <ChevronDown 
                      size={16} 
                      className={`text-text-tertiary group-hover:text-accent-violet transition-transform duration-300 ${isExpanded ? 'rotate-180 text-accent-violet' : ''}`} 
                    />
                  </div>
                </div>
              </div>
              
              {/* Expandable section with detailed workout information */}
              {isExpanded && (
                <div className="mt-5 pt-5 border-t border-white/5 animate-fadeIn">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 size={16} className="text-accent-violet" />
                    <h4 className="font-semibold text-text">Workout Details</h4>
                  </div>
                  
                  {/* Metrics */}
                  {Object.keys(metrics).length > 0 && (
                    <div className="mb-5 p-4 bg-background-surface/20 backdrop-blur-sm rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 mb-3">
                        <Flame size={14} className="text-orange-400" />
                        <h5 className="text-sm font-semibold text-text">Performance Metrics</h5>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        {Object.entries(metrics).map(([key, value]) => {
                          // Format the key for display
                          const formattedKey = key.replace(/_/g, ' ')
                            .split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ');
                            
                          // Format the value based on the key
                          let formattedValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
                          let valueClass = 'text-text font-medium';
                          
                          // Special formatting for certain metrics
                          if (key.includes('volume')) {
                            valueClass = 'text-white font-semibold';
                            if (typeof value === 'number') {
                              formattedValue = `${value.toLocaleString()} kg`;
                            }
                          } else if (key.includes('duration')) {
                            valueClass = 'text-white font-semibold';
                            if (typeof value === 'number') {
                              formattedValue = `${value} min`;
                            }
                          } else if (key.includes('start_time') || key.includes('end_time') || key.includes('time')) {
                            valueClass = 'text-white font-semibold';
                            formattedValue = formatTime(String(value));
                          }
                          
                          return (
                            <div key={key} className="p-2.5 bg-background-surface/30 rounded-lg">
                              <span className="text-text-secondary text-xs block mb-1">{formattedKey}</span>
                              <p className={valueClass}>{formattedValue}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Completed Exercises */}
                  {Object.keys(completedExercises).length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Award size={14} className="text-yellow-400" />
                        <h5 className="text-sm font-semibold text-text">Completed Exercises</h5>
                      </div>
                      <div className="space-y-3">
                        {Object.entries(completedExercises).map(([exerciseName, sets]: [string, any]) => (
                          <div key={exerciseName} className="p-4 bg-background-surface/20 backdrop-blur-sm rounded-xl border border-white/5 hover:bg-background-surface/30 transition-colors">
                            <div className="font-semibold text-text mb-2">{exerciseName}</div>
                            {Array.isArray(sets) && (
                              <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-background-surface/30 backdrop-blur-sm">
                                {/* Table Header */}
                                <div className="grid grid-cols-4 text-xs font-medium text-text-secondary bg-background-surface/50 border-b border-white/5">
                                  <div className="p-3 pl-4">SET</div>
                                  <div className="p-3">WEIGHT</div>
                                  <div className="p-3">REPS</div>
                                  <div className="p-3">VOLUME</div>
                                </div>
                                
                                {/* Table Body */}
                                <div className="divide-y divide-white/5">
                                  {sets.map((set: any, index: number) => {
                                    // Determine if this is a PR set
                                    const isPR = index === sets.length - 1 && set.weight > 0 && set.reps > 0;
                                    const volume = (set.weight || 0) * (set.reps || 0);
                                    
                                    return (
                                      <div 
                                        key={index} 
                                        className={`grid grid-cols-4 text-xs ${isPR 
                                          ? 'bg-yellow-500/5 hover:bg-yellow-500/10' 
                                          : 'hover:bg-background-surface/50'} transition-colors duration-150`}
                                      >
                                        <div className="p-3 pl-4 flex items-center">
                                          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full mr-2 ${isPR ? 'bg-yellow-500 text-black' : 'bg-background-surface/70 text-text-secondary'} font-bold text-[10px]`}>
                                            {index + 1}
                                          </span>
                                          <span className={isPR ? 'text-yellow-500 font-medium' : 'text-text-secondary'}>
                                            {isPR ? 'PR Set' : 'Working Set'}
                                          </span>
                                        </div>
                                        <div className="p-3 font-medium text-white">{set.weight || 0} kg</div>
                                        <div className="p-3 font-medium text-white">{set.reps || 0}</div>
                                        <div className="p-3 font-medium text-white">
                                          {volume.toLocaleString()} kg
                                          {isPR && (
                                            <span className="ml-2 inline-flex items-center justify-center bg-yellow-500 text-black text-[10px] px-1.5 py-0.5 rounded-full font-bold">PR</span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
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
