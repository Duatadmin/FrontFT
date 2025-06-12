import React, { useState, useEffect, useRef, useCallback } from 'react';
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
        console.log('RMS received:', rms);
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
  const handleAnimationIteration = useCallback(() => {
    console.log('Animation iteration. Latest RMS:', latestRms.current);
    setDashes(prevDashes => {
      if (prevDashes.length === 0) return [];

      const newHeight = Constants.mapRmsToHeight(latestRms.current);
      const dashToMove: Dash = { 
        ...prevDashes[0], 
        color: Constants.NEW_DASH_COLOR, 
        height: newHeight,
      };

      return [...prevDashes.slice(1), dashToMove];
    });
  }, []); // latestRms.current is a ref, no need to include in deps for this callback

  // This effect sets up the main state and observers
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

  // The component only renders if isRecordingActive is true
  if (!isRecordingActive) {
    return null;
  }

  return (
    <div
      className={styles.voiceLayer}
      ref={voiceLayerRef}
      onAnimationIteration={handleAnimationIteration}
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
