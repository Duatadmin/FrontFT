import React, { useEffect } from 'react';
import GoalTracker from '../goals/GoalTracker';
import ReflectionTimeline from '../goals/ReflectionTimeline';
import PhotoSlot from '../goals/PhotoSlot';
import StreakCounter from '../goals/StreakCounter';
import createLogger from '../../../utils/logger';
import ErrorBoundary from '../../ui/error-boundary';

/**
 * Goals & Reflections Tab
 * Displays progress tracking tools and motivational elements
 */
const GoalsReflectionsTab: React.FC = () => {
  // Initialize logger
  const logger = createLogger('GoalsReflectionsTab');
  
  // Log component mount
  useEffect(() => {
    logger.info('GoalsReflectionsTab mounted');
    
    return () => {
      logger.info('GoalsReflectionsTab unmounted');
    };
  }, []);
  logger.debug('Rendering GoalsReflectionsTab');
  
  return (
    <div className="space-y-6">
      {/* Streak counter */}
      <div className="mb-6">
        <ErrorBoundary componentName="StreakCounter">
          <StreakCounter />
        </ErrorBoundary>
      </div>
      
      {/* Two-column layout for desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Goals */}
        <div className="lg:col-span-7 space-y-6">
          <ErrorBoundary componentName="GoalTracker">
            <GoalTracker />
          </ErrorBoundary>
        </div>
        
        {/* Right column: Progress Photos & Timeline */}
        <div className="lg:col-span-5 space-y-6">
          <ErrorBoundary componentName="PhotoSlot">
            <PhotoSlot />
          </ErrorBoundary>
          <ErrorBoundary componentName="ReflectionTimeline">
            <ReflectionTimeline />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default GoalsReflectionsTab;
