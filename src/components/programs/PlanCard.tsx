import React, { useEffect } from 'react';
import { useWorkoutPlan } from '@/hooks/useWorkoutPlan';
import { WeekTabs } from './WeekTabs'; // Assuming WeekTabs will be created next
import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { formatText } from '../../utils/TextOutputAdapter';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// planId prop is no longer needed as useWorkoutPlan fetches based on user context
// interface PlanCardProps {
// }

export const PlanCard: React.FC = () => { 
  const setInitialPlan = useWorkoutStore((state) => state.setInitialPlan);
  const { data: plan, isLoading, error, isError } = useWorkoutPlan(); // Correctly destructure isError, remove unused refetch

  console.log('[PlanCard] Render state:', {
    isLoading,
    isError,
    hasData: !!plan,
    planSummary: plan ? {
      planId: plan.planId,
      goal: plan.goal,
      status: plan.planStatus,
      weeksCount: plan.weeks?.length
    } : null
  });

  useEffect(() => {
    if (plan) {
      console.log('[PlanCard] Setting initial plan in store');
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
    <div className="space-y-4 sm:space-y-6">
      {/* Minimal Program Card Design */}
      <div className="relative overflow-hidden">
        {/* Background with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F1014]/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative bg-[#0F1014]/30 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4 sm:p-6 lg:p-8">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-green-400/20 to-transparent" />
          
          <header>
            {/* Program Type with minimal styling */}
            <h2 className="text-2xl sm:text-3xl font-rubik font-bold text-white/90 mb-3 sm:mb-4">
              {formatText(plan.goal) || 'Workout Plan'}
            </h2>
            
            {/* Program details in minimal pills */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {/* Split Type */}
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                <span className="text-xs text-white/40 uppercase tracking-wider">Split</span>
                <span className="text-xs sm:text-sm text-white/80 font-medium">{formatText(plan.splitType) || 'N/A'}</span>
              </div>
              
              {/* Level */}
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                <span className="text-xs text-white/40 uppercase tracking-wider">Level</span>
                <span className="text-xs sm:text-sm text-white/80 font-medium">{formatText(plan.level) || 'N/A'}</span>
              </div>
              
              {/* Status with subtle accent */}
              <div className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border transition-all duration-300 ${
                plan.planStatus === 'active' 
                  ? 'bg-green-400/[0.05] border-green-400/20' 
                  : 'bg-orange-400/[0.05] border-orange-400/20'
              }`}>
                <div className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${
                  plan.planStatus === 'active' ? 'bg-green-400' : 'bg-orange-400'
                }`} />
                <span className={`text-xs sm:text-sm font-medium ${
                  plan.planStatus === 'active' ? 'text-green-400/90' : 'text-orange-400/90'
                }`}>
                  {plan.planStatus || 'N/A'}
                </span>
              </div>
            </div>
          </header>
        </div>
      </div>

      {plan.weeks && plan.weeks.length > 0 ? (
        <WeekTabs weeks={plan.weeks} />
      ) : (
        <div className="text-center py-8 text-neutral-500">
          <p className="text-lg">This plan currently has no weeks defined.</p>
        </div>
      )}
    </div>
  );
};
