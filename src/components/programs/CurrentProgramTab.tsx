import React from 'react';
import { PlanCard } from './PlanCard';

const CurrentProgramTab: React.FC = () => {
  // The PlanCard component now handles its own data fetching, loading, and error states.
  // It expects a planId for the workout_full_view.
  return (
    <div className="w-full">
      <PlanCard />
    </div>
  );
};

export default CurrentProgramTab;
