import React from 'react';
import TrainingLoadCard from '@/dashboard/components/TrainingLoadCard';
import ProgressiveProgressCard from '@/dashboard/components/ProgressiveProgressCard';
import MuscleMovementBalanceCard from '@/dashboard/components/MuscleMovementBalanceCard'; // Import the new card

const AnalyticsDashboardPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-20 sm:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 py-2 sm:py-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-sm sm:text-base text-text-secondary mt-2">Track your training progress and performance metrics</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Analytics modules will be added here */}
        <TrainingLoadCard />
        <ProgressiveProgressCard />
        <MuscleMovementBalanceCard />
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;
