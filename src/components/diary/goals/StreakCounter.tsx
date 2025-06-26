import React, { useEffect } from 'react';
import { Flame, Trophy, ArrowUp } from 'lucide-react';
import useDiaryStore from '../../../store/useDiaryStore';
import useUserStore from '../../../store/useUserStore';
import { cn } from '../../../lib/utils';
import createLogger from '../../../utils/logger';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const logger = createLogger('StreakCounter');

/**
 * StreakCounter Component
 * Displays the user's current workout streak and motivational elements
 */
const StreakCounter: React.FC = () => {
  // Get streak data from store with safe defaults
  const { 
    loading, 
    error, 
    calculateStreak 
  } = useDiaryStore();
  
  // Safely extract streak data with defaults
  const streakData = useDiaryStore(state => {
    // Handle both object and primitive streak formats
    if (typeof state.streak === 'object' && state.streak !== null) {
      return {
        currentStreak: state.streak.currentStreak || 0,
        longestStreak: state.streak.longestStreak || 0,
        lastSevenDays: Array.isArray(state.streak.lastSevenDays) ? state.streak.lastSevenDays : [],
        streakChange: state.streak.streakChange || 0
      };
    }
    // Default values
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastSevenDays: [],
      streakChange: 0
    };
  });
  
  const { user } = useUserStore();
  
  // Calculate streak on component mount
  useEffect(() => {
    logger.debug('StreakCounter mounted');
    try {
      if (user?.id) {
        logger.debug('Calculating streak for user', { userId: user.id });
        calculateStreak();
      }
    } catch (err) {
      logger.error('Error calculating streak', err);
    }
  }, [calculateStreak]);
  
  // Loading state
  if (loading.streak) {
    return <div className="h-20"><LoadingSpinner /></div>;
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
  if (streakData.currentStreak === 0) {
    return (
      <div className="bg-neutral-800/50 rounded-2xl shadow-card p-4" data-testid="streak-counter-empty">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-semibold flex items-center">
            <Flame className="text-accent-violet mr-2" size={18} />
            Workout Streak
          </h3>
        </div>
        
        <div className="mt-2 text-text-secondary text-sm">
          <p>Complete your first workout to start your streak!</p>
        </div>
      </div>
    );
  }
  
  // Normal state with streak data
  return (
    <div className="bg-neutral-800/50 rounded-2xl shadow-card p-4" data-testid="streak-counter-active">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-semibold flex items-center">
          <Flame className={cn(
            "mr-2", 
            streakData.currentStreak >= 7 ? "text-amber-500" : "text-accent-violet"
          )} size={18} />
          Workout Streak
        </h3>
        
        {streakData.streakChange > 0 && (
          <div className="flex items-center text-green-500 text-xs font-medium bg-green-500/10 px-2 py-0.5 rounded-full">
            <ArrowUp size={12} className="mr-0.5" />
            +{streakData.streakChange}
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold">{streakData.currentStreak}</span>
            <span className="text-text-secondary text-sm ml-1.5">day{streakData.currentStreak !== 1 ? 's' : ''}</span>
          </div>
          
          <div className="flex items-center mt-1 text-xs text-text-secondary">
            <Trophy size={12} className="mr-1 text-amber-500" />
            <span>Best: {streakData.longestStreak} days</span>
          </div>
        </div>
        
        <div className="flex gap-0.5 items-center">
          {Array.isArray(streakData.lastSevenDays) && streakData.lastSevenDays.map((active, i) => (
            <div 
              key={i}
              className={cn(
                "w-3 h-3 rounded-sm",
                active 
                  ? "bg-accent-violet" 
                  : "bg-background-surface"
              )}
              title={`${active ? 'Active' : 'Inactive'} day`}
            />
          ))}
        </div>
      </div>
      
      {/* Motivational message based on streak */}
      <p className="text-xs text-text-secondary mt-2">
        {streakData.currentStreak >= 30 ? "Amazing dedication! You're in the top tier of consistency." :
         streakData.currentStreak >= 14 ? "Fantastic work! Your consistency is becoming a solid habit." :
         streakData.currentStreak >= 7 ? "Great job! You've completed a full week of training." :
         streakData.currentStreak >= 3 ? "Good start! Keep the momentum going." :
         "You're on your way! Consistency is key to results."}
      </p>
    </div>
  );
};

export default StreakCounter;
