import React from 'react';
import { TrainingPlan } from '../../lib/stores/useProgramStore';

interface WeeklyPlanGridProps {
  plan: TrainingPlan | null;
}

const daysOfWeek = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

const WeeklyPlanGrid: React.FC<WeeklyPlanGridProps> = ({ plan }) => {
  // Handler for empty state
  if (!plan || !plan.days || Object.keys(plan.days).length === 0) {
    return (
      <div className="bg-background-surface rounded-xl p-6 text-center">
        <p className="text-text-secondary">No training schedule found. Create a plan to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-7 gap-3 mb-6">
      {daysOfWeek.map((day) => {
        const exercises = plan.days[day] || [];
        const dayFormatted = day.charAt(0).toUpperCase() + day.slice(1);
        
        return (
          <div 
            key={day} 
            className={`bg-background-surface rounded-xl p-4 
              ${exercises.length > 0 ? 'border-l-4 border-accent-green' : 'opacity-75'}`}
          >
            <h3 className="font-medium mb-2">{dayFormatted}</h3>
            
            {exercises.length === 0 ? (
              <p className="text-sm text-text-tertiary">Rest Day</p>
            ) : (
              <ul className="space-y-2">
                {exercises.map((exerciseId, index) => (
                  <li 
                    key={`${exerciseId}-${index}`} 
                    className="text-sm flex items-center"
                  >
                    <span className="w-2 h-2 rounded-full bg-accent-green mr-2"></span>
                    <span>{exerciseId}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WeeklyPlanGrid;
