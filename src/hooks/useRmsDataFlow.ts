// src/hooks/useRmsDataFlow.ts
import { useRef, useCallback } from 'react';

export interface RmsDataSource {
  /**
   * Source identifier for debugging
   */
  source: string;
  
  /**
   * Whether this source uses normalized values (0-1) or raw values
   */
  isNormalized: boolean;
  
  /**
   * Optional custom normalizer function
   */
  normalizer?: (value: number) => number;
}

export interface UseRmsDataFlowOptions {
  /**
   * Data source configuration
   */
  source: RmsDataSource;
  
  /**
   * Target callbacks to receive normalized RMS data
   */
  targets: Array<(rms: number) => void>;
  
  /**
   * Whether to log RMS data for debugging
   */
  debug?: boolean;
}

/**
 * Hook to manage RMS data flow between sources and targets
 * Handles normalization and distribution of RMS values
 */
export function useRmsDataFlow(options: UseRmsDataFlowOptions) {
  const { source, targets, debug = false } = options;
  
  // Keep track of last value for debugging
  const lastValueRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  
  // Default normalizer for raw audio values
  const defaultNormalizer = useCallback((value: number) => {
    // If already normalized, return as-is
    if (source.isNormalized) return value;
    
    // For raw RMS values, apply standard normalization
    // Typical RMS range is 0-1, but can spike higher
    return Math.max(0, Math.min(1, value));
  }, [source.isNormalized]);
  
  // Process incoming RMS data
  const processRmsData = useCallback((rmsValue: number) => {
    frameCountRef.current++;
    
    // Apply normalization
    const normalizer = source.normalizer || defaultNormalizer;
    const normalizedValue = normalizer(rmsValue);
    
    // Debug logging every 30 frames (~1 second at 30fps)
    if (debug && frameCountRef.current % 30 === 0) {
      console.log(`[RmsDataFlow] ${source.source}: raw=${rmsValue.toFixed(4)}, normalized=${normalizedValue.toFixed(4)}`);
    }
    
    // Distribute to all targets
    targets.forEach(target => {
      try {
        target(normalizedValue);
      } catch (error) {
        console.error(`[RmsDataFlow] Error in target callback:`, error);
      }
    });
    
    lastValueRef.current = normalizedValue;
  }, [source, targets, debug, defaultNormalizer]);
  
  return {
    processRmsData,
    getLastValue: () => lastValueRef.current
  };
}