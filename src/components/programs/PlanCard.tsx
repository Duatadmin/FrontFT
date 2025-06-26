import React, { useEffect } from 'react';
import { useWorkoutPlan } from '@/hooks/useWorkoutPlan';
import { WeekTabs } from './WeekTabs'; // Assuming WeekTabs will be created next
import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { formatText } from '../../utils/TextOutputAdapter';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// planId prop is no longer needed as useWorkoutPlan fetches based on user context
// interface PlanCardProps {
// }

export const PlanCard: React.FC = () => { 
  const setInitialPlan = useWorkoutStore((state) => state.setInitialPlan);
  const { data: plan, isLoading, error, isError } = useWorkoutPlan(); // Correctly destructure isError, remove unused refetch

  useEffect(() => {
    if (plan) {
      setInitialPlan(plan);
    }
  }, [plan, setInitialPlan]);

  if (isLoading) {
    return <div className="h-64"><LoadingSpinner /></div>;
  }

  if (isError || (!isLoading && !plan)) { // Check !isLoading before !plan to avoid showing error during initial load
    return (
      <div className="p-4 bg-red-800 text-red-100 rounded-lg shadow-md">
        <h3 className="font-semibold text-lg">Error Loading Workout Plan</h3>
        <p>{error?.message || 'The workout plan could not be loaded or does not exist.'}</p>
      </div>
    );
  }

  // Explicit check to ensure plan is defined before proceeding
  if (!plan) {
    // This case should ideally be covered by isLoading or isError,
    // but this satisfies TS and handles any unexpected undefined state.
    return <div className="p-4 text-center text-neutral-500">No plan data available.</div>;
  }

  return (
    <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg text-neutral-100">
      <header className="mb-6 pb-4 border-b border-neutral-700">
        <h2 className="text-3xl font-rubik font-bold text-primary mb-2">
          {formatText(plan.goal) || 'Workout Plan'}
        </h2>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-neutral-400">
          <span>
            <strong>Split:</strong> {formatText(plan.splitType) || 'N/A'}
          </span>
          <span>
            <strong>Level:</strong> {formatText(plan.level) || 'N/A'}
          </span>
          <span>
            <strong>Status:</strong> <span className={`${plan.planStatus === 'active' ? 'bg-green-600/20 border-green-500/40 text-green-300' : 'bg-yellow-600/20 border-yellow-500/40 text-yellow-300'} border backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-medium`}>{plan.planStatus || 'N/A'}</span>
          </span>
        </div>
      </header>

      {plan.weeks && plan.weeks.length > 0 ? (
        <WeekTabs weeks={plan.weeks} /> // Remove planId prop
      ) : (
        <div className="text-center py-8 text-neutral-500">
          <p className="text-lg">This plan currently has no weeks defined.</p>
        </div>
      )}
    </div>
  );
};
