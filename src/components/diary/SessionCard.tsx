import React, { useState } from 'react';
import { CompletedSession, SessionSet } from '@/utils/rowsToSessionHistory';
import { format } from 'date-fns';
import { Clock, ChevronRight, ChevronDown, Dumbbell, Repeat, TrendingUp } from 'lucide-react';
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

export const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const sessionDate = new Date(session.sessionDate);

  return (
    <div 
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg transition-all duration-300 ease-in-out"
    >
      {/* Header Section */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/10 rounded-t-2xl"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="text-center w-12">
            <div className="text-sm text-neutral-400">{format(sessionDate, 'MMM')}</div>
            <div className="text-2xl font-bold text-white">{format(sessionDate, 'dd')}</div>
          </div>
          <div>
            <h3 className="font-semibold text-white">{session.sessionTitle}</h3>
            <div className="flex items-center gap-4 text-xs text-neutral-400 mt-1">
              {(() => {
                const exerciseMuscleGroups = session.exercises
                  .map(ex => ex.muscle_group)
                  .filter(mg => mg && validMuscleGroupsList.includes(mg as MuscleGroup)) as MuscleGroup[];
                
                const uniqueMuscleGroups = Array.from(new Set(exerciseMuscleGroups));

                if (uniqueMuscleGroups.length > 0) {
                  console.log('[SessionCard] Rendering MuscleGroupDisplay with unique groups:', uniqueMuscleGroups);
                  return <MuscleGroupDisplay muscleGroups={uniqueMuscleGroups} iconSize={12} />;
                }
                return null;
              })()}

              {session.durationMinutes && (
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {session.durationMinutes} min
                </span>
              )}
            </div>
          </div>
        </div>
        {isExpanded ? <ChevronDown className="text-neutral-500" /> : <ChevronRight className="text-neutral-500" />}
      </div>

      {/* Expandable Content Section */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-white/10">
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
