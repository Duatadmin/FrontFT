import React, { useState } from 'react';
import { cleanDayLabel } from '@/utils/TextOutputAdapter';
import { CompletedSession, SessionSet } from '@/utils/rowsToSessionHistory';
import { format } from 'date-fns';
import { Clock, Dumbbell, Repeat, TrendingUp } from 'lucide-react';
import { MuscleGroupDisplay, MuscleGroup } from './MuscleGroupDisplay'; // Import MuscleGroup type

// It's good practice to have this defined in one place, e.g., in MuscleGroupDisplay.tsx and export it, 
// or a shared types file. For now, redefining here for clarity of what SessionCard expects.
const validMuscleGroupsList: MuscleGroup[] = [
  'abs', 'back', 'biceps', 'calves', 'cardio', 'chest', 
  'forearms', 'glutes', 'hamstrings', 'quads', 
  'shoulders', 'traps', 'triceps'
];

interface SessionCardProps {
  session: CompletedSession;
  defaultExpanded?: boolean;
  onClick: () => void;
}

const SetRow: React.FC<{ set: SessionSet }> = ({ set }) => (
  <div className="grid grid-cols-4 gap-2 text-sm text-neutral-300 py-1">
    <div className="font-semibold">Set {set.setNo}</div>
    <div className="flex items-center gap-1.5">
      <Dumbbell size={14} className="text-neutral-400" />
      <span>{set.weightKg ?? '-'} kg</span>
    </div>
    <div className="flex items-center gap-1.5">
      <Repeat size={14} className="text-neutral-400" />
      <span>{set.repsDone ?? '-'} reps</span>
    </div>
    <div className="flex items-center gap-1.5">
      <TrendingUp size={14} className="text-neutral-400" />
      <span>RPE {set.rpe ?? '-'}</span>
    </div>
  </div>
);

export const SessionCard: React.FC<SessionCardProps> = ({ session, defaultExpanded = false, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const sessionDate = new Date(session.sessionDate);

  return (
    <div 
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg transition-all duration-300 ease-in-out"
    >
      {/* Header Section */}
      <div 
        className={`p-3 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-white/10 ${isExpanded ? 'rounded-t-2xl' : 'rounded-2xl'} transition-colors duration-150`}
        onClick={() => { onClick(); setIsExpanded(!isExpanded); }}
      >
        <div className="flex items-center gap-3 flex-grow min-w-0">
          <div className="text-center w-10 flex-shrink-0">
            <div className="text-xs text-neutral-400">{format(sessionDate, 'MMM')}</div>
            <div className="text-lg font-bold text-white">{format(sessionDate, 'dd')}</div>
          </div>
          <div className="flex-grow min-w-0">
            <h3 className="font-semibold text-base text-white capitalize truncate">{cleanDayLabel(session.sessionTitle)}</h3>
            {/* Display day of the week similar to Programs page */}
            {sessionDate && (
              <div className="text-xs text-neutral-500">
                {format(sessionDate, 'eeee')}
              </div>
            )}
            {/* Original duration display - can be kept or adapted if needed */}
            {session.durationMinutes && (
              <div className="flex items-center gap-1 text-xs text-neutral-400 mt-0.5">
                <Clock size={12} />
                {session.durationMinutes} min
              </div>
            )}
          </div>
        </div>

        {/* Right side: Muscle Icons and Chevron */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {(() => { // Logic for MuscleGroupDisplay moved here
            const exerciseMuscleGroups = session.exercises
              .map(ex => ex.muscle_group)
              .filter(mg => mg && validMuscleGroupsList.includes(mg as MuscleGroup)) as MuscleGroup[];
            
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
            
            // Ensure we don't exceed 5, though the loop above should handle it
            const finalDisplayGroups = displayableMuscleGroups.slice(0, 5);

            if (finalDisplayGroups.length > 0) {
              return <MuscleGroupDisplay muscleGroups={finalDisplayGroups} iconSize={24} />;
            }
            return null;
          })()}
          {/* Chevron from SessionAccordion */}
          <svg
            className={`w-5 h-5 transform transition-transform duration-200 text-neutral-400 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>

      {/* Expandable Content Section */}
      {isExpanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 border-t border-white/10 rounded-b-2xl">
          {session.exercises.length > 0 ? (
            <div className="space-y-4">
              {session.exercises.map((exercise, index) => (
                <div key={exercise.exerciseRowId} className={`pt-4 ${index > 0 ? 'border-t border-white/5' : ''}`}>
                  <h4 className="font-semibold text-white mb-2">{exercise.exerciseName}</h4>
                  {exercise.sets && exercise.sets.length > 0 ? (
                    <div className="space-y-1">
                      {exercise.sets.map(set => <SetRow key={set.setId} set={set} />)}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-400 italic">No sets completed for this exercise.</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400 italic">No exercises recorded for this session.</p>
          )}
        </div>
      )}
    </div>
  );
};
