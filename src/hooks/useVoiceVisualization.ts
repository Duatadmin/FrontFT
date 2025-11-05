// src/hooks/useVoiceVisualization.ts
import { useRef, useCallback, useState, useEffect } from 'react';
import { ISepiaVoiceRecorder } from '../components/chat/VoiceTickerWithOptimizations';

export interface UseVoiceVisualizationOptions {
  /**
   * Whether the voice recording is currently active
   */
  isRecordingActive: boolean;
  
  /**
   * Optional callback when RMS level changes
   */
  onLevelChange?: (level: number) => void;
  
  /**
   * Optional initial RMS level (0-1)
   */
  initialLevel?: number;
}

export interface UseVoiceVisualizationReturn {
  /**
   * Ref to pass to VoiceTicker component
   */
  recorderRef: React.RefObject<ISepiaVoiceRecorder>;
  
  /**
   * Current RMS level (0-1)
   */
  level: number;
  
  /**
   * Method to update RMS data (called by VoiceWidget or other sources)
   */
  updateRmsData: (rms: number) => void;
  
  /**
   * Whether visualization should be shown
   */
  isVisualizationActive: boolean;
}

/**
 * Unified hook for voice visualization
 * Manages the connection between voice input sources and visualization components
 */
export function useVoiceVisualization(options: UseVoiceVisualizationOptions): UseVoiceVisualizationReturn {
  const { isRecordingActive, onLevelChange, initialLevel = 0 } = options;
  
  // Create recorder ref for VoiceTicker
  const recorderRef = useRef<ISepiaVoiceRecorder>({ onResamplerData: undefined });
  
  // Track current RMS level
  const [level, setLevel] = useState(initialLevel);
  
  // Update RMS data method
  const updateRmsData = useCallback((rms: number) => {
    // Clamp RMS between 0 and 1
    const clampedRms = Math.max(0, Math.min(1, rms));
    
    // Update internal state
    setLevel(clampedRms);
    
    // Forward to recorder ref if it has a handler
    if (recorderRef.current && recorderRef.current.onResamplerData) {
      recorderRef.current.onResamplerData(clampedRms);
    }
    
    // Call optional callback
    if (onLevelChange) {
      onLevelChange(clampedRms);
    }
  }, [onLevelChange]);
  
  // Reset level when recording stops
  useEffect(() => {
    if (!isRecordingActive) {
      setLevel(0);
    }
  }, [isRecordingActive]);
  
  return {
    recorderRef,
    level,
    updateRmsData,
    isVisualizationActive: isRecordingActive
  };
}