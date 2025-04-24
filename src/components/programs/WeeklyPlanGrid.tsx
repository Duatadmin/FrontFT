import React from 'react';
import { TrainingPlan } from '../../lib/stores/useProgramStore';
import { Card, CardContent } from '../ui/Card';

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
      <Card className="text-center p-6">
        <p className="text-text-secondary">No training schedule found. Create a plan to get started!</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-7 gap-4 mb-8">
      {daysOfWeek.map((day) => {
        const exercises = plan.days[day] || [];
        const dayFormatted = day.charAt(0).toUpperCase() + day.slice(1);
        const hasExercises = exercises.length > 0;
        
        return (
          <Card 
            key={day} 
            className={`${hasExercises ? 'border-l-2 border-accent-green' : ''} hover:bg-card-hover transition-colors`}
          >
            <CardContent className="p-4">
              <h3 className="font-medium mb-2 text-text-primary text-sm">{dayFormatted}</h3>
              
              {!hasExercises ? (
                <p className="text-xs text-text-tertiary">Rest Day</p>
              ) : (
                <ul className="space-y-1.5">
                  {exercises.map((exerciseId, index) => (
                    <li 
                      key={`${exerciseId}-${index}`} 
                      className="text-xs flex items-center text-text-secondary"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-green mr-1.5"></span>
                      <span>{exerciseId}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default WeeklyPlanGrid;
