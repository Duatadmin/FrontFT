import React, { useEffect } from 'react';
import { CalendarClock, BarChart2, Award, Clock, Dumbbell, Heart } from 'lucide-react';
import useDiaryStore from '../../../store/useDiaryStore';
import useUserStore from '../../../store/useUserStore';
import { WeeklyReflection } from '../../../store/useDiaryStore';

/**
 * WeeklySummaryCard Component
 * Displays weekly training metrics and summary
 */
const WeeklySummaryCard: React.FC = () => {
  // Get data from stores
  const { currentWeekReflection, loading, error, fetchCurrentWeekReflection } = useDiaryStore();
  const { user } = useUserStore();
  
  // Fetch current week reflection on component mount
  useEffect(() => {
    if (user?.id) {
      fetchCurrentWeekReflection(user.id);
    }
  }, [user?.id, fetchCurrentWeekReflection]);
  
  // Calculate completion percentage
  const calculateCompletionPercentage = (reflection: WeeklyReflection | null) => {
    if (!reflection || reflection.planned_sessions === 0) return 0;
    return Math.round((reflection.completed_sessions / reflection.planned_sessions) * 100);
  };
  
  // Loading state
  if (loading.weeklyReflection) {
    return (
      <div className="bg-background-card rounded-2xl shadow-card p-6 h-[200px] animate-pulse" data-testid="weekly-summary-loading">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-background-surface rounded-full"></div>
          <div className="h-6 w-48 bg-background-surface rounded-md"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((_, i) => (
            <div key={i} className="h-20 bg-background-surface rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }
  
  // Error state
  if (error.weeklyReflection) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center" data-testid="weekly-summary-error">
        <h3 className="text-lg font-medium mb-2">Weekly Summary Unavailable</h3>
        <p className="text-text-secondary mb-4 text-sm">{error.weeklyReflection}</p>
        <button 
          onClick={() => user?.id && fetchCurrentWeekReflection(user.id)}
          className="bg-accent-violet hover:bg-accent-violet/90 text-white px-4 py-2 rounded-lg text-sm"
        >
          Retry
        </button>
      </div>
    );
  }
  
  // Empty state or first visit - needs to be created
  if (!currentWeekReflection) {
    return (
      <div className="bg-background-card rounded-2xl shadow-card p-6" data-testid="weekly-summary-empty">
        <div className="flex items-center gap-2 mb-4">
          <CalendarClock className="text-accent-violet" size={24} />
          <h2 className="text-lg font-semibold">Weekly Summary</h2>
        </div>
        <p className="text-text-secondary mb-4">
          This is your first week in the journal. Track your workouts and come back for insights!
        </p>
        <button className="bg-accent-violet text-white px-4 py-2 rounded-lg text-sm hover:bg-accent-violet/90 transition-colors">
          Start Tracking
        </button>
      </div>
    );
  }
  
  // Format dates for display
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };
  
  const completionPercentage = calculateCompletionPercentage(currentWeekReflection);
  
  return (
    <div className="bg-background-card rounded-2xl shadow-card p-6" data-testid="weekly-summary-card">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2">
          <CalendarClock className="text-accent-violet" size={24} />
          <div>
            <h2 className="text-lg font-semibold">Week Overview</h2>
            <p className="text-sm text-text-secondary">
              {formatDateRange(currentWeekReflection.week_start_date, currentWeekReflection.week_end_date)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="flex items-center mr-2">
            <span className="text-sm font-medium mr-2">Completion:</span>
            <div className="bg-background-surface h-2 w-24 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  completionPercentage >= 80 ? 'bg-accent-mint' : 
                  completionPercentage >= 50 ? 'bg-accent-violet' : 
                  'bg-accent-red'
                }`}
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
          <span className="text-sm font-medium">{completionPercentage}%</span>
        </div>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Sessions Completed */}
        <div className="bg-background-surface rounded-lg p-3 flex flex-col items-center" data-testid="metric-sessions">
          <BarChart2 className="text-accent-violet mb-1" size={20} />
          <span className="text-sm text-text-secondary">Sessions</span>
          <div className="font-bold text-lg">{currentWeekReflection.completed_sessions}/{currentWeekReflection.planned_sessions}</div>
        </div>
        
        {/* Total Volume */}
        <div className="bg-background-surface rounded-lg p-3 flex flex-col items-center" data-testid="metric-volume">
          <Dumbbell className="text-accent-violet mb-1" size={20} />
          <span className="text-sm text-text-secondary">Volume</span>
          <div className="font-bold text-lg">{(currentWeekReflection.total_volume / 1000).toFixed(1)}k</div>
        </div>
        
        {/* New PRs */}
        <div className="bg-background-surface rounded-lg p-3 flex flex-col items-center" data-testid="metric-prs">
          <Award className="text-accent-mint mb-1" size={20} />
          <span className="text-sm text-text-secondary">PRs</span>
          <div className="font-bold text-lg">{currentWeekReflection.new_prs}</div>
        </div>
        
        {/* Cardio Minutes */}
        <div className="bg-background-surface rounded-lg p-3 flex flex-col items-center" data-testid="metric-cardio">
          <Clock className="text-accent-violet mb-1" size={20} />
          <span className="text-sm text-text-secondary">Cardio</span>
          <div className="font-bold text-lg">{currentWeekReflection.cardio_minutes} min</div>
        </div>
        
        {/* Mood */}
        <div className="bg-background-surface rounded-lg p-3 flex flex-col items-center" data-testid="metric-mood">
          <Heart className="text-accent-red mb-1" size={20} />
          <span className="text-sm text-text-secondary">Mood</span>
          <div className="font-bold text-lg">
            {currentWeekReflection.avg_mood.toFixed(1)}/5
          </div>
        </div>
        
        {/* Sleep Quality */}
        <div className="bg-background-surface rounded-lg p-3 flex flex-col items-center" data-testid="metric-sleep">
          <span className="text-lg mb-1">💤</span>
          <span className="text-sm text-text-secondary">Sleep</span>
          <div className="font-bold text-lg">
            {currentWeekReflection.avg_sleep.toFixed(1)}/5
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklySummaryCard;
