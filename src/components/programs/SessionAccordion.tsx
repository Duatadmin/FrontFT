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

  // Logic for limiting and prioritizing muscle groups
  const preferredOrder: MuscleGroup[] = ['chest', 'back', 'shoulders', 'glutes', 'quads'];
  let displayableMuscleGroups: MuscleGroup[] = [];

  // Add preferred muscle groups first
  for (const preferred of preferredOrder) {
    if (exerciseMuscleGroups.includes(preferred) && !displayableMuscleGroups.includes(preferred)) {
      displayableMuscleGroups.push(preferred);
    }
  }

  // Add other muscle groups if space allows (up to 5 total)
  for (const group of exerciseMuscleGroups) {
    if (displayableMuscleGroups.length >= 5) break;
    if (!displayableMuscleGroups.includes(group)) {
      displayableMuscleGroups.push(group);
    }
  }
  
  // Ensure we don't exceed 5
  const finalDisplayGroups = displayableMuscleGroups.slice(0, 5);

  return (
    <div className="bg-[#2A2A2A]/40 backdrop-blur-md border border-white/10 rounded-xl shadow-lg mb-3 transition-all duration-300 ease-in-out">
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
          {finalDisplayGroups.length > 0 && (
            <MuscleGroupDisplay muscleGroups={finalDisplayGroups} iconSize={24} />
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
      {/* Modern Expandable Content with Smooth Transitions */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${
          isOpen ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div
          id={`session-content-${session.sessionId}`}
          className="relative"
        >
          {/* Gradient Background using welcome page greys */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1C1D24]/20 to-transparent pointer-events-none" />
          
          {/* Content Container with Modern Styling */}
          <div className="px-6 pb-6 pt-4">
            {/* Session Overview */}
            <div className="mb-6 p-4 bg-gradient-to-r from-green-500/10 to-green-400/5 rounded-lg border border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-neutral-400">Total Exercises</span>
                  <p className="text-2xl font-bold text-green-400">
                    {session.exercises ? session.exercises.length : 0}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-neutral-400">Total Sets</span>
                  <p className="text-2xl font-bold text-orange-400">
                    {session.exercises ? 
                      session.exercises.reduce((total, ex) => total + (ex.setsPlanned || 0), 0) : 
                      0
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Exercise Container */}
            {session.exercises && session.exercises.length > 0 ? (
              <ExerciseList 
                exercises={session.exercises} 
                sessionId={session.sessionId} 
                weekId={weekId} 
              />
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <svg
                    className="w-12 h-12 mx-auto mb-3 text-neutral-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <p className="text-[#BFBFBF] text-sm">No exercises defined yet</p>
                  <p className="text-[#6B6B7B] text-xs mt-1">Add exercises to start building your workout</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
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
