import React from 'react';
import { ProgramDay } from '../../../store/useProgramStore';
import { X, Dumbbell, BarChart } from 'lucide-react';
import createLogger from '../../../utils/logger';

const logger = createLogger('DaySessionDrawer');

interface DaySessionDrawerProps {
  day?: ProgramDay;
  isOpen: boolean;
  onClose: () => void;
  dayLabel: string;
}

/**
 * DaySessionDrawer Component
 * Displays detailed information about exercises for a specific day
 */
const DaySessionDrawer: React.FC<DaySessionDrawerProps> = ({ day, isOpen, onClose, dayLabel }) => {
  // If no day data or drawer is closed, return null
  if (!day || !isOpen) return null;
  
  // Calculate total volume
  const totalVolume = day.exercises.reduce((total, exercise) => {
    const load = exercise.load || 0;
    return total + (exercise.sets * exercise.reps * load);
  }, 0);
  
  // Handle outside click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex justify-end"
      onClick={handleBackdropClick}
      data-testid="day-session-drawer-backdrop"
    >
      <div 
        className="w-full max-w-md bg-background-default h-full overflow-y-auto shadow-xl transition-transform animate-drawer-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <div className="sticky top-0 z-10 bg-background-default border-b border-border px-4 py-4 flex justify-between items-center">
          <h2 id="drawer-title" className="text-lg font-semibold text-text-primary">
            {dayLabel}: {day.focus}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-background-hover transition-colors"
            aria-label="Close drawer"
            data-testid="close-drawer-button"
          >
            <X className="h-5 w-5 text-text-secondary" />
          </button>
        </div>
        
        <div className="p-4">
          {/* Workout summary */}
          <div className="bg-background-surface rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-text-primary">Workout Summary</h3>
              <div className="text-xs font-medium text-text-tertiary bg-background-hover px-2 py-1 rounded-full">
                {day.exercises.length} exercises
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Dumbbell className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">Total Sets</p>
                  <p className="font-medium">{day.exercises.reduce((total, ex) => total + ex.sets, 0)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  <BarChart className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">Volume</p>
                  <p className="font-medium">{totalVolume.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Exercise list */}
          <h3 className="font-medium text-text-primary mb-3">Exercise Plan</h3>
          <div className="space-y-4">
            {day.exercises.map((exercise, index) => (
              <div 
                key={exercise.id}
                className="bg-background-surface rounded-xl p-4 hover:shadow-sm transition-shadow"
                data-testid={`exercise-item-${index}`}
              >
                <h4 className="font-medium text-text-primary mb-1">{exercise.name}</h4>
                
                <div className="flex gap-3 text-text-secondary text-sm mb-2">
                  <div>
                    <span className="font-semibold">{exercise.sets}</span> sets
                  </div>
                  <div>
                    <span className="font-semibold">{exercise.reps}</span> reps
                  </div>
                  {exercise.load && (
                    <div>
                      <span className="font-semibold">{exercise.load}</span> kg
                    </div>
                  )}
                  {exercise.rpe && (
                    <div>
                      RPE <span className="font-semibold">{exercise.rpe}</span>
                    </div>
                  )}
                </div>
                
                {exercise.notes && (
                  <div className="mt-2 text-sm text-text-tertiary bg-background-hover p-2 rounded">
                    <p className="text-xs uppercase font-medium mb-1">Notes</p>
                    {exercise.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DaySessionDrawer;
