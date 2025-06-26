import React, { useState, useEffect } from 'react';
import { ListTodo, Plus, Edit2, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import useDiaryStore from '../../../store/useDiaryStore';
import type { Goal } from '../../../store/diaryTypes';
import useUserStore from '../../../store/useUserStore';
import createLogger from '../../../utils/logger';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/**
 * Goal Tracker Component
 * Displays and manages short and long term fitness goals
 */
const GoalTracker: React.FC = () => {
  // Initialize logger
  const logger = createLogger('GoalTracker');
  
  // Access store directly - ErrorBoundary will catch any issues
  const { goals, loading, error, fetchGoals, addGoal, updateGoal, deleteGoal } = useDiaryStore();
  const { user } = useUserStore();
  
  // Log store state for debugging
  useEffect(() => {
    logger.debug('Diary store state:', { 
      hasGoals: Array.isArray(goals), 
      goalsLength: goals?.length || 0,
      loading,
      hasError: !!error
    });
  }, [goals, loading, error]);
  
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  
  // Form state
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    type: 'short_term',
  });
  
  const [editGoal, setEditGoal] = useState<Partial<Goal>>({});
  
  // Fetch goals on component mount
  useEffect(() => {
    logger.info('GoalTracker mounted');
    
    if (user?.id) {
      logger.debug('Fetching goals for user', { userId: user.id });
      try {
        fetchGoals(user.id);
      } catch (err) {
        logger.error('Error fetching goals', err);
      }
    } else {
      logger.warn('No user ID available, skipping goal fetch');
    }
    
    return () => {
      logger.info('GoalTracker unmounted');
    };
  }, [user?.id, fetchGoals]);
  
  // Handle adding a new goal
  const handleAddGoal = () => {
    logger.debug('Attempting to add new goal', { title: newGoal.title });
    
    if (!newGoal.title.trim()) {
      logger.warn('Attempted to add goal with empty title');
      return;
    }
    
    if (!user?.id) {
      logger.warn('Attempted to add goal without user ID');
      return;
    }
    
    const goalData: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'completed'> = {
      title: newGoal.title.trim(),
      description: newGoal.description.trim() || null, // Ensure description can be null if empty
      target_date: newGoal.target_date,
      type: newGoal.type as 'short_term' | 'long_term',
      progress: 0, // New goals start with 0 progress
    };
    addGoal(goalData, user.id);
    
    // Reset form
    setNewGoal({
      title: '',
      description: '',
      target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      type: 'short_term',
    });
    
    setIsAddingGoal(false);
  };
  
  // Start editing a goal
  const handleStartEditing = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditGoal({ ...goal });
  };
  
  // Save goal edits
  const handleSaveEdit = () => {
    if (!editGoal.title?.trim() || !user?.id || !editingGoalId) return;
    
    const { id, user_id, created_at, ...updateData } = editGoal;
    updateGoal(editingGoalId, {
      ...updateData,
      title: editGoal.title?.trim(), // Ensure title is trimmed
      description: editGoal.description?.trim() || null, // Ensure description is trimmed or null
    });
    
    setEditingGoalId(null);
    setEditGoal({});
  };
  
  // Update goal progress
  const handleProgressChange = (id: string, progress: number) => {
    if (!user?.id) return;
    
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    
    // If progress is 100, mark as completed
    const completed = progress === 100;
    
    updateGoal(id, { progress, completed });
  };
  
  // Delete a goal
  const handleDeleteGoal = (id: string) => {
    if (!user?.id) return;
    deleteGoal(id);
  };
  
  // Toggle expanded state for a goal
  const toggleExpanded = (id: string) => {
    setExpanded(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Loading state
  if (loading.goals) {
    return <div className="h-48"><LoadingSpinner /></div>;
  }
  
  // Error state
  if (error.goals) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center" data-testid="goal-tracker-error">
        <h3 className="text-lg font-medium mb-2">Unable to Load Goals</h3>
        <p className="text-text-secondary mb-4 text-sm">{error.goals}</p>
        <button 
          onClick={() => user?.id && fetchGoals(user.id)}
          className="bg-accent-violet hover:bg-accent-violet/90 text-white px-4 py-2 rounded-lg text-sm"
        >
          Retry
        </button>
      </div>
    );
  }
  
  // Filter goals by type
  const shortTermGoals = goals.filter(goal => goal.type === 'short_term');
  const longTermGoals = goals.filter(goal => goal.type === 'long_term');
  
  return (
    <div className="bg-neutral-800/50 rounded-2xl shadow-card p-5" data-testid="goal-tracker">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold flex items-center">
          <ListTodo className="text-accent-violet mr-2" size={18} />
          Goal Tracker
        </h3>
        
        <button
          onClick={() => setIsAddingGoal(!isAddingGoal)}
          className={`p-1.5 rounded-lg text-sm font-medium flex items-center ${
            isAddingGoal ? 'bg-red-500/10 text-red-500' : 'bg-accent-violet/10 text-accent-violet'
          }`}
          aria-label={isAddingGoal ? "Cancel adding goal" : "Add new goal"}
          data-testid="toggle-add-goal"
        >
          {isAddingGoal ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>
      
      {/* Add goal form */}
      {isAddingGoal && (
        <div className="bg-neutral-900/70 rounded-lg p-4 mb-4 border border-border-light" data-testid="add-goal-form">
          <h4 className="text-sm font-medium mb-3">Add New Goal</h4>
          
          <div className="space-y-3 mb-4">
            <div>
              <label htmlFor="goal-title" className="block text-xs text-text-secondary mb-1">
                Goal Title*
              </label>
              <input
                id="goal-title"
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className="w-full p-2 text-sm bg-neutral-900/70 border border-border-light rounded-md focus:ring-1 focus:ring-accent-violet"
                placeholder="E.g., Squat 200 lbs, Run 5K, etc."
                data-testid="new-goal-title"
              />
            </div>
            
            <div>
              <label htmlFor="goal-description" className="block text-xs text-text-secondary mb-1">
                Description (Optional)
              </label>
              <textarea
                id="goal-description"
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                className="w-full p-2 text-sm bg-neutral-900/70 border border-border-light rounded-md focus:ring-1 focus:ring-accent-violet"
                placeholder="Add more details about your goal..."
                rows={2}
                data-testid="new-goal-description"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="goal-target-date" className="block text-xs text-text-secondary mb-1">
                  Target Date
                </label>
                <input
                  id="goal-target-date"
                  type="date"
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                  className="w-full p-2 text-sm bg-neutral-900/70 border border-border-light rounded-md focus:ring-1 focus:ring-accent-violet"
                  data-testid="new-goal-date"
                />
              </div>
              
              <div>
                <label htmlFor="goal-type" className="block text-xs text-text-secondary mb-1">
                  Goal Type
                </label>
                <select
                  id="goal-type"
                  value={newGoal.type}
                  onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
                  className="w-full p-2 text-sm bg-neutral-900/70 border border-border-light rounded-md focus:ring-1 focus:ring-accent-violet"
                  data-testid="new-goal-type"
                >
                  <option value="short_term">Short Term</option>
                  <option value="long_term">Long Term</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => setIsAddingGoal(false)}
              className="text-text-secondary text-sm mr-3"
              data-testid="cancel-add-goal"
            >
              Cancel
            </button>
            <button
              onClick={handleAddGoal}
              disabled={!newGoal.title.trim()}
              className={`flex items-center text-sm px-3 py-1.5 rounded-lg ${
                newGoal.title.trim() 
                  ? 'bg-accent-violet text-white hover:bg-accent-violet/90' 
                  : 'bg-background-card text-text-tertiary cursor-not-allowed'
              }`}
              data-testid="confirm-add-goal"
            >
              <Plus size={14} className="mr-1" />
              Add Goal
            </button>
          </div>
        </div>
      )}
      
      {/* Short Term Goals */}
      <div className="mb-5">
        <h4 className="text-sm font-medium mb-2 text-accent-violet">Short Term Goals</h4>
        
        {shortTermGoals.length === 0 ? (
          <p className="text-sm text-text-secondary italic py-2">
            No short-term goals yet. Add some to track your progress!
          </p>
        ) : (
          <div className="space-y-3">
            {shortTermGoals.map((goal) => (
              <div 
                key={goal.id} 
                className={`bg-neutral-900/70 border border-border-light rounded-lg overflow-hidden ${
                  goal.completed ? 'border-accent-mint/30 bg-accent-mint/5' : ''
                }`}
                data-testid={`goal-${goal.id}`}
              >
                {editingGoalId === goal.id ? (
                  // Edit mode
                  <div className="p-3 space-y-3">
                    <input
                      type="text"
                      value={editGoal.title || ''}
                      onChange={(e) => setEditGoal({ ...editGoal, title: e.target.value })}
                      className="w-full p-2 text-sm bg-neutral-900/70 border border-border-light rounded-md focus:ring-1 focus:ring-accent-violet"
                      placeholder="Goal title"
                    />
                    
                    <textarea
                      value={editGoal.description || ''}
                      onChange={(e) => setEditGoal({ ...editGoal, description: e.target.value })}
                      className="w-full p-2 text-sm bg-neutral-900/70 border border-border-light rounded-md focus:ring-1 focus:ring-accent-violet"
                      placeholder="Description (optional)"
                      rows={2}
                    />
                    
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="date"
                        value={editGoal.target_date || ''}
                        onChange={(e) => setEditGoal({ ...editGoal, target_date: e.target.value })}
                        className="w-full p-2 text-sm bg-neutral-900/70 border border-border-light rounded-md focus:ring-1 focus:ring-accent-violet"
                      />
                      
                      <select
                        value={editGoal.type || 'short_term'}
                        onChange={(e) => setEditGoal({ ...editGoal, type: e.target.value as 'short_term' | 'long_term' })}
                        className="w-full p-2 text-sm bg-neutral-900/70 border border-border-light rounded-md focus:ring-1 focus:ring-accent-violet"
                      >
                        <option value="short_term">Short Term</option>
                        <option value="long_term">Long Term</option>
                      </select>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingGoalId(null)}
                        className="text-text-secondary text-xs flex items-center"
                      >
                        <X size={14} className="mr-1" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="bg-accent-violet text-white text-xs flex items-center px-2 py-1 rounded-md hover:bg-accent-violet/90"
                      >
                        <Check size={14} className="mr-1" />
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div>
                    <div className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={goal.completed}
                            onChange={(e) => handleProgressChange(goal.id, e.target.checked ? 100 : 0)}
                            className="h-4 w-4 text-accent-violet rounded focus:ring-accent-violet mr-2"
                            id={`goal-check-${goal.id}`}
                            data-testid={`goal-checkbox-${goal.id}`}
                          />
                          <label
                            htmlFor={`goal-check-${goal.id}`}
                            className={`font-medium text-sm ${goal.completed ? 'line-through text-text-tertiary' : ''}`}
                          >
                            {goal.title}
                          </label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleStartEditing(goal)}
                            className="p-1.5 text-text-secondary hover:text-accent-violet hover:bg-accent-violet/10 rounded-md"
                            aria-label="Edit goal"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="p-1.5 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-md"
                            aria-label="Delete goal"
                          >
                            <X size={14} />
                          </button>
                          <button
                            onClick={() => toggleExpanded(goal.id)}
                            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-background-hover rounded-md"
                            aria-label={expanded[goal.id] ? "Collapse goal" : "Expand goal"}
                          >
                            {expanded[goal.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 mb-1">
                        <div className="w-full bg-neutral-900/70 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-accent-violet h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${goal.progress}%` }}
                            data-testid={`goal-progress-${goal.id}`}
                          ></div>
                        </div>
                      </div>
                      {expanded[goal.id] && (
                        <div className="mt-2 pt-2 border-t border-border-light">
                          <p className="text-xs text-text-secondary whitespace-pre-wrap">
                            {goal.description || <span className="italic">No description.</span>}
                          </p>
                          <p className="text-xs text-text-tertiary mt-1">
                            Target: {formatDate(goal.target_date)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Long Term Goals */}
      <div>
        <h4 className="text-sm font-medium mb-2 text-accent-mint">Long Term Goals</h4>
        
        {longTermGoals.length === 0 ? (
          <p className="text-sm text-text-secondary italic py-2">
            No long-term goals yet. Add some to track your progress!
          </p>
        ) : (
          <div className="space-y-3">
            {longTermGoals.map((goal) => (
              <div 
                key={goal.id} 
                className={`bg-neutral-900/70 border border-border-light rounded-lg overflow-hidden ${
                  goal.completed ? 'border-accent-mint/30 bg-accent-mint/5' : ''
                }`}
                data-testid={`goal-${goal.id}`}
              >
                {editingGoalId === goal.id ? (
                  // Edit mode
                  <div className="p-3 space-y-3">
                    <input
                      type="text"
                      value={editGoal.title || ''}
                      onChange={(e) => setEditGoal({ ...editGoal, title: e.target.value })}
                      className="w-full p-2 text-sm bg-neutral-900/70 border border-border-light rounded-md focus:ring-1 focus:ring-accent-violet"
                      placeholder="Goal title"
                    />
                    
                    <textarea
                      value={editGoal.description || ''}
                      onChange={(e) => setEditGoal({ ...editGoal, description: e.target.value })}
                      className="w-full p-2 text-sm bg-neutral-900/70 border border-border-light rounded-md focus:ring-1 focus:ring-accent-violet"
                      placeholder="Description (optional)"
                      rows={2}
                    />
                    
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="date"
                        value={editGoal.target_date || ''}
                        onChange={(e) => setEditGoal({ ...editGoal, target_date: e.target.value })}
                        className="w-full p-2 text-sm bg-neutral-900/70 border border-border-light rounded-md focus:ring-1 focus:ring-accent-violet"
                      />
                      
                      <select
                        value={editGoal.type || 'long_term'}
                        onChange={(e) => setEditGoal({ ...editGoal, type: e.target.value as 'short_term' | 'long_term' })}
                        className="w-full p-2 text-sm bg-neutral-900/70 border border-border-light rounded-md focus:ring-1 focus:ring-accent-violet"
                      >
                        <option value="short_term">Short Term</option>
                        <option value="long_term">Long Term</option>
                      </select>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingGoalId(null)}
                        className="text-text-secondary text-xs flex items-center"
                      >
                        <X size={14} className="mr-1" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="bg-accent-violet text-white text-xs flex items-center px-2 py-1 rounded-md hover:bg-accent-violet/90"
                      >
                        <Check size={14} className="mr-1" />
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div>
                    <div className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={goal.completed}
                            onChange={(e) => handleProgressChange(goal.id, e.target.checked ? 100 : 0)}
                            className="h-4 w-4 text-accent-mint rounded focus:ring-accent-mint mr-2"
                            id={`goal-check-${goal.id}`}
                            data-testid={`goal-checkbox-${goal.id}`}
                          />
                          <label 
                            htmlFor={`goal-check-${goal.id}`}
                            className={`font-medium text-sm ${goal.completed ? 'line-through text-text-tertiary' : ''}`}
                          >
                            {goal.title}
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleStartEditing(goal)}
                            className="text-text-tertiary hover:text-accent-violet"
                            aria-label="Edit goal"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="text-text-tertiary hover:text-red-500"
                            aria-label="Delete goal"
                          >
                            <X size={14} />
                          </button>
                          <button
                            onClick={() => toggleExpanded(goal.id)}
                            className="text-text-tertiary hover:text-text-primary"
                            aria-label={expanded[goal.id] ? "Collapse goal" : "Expand goal"}
                          >
                            {expanded[goal.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-1">
                        <div className="w-full bg-neutral-900/70 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-accent-violet h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${goal.progress}%` }}
                            data-testid={`goal-progress-${goal.id}`}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-text-tertiary">
                            Target: {formatDate(goal.target_date)}
                          </span>
                          <span className="text-xs font-medium">
                            {goal.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {expanded[goal.id] && (
                      <div className="border-t border-border-light p-3 bg-background-card/50">
                        {goal.description ? (
                          <p className="text-sm text-text-secondary mb-3">{goal.description}</p>
                        ) : (
                          <p className="text-sm italic text-text-tertiary mb-3">No description provided</p>
                        )}
                        
                        {!goal.completed && (
                          <div>
                            <p className="text-xs text-text-tertiary mb-1">Update Progress:</p>
                            <div className="flex items-center space-x-2">
                              {[0, 25, 50, 75, 100].map((progress) => (
                                <button
                                  key={progress}
                                  onClick={() => handleProgressChange(goal.id, progress)}
                                  className={`px-2 py-1 text-xs rounded ${
                                    goal.progress === progress 
                                      ? 'bg-accent-mint text-dark-surface' 
                                      : 'bg-background-surface text-text-secondary hover:bg-background-surface/70'
                                  }`}
                                >
                                  {progress}%
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalTracker;
