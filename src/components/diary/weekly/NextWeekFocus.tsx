import React, { useState } from 'react';
import { Target, Check, Edit2, Plus } from 'lucide-react';
import useDiaryStore from '../../../store/useDiaryStore';
import useUserStore from '../../../store/useUserStore';

/**
 * NextWeekFocus Component
 * Allows users to set focus areas and intentions for the upcoming week
 */
const NextWeekFocus: React.FC = () => {
  const { currentWeekReflection, updateWeeklyReflection } = useDiaryStore();
  const { user } = useUserStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [focusText, setFocusText] = useState(currentWeekReflection?.next_week_focus || '');
  const [sessionTarget, setSessionTarget] = useState(
    currentWeekReflection?.next_week_session_target?.toString() || '3'
  );
  
  // Save focus area and targets
  const handleSaveFocus = () => {
    if (!user?.id || !currentWeekReflection) return;
    
    updateWeeklyReflection({
      ...currentWeekReflection,
      next_week_focus: focusText.trim(),
      next_week_session_target: parseInt(sessionTarget, 10) || 3,
    }, user.id);
    
    setIsEditing(false);
  };
  
  // Start editing
  const handleStartEditing = () => {
    setFocusText(currentWeekReflection?.next_week_focus || '');
    setSessionTarget(currentWeekReflection?.next_week_session_target?.toString() || '3');
    setIsEditing(true);
  };
  
  // If no reflection exists yet, show a placeholder
  if (!currentWeekReflection) {
    return (
      <div className="bg-background-card rounded-2xl shadow-card p-5 h-full">
        <h3 className="text-base font-semibold mb-4 flex items-center">
          <Target className="text-accent-violet mr-2" size={18} />
          Next Week Focus
        </h3>
        <p className="text-sm text-text-secondary mb-3">
          Plan and set intentions for your upcoming training week.
        </p>
        <div className="text-xs text-text-tertiary">
          Complete at least one workout to start planning your weekly focus.
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-background-card rounded-2xl shadow-card p-5 h-full" data-testid="next-week-focus">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold flex items-center">
          <Target className="text-accent-violet mr-2" size={18} />
          Next Week Focus
        </h3>
        
        {!isEditing && (
          <button
            onClick={handleStartEditing}
            className="text-accent-violet hover:bg-accent-violet/10 p-1 rounded-md"
            aria-label="Edit focus"
            data-testid="edit-focus-button"
          >
            <Edit2 size={16} />
          </button>
        )}
      </div>
      
      {isEditing ? (
        // Edit Mode
        <div className="space-y-4">
          <div>
            <label htmlFor="focus-text" className="block text-sm font-medium mb-1">
              Focus Area(s)
            </label>
            <textarea
              id="focus-text"
              value={focusText}
              onChange={(e) => setFocusText(e.target.value)}
              className="w-full p-3 text-sm bg-background-surface border border-border-light rounded-md focus:ring-1 focus:ring-accent-violet"
              placeholder="What will you focus on next week? (e.g., Leg strength, cardio endurance, flexibility...)"
              rows={4}
              data-testid="focus-text-input"
            />
          </div>
          
          <div>
            <label htmlFor="session-target" className="block text-sm font-medium mb-1">
              Training Sessions Target
            </label>
            <select
              id="session-target"
              value={sessionTarget}
              onChange={(e) => setSessionTarget(e.target.value)}
              className="w-full p-2 text-sm bg-background-surface border border-border-light rounded-md focus:ring-1 focus:ring-accent-violet"
              data-testid="session-target-select"
            >
              {[1, 2, 3, 4, 5, 6, 7].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'session' : 'sessions'}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="text-text-secondary text-sm mr-3 hover:text-text-primary"
              data-testid="cancel-focus-button"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveFocus}
              className="bg-accent-violet text-white text-sm px-3 py-1.5 rounded-lg flex items-center hover:bg-accent-violet/90"
              data-testid="save-focus-button"
            >
              <Check size={16} className="mr-1" />
              Save Focus
            </button>
          </div>
        </div>
      ) : (
        // View Mode
        <div className="h-full flex flex-col">
          {currentWeekReflection.next_week_focus ? (
            <>
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-1">Focus Area(s):</h4>
                <div className="bg-background-surface p-3 rounded-lg text-sm">
                  {currentWeekReflection.next_week_focus}
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-1">Weekly Target:</h4>
                <div className="bg-background-surface p-3 rounded-lg text-sm flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mr-2">
                    <div 
                      className="bg-accent-violet h-2.5 rounded-full" 
                      style={{ width: `${(currentWeekReflection.completed_sessions / currentWeekReflection.next_week_session_target) * 100}%` }}
                    ></div>
                  </div>
                  <span className="whitespace-nowrap">
                    {currentWeekReflection.completed_sessions}/{currentWeekReflection.next_week_session_target} sessions
                  </span>
                </div>
              </div>
              
              <div className="text-xs text-text-secondary mt-auto pt-4 border-t border-border-light">
                <p>💡 Tip: Setting clear intentions helps you stay focused on your goals for the week ahead.</p>
              </div>
            </>
          ) : (
            // Empty state
            <div className="flex flex-col items-center justify-center py-6 h-full">
              <div className="bg-background-surface h-12 w-12 rounded-full flex items-center justify-center mb-3">
                <Target className="text-text-tertiary" size={20} />
              </div>
              <p className="text-sm text-text-secondary mb-3 text-center">
                Set your focus for the upcoming week to stay on track with your goals.
              </p>
              <button
                onClick={handleStartEditing}
                className="bg-accent-violet text-white text-sm px-3 py-1.5 rounded-lg flex items-center hover:bg-accent-violet/90"
                data-testid="create-focus-button"
              >
                <Plus size={16} className="mr-1" />
                Set Weekly Focus
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NextWeekFocus;
