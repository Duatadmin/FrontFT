import React, { useState } from 'react';
import useProgramStore from '../../../store/useProgramStore';
import GoalList from './GoalList';
import GoalForm from './GoalForm';
import GoalProgressCard from './GoalProgressCard';
import { Target, Plus } from 'lucide-react';
import createLogger from '../../../utils/logger';
import useUserStore from '../../../store/useUserStore';

const logger = createLogger('GoalsTab');

/**
 * GoalsTab Component
 * Displays goal management interface with list, progress cards, and creation form
 */
const GoalsTab: React.FC = () => {
  const { goals, loading, error } = useProgramStore();
  const { user } = useUserStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  
  // Handle open form
  const handleOpenForm = () => {
    logger.debug('Opening goal form');
    setIsFormOpen(true);
  };
  
  // Handle close form
  const handleCloseForm = () => {
    logger.debug('Closing goal form');
    setIsFormOpen(false);
  };
  
  // Handle filter change
  const handleFilterChange = (newFilter: 'all' | 'active' | 'completed') => {
    logger.debug('Changing goal filter', { filter: newFilter });
    setFilter(newFilter);
  };
  
  // Empty state - no goals
  if (!loading.goals && goals.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center" data-testid="no-goals-state">
        <div className="bg-background-surface rounded-full p-4 mb-4">
          <Target className="h-12 w-12 text-text-secondary" />
        </div>
        <h3 className="text-xl font-medium mb-2">No Fitness Goals Set</h3>
        <p className="text-text-secondary mb-6 max-w-md">
          Set measurable fitness goals to track your progress and stay motivated on your fitness journey.
        </p>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-primary rounded-lg text-white font-medium hover:bg-primary/90 transition-colors"
          onClick={handleOpenForm}
          data-testid="create-goal-button"
        >
          <Plus className="h-4 w-4" />
          Create First Goal
        </button>
        
        {isFormOpen && user && (
          <GoalForm 
            isOpen={isFormOpen} 
            onClose={handleCloseForm} 
            userId={user.id} 
          />
        )}
      </div>
    );
  }
  
  // Loading state
  if (loading.goals) {
    return (
      <div className="space-y-6" data-testid="loading-goals-state">
        {/* Skeleton for goals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-background-surface rounded-xl p-6 h-40">
              <div className="h-4 w-1/2 bg-gray-300/20 rounded mb-4"></div>
              <div className="h-12 w-12 bg-gray-300/20 rounded-full mx-auto mb-4"></div>
              <div className="h-3 w-1/3 bg-gray-300/20 rounded-full mx-auto"></div>
            </div>
          ))}
        </div>
        
        {/* Skeleton for list */}
        <div className="bg-background-surface rounded-xl p-4 animate-pulse">
          <div className="h-6 w-40 bg-gray-300/20 rounded mb-4"></div>
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="py-3 border-b border-border">
              <div className="h-4 w-full bg-gray-300/20 rounded mb-2"></div>
              <div className="h-3 w-2/3 bg-gray-300/20 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Filter goals based on current filter
  const filteredGoals = goals.filter(goal => {
    if (filter === 'all') return true;
    if (filter === 'active') return !goal.completed_at;
    if (filter === 'completed') return !!goal.completed_at;
    return true;
  });
  
  // Get top goals for progress cards (choose 3 active goals with highest progress)
  const topGoals = goals
    .filter(goal => !goal.completed_at)
    .sort((a, b) => (b.progress || 0) - (a.progress || 0))
    .slice(0, 3);
  
  // Normal state with goals data
  return (
    <div className="space-y-6" data-testid="goals-content">
      {/* Add goal button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Your Fitness Goals</h3>
        <button 
          className="flex items-center gap-2 px-3 py-1.5 bg-primary rounded-lg text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          onClick={handleOpenForm}
          data-testid="add-goal-button"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Goal
        </button>
      </div>
      
      {/* Progress cards - shows visualization of progress toward top goals */}
      {topGoals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topGoals.map(goal => (
            <GoalProgressCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
      
      {/* Goal list */}
      <GoalList 
        goals={filteredGoals} 
        filter={filter} 
        onFilterChange={handleFilterChange} 
      />
      
      {/* Goal form modal */}
      {isFormOpen && user && (
        <GoalForm 
          isOpen={isFormOpen} 
          onClose={handleCloseForm} 
          userId={user.id} 
        />
      )}
      
      {/* Error display */}
      {error.goals && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-text-primary">
          <h3 className="font-semibold mb-2">Error loading goals</h3>
          <p className="text-sm text-text-secondary">{error.goals}</p>
        </div>
      )}
    </div>
  );
};

export default GoalsTab;
