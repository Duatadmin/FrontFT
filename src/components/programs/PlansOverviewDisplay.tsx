import React from 'react';
import { usePlansOverview } from '../../hooks/usePlansOverview'; // Adjusted path
import { PlanSummaryCard } from './PlanSummaryCard';
import { PlanOverview } from '../../types/plan'; // Adjusted path
// You might want a skeleton loader for a better UX
// import { Skeleton } from '@/components/ui/skeleton';

export const PlansOverviewDisplay: React.FC = () => {
  const { data: plans, isLoading, isError, error } = usePlansOverview();

  if (isLoading) {
    return (
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Placeholder for skeleton loaders */}
        {Array.from({ length: 4 }).map((_, index) => (
          // A simple pulsing placeholder
          <div key={index} className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>Error loading plans: {error?.message || 'Unknown error'}</p>
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500 dark:text-slate-400">
        <p>No training plans found. Get started by creating one!</p>
        {/* Optionally, add a button/link to create a new plan here */}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-100">Your Training Plans</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {plans.map((plan: PlanOverview) => (
          <PlanSummaryCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
};
