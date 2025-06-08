import React, { useEffect } from 'react';
import { useProgramStore } from '../../lib/stores/useProgramStore';
import WeeklyPlanGrid from './WeeklyPlanGrid';
import { CalendarDays, BarChart2, Clock, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '../ui/Card';

const CurrentProgramTab: React.FC = () => {
  const { currentPlan, isLoading, error, fetchCurrentPlan } = useProgramStore();
  
  // Fetch data on component mount
  useEffect(() => {
    fetchCurrentPlan();
  }, [fetchCurrentPlan]);
  
  // Loading state
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="flex justify-center items-center py-8">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-accent-mint" />
            <span className="text-sm text-text-secondary">Loading your training plan...</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Card className="border-red-200 mb-6">
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Plan</CardTitle>
          <CardDescription className="text-red-600 text-sm">
            There was a problem loading your training plan. Please try again later.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <button 
            onClick={() => fetchCurrentPlan()}
            className="px-3 py-1.5 text-sm bg-background-card text-text-primary rounded-md hover:bg-background-card/80 transition-colors"
          >
            Retry
          </button>
        </CardFooter>
      </Card>
    );
  }
  
  // Empty state - No plan found
  if (!currentPlan) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>No Active Program</CardTitle>
          <CardDescription className="text-sm">
            You don't have an active training program yet.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <button className="px-3 py-1.5 text-sm bg-accent-mint text-dark-surface rounded-md hover:bg-accent-mint/90 transition-colors">
            Create New Program
          </button>
        </CardFooter>
      </Card>
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
    <div className="space-y-6">
      {/* Program info card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <CardTitle>{currentPlan.name}</CardTitle>
            <span className="px-2 py-0.5 bg-accent-mint/10 text-accent-mint rounded-full text-xs mt-2 sm:mt-0">
              Active
            </span>
          </div>
          <CardDescription className="text-sm">{currentPlan.description}</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 text-text-tertiary mr-2" />
              <span className="text-sm text-text-secondary">Started: {formattedStartDate}</span>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-text-tertiary mr-2" />
              <span className="text-sm text-text-secondary">
                {currentPlan.end_date ? `Ends: ${new Date(currentPlan.end_date).toLocaleDateString()}` : 'Ongoing program'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Weekly plan section */}
      <div>
        <h3 className="text-base font-medium mb-3 text-text-primary">Weekly Schedule</h3>
        <WeeklyPlanGrid plan={currentPlan} />
      </div>
    </div>
  );
};

export default CurrentProgramTab;
