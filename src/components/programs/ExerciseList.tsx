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
      {/* Modern Exercise Card with Glassmorphism and Micro-interactions */}
      <div className="group relative overflow-hidden rounded-2xl mb-3 transition-all duration-300 hover:transform hover:scale-[1.02]">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/50 via-neutral-800/30 to-transparent" />
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-green-400/10" />
        </div>
        
        {/* Main content */}
        <div className="relative backdrop-blur-md bg-white/[0.02] border border-white/10 rounded-2xl p-5">
          {/* Header with exercise name and visual indicator */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white capitalize group-hover:text-green-300 transition-colors duration-300">
                {exercise.name || 'Unnamed Exercise'}
              </h4>
            </div>
            
            {/* Exercise number indicator */}
            <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-green-400/10 rounded-lg flex items-center justify-center">
              <span className="text-green-400 font-bold text-sm">{index + 1}</span>
            </div>
          </div>
          
          {/* Tags matching exercise library style */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-wrap gap-2">
              {exercise.muscleGroup && exercise.muscleGroup !== 'N/A' && (
                <span className="text-[0.7rem] bg-green-500/20 text-green-300 px-2 py-1 rounded-md border border-green-500/40 backdrop-blur-sm">
                  {exercise.muscleGroup}
                </span>
              )}
              {exercise.equipment && exercise.equipment !== 'N/A' && (
                <span className="text-[0.7rem] bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md border border-blue-500/40 backdrop-blur-sm">
                  {exercise.equipment}
                </span>
              )}
              {exercise.rir !== null && exercise.rir !== undefined && (
                <span className="text-[0.7rem] bg-purple-500/20 text-purple-300 px-2 py-1 rounded-md border border-purple-500/40 backdrop-blur-sm">
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
              <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-green-400/5 border border-green-500/20">
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="text-2xl font-bold text-green-400">{exercise.setsPlanned}</span>
                  <p className="text-xs text-neutral-400 mt-1">Sets</p>
                </div>
              </div>
            )}
            
            {/* Rep Scheme Display */}
            {exercise.repScheme && (
              <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-400/5 border border-orange-500/20">
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="text-2xl font-bold text-orange-400">{exercise.repScheme}</span>
                  <p className="text-xs text-neutral-400 mt-1">Reps</p>
                </div>
              </div>
            )}
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
