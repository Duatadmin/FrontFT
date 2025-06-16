import React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import ExerciseCard from './ExerciseCard'; // Assuming ExerciseCard.tsx will be in the same directory

// Define a type for exercise data (can be expanded later)
interface Exercise {
  id: string;
  name?: string; // Optional name property
}

// Placeholder data for demonstration - replace with actual data source
const allExercises: Exercise[] = Array.from({ length: 100 }).map((_, i) => ({
  id: `exercise_${i + 1}`,
  name: `Sample Exercise ${i + 1}`,
}));

const ITEMS_PER_ROW = 3; // Number of exercise cards per visual row
const FIXED_ROW_HEIGHT = 560; // px - height of each virtualized row container

export const ExerciseGrid: React.FC = () => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Calculate the total number of rows needed for virtualization
  const rowCount = Math.ceil(allExercises.length / ITEMS_PER_ROW);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => FIXED_ROW_HEIGHT, // Fixed height for each row
    overscan: 1, // Render 1 extra row before and after the visible ones
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      style={{
        height: '80vh', // Example container height, adjust as needed
        width: '100%',
        overflowY: 'auto', // Enable vertical scrolling
        border: '1px solid #eee', // Optional: for visual debugging
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`, // Total height of all virtualized items
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualRows.map((virtualRow) => {
          // Determine which exercises fall into the current virtual row
          const exercisesInThisRow: Exercise[] = [];
          const startIndex = virtualRow.index * ITEMS_PER_ROW;
          for (let i = 0; i < ITEMS_PER_ROW; i++) {
            const exerciseIndex = startIndex + i;
            if (exerciseIndex < allExercises.length) {
              exercisesInThisRow.push(allExercises[exerciseIndex]);
            }
          }

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement} // Important for accurate measurement, even with estimateSize
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`, // Should be FIXED_ROW_HEIGHT
                transform: `translateY(${virtualRow.start}px)`,
                display: 'flex',
                justifyContent: 'space-around', // Distribute cards evenly in the row
                alignItems: 'flex-start', // Align cards to the top of the row
                padding: '10px 0', // Vertical padding for the row (560px row height - 540px card height = 20px / 2)
                boxSizing: 'border-box',
              }}
            >
              {exercisesInThisRow.map((exercise, idx) => (
                <div
                  key={exercise.id}
                  style={{
                    flex: `1 1 calc(${100 / ITEMS_PER_ROW}% - 20px)`, // Basis for card width, allows for margin
                    maxWidth: `calc(${100 / ITEMS_PER_ROW}% - 20px)`,
                    margin: '0 10px', // Horizontal margin between cards
                    height: '540px', // Explicit height for the card wrapper, matching card's eventual height
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <ExerciseCard id={exercise.id} absoluteIndex={startIndex + idx} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExerciseGrid;
