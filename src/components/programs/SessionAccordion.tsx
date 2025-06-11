import React, { useState } from 'react';
import type { WorkoutSession } from '@/utils/rowsToPlanTree';
import { cleanDayLabel } from '@/utils/TextOutputAdapter';
import { ExerciseList } from './ExerciseList'; // Assuming ExerciseList will be created next

interface SessionAccordionProps {
  sessions: WorkoutSession[];
  weekId: string;
  // planId: string; // Removed, useWorkoutStore for context
}

interface AccordionItemProps {
  session: WorkoutSession;
  isOpen: boolean;
  onToggle: () => void;
  // planId: string; // Removed
  weekId: string;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ session, isOpen, onToggle, weekId }) => {
  return (
    <div className="border border-neutral-700 rounded-lg mb-3 bg-neutral-800/50 shadow-md">
      <h2>
        <button
          type="button"
          className="flex items-center justify-between w-full p-4 font-medium text-left text-neutral-300 hover:bg-neutral-700/50 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors duration-150"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={`session-content-${session.sessionId}`}
        >
          <div className="flex-grow">
            <span className="text-lg text-green-400 capitalize">
              {session.dayLabel ? cleanDayLabel(session.dayLabel) : `Session ${session.sessionNumber || ''}`.trim()}
            </span>
            {session.focusArea && (
              <span className="block text-sm text-neutral-400">
                Focus: {session.focusArea}
              </span>
            )}
            {session.sessionDate && (
                 <span className="block text-xs text-neutral-500">
                    {new Date(session.sessionDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                 </span>
            )}
          </div>
          <svg
            className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </h2>
      {isOpen && (
        <div
          id={`session-content-${session.sessionId}`}
          className="p-4 border-t border-neutral-700 bg-neutral-800/30 rounded-b-lg"
        >
          {session.exercises && session.exercises.length > 0 ? (
            <ExerciseList 
              exercises={session.exercises} 
              sessionId={session.sessionId} 
              weekId={weekId} 
            />
          ) : (
            <p className="text-neutral-500">No exercises defined for this session.</p>
          )}
        </div>
      )}
    </div>
  );
};

export const SessionAccordion: React.FC<SessionAccordionProps> = ({ sessions, weekId }) => {
  const [openSessionId, setOpenSessionId] = useState<string | null>(null);

  const handleToggle = (sessionId: string) => {
    setOpenSessionId(openSessionId === sessionId ? null : sessionId);
  };

  if (!sessions || sessions.length === 0) {
    return <p className="text-neutral-400">No sessions available for this week.</p>;
  }

  return (
    <div className="space-y-2">
      {sessions.map((session) => (
        <AccordionItem
          key={session.sessionId}
          session={session}
          isOpen={openSessionId === session.sessionId}
          onToggle={() => handleToggle(session.sessionId)}
          weekId={weekId}
        />
      ))}
    </div>
  );
};

// This export ensures the file is treated as a module.
export {};
