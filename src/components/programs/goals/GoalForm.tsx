import React, { useState } from 'react';
import useProgramStore from '../../../store/useProgramStore';
import { X, Calendar } from 'lucide-react';
import createLogger from '../../../utils/logger';

const logger = createLogger('GoalForm');

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  editGoal?: {
    id: string;
    type: string;
    metric: string;
    target_value: number;
    unit: string;
    deadline: string;
  };
}

/**
 * GoalForm Component
 * Modal form for creating and editing fitness goals
 */
const GoalForm: React.FC<GoalFormProps> = ({ isOpen, onClose, userId, editGoal }) => {
  // Form state
  const [formState, setFormState] = useState({
    type: editGoal?.type || 'strength',
    metric: editGoal?.metric || '',
    target_value: editGoal?.target_value || 0,
    unit: editGoal?.unit || 'kg',
    deadline: editGoal?.deadline || getDefaultDeadline(),
  });
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Store actions
  const { createGoal, updateGoal } = useProgramStore();
  
  // Get default deadline (4 weeks from today)
  function getDefaultDeadline() {
    const date = new Date();
    date.setDate(date.getDate() + 28); // 4 weeks
    return date.toISOString().split('T')[0];
  }
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formState.metric.trim()) {
      newErrors.metric = 'Goal metric is required';
    }
    
    if (!formState.target_value || formState.target_value <= 0) {
      newErrors.target_value = 'Target value must be greater than 0';
    }
    
    if (!formState.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }
    
    // Check deadline is at least 1 week in the future
    const deadline = new Date(formState.deadline);
    const minDeadline = new Date();
    minDeadline.setDate(minDeadline.getDate() + 7);
    
    if (deadline < minDeadline) {
      newErrors.deadline = 'Deadline must be at least 1 week from today';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare goal data
      const goalData = {
        user_id: userId,
        type: formState.type as 'strength' | 'endurance' | 'body_composition' | 'benchmark',
        metric: formState.metric,
        target_value: Number(formState.target_value),
        unit: formState.unit,
        deadline: formState.deadline,
      };
      
      logger.debug('Submitting goal form', goalData);
      
      // Create or update goal
      if (editGoal) {
        await updateGoal(editGoal.id, goalData);
        logger.info('Goal updated successfully', { goalId: editGoal.id });
      } else {
        await createGoal(goalData);
        logger.info('Goal created successfully');
      }
      
      // Close form
      onClose();
    } catch (error) {
      logger.error('Error saving goal', error);
      setErrors(prev => ({
        ...prev,
        form: 'Failed to save goal. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // If not open, don't render
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 safe-top safe-bot safe-left safe-right"
      onClick={handleBackdropClick}
      data-testid="goal-form-modal"
    >
      <div 
        className="w-full max-w-md bg-background-default rounded-xl shadow-xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 id="modal-title" className="text-lg font-semibold text-text-primary">
            {editGoal ? 'Edit Goal' : 'Create New Goal'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-background-hover transition-colors"
            aria-label="Close modal"
            data-testid="close-modal-button"
          >
            <X className="h-5 w-5 text-text-secondary" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Goal Type */}
          <div className="mb-4">
            <label htmlFor="type" className="block text-sm font-medium text-text-secondary mb-1">
              Goal Type
            </label>
            <select
              id="type"
              name="type"
              value={formState.type}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-background-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              data-testid="goal-type-select"
            >
              <option value="strength">Strength</option>
              <option value="endurance">Endurance</option>
              <option value="body_composition">Body Composition</option>
              <option value="benchmark">Benchmark</option>
            </select>
          </div>
          
          {/* Goal Metric */}
          <div className="mb-4">
            <label htmlFor="metric" className="block text-sm font-medium text-text-secondary mb-1">
              Goal Metric
            </label>
            <input
              type="text"
              id="metric"
              name="metric"
              value={formState.metric}
              onChange={handleChange}
              placeholder="e.g., Bench Press 1RM, Body Weight, 5K Time"
              className={`w-full px-3 py-2 bg-background-surface border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.metric ? 'border-red-500' : 'border-border'
              }`}
              data-testid="goal-metric-input"
            />
            {errors.metric && (
              <p className="mt-1 text-sm text-red-500">{errors.metric}</p>
            )}
          </div>
          
          {/* Target Value and Unit */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label htmlFor="target_value" className="block text-sm font-medium text-text-secondary mb-1">
                Target Value
              </label>
              <input
                type="number"
                id="target_value"
                name="target_value"
                value={formState.target_value}
                onChange={handleChange}
                min="0"
                step="any"
                className={`w-full px-3 py-2 bg-background-surface border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.target_value ? 'border-red-500' : 'border-border'
                }`}
                data-testid="goal-target-input"
              />
              {errors.target_value && (
                <p className="mt-1 text-sm text-red-500">{errors.target_value}</p>
              )}
            </div>
            
            <div className="w-1/3">
              <label htmlFor="unit" className="block text-sm font-medium text-text-secondary mb-1">
                Unit
              </label>
              <input
                type="text"
                id="unit"
                name="unit"
                value={formState.unit}
                onChange={handleChange}
                placeholder="kg, lbs, min"
                className={`w-full px-3 py-2 bg-background-surface border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.unit ? 'border-red-500' : 'border-border'
                }`}
                data-testid="goal-unit-input"
              />
              {errors.unit && (
                <p className="mt-1 text-sm text-red-500">{errors.unit}</p>
              )}
            </div>
          </div>
          
          {/* Deadline */}
          <div className="mb-6">
            <label htmlFor="deadline" className="block text-sm font-medium text-text-secondary mb-1">
              Target Date
            </label>
            <div className={`relative rounded-lg ${
              errors.deadline ? 'ring-1 ring-red-500' : ''
            }`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-text-tertiary" />
              </div>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formState.deadline}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full pl-10 pr-3 py-2 bg-background-surface border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.deadline ? 'border-red-500' : 'border-border'
                }`}
                data-testid="goal-deadline-input"
              />
            </div>
            {errors.deadline && (
              <p className="mt-1 text-sm text-red-500">{errors.deadline}</p>
            )}
          </div>
          
          {/* Form error */}
          {errors.form && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
              {errors.form}
            </div>
          )}
          
          {/* Submit and Cancel buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-background-surface border border-border rounded-lg text-text-primary hover:bg-background-hover transition-colors"
              data-testid="cancel-goal-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              data-testid="save-goal-button"
            >
              {isSubmitting 
                ? 'Saving...' 
                : editGoal 
                  ? 'Update Goal' 
                  : 'Create Goal'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalForm;
