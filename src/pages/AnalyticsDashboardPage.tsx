import React from 'react';
import TrainingLoadCard from '@/dashboard/components/TrainingLoadCard';
import ProgressiveProgressCard from '@/dashboard/components/ProgressiveProgressCard';
import MuscleMovementBalanceCard from '@/dashboard/components/MuscleMovementBalanceCard'; // Import the new card

const AnalyticsDashboardPage: React.FC = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="font-display text-3xl font-bold text-white mb-6">Analytics Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Analytics modules will be added here */}
        <TrainingLoadCard />
        <ProgressiveProgressCard />
        <MuscleMovementBalanceCard />
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;
