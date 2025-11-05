import React from 'react';
import { Goal } from '../../../store/useProgramStore';
import useProgramStore from '../../../store/useProgramStore';
import { CheckCircle, Circle, Trash2, Calendar, Award, Battery, Heart, Dumbbell } from 'lucide-react';
import createLogger from '../../../utils/logger';

const logger = createLogger('GoalList');

interface GoalListProps {
  goals: Goal[];
  filter: 'all' | 'active' | 'completed';
  onFilterChange: (filter: 'all' | 'active' | 'completed') => void;
}

/**
 * GoalList Component
 * Displays a filterable list of goals with progress indicators
 */
const GoalList: React.FC<GoalListProps> = ({ goals, filter, onFilterChange }) => {
  // Format deadline date
  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  // Handle marking a goal as complete
  const handleToggleComplete = (goalId: string, isCompleted: boolean) => {
    logger.debug('Toggle goal completion', { goalId, isCompleted });
    if (isCompleted) {
      // If already completed, undo completion (update to remove completed_at)
      useProgramStore.getState().updateGoal(goalId, { completed_at: undefined, progress: 0.9 });
    } else {
      // If not completed, mark as complete
      useProgramStore.getState().completeGoal(goalId);
    }
  };
  
  // Handle deleting a goal
  const handleDelete = (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      logger.debug('Deleting goal', { goalId });
      useProgramStore.getState().deleteGoal(goalId);
    }
  };
  
  // Get icon for goal type
  const getGoalTypeIcon = (type: string) => {
    switch (type) {
      case 'strength':
        return <Dumbbell className="h-4 w-4" />;
      case 'endurance':
        return <Battery className="h-4 w-4" />;
      case 'body_composition':
        return <Heart className="h-4 w-4" />;
      case 'benchmark':
        return <Award className="h-4 w-4" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="bg-background-surface rounded-xl p-4 lg:p-6" data-testid="goal-list">
      {/* Filter pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
            filter === 'all' 
              ? 'bg-background-hover text-text-primary' 
              : 'text-text-secondary hover:bg-background-hover/50'
          }`}
          onClick={() => onFilterChange('all')}
          data-testid="filter-all"
        >
          All Goals
        </button>
        <button
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
            filter === 'active' 
              ? 'bg-background-hover text-text-primary' 
              : 'text-text-secondary hover:bg-background-hover/50'
          }`}
          onClick={() => onFilterChange('active')}
          data-testid="filter-active"
        >
          Active
        </button>
        <button
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
            filter === 'completed' 
              ? 'bg-background-hover text-text-primary' 
              : 'text-text-secondary hover:bg-background-hover/50'
          }`}
          onClick={() => onFilterChange('completed')}
          data-testid="filter-completed"
        >
          Completed
        </button>
      </div>
      
      {/* Goals list */}
      {goals.length === 0 ? (
        <div className="py-8 text-center text-text-secondary" data-testid="no-filtered-goals">
          <p>No {filter !== 'all' ? filter : ''} goals found.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {goals.map(goal => {
            const isCompleted = !!goal.completed_at;
            const progress = goal.progress || 0;
            const progressPercent = Math.min(100, Math.round(progress * 100));
            
            // Calculate deadline status
            const deadline = new Date(goal.deadline);
            const today = new Date();
            const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const isOverdue = daysLeft < 0 && !isCompleted;
            
            return (
              <li 
                key={goal.id} 
                className="py-4 flex flex-col sm:flex-row sm:items-center gap-3"
                data-testid={`goal-item-${goal.id}`}
              >
                {/* Checkbox for completion status */}
                <div className="flex-shrink-0">
                  <button
                    onClick={() => handleToggleComplete(goal.id, isCompleted)}
                    className={`rounded-full focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                      isCompleted ? 'text-green-500' : 'text-text-tertiary hover:text-primary'
                    }`}
                    aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    data-testid={`toggle-goal-${goal.id}`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <Circle className="h-6 w-6" />
                    )}
                  </button>
                </div>
                
                {/* Goal info */}
                <div className="flex-grow space-y-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className={`p-1 rounded-md ${
                        isCompleted 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {getGoalTypeIcon(goal.type)}
                    </div>
                    <h4 
                      className={`font-medium ${
                        isCompleted ? 'text-text-secondary line-through' : 'text-text-primary'
                      }`}
                    >
                      {goal.metric}: {goal.target_value} {goal.unit}
                    </h4>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {/* Deadline */}
                    <div 
                      className={`flex items-center gap-1 ${
                        isOverdue ? 'text-red-500' : 'text-text-secondary'
                      }`}
                      title={isOverdue ? 'Overdue' : 'Deadline'}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {isOverdue 
                          ? `Overdue by ${Math.abs(daysLeft)} days` 
                          : isCompleted 
                            ? 'Completed' 
                            : `${daysLeft} days left`
                        }
                      </span>
                    </div>
                    
                    {/* Target date */}
                    <div className="text-text-tertiary">
                      Target: {formatDeadline(goal.deadline)}
                    </div>
                  </div>
                </div>
                
                {/* Progress and actions */}
                <div className="flex items-center gap-4">
                  {/* Progress bar */}
                  <div className="flex-grow sm:w-32">
                    <div className="text-xs text-right text-text-tertiary mb-1">
                      {isCompleted ? 'Completed' : `${progressPercent}%`}
                    </div>
                    <div className="h-1.5 bg-background-hover rounded-full w-full">
                      <div 
                        className={`h-1.5 rounded-full ${
                          isCompleted 
                            ? 'bg-green-500' 
                            : progressPercent < 25 
                              ? 'bg-red-500' 
                              : progressPercent < 50 
                                ? 'bg-orange-500' 
                                : 'bg-primary'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-text-tertiary hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-full transition-colors"
                    aria-label="Delete goal"
                    data-testid={`delete-goal-${goal.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default GoalList;
