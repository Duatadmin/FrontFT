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
    return (
      <div className="text-center py-12">
        <div className="inline-flex flex-col items-center">
          <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center mb-4 border border-white/[0.06]">
            <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-white/40 text-sm">No weeks available for this plan</p>
          <p className="text-white/20 text-xs mt-1">Create weeks to organize your program</p>
        </div>
      </div>
    );
  }

  const selectedWeek = weeks[selectedWeekIndex];

  return (
    <div className="pt-1">
      {/* Minimal Week Selector Design */}
      <div className="mb-8">
        {/* Tab Container with subtle background */}
        <div className="bg-[#0F1014]/20 backdrop-blur-sm border border-white/[0.04] rounded-xl p-1.5">
          <nav className="flex gap-1 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent" aria-label="Weeks">
            {weeks.map((week, index) => (
              <button
                key={week.weekId}
                onClick={() => setSelectedWeekIndex(index)}
                className={`relative whitespace-nowrap px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-violet ${
                  selectedWeekIndex === index
                    ? 'bg-accent-violet/20 text-accent-violet'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
                }`}
                aria-current={selectedWeekIndex === index ? 'page' : undefined}
              >
                <span>
                  Week {week.weekNumber || index + 1}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {selectedWeek && selectedWeek.sessions && selectedWeek.sessions.length > 0 ? (
        <SessionAccordion sessions={selectedWeek.sessions} weekId={selectedWeek.weekId} />
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex flex-col items-center">
            <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center mb-4 border border-white/[0.06]">
              <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-white/40 text-sm">No sessions defined for this week</p>
            <p className="text-white/20 text-xs mt-1">Add sessions to start planning</p>
          </div>
        </div>
      )}
    </div>
  );
};

// This export ensures the file is treated as a module.
export {};
