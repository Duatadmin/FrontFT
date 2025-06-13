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
}

const VoiceTicker: React.FC<VoiceTickerProps> = ({ isRecordingActive, recorder }) => {
  const [dashes, setDashes] = useState<Dash[]>([]);
  const voiceLayerRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const latestRms = useRef<number>(0); // Store the latest RMS value

  // Subscribe to RMS data from the recorder
  useEffect(() => {
    if (isRecordingActive && recorder.current) {
      const currentRecorder = recorder.current;
      currentRecorder.onResamplerData = (rms: number) => {
        latestRms.current = rms;
      };
      // Cleanup function
      return () => {
        if (currentRecorder) {
          currentRecorder.onResamplerData = undefined;
        }
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
    first.style.height = `${Constants.mapRmsToHeight(latestRms.current)}px`;
    first.style.backgroundColor = Constants.NEW_DASH_COLOR;

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
    <div
      className={styles.voiceLayer}
      ref={voiceLayerRef}
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
        />
      ))}
    </div>
  );
};

export default VoiceTicker;
