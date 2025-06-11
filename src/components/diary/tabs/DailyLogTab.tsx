import React from 'react';
import FiltersBar from '../daily/FiltersBar';
import SessionDrawer from '../SessionDrawer';

/**
 * Daily Log Tab
 * Shows today's workout plan and workout history
 */
const DailyLogTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's workout card */}
        <div className="lg:col-span-4">
        </div>
        
        {/* Workout history section */}
        <div className="lg:col-span-8 flex flex-col">
          <FiltersBar />
        </div>
      </div>
      
      {/* Session drawer - shared across tabs */}
      <SessionDrawer />
    </div>
  );
};

export default DailyLogTab;
