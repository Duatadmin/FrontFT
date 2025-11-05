import React from 'react';
import WeeklySummaryCard from '../weekly/WeeklySummaryCard';
import ChallengesAndFixes from '../weekly/ChallengesAndFixes';
import NextWeekFocus from '../weekly/NextWeekFocus';

/**
 * Weekly Review Tab
 * Provides a summary of the current week's training and tools for reflection
 */
const WeeklyReviewTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Weekly summary metrics */}
      <WeeklySummaryCard />
      
      {/* Weekly reflection components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Challenges and wins */}
        <div className="space-y-6">
          <ChallengesAndFixes />
        </div>
        
        {/* Next week focus */}
        <div>
          <NextWeekFocus />
        </div>
      </div>
    </div>
  );
};

export default WeeklyReviewTab;
