import { useState } from 'react';
import DaySessionDrawer from './DaySessionDrawer';
import createLogger from '../../../utils/logger';

// Local type mapping to bridge the gap between different store structures
interface ProgramExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  load?: number;
  rpe?: number;
  notes?: string;
}

interface ProgramDay {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  focus: string;
  exercises: ProgramExercise[];
}

const logger = createLogger('WeeklyPlanGrid');

interface WeeklyPlanGridProps {
  program: any;
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
const WeeklyPlanGrid = ({ program }: WeeklyPlanGridProps) => {
  // Map weekday names to day numbers (0 = Sunday, 6 = Saturday)
  const dayMapping: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6
  };
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
  
  // Get emoji based on the day name since focus isn't available in the new structure
  const getFocusEmoji = (dayName: string) => {
    const lowercaseFocus = dayName.toLowerCase();
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
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
        {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
          const dayName = [
            'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
          ][dayOfWeek];
          const displayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
          const exercises = program.days[dayName] || [];
          const hasExercises = exercises.length > 0;
          const isToday = dayOfWeek === today;

          return (
            <div 
              key={dayOfWeek}
              className={`
                p-4 rounded-xl bg-card border border-border-light shadow-sm
                ${isToday ? 'ring-1 ring-accent-mint/50 bg-accent-mint/5' : ''}
                ${hasExercises ? 'cursor-pointer hover:shadow-md transition-shadow' : 'opacity-80'}
              `}
              onClick={() => hasExercises && handleDayClick(dayOfWeek)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-primary">{displayName}</h3>
                {isToday && <span className="text-xs px-1.5 py-0.5 bg-accent-mint/20 text-accent-mint rounded-full">Today</span>}
              </div>
              
              {hasExercises ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    {getFocusEmoji(dayName)} {dayName.charAt(0).toUpperCase() + dayName.slice(1)}
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1.5">
                    {exercises.slice(0, 3).map((ex: string, i: number) => (
                      <div key={i} className="flex justify-between">
                        <span>{ex}</span>
                        <span>--</span>
                      </div>
                    ))}
                    {exercises.length > 3 && (
                      <div className="text-xs text-muted-foreground opacity-75">
                        + {exercises.length - 3} more exercises
                      </div>
                    )}
                  </div>
                  
                  {exercises.length > 0 && (
                    <div className="text-xs flex justify-between text-muted-foreground pt-1 border-t border-border-light mt-2">
                      <span>Exercises</span>
                      <span>{exercises.length}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground mt-2">Rest day</div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Day session drawer */}
      {selectedDay !== null && (
        <DaySessionDrawer 
          day={{
            dayOfWeek: selectedDay,
            focus: DAYS.find(d => d.value === selectedDay)?.label || '',
            exercises: (program.days[[
              'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
            ][selectedDay]] || []).map((name: string) => ({
              id: `ex-${Math.random().toString(36).substr(2, 9)}`,
              name: name,
              sets: 3,
              reps: 10
            }))
          }}
          isOpen={selectedDay !== null}
          onClose={handleCloseDrawer}
          dayLabel={DAYS.find(d => d.value === selectedDay)?.label || ''}
        />
      )}
    </div>
  );
};

export default WeeklyPlanGrid;
