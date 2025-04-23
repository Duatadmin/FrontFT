import React, { useEffect } from 'react';
import { useProgramStore } from '../../lib/stores/useProgramStore';
import WeeklyPlanGrid from './WeeklyPlanGrid';
import { CalendarDays, BarChart2, Clock } from 'lucide-react';

const CurrentProgramTab: React.FC = () => {
  const { currentPlan, isLoading, error, fetchCurrentPlan } = useProgramStore();
  
  // Fetch data on component mount
  useEffect(() => {
    fetchCurrentPlan();
  }, [fetchCurrentPlan]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-pulse text-accent-green">Loading your training plan...</div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2 text-red-600">Error Loading Plan</h2>
        <p className="text-red-600">There was a problem loading your training plan. Please try again later.</p>
        <button 
          onClick={() => fetchCurrentPlan()}
          className="mt-4 px-4 py-2 bg-background-card text-text-primary rounded-lg hover:bg-background-card/80"
        >
          Retry
        </button>
      </div>
    );
  }
  
  // Empty state - No plan found
  if (!currentPlan) {
    return (
      <div className="bg-background-surface rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">No Active Program</h2>
        <p className="text-text-secondary mb-4">You don't have an active training program yet.</p>
        <button className="px-4 py-2 bg-accent-green text-white rounded-lg hover:bg-accent-green/90">
          Create New Program
        </button>
      </div>
    );
  }
  
  // Parse dates for display
  const startDate = new Date(currentPlan.start_date);
  const formattedStartDate = startDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  return (
    <div>
      {/* Program summary card */}
      <div className="bg-background-surface rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{currentPlan.name}</h2>
          <div className="inline-flex items-center px-3 py-1 bg-accent-green/10 text-accent-green text-sm rounded-full mt-2 sm:mt-0">
            <Clock size={14} className="mr-1" />
            <span>Active</span>
          </div>
        </div>
        
        <p className="text-text-secondary mb-4">{currentPlan.description}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <CalendarDays size={18} className="text-text-tertiary mr-2" />
            <span className="text-sm">Started: {formattedStartDate}</span>
          </div>
          <div className="flex items-center">
            <BarChart2 size={18} className="text-text-tertiary mr-2" />
            <span className="text-sm">Program ID: {currentPlan.id.substring(0, 8)}</span>
          </div>
        </div>
      </div>
      
      {/* Weekly schedule grid */}
      <h3 className="text-lg font-medium mb-3">Weekly Schedule</h3>
      <WeeklyPlanGrid plan={currentPlan} />
    </div>
  );
};

export default CurrentProgramTab;
