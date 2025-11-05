/**
 * DEPRECATED: This file is maintained only for backward compatibility.
 * 
 * Please use import from '../lib/stores/useProgramStore' instead.
 * 
 * This file re-exports everything from the standardized store location
 * to prevent breaking changes in existing code.
 */

import { useProgramStore as programStore } from '../lib/stores/useProgramStore';
export type { TrainingPlan, Goal } from '../lib/stores/useProgramStore';

// Re-export the store as the default export
export default programStore;
