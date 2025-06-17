import React from 'react';
import { VariableSizeList, type ListChildComponentProps } from 'react-window';
import type { WorkoutExercise } from '@/utils/rowsToPlanTree';
import { SetTable } from './SetTable'; // Assuming SetTable will be created next

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

const ExerciseRow: React.FC<ListChildComponentProps<ExerciseRowData>> = ({ index, style, data }) => {
  const { exercises, weekId, sessionId } = data; // planId removed
  const exercise = exercises[index];

  if (!exercise) {
    return null; // Should not happen if data is clean
  }

  return (
    <div style={style} className="pr-2"> {/* py-3 removed, spacing handled by card's margin */}
      <div className="p-4 bg-neutral-700/40 rounded-lg shadow border border-neutral-600 mb-2"> {/* mb-2 added for spacing */}
        <h4 className="text-xl font-semibold text-green-300 mb-2 capitalize">
          {exercise.name || 'Unnamed Exercise'}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-xs sm:text-sm mb-3 text-neutral-300">
          <p><strong>Muscle:</strong> {exercise.muscleGroup || 'N/A'}</p>
          <p><strong>Tier:</strong> {exercise.tier || 'N/A'}</p>
          <p><strong>Equip:</strong> {exercise.equipment || 'N/A'}</p>
          <p><strong>Scheme:</strong> {exercise.repScheme || 'N/A'}</p>
          <p><strong>RIR:</strong> {exercise.rir ?? 'N/A'}</p>
          <p><strong>Planned Sets:</strong> {exercise.setsPlanned ?? 'N/A'}</p>
        </div>
        
        {exercise.sets && exercise.sets.length > 0 ? (
          <SetTable 
            sets={exercise.sets} 
            // planId={planId} // Removed
            weekId={weekId}
            sessionId={sessionId}
            exerciseId={exercise.exerciseRowId} // Pass exerciseRowId as exerciseId for the store
          />
        ) : (
          <p className="text-sm text-neutral-500 italic">No sets recorded for this exercise yet.</p>
        )}
      </div>
    </div>
  );
};

export const ExerciseList: React.FC<ExerciseListProps> = ({ exercises, sessionId, weekId }) => {
  if (!exercises || exercises.length === 0) {
    return <p className="text-neutral-400 italic">No exercises in this session.</p>;
  }

  // react-window needs a fixed height for the list container.
  // This can be a challenge in responsive designs. For simplicity, using a fixed height here.
  // Consider using react-virtualized-auto-sizer for more dynamic height handling.
  // Height calculation for VariableSizeList needs a different approach.
  // For now, let's use a fixed height for the list viewport or make it more dynamic later.
  const listHeight = 600; // Default list viewport height, can be adjusted

  const getItemHeight = (index: number): number => {
    const exercise = exercises[index];
    if (!exercise) return 80; // Fallback small height

    let height = 0;
    // Card structure: p-4 (16px*2=32) + border (1px*2=2) + mb-2 (8px)
    height += 32 + 2 + 8; // 42px

    // Exercise Name (text-xl, mb-2)
    height += 28; // Approx height for text-xl (e.g., 1.25rem * 1.5 line height)
    height += 8;  // mb-2 (0.5rem)

    // Metadata (6 items, text-xs, grid, mb-3)
    // On mobile (single column), each item text-xs (0.75rem * 1.5 line height = ~18px)
    // Assuming up to 6 lines if all wrap, or fewer if grid applies effectively.
    // Let's estimate based on 3 rows of 2 items on sm, or 6 rows on xs.
    // Max 6 lines * ~18px/line = 108px. Plus mb-3 (12px)
    height += (6 * 18); // Max height for metadata text
    height += 12; // mb-3 (0.75rem)

    // SetTable (mt-2)
    height += 8; // mt-2 (0.5rem)
    if (exercise.sets && exercise.sets.length > 0) {
      height += 24; // Table header (approx text-xs + padding)
      height += exercise.sets.length * 30; // Each set row (approx text-xs + padding)
    } else {
      height += 20; // "No sets" message (text-sm)
    }
    
    // Add a small general buffer for any unaccounted spacing/rounding
    height += 16;

    return Math.max(height, 150); // Ensure a minimum height
  };

  return (
    <VariableSizeList
      height={listHeight} 
      itemCount={exercises.length}
      itemSize={getItemHeight}
      width="100%" // Takes full width of its parent
      itemData={{ exercises, weekId, sessionId }} // planId removed
      className="scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800"
    >
      {ExerciseRow}
    </VariableSizeList>
  );
};

// This export ensures the file is treated as a module.
export {};
