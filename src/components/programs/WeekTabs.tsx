import React, { useState } from 'react';
import type { WorkoutWeek } from '@/utils/rowsToPlanTree';
import { SessionAccordion } from './SessionAccordion'; // Assuming SessionAccordion will be created next

interface WeekTabsProps {
  weeks: WorkoutWeek[];
  // planId is no longer passed down; components should use useWorkoutStore if plan-level context is needed
}

export const WeekTabs: React.FC<WeekTabsProps> = ({ weeks }) => {
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);

  if (!weeks || weeks.length === 0) {
    return <p className="text-neutral-400">No weeks available for this plan.</p>;
  }

  const selectedWeek = weeks[selectedWeekIndex];

  return (
    <div className="pt-1">
      <nav className="mb-6 border-b border-white/10 flex space-x-1 overflow-x-auto" aria-label="Weeks">
        {weeks.map((week, index) => (
          <button
            key={week.weekId}
            onClick={() => setSelectedWeekIndex(index)}
            className={`whitespace-nowrap px-4 py-3 font-medium text-sm rounded-t-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-150
              ${
                selectedWeekIndex === index
                  ? 'bg-primary/10 font-semibold border-b-2 border-primary text-primary'
                  : 'text-neutral-400 hover:text-neutral-100 border-b-2 border-transparent'
              }`}
            aria-current={selectedWeekIndex === index ? 'page' : undefined}
          >
            Week {week.weekNumber || index + 1}
          </button>
        ))}
      </nav>

      {selectedWeek && selectedWeek.sessions && selectedWeek.sessions.length > 0 ? (
        <SessionAccordion sessions={selectedWeek.sessions} weekId={selectedWeek.weekId} />
      ) : (
        <div className="text-center py-6 text-neutral-500">
          <p>No sessions defined for this week.</p>
        </div>
      )}
    </div>
  );
};

// This export ensures the file is treated as a module.
export {};
