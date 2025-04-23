import React, { useEffect } from 'react';
import { Flame, Trophy, Calendar, ArrowUp } from 'lucide-react';
import useDiaryStore from '../../../store/useDiaryStore';
import useUserStore from '../../../store/useUserStore';
import { cn } from '../../../lib/utils';

/**
 * StreakCounter Component
 * Displays the user's current workout streak and motivational elements
 */
const StreakCounter: React.FC = () => {
  const { streak, loading, error, calculateStreak } = useDiaryStore();
  const { user } = useUserStore();
  
  // Calculate streak on component mount
  useEffect(() => {
    if (user?.id) {
      calculateStreak(user.id);
    }
  }, [user?.id, calculateStreak]);
  
  // Loading state
  if (loading.streak) {
    return (
      <div className="bg-background-card rounded-2xl shadow-card p-4 h-[80px] animate-pulse" data-testid="streak-counter-loading">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-background-surface rounded-full"></div>
          <div className="h-5 w-32 bg-background-surface rounded-md"></div>
        </div>
        <div className="h-6 w-48 bg-background-surface rounded-md"></div>
      </div>
    );
  }
  
  // Error state
  if (error.streak) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center" data-testid="streak-counter-error">
        <p className="text-sm text-red-500">{error.streak}</p>
      </div>
    );
  }
  
  // Empty state - no streak yet
  if (!streak || streak.currentStreak === 0) {
    return (
      <div className="bg-background-card rounded-2xl shadow-card p-4" data-testid="streak-counter-empty">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-semibold flex items-center">
            <Flame className="text-accent-violet mr-2" size={18} />
            Workout Streak
          </h3>
          
          <span className="bg-background-surface py-1 px-2 rounded-md text-sm flex items-center">
            <Calendar size={14} className="mr-1 text-text-tertiary" />
            Start Today
          </span>
        </div>
        
        <p className="text-sm text-text-secondary mt-2">
          Complete a workout to start your streak. Consistency builds results!
        </p>
      </div>
    );
  }
  
  // Generate a gradient color for the streak based on its value
  const getStreakColor = (streakValue: number) => {
    if (streakValue >= 30) return 'from-purple-500 to-violet-600'; // 30+ days
    if (streakValue >= 14) return 'from-indigo-500 to-blue-600';   // 14+ days
    if (streakValue >= 7) return 'from-cyan-500 to-blue-500';      // 7+ days
    return 'from-amber-500 to-orange-600';                         // < 7 days
  };
  
  // Calculate if the current streak is equal to the longest streak
  const isNewRecord = streak.currentStreak === streak.longestStreak && streak.currentStreak > 0;
  
  return (
    <div 
      className={cn(
        "bg-background-card rounded-2xl shadow-card p-4 border-l-4",
        streak.currentStreak >= 7 ? "border-accent-violet" : "border-accent-green"
      )}
      data-testid="streak-counter"
    >
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-base font-semibold flex items-center">
          <Flame className={cn(
            "mr-2",
            streak.currentStreak >= 30 ? "text-violet-500" : 
            streak.currentStreak >= 14 ? "text-blue-500" : 
            streak.currentStreak >= 7 ? "text-cyan-500" : 
            "text-orange-500"
          )} size={18} />
          Current Streak
        </h3>
        
        {streak.streakChange > 0 && (
          <span className="bg-accent-green/20 text-accent-green py-1 px-2 rounded-md text-xs flex items-center">
            <ArrowUp size={12} className="mr-1" />
            +{streak.streakChange} days
          </span>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-baseline">
          <span className={cn(
            "text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
            getStreakColor(streak.currentStreak)
          )}>
            {streak.currentStreak}
          </span>
          <span className="text-text-secondary ml-1">days</span>
        </div>
        
        <div className="flex items-center">
          <div className="flex flex-col items-end mr-3">
            <span className="text-xs text-text-tertiary">Longest</span>
            <div className="flex items-baseline">
              <span className="font-bold">{streak.longestStreak}</span>
              <span className="text-xs text-text-tertiary ml-1">days</span>
            </div>
          </div>
          
          {isNewRecord && (
            <Trophy size={18} className="text-accent-green" />
          )}
        </div>
      </div>
      
      {/* Mini calendar visualization (7 days) */}
      <div className="flex items-center justify-between mt-2 bg-background-surface rounded-md p-2">
        {Array.from({ length: 7 }).map((_, index) => {
          const isActive = index < streak.lastSevenDays.filter(Boolean).length;
          return (
            <div 
              key={index}
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                isActive 
                  ? "bg-gradient-to-r from-accent-violet to-accent-violet/80 text-white"
                  : "bg-background-card text-text-tertiary"
              )}
              aria-label={isActive ? "Active day" : "Inactive day"}
            >
              {isActive ? <Flame size={12} /> : index + 1}
            </div>
          );
        })}
      </div>
      
      {/* Motivational message based on streak */}
      <p className="text-xs text-text-secondary mt-2">
        {streak.currentStreak >= 30 ? "Amazing dedication! You're in the top tier of consistency." :
         streak.currentStreak >= 14 ? "Fantastic work! Your consistency is becoming a solid habit." :
         streak.currentStreak >= 7 ? "Great job! You've completed a full week of training." :
         streak.currentStreak >= 3 ? "Good start! Keep the momentum going." :
         "You're on your way! Consistency is key to results."}
      </p>
    </div>
  );
};

export default StreakCounter;
