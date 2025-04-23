import React, { useEffect } from 'react';
import { CalendarClock, ArrowRight, Dumbbell, Clock, CheckCircle, PlayCircle } from 'lucide-react';
import useDiaryStore from '../../../store/useDiaryStore';
import useUserStore from '../../../store/useUserStore';

/**
 * TodayCard Component
 * Displays today's scheduled workout with options to mark as completed or start in Coach
 */
const TodayCard: React.FC = () => {
  // Get data from stores
  const { currentPlan, todayWorkout, loading, error, fetchCurrentPlan, markSessionCompleted } = useDiaryStore();
  const { user } = useUserStore();
  
  // Fetch current plan on component mount
  useEffect(() => {
    if (user?.id) {
      fetchCurrentPlan(user.id);
    }
  }, [user?.id, fetchCurrentPlan]);
  
  // Handle mark as completed
  const handleMarkCompleted = () => {
    if (user?.id && todayWorkout) {
      const sessionData = {
        training_plan_id: currentPlan?.id || '',
        duration_minutes: todayWorkout.duration_minutes || 45,
        exercises_completed: todayWorkout.exercises || [],
        total_sets: todayWorkout.exercises?.length * 3 || 0, // Estimate 3 sets per exercise
        total_reps: todayWorkout.exercises?.length * 3 * 10 || 0, // Estimate 10 reps per set
        overall_difficulty: 3, // Default medium difficulty
        user_feedback: 'Completed via quick action'
      };
      
      markSessionCompleted(user.id, sessionData);
    }
  };
  
  // Loading state
  if (loading.currentPlan) {
    return (
      <div className="bg-background-card rounded-2xl shadow-card p-6 h-[260px] animate-pulse" data-testid="today-card-loading">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-background-surface rounded-full"></div>
          <div className="h-6 w-48 bg-background-surface rounded-md"></div>
        </div>
        <div className="h-7 w-72 bg-background-surface rounded-md mb-3"></div>
        <div className="h-5 w-56 bg-background-surface rounded-md mb-6"></div>
        <div className="flex gap-4">
          <div className="h-16 w-full bg-background-surface rounded-md"></div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error.currentPlan) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center" data-testid="today-card-error">
        <h3 className="text-lg font-medium mb-2">Training Plan Unavailable</h3>
        <p className="text-text-secondary mb-4 text-sm">{error.currentPlan}</p>
        <button 
          onClick={() => user?.id && fetchCurrentPlan(user.id)}
          className="bg-accent-violet hover:bg-accent-violet/90 text-white px-4 py-2 rounded-lg text-sm"
        >
          Retry
        </button>
      </div>
    );
  }
  
  // Empty state - No workout for today
  if (!currentPlan || !todayWorkout) {
    return (
      <div className="bg-background-card rounded-2xl shadow-card p-6" data-testid="today-card-empty">
        <div className="flex items-center gap-2 mb-4">
          <CalendarClock className="text-accent-violet" size={24} />
          <h2 className="text-lg font-semibold">Today's Workout</h2>
        </div>
        <p className="text-text-secondary mb-4">No workout scheduled for today. Enjoy your rest day!</p>
        <button className="text-accent-violet flex items-center text-sm font-medium">
          View full training plan <ArrowRight size={14} className="ml-1" />
        </button>
      </div>
    );
  }
  
  // Format time duration to readable format (e.g., "45 min")
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
  };
  
  return (
    <div className="bg-background-card rounded-2xl shadow-card p-6" data-testid="today-card">
      <div className="flex items-center gap-2 mb-4">
        <CalendarClock className="text-accent-violet" size={24} />
        <h2 className="text-lg font-semibold">Today's Workout</h2>
      </div>
      
      <h3 className="text-xl font-bold mb-1">{todayWorkout.name || currentPlan.name}</h3>
      <p className="text-text-secondary mb-4">{todayWorkout.description || 'Focus on proper form and controlled movements'}</p>
      
      <div className="flex flex-wrap gap-4 mb-4">
        {/* Estimated duration */}
        <div className="flex items-center bg-background-surface/70 rounded-lg px-3 py-2">
          <Clock size={16} className="text-text-secondary mr-2" />
          <span className="text-sm">{formatDuration(todayWorkout.duration_minutes || 45)}</span>
        </div>
        
        {/* Exercise count */}
        <div className="flex items-center bg-background-surface/70 rounded-lg px-3 py-2">
          <Dumbbell size={16} className="text-text-secondary mr-2" />
          <span className="text-sm">{todayWorkout.exercises?.length || 0} exercises</span>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-5">
        <button 
          onClick={handleMarkCompleted}
          className="flex-1 flex items-center justify-center gap-2 bg-accent-green/20 text-accent-green font-medium p-2.5 rounded-lg hover:bg-accent-green/30 transition-colors"
          data-testid="mark-completed-button"
        >
          <CheckCircle size={18} />
          <span>Mark Completed</span>
        </button>
        
        <button 
          className="flex-1 flex items-center justify-center gap-2 bg-accent-violet text-white font-medium p-2.5 rounded-lg hover:bg-accent-violet/90 transition-colors"
          data-testid="start-workout-button"
        >
          <PlayCircle size={18} />
          <span>Start Workout</span>
        </button>
      </div>
    </div>
  );
};

export default TodayCard;
