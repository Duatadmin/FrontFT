import React, { useState } from 'react';
import type { WorkoutSession } from '@/utils/rowsToPlanTree';
import { cleanDayLabel } from '@/utils/TextOutputAdapter';
import { ExerciseList } from './ExerciseList';
import { MuscleGroupDisplay, MuscleGroup, validMuscleGroups } from '@/components/diary/MuscleGroupDisplay';
import { format } from 'date-fns';

interface SessionAccordionProps {
  sessions: WorkoutSession[];
  weekId: string;
  // planId: string; // Removed, useWorkoutStore for context
}

interface AccordionItemProps {
  session: WorkoutSession;
  isOpen: boolean;
  onToggle: () => void;
  weekId: string;
}



const AccordionItem: React.FC<AccordionItemProps> = ({ session, isOpen, onToggle, weekId }) => {
  const sessionDate = session.sessionDate ? new Date(session.sessionDate) : null;

  const exerciseMuscleGroups = (session.exercises || [])
    .map(ex => ex.muscleGroup)
    .filter(mg => mg && validMuscleGroups.includes(mg as MuscleGroup)) as MuscleGroup[];
  
  const uniqueMuscleGroups = Array.from(new Set(exerciseMuscleGroups));

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-lg mb-3 transition-all duration-300 ease-in-out">
      {/* Header Section */}
      <div 
        className={`p-4 flex items-center justify-between cursor-pointer hover:bg-white/10 ${isOpen ? 'rounded-t-xl' : 'rounded-xl'} transition-colors duration-150`}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle()}
        aria-expanded={isOpen}
        aria-controls={`session-content-${session.sessionId}`}
      >
        <div className="flex items-center gap-3 flex-grow min-w-0">
          {sessionDate && (
            <div className="text-center w-10 flex-shrink-0">
              <div className="text-xs text-neutral-400">{format(sessionDate, 'MMM')}</div>
              <div className="text-lg font-bold text-white">{format(sessionDate, 'dd')}</div>
            </div>
          )}
          <div className="flex-grow min-w-0">
            <h3 className="font-semibold text-base text-white capitalize truncate">
              {session.dayLabel ? cleanDayLabel(session.dayLabel) : `Session ${session.sessionNumber || ''}`.trim()}
            </h3>
            {sessionDate && (
              <div className="text-xs text-neutral-500">
                {format(sessionDate, 'eeee')}{/* Full day name, e.g., Tuesday */}
              </div>
            )}
          </div>
        </div>

        {/* Right side: Muscle Icons and Chevron */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {uniqueMuscleGroups.length > 0 && (
            <MuscleGroupDisplay muscleGroups={uniqueMuscleGroups} iconSize={24} />
          )}
          <svg
            className={`w-5 h-5 transform transition-transform duration-200 text-neutral-400 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
      {isOpen && (
        <div
          id={`session-content-${session.sessionId}`}
          className="px-4 pb-4 pt-2 border-t border-white/10 bg-transparent rounded-b-xl"
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
