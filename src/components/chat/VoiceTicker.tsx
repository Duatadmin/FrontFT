import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './VoiceTicker.module.css';
import * as Constants from './voiceTickerConstants';

interface VoiceTickerProps {
  isRecordingActive: boolean;
}

// A simple type for our dash objects
type Dash = {
  id: number;
  color: string;
};

const VoiceTicker: React.FC<VoiceTickerProps> = ({ isRecordingActive }) => {
  const [dashes, setDashes] = useState<Dash[]>([]);
  const voiceLayerRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  

  // The core logic: on each animation iteration, we cycle the array.
  // The first element is moved to the end, and we decide its color.
  const handleAnimationIteration = useCallback(() => {
    setDashes(prevDashes => {
      if (prevDashes.length === 0) return [];

      // Get the leftmost dash and color it white for recycling.
      const dashToMove = { 
        ...prevDashes[0], 
        color: Constants.NEW_DASH_COLOR 
      };

      // Return a new array with the first element moved to the end
      return [...prevDashes.slice(1), dashToMove];
    });
  }, []);

  // This effect sets up the main state and observers
  useEffect(() => {
    const layer = voiceLayerRef.current;
    if (!layer) return;

    let animationFrameId: number;

    const observer = new ResizeObserver(() => {
      // Use rAF to avoid ResizeObserver loop limit errors
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        const containerWidth = layer.clientWidth;
        if (containerWidth === 0) return;

        const dashStep = Constants.DASH_W + Constants.DASH_GAP;
        // Calculate how many dashes we need to fill the container, plus a buffer
        const numDashes = Math.ceil(containerWidth / dashStep) + 5;

        // Set CSS variables for our styles
        layer.style.setProperty('--dash-w', `${Constants.DASH_W}px`);
        layer.style.setProperty('--dash-gap', `${Constants.DASH_GAP}px`);

        // Animation duration for one step
        const stepDuration = (dashStep / Constants.SCROLL_SPEED_PX_SEC) * 1000;
        layer.style.setProperty('--dur', `${stepDuration}ms`);

        // Create the initial array of dashes
        setDashes(
          Array.from({ length: numDashes }, () => ({
            id: nextId.current++,
            color: Constants.INITIAL_DASH_COLOR, // Start with all black dashes
          }))
        );
      });
    });

    observer.observe(layer);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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
          style={{ backgroundColor: dash.color }}
        />
      ))}
    </div>
  );
};

export default VoiceTicker;


