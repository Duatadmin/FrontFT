import React, { useState } from 'react';
import useProgramStore from '../../../store/useProgramStore';
import useUserStore from '../../../store/useUserStore';
import TemplateGallery from './TemplateGallery';
import PlanBuilder from './PlanBuilder';
import SavePlanBar from './SavePlanBar';
import { Dumbbell, FileText } from 'lucide-react';
import createLogger from '../../../utils/logger';

const logger = createLogger('TemplatesTab');

/**
 * TemplatesTab Component
 * Provides template gallery and custom program builder functionality
 */
const TemplatesTab: React.FC = () => {
  // Local state
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [isBuilderActive, setIsBuilderActive] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  // Get user state
  const { user } = useUserStore();
  
  // Log state changes
  React.useEffect(() => {
    logger.debug('TemplatesTab state', { activeTemplate, isBuilderActive, unsavedChanges });
  }, [activeTemplate, isBuilderActive, unsavedChanges]);
  
  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    logger.debug('Template selected', { templateId });
    setActiveTemplate(templateId);
    setIsBuilderActive(true);
    setUnsavedChanges(true);
  };
  
  // Handle starting from scratch
  const handleStartFromScratch = () => {
    logger.debug('Starting builder from scratch');
    setActiveTemplate(null);
    setIsBuilderActive(true);
    setUnsavedChanges(false);
  };
  
  // Handle exiting builder
  const handleExitBuilder = () => {
    // If unsaved changes, confirm
    if (unsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to exit?');
      if (!confirmed) return;
    }
    
    logger.debug('Exiting builder');
    setIsBuilderActive(false);
    setActiveTemplate(null);
    setUnsavedChanges(false);
  };
  
  // Handle plan change in builder
  const handlePlanChange = () => {
    if (!unsavedChanges) {
      setUnsavedChanges(true);
    }
  };
  
  // Handle save plan
  const handleSavePlan = (planData: any, activate: boolean) => {
    logger.debug('Saving plan', { planData, activate });
    // Save logic would be implemented here
    setUnsavedChanges(false);
    
    // If activating, switch to current tab
    if (activate) {
      useProgramStore.getState().setActiveTab('current');
    }
  };

  return (
    <div className="relative min-h-[500px]" data-testid="templates-tab">
      {isBuilderActive ? (
        // Plan builder view
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Program Builder</h3>
            <button
              onClick={handleExitBuilder}
              className="px-3 py-1.5 border border-border rounded-lg text-text-secondary text-sm hover:bg-background-hover transition-colors"
              data-testid="exit-builder-button"
            >
              Back to Templates
            </button>
          </div>
          
          <PlanBuilder 
            templateId={activeTemplate} 
            onChange={handlePlanChange} 
          />
          
          {/* Fixed bottom save bar */}
          <SavePlanBar 
            hasChanges={unsavedChanges} 
            onSave={handleSavePlan} 
            userId={user?.id || ''} 
          />
        </div>
      ) : (
        // Template gallery view
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Program Templates</h3>
            <button
              onClick={handleStartFromScratch}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary rounded-lg text-white text-sm font-medium hover:bg-primary/90 transition-colors"
              data-testid="start-scratch-button"
            >
              <Dumbbell className="h-3.5 w-3.5" />
              Create Custom Program
            </button>
          </div>
          
          {/* Template categories */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button className="px-3 py-1.5 bg-background-hover text-text-primary rounded-full text-sm font-medium whitespace-nowrap">
              All Templates
            </button>
            <button className="px-3 py-1.5 text-text-secondary hover:bg-background-hover/50 rounded-full text-sm font-medium whitespace-nowrap">
              Strength
            </button>
            <button className="px-3 py-1.5 text-text-secondary hover:bg-background-hover/50 rounded-full text-sm font-medium whitespace-nowrap">
              Hypertrophy
            </button>
            <button className="px-3 py-1.5 text-text-secondary hover:bg-background-hover/50 rounded-full text-sm font-medium whitespace-nowrap">
              Weight Loss
            </button>
            <button className="px-3 py-1.5 text-text-secondary hover:bg-background-hover/50 rounded-full text-sm font-medium whitespace-nowrap">
              Endurance
            </button>
          </div>
          
          {/* Template gallery */}
          <TemplateGallery onSelectTemplate={handleSelectTemplate} />
          
          {/* Help section */}
          <div className="mt-8 p-4 bg-background-surface/50 border border-border rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-text-primary mb-1">Need help building your program?</h4>
                <p className="text-text-secondary text-sm mb-2">
                  Our AI assistant can help create a personalized training program based on your goals, 
                  experience level, and available equipment.
                </p>
                <button className="text-primary text-sm font-medium hover:underline">
                  Get AI recommendations
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesTab;
