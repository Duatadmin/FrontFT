import React from 'react';
import type { WorkoutExercise } from '@/utils/rowsToPlanTree';
import { Dumbbell } from 'lucide-react';

interface ExerciseListProps {
  exercises: WorkoutExercise[];
  sessionId: string;
  weekId: string;
  // planId: string; // Removed
}

// ITEM_HEIGHT is no longer a fixed const, it will be calculated per item.

interface ExerciseRowData {
  exercises: WorkoutExercise[];
  // planId: string; // Removed
  weekId: string;
  sessionId: string;
}

interface ExerciseRowProps {
  index: number;
  style: React.CSSProperties;
  data: ExerciseRowData;
}

const getTierIconCount = (tier?: string): number => {
  if (!tier) return 1;
  switch (tier.toUpperCase()) {
    case 'S': return 5;
    case 'A': return 4;
    case 'B': return 3;
    case 'C': return 2;
    default: return 1;
  }
};

const ExerciseRow: React.FC<ExerciseRowProps> = ({ index, style, data }) => {
  const { exercises, weekId, sessionId } = data; // planId removed
  const exercise = exercises[index];

  if (!exercise) {
    return null; // Should not happen if data is clean
  }

  return (
    <div style={style} className="pr-2">
      {/* Clean Exercise Card Design */}
      <div className="group relative mb-3 transition-all duration-300">
        {/* Main card with subtle background */}
        <div className="relative bg-[#0F1014]/40 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden hover:bg-[#0F1014]/60 hover:border-white/[0.08] transition-all duration-300">
          {/* Subtle accent line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          <div className="p-5">
          {/* Header with exercise name and visual indicator */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white capitalize group-hover:text-green-300 transition-colors duration-300">
                {exercise.name || 'Unnamed Exercise'}
              </h4>
            </div>
            
            {/* Exercise number indicator - minimal design */}
            <div className="w-8 h-8 bg-white/[0.03] rounded-lg flex items-center justify-center border border-white/[0.06]">
              <span className="text-white/60 font-medium text-sm">{index + 1}</span>
            </div>
          </div>
          
          {/* Tags matching exercise library style */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-wrap gap-2">
              {exercise.muscleGroup && exercise.muscleGroup !== 'N/A' && (
                <span className="text-[0.7rem] bg-white/[0.04] text-green-400/90 px-2.5 py-1 rounded-md border border-green-400/20">
                  {exercise.muscleGroup}
                </span>
              )}
              {exercise.equipment && exercise.equipment !== 'N/A' && (
                <span className="text-[0.7rem] bg-white/[0.04] text-white/70 px-2.5 py-1 rounded-md border border-white/10">
                  {exercise.equipment}
                </span>
              )}
              {exercise.rir !== null && exercise.rir !== undefined && (
                <span className="text-[0.7rem] bg-white/[0.04] text-orange-400/90 px-2.5 py-1 rounded-md border border-orange-400/20">
                  RIR {exercise.rir}
                </span>
              )}
            </div>
            
            {/* Tier Icons - same as exercise library */}
            {exercise.tier && exercise.tier !== 'N/A' && (
              <div className="flex items-center gap-0.5">
                {Array.from({ length: getTierIconCount(exercise.tier) }).map((_, index) => (
                  <Dumbbell key={index} className="w-4 h-4 text-lime-400" />
                ))}
              </div>
            )}
          </div>
          
          {/* Sets and Reps Plan Display */}
          <div className="grid grid-cols-2 gap-3">
            {/* Sets Display */}
            {exercise.setsPlanned && exercise.setsPlanned > 0 && (
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors duration-200">
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="text-2xl font-bold text-green-400/90">{exercise.setsPlanned}</span>
                  <p className="text-xs text-white/50 mt-1">Sets</p>
                </div>
              </div>
            )}
            
            {/* Rep Scheme Display */}
            {exercise.repScheme && (
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors duration-200">
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="text-2xl font-bold text-orange-400/90">{exercise.repScheme}</span>
                  <p className="text-xs text-white/50 mt-1">Reps</p>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ExerciseList: React.FC<ExerciseListProps> = ({ exercises, sessionId, weekId }) => {
  if (!exercises || exercises.length === 0) {
    return <p className="text-neutral-400 italic">No exercises in this session.</p>;
  }

  // Remove virtualization to allow natural expansion of content
  return (
    <div className="space-y-3">
      {exercises.map((exercise, index) => (
        <ExerciseRow
          key={exercise.exerciseRowId}
          index={index}
          style={{}} // No need for positioning style
          data={{ exercises, weekId, sessionId }}
        />
      ))}
    </div>
  );
};

// This export ensures the file is treated as a module.
export {};
