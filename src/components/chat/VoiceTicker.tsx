// src/components/chat/VoiceTicker.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './VoiceTicker.module.css';
import * as Constants from './voiceTickerConstants';

export interface ISepiaVoiceRecorder {
  onResamplerData?: ((rms: number) => void) | undefined;
}

interface VoiceTickerProps {
  isRecordingActive: boolean;
  recorder: React.RefObject<ISepiaVoiceRecorder>;
}

const VoiceTicker: React.FC<VoiceTickerProps> = ({ isRecordingActive, recorder }) => {
  const [bars, setBars] = useState<{ id: number; height: number }[]>([]);
  const nextId = useRef(0);
  const voiceLayerRef = useRef<HTMLDivElement>(null);

  // Effect to set animation duration and handle resize
  useEffect(() => {
    const layer = voiceLayerRef.current;
    if (!layer) return;

    const setAnimDuration = () => {
      const containerWidth = layer.clientWidth;
      if (containerWidth > 0) {
        const animMs = Constants.calcAnimMs(containerWidth);
        layer.style.setProperty('--dur', `${animMs}ms`);
      }
    };

    setAnimDuration(); // Initial calculation

    const resizeObserver = new ResizeObserver(setAnimDuration);
    resizeObserver.observe(layer);

    return () => {
      resizeObserver.unobserve(layer);
    };
  }, []);

  // Effect to handle recorder data and create new bars
  useEffect(() => {
    const currentRecorder = recorder.current;
    if (isRecordingActive && currentRecorder) {
      currentRecorder.onResamplerData = (rms: number) => {
        const norm = Math.max(0, Math.min(rms / Constants.AUDIO_SCALE, 1));
        const height = Constants.MIN_H + norm * (Constants.MAX_H - Constants.MIN_H);
        setBars(prevBars => [...prevBars, { id: nextId.current++, height }]);
      };
    } else if (currentRecorder) {
      // Clear callback if not recording or recorder changed
      currentRecorder.onResamplerData = undefined;
    }

    // Cleanup function for this effect
    return () => {
      if (currentRecorder) {
        currentRecorder.onResamplerData = undefined;
      }
    };
  }, [isRecordingActive, recorder]);

  const handleAnimationEnd = useCallback((barId: number) => {
    setBars(prevBars => prevBars.filter(bar => bar.id !== barId));
  }, []);
  
  // Effect to clear bars when recording stops and all animations are done (indirectly)
  // This is mainly to ensure the component unmounts if it becomes empty after stopping
  useEffect(() => {
    if (!isRecordingActive && bars.length > 0) {
      // Bars will be removed by their own onAnimationEnd. 
      // If isRecordingActive becomes false, no new bars are added.
      // The component will unmount when bars.length becomes 0 via the condition below.
    } else if (!isRecordingActive && bars.length === 0){
      // This condition is handled by the return null below
    }
  }, [isRecordingActive, bars.length]);

  if (!isRecordingActive && bars.length === 0) {
    return null;
  }

  return (
    <div className={styles.voiceLayer} ref={voiceLayerRef}>
      <div className={styles.baseline} />
      {bars.map((bar) => (
        <div
          key={bar.id}
          className={styles.bar}
          style={{ height: `${bar.height}px` }}
          onAnimationEnd={() => handleAnimationEnd(bar.id)}
        />
      ))}
    </div>
  );
};

export default VoiceTicker;

