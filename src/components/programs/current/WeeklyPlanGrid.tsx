import React, { useState } from 'react';
import { TrainingPlan } from '../../../store/useProgramStore';
import DaySessionDrawer from './DaySessionDrawer';
import createLogger from '../../../utils/logger';

const logger = createLogger('WeeklyPlanGrid');

interface WeeklyPlanGridProps {
  program: TrainingPlan;
}

// Day of week mapping
const DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

// Focus area emoji mapping
const FOCUS_EMOJIS: Record<string, string> = {
  'upper body': '💪',
  'lower body': '🦵',
  'full body': '⚡',
  'push': '👐',
  'pull': '💪',
  'legs': '🦵',
  'cardio': '🏃',
  'core': '🔄',
  'rest': '🧘',
  'default': '📋'
};

/**
 * WeeklyPlanGrid Component
 * Displays a 7-day grid showing workout schedule for the current program
 */
const WeeklyPlanGrid: React.FC<WeeklyPlanGridProps> = ({ program }) => {
  // State for the selected day drawer
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  // Get today's day of week (0-6, 0 is Sunday)
  const today = new Date().getDay();

  // Handle click on a day cell
  const handleDayClick = (dayOfWeek: number) => {
    logger.debug('Day clicked', { dayOfWeek });
    setSelectedDay(dayOfWeek);
  };
  
  // Close drawer
  const handleCloseDrawer = () => {
    setSelectedDay(null);
  };
  
  // Calculate total volume for a day (sets × reps × load)
  const calculateDayVolume = (dayOfWeek: number) => {
    const day = program.days.find(d => d.dayOfWeek === dayOfWeek);
    if (!day) return 0;
    
    return day.exercises.reduce((total, exercise) => {
      const load = exercise.load || 0;
      return total + (exercise.sets * exercise.reps * load);
    }, 0);
  };
  
  // Get emoji for focus area
  const getFocusEmoji = (focus: string) => {
    const lowercaseFocus = focus.toLowerCase();
    for (const [key, emoji] of Object.entries(FOCUS_EMOJIS)) {
      if (lowercaseFocus.includes(key)) {
        return emoji;
      }
    }
    return FOCUS_EMOJIS.default;
  };

  return (
    <div data-testid="weekly-plan-grid">
      <h3 className="text-lg font-medium mb-4">Weekly Schedule</h3>
      
      <div className="grid grid-cols-7 gap-2 mb-6">
        {DAYS.map(day => {
          // Find program day if it exists
          const programDay = program.days.find(d => d.dayOfWeek === day.value);
          const hasWorkout = !!programDay;
          const isToday = day.value === today;
          const volume = calculateDayVolume(day.value);
          
          return (
            <div 
              key={day.value}
              className={`
                rounded-lg overflow-hidden transition-all
                ${isToday ? 'ring-2 ring-primary' : ''}
                ${hasWorkout ? 'cursor-pointer hover:shadow-md' : 'opacity-70'}
              `}
              onClick={hasWorkout ? () => handleDayClick(day.value) : undefined}
              data-testid={`day-cell-${day.label.toLowerCase()}`}
            >
              <div className="bg-background-surface px-3 py-2 text-center border-b border-border">
                <p className={`font-medium ${isToday ? 'text-primary' : 'text-text-primary'}`}>
                  {day.label}
                </p>
              </div>
              
              <div className={`p-4 min-h-[100px] flex flex-col justify-between ${hasWorkout ? 'bg-background-surface' : 'bg-background-surface/50'}`}>
                {hasWorkout && programDay ? (
                  <>
                    <div>
                      <div className="text-xl mb-1">{getFocusEmoji(programDay.focus)}</div>
                      <h4 className="font-medium text-text-primary mb-1">{programDay.focus}</h4>
                      <p className="text-xs text-text-secondary">{programDay.exercises.length} exercises</p>
                    </div>
                    <div 
                      className="text-xs text-text-tertiary mt-2 bg-background-hover px-2 py-1 rounded self-start"
                      title="Workout volume (sets × reps × load)"
                    >
                      Vol: {volume.toLocaleString()}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-text-tertiary">
                    <p className="text-sm">Rest Day</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Day session drawer */}
      {selectedDay !== null && (
        <DaySessionDrawer 
          day={program.days.find(d => d.dayOfWeek === selectedDay)} 
          isOpen={selectedDay !== null}
          onClose={handleCloseDrawer}
          dayLabel={DAYS.find(d => d.value === selectedDay)?.label || ''}
        />
      )}
    </div>
  );
};

export default WeeklyPlanGrid;
