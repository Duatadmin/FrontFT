import React from 'react';
import { useProgramStore } from '../../../lib/stores/useProgramStore';
import ProgramOverviewCard from './ProgramOverviewCard';
import WeeklyPlanGrid from './WeeklyPlanGrid';
import createLogger from '../../../utils/logger';
import { Calendar, Plus } from 'lucide-react';

const logger = createLogger('CurrentProgramTab');

/**
 * CurrentProgramTab Component
 * Displays the active training program with overview and weekly plan
 */
const CurrentProgramTab: React.FC = () => {
  const { currentPlan, isLoading, error } = useProgramStore();
  
  // Empty state - no active program
  if (!isLoading && !currentPlan) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center" data-testid="no-program-state">
        <div className="bg-background-surface rounded-full p-4 mb-4">
          <Calendar className="h-12 w-12 text-text-secondary" />
        </div>
        <h3 className="text-xl font-medium mb-2">No Active Training Program</h3>
        <p className="text-text-secondary mb-4">{error}</p>
        <p className="text-text-secondary mb-6 max-w-md">
          Create a new program or activate an existing template to start tracking your workouts.
        </p>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-primary rounded-lg text-white font-medium hover:bg-primary/90 transition-colors"
          onClick={() => useProgramStore.getState().setActiveTab('templates')}
          data-testid="create-program-button"
        >
          <Plus className="h-4 w-4" />
          Create Program
        </button>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="space-y-6" data-testid="error-program-state">
        {/* Skeleton for program overview card */}
        <div className="bg-background-surface rounded-xl p-6 animate-pulse">
          <div className="h-6 w-2/3 bg-gray-300/20 rounded mb-4"></div>
          <div className="h-4 w-1/2 bg-gray-300/20 rounded mb-2"></div>
          <div className="h-4 w-1/3 bg-gray-300/20 rounded mb-6"></div>
          <div className="h-2 w-full bg-gray-300/20 rounded"></div>
        </div>
        
        {/* Skeleton for weekly plan grid */}
        <div className="grid grid-cols-7 gap-2 animate-pulse">
          {Array(7).fill(0).map((_, i) => (
            <div key={i} className="bg-background-surface rounded-lg p-4 h-32">
              <div className="h-4 w-12 bg-gray-300/20 rounded mb-4"></div>
              <div className="h-3 w-20 bg-gray-300/20 rounded mb-2"></div>
              <div className="h-3 w-16 bg-gray-300/20 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="loading-program-state">
        {/* Skeleton for program overview card */}
        <div className="bg-background-surface rounded-xl p-6 animate-pulse">
          <div className="h-6 w-2/3 bg-gray-300/20 rounded mb-4"></div>
          <div className="h-4 w-1/2 bg-gray-300/20 rounded mb-2"></div>
          <div className="h-4 w-1/3 bg-gray-300/20 rounded mb-6"></div>
          <div className="h-2 w-full bg-gray-300/20 rounded"></div>
        </div>
        
        {/* Skeleton for weekly plan grid */}
        <div className="grid grid-cols-7 gap-2 animate-pulse">
          {Array(7).fill(0).map((_, i) => (
            <div key={i} className="bg-background-surface rounded-lg p-4 h-32">
              <div className="h-4 w-12 bg-gray-300/20 rounded mb-4"></div>
              <div className="h-3 w-20 bg-gray-300/20 rounded mb-2"></div>
              <div className="h-3 w-16 bg-gray-300/20 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Normal state with program data
  return (
    <div className="space-y-6" data-testid="current-program-content">
      {currentPlan && (
        <>
          <ProgramOverviewCard program={currentPlan} />
          <WeeklyPlanGrid program={currentPlan} />
        </>
      )}
    </div>
  );
};

export default CurrentProgramTab;
