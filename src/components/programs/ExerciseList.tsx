import React from 'react';
import { FixedSizeList, type ListChildComponentProps } from 'react-window';
import type { WorkoutExercise } from '@/utils/rowsToPlanTree';
import { SetTable } from './SetTable'; // Assuming SetTable will be created next

interface ExerciseListProps {
  exercises: WorkoutExercise[];
  sessionId: string;
  weekId: string;
  // planId: string; // Removed
}

const ITEM_HEIGHT = 200; // Approximate height for each exercise item, adjust as needed

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
    <div style={style} className="py-3 pr-2"> {/* Added pr-2 for scrollbar spacing if needed */}
      <div className="p-4 bg-neutral-700/40 rounded-lg shadow border border-neutral-600">
        <h4 className="text-xl font-semibold text-green-300 mb-2 capitalize">
          {exercise.name || 'Unnamed Exercise'}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-sm mb-3 text-neutral-300">
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
  const listHeight = Math.min(exercises.length * ITEM_HEIGHT, 600); // Max height 600px, or total items height

  return (
    <FixedSizeList
      height={listHeight} 
      itemCount={exercises.length}
      itemSize={ITEM_HEIGHT}
      width="100%" // Takes full width of its parent
      itemData={{ exercises, weekId, sessionId }} // planId removed
      className="scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800"
    >
      {ExerciseRow}
    </FixedSizeList>
  );
};

// This export ensures the file is treated as a module.
export {};
