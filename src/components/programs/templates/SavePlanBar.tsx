import React, { useState } from 'react';
import { Save, PlayCircle, Calendar } from 'lucide-react';
import useProgramStore from '../../../store/useProgramStore';
import createLogger from '../../../utils/logger';

const logger = createLogger('SavePlanBar');

interface SavePlanBarProps {
  hasChanges: boolean;
  onSave: (planData: any, activate: boolean) => void;
  userId: string;
}

/**
 * SavePlanBar Component
 * Fixed bottom bar for saving or activating a training plan
 */
const SavePlanBar: React.FC<SavePlanBarProps> = ({ hasChanges, onSave, userId }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [startDate, setStartDate] = useState(getTodayString());
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  
  // Get today's date as ISO string (YYYY-MM-DD)
  function getTodayString() {
    return new Date().toISOString().split('T')[0];
  }
  
  // Handle save as draft
  const handleSaveAsDraft = () => {
    if (!hasChanges) return;
    
    logger.debug('Saving plan as draft');
    setIsSaving(true);
    
    try {
      // In a real implementation, this would gather all plan data from the builder
      const planData = {
        user_id: userId,
        name: 'New Training Plan',
        start_date: startDate,
        active: false
      };
      
      onSave(planData, false);
    } catch (error) {
      logger.error('Error saving plan as draft', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle activate plan
  const handleActivatePlan = () => {
    if (!hasChanges) return;
    
    logger.debug('Activating plan', { startDate });
    setIsSaving(true);
    
    try {
      // In a real implementation, this would gather all plan data from the builder
      const planData = {
        user_id: userId,
        name: 'New Training Plan',
        start_date: startDate,
        active: true
      };
      
      onSave(planData, true);
    } catch (error) {
      logger.error('Error activating plan', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Toggle start date picker
  const handleToggleStartDate = () => {
    setIsStartDateOpen(!isStartDateOpen);
  };

  return (
    <div 
      className="fixed left-0 right-0 bg-background-default border-t border-border p-4 z-20 shadow-md sticky-safe-bot sticky-safe-left sticky-safe-right"
      data-testid="save-plan-bar"
    >
      <div className="container mx-auto flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={handleToggleStartDate}
              className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-background-surface text-text-primary hover:bg-background-hover transition-colors"
              data-testid="set-start-date-button"
            >
              <Calendar className="h-4 w-4 text-text-secondary" />
              <span>
                Start Date: <span className="font-medium">{new Date(startDate).toLocaleDateString()}</span>
              </span>
            </button>
            
            {isStartDateOpen && (
              <div className="absolute left-0 bottom-12 bg-background-default border border-border rounded-lg shadow-lg p-4 w-72">
                <div className="mb-2">
                  <label className="block text-sm text-text-secondary mb-1">
                    Program Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={getTodayString()}
                    className="w-full px-3 py-2 bg-background-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    data-testid="start-date-input"
                  />
                </div>
                <div className="text-sm text-text-tertiary">
                  This will be day 1 of your program.
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleSaveAsDraft}
            disabled={isSaving || !hasChanges}
            className="px-4 py-2 border border-border rounded-lg text-text-primary flex items-center gap-2 hover:bg-background-hover transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
            data-testid="save-draft-button"
          >
            <Save className="h-4 w-4" />
            Save as Draft
          </button>
          
          <button
            onClick={handleActivatePlan}
            disabled={isSaving || !hasChanges}
            className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:hover:bg-primary"
            data-testid="activate-plan-button"
          >
            <PlayCircle className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Activate Plan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavePlanBar;
