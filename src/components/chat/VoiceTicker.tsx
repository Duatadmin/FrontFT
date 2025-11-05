import React, { useState, useEffect, useRef } from 'react';
import styles from './VoiceTicker.module.css';
import * as Constants from './voiceTickerConstants';

interface Dash {
  id: number;
  color: string;
  height: number;
}

export interface ISepiaVoiceRecorder {
  onResamplerData?: (rms: number) => void;
}

interface VoiceTickerProps {
  isRecordingActive: boolean;
  recorder: React.RefObject<ISepiaVoiceRecorder>; // Prop to receive the recorder object
  state?: 'listening' | 'processing' | 'error'; // Visual state
}

const VoiceTicker: React.FC<VoiceTickerProps> = ({ isRecordingActive, recorder, state = 'listening' }) => {
  const [dashes, setDashes] = useState<Dash[]>([]);
  const [voiceLevel, setVoiceLevel] = useState<'silent' | 'quiet' | 'normal' | 'loud'>('silent');
  const voiceLayerRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const latestRms = useRef<number>(0); // Store the latest RMS value
  const smoothedRms = useRef<number>(0); // Store smoothed RMS value
  const SMOOTHING_FACTOR = 0.5; // Balanced between responsiveness and stability
  const rafId = useRef<number | null>(null); // RequestAnimationFrame ID
  const lastUpdateTime = useRef<number>(0); // For frame rate limiting
  const voiceLevelUpdateTime = useRef<number>(0); // For voice level announcements

  // Subscribe to RMS data from the recorder
  useEffect(() => {
    if (isRecordingActive && recorder.current) {
      const currentRecorder = recorder.current;
      currentRecorder.onResamplerData = (rms: number) => {
        // Apply exponential smoothing to reduce jitter
        smoothedRms.current = SMOOTHING_FACTOR * smoothedRms.current + (1 - SMOOTHING_FACTOR) * rms;
        
        // Debug: Log RMS values occasionally to calibrate
        if (Math.random() < 0.02) { // Log ~2% of samples
          console.log(`[VoiceTicker Debug] Raw RMS: ${rms.toFixed(4)}, Smoothed: ${smoothedRms.current.toFixed(4)}`);
        }
        
        // Use RAF for smooth updates at 60fps for more fluid motion
        const now = performance.now();
        if (now - lastUpdateTime.current > 16) { // ~60fps
          if (rafId.current) cancelAnimationFrame(rafId.current);
          rafId.current = requestAnimationFrame(() => {
            latestRms.current = smoothedRms.current;
            lastUpdateTime.current = now;
            
            // Update voice level for accessibility (once per second)
            if (now - voiceLevelUpdateTime.current > 1000) {
              const height = Constants.mapRmsToHeight(smoothedRms.current);
              const heightRatio = (height - Constants.MIN_DASH_H) / (Constants.MAX_DASH_H - Constants.MIN_DASH_H);
              
              let newLevel: 'silent' | 'quiet' | 'normal' | 'loud' = 'silent';
              if (heightRatio > 0.7) newLevel = 'loud';
              else if (heightRatio > 0.4) newLevel = 'normal';
              else if (heightRatio > 0.1) newLevel = 'quiet';
              
              setVoiceLevel(newLevel);
              voiceLevelUpdateTime.current = now;
            }
          });
        }
      };
      // Cleanup function
      return () => {
        if (currentRecorder) {
          currentRecorder.onResamplerData = undefined;
        }
        if (rafId.current) {
          cancelAnimationFrame(rafId.current);
          rafId.current = null;
        }
        // Reset smoothed value when stopping
        smoothedRms.current = 0;
        lastUpdateTime.current = 0;
      };
    }
  }, [isRecordingActive, recorder]);

  // The core logic: on each animation iteration, we cycle the array.
  // The first element is moved to the end, its color is updated, and height is set from RMS.
  // This effect sets up the main state and observers for initial dash population
  useEffect(() => {
    const voiceLayer = voiceLayerRef.current;
    if (!voiceLayer) return;

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        const containerWidth = entry.contentRect.width;
        // +2 for buffer, ensures seamless looping
        const numDashes = Math.ceil(containerWidth / Constants.DASH_STEP_PX) + 2; 
        
        setDashes(
          Array.from({ length: numDashes }, (_) => ({
            id: nextId.current++,
            color: Constants.INITIAL_DASH_COLOR,
            height: Constants.MIN_DASH_H, // Initial dashes have min height
          }))
        );
        
        voiceLayer.style.setProperty('--dash-w', `${Constants.DASH_W}px`);
        voiceLayer.style.setProperty('--dash-gap', `${Constants.DASH_GAP}px`);
        // Animation duration is now calculated based only on dash step and speed
        voiceLayer.style.setProperty('--dur', `${Constants.calcAnimMs()}ms`);
      }
    });

    observer.observe(voiceLayer);

    return () => {
      observer.unobserve(voiceLayer);
      observer.disconnect();
    };
  }, []); // Empty dependency array: runs once on mount

  const rotateDash = () => {
    const layer = voiceLayerRef.current;
    if (!layer) return;
    const first = layer.firstElementChild as HTMLElement;
    if (!first) return;

    // 1. Update only the recycled dash
    const height = Constants.mapRmsToHeight(latestRms.current);
    const isActive = height > Constants.MIN_DASH_H;
    
    first.style.height = `${height}px`;
    first.style.backgroundColor = isActive ? Constants.NEW_DASH_COLOR : Constants.INITIAL_DASH_COLOR;
    first.setAttribute('data-active', isActive ? 'true' : 'false');

    // 2. Move it to the end – one cheap DOM op, no React reconciliation
    layer.appendChild(first);
  };

  // Effect to handle animation iteration via direct DOM manipulation
  useEffect(() => {
    const layer = voiceLayerRef.current;
    if (!layer || !isRecordingActive) return;

    // Call rotateDash directly (synchronously) within the event handler
    // This ensures the DOM reorder happens before the browser proceeds to compositing for this frame.
    const onIter = () => rotateDash(); 
    layer.addEventListener('animationiteration', onIter);

    return () => {
      layer.removeEventListener('animationiteration', onIter);
    };
    // Re-run if isRecordingActive changes to attach/detach listener
    // voiceLayerRef.current should be stable after first render with isRecordingActive=true
  }, [isRecordingActive]);

  // The component only renders if isRecordingActive is true
  if (!isRecordingActive) {
    return null;
  }

  // Initial render of dashes is handled by React. Subsequent updates are DOM-manual.
  return (
    <>
      <div
        className={styles.voiceLayer}
        ref={voiceLayerRef}
        data-state={state}
        role="img"
        aria-label="Voice input level indicator"
        aria-describedby="voice-level-status"
        // onAnimationIteration prop removed, handled by addEventListener
      >
        {dashes.map(dash => (
          <div
            key={dash.id}
            className={styles.dash}
            style={{ 
              backgroundColor: dash.color,
              height: `${dash.height}px`, // Apply dynamic height
            }}
            data-active="false" // Initial state
          />
        ))}
      </div>
      {/* Screen reader announcements */}
      <div id="voice-level-status" className={styles['sr-only']} aria-live="polite" aria-atomic="true">
        Voice level: {voiceLevel}
      </div>
    </>
  );
};

export default VoiceTicker;
