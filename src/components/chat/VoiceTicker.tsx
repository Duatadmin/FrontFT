// src/components/chat/VoiceTicker.tsx
import React, { useState, useEffect, useRef } from 'react';
import styles from './VoiceTicker.module.css';
import * as Constants from './voiceTickerConstants';

// Defines the shape of the recorder object expected as a prop.
export interface ISepiaVoiceRecorder {
  onResamplerData?: ((rms: number) => void) | undefined;
}

// Defines the props for the VoiceTicker component.
interface VoiceTickerProps {
  isRecordingActive: boolean;
  recorder: React.RefObject<ISepiaVoiceRecorder>;
}

const VoiceTicker: React.FC<VoiceTickerProps> = ({ isRecordingActive, recorder }) => {
  const [bars, setBars] = useState<{ id: number; height: number }[]>([]);
  const nextId = useRef(0);
  const voiceLayerRef = useRef<HTMLDivElement>(null);
  const [maxBars, setMaxBars] = useState(0);

  // Effect to calculate max bars based on container width
  useEffect(() => {
    const calculateMaxBars = () => {
      if (voiceLayerRef.current) {
        const containerWidth = voiceLayerRef.current.clientWidth;
        const barWidth = Constants.BAR_W + Constants.BAR_M;
        setMaxBars(Math.floor(containerWidth / barWidth));
      }
    };

    calculateMaxBars();
    const resizeObserver = new ResizeObserver(calculateMaxBars);
    if (voiceLayerRef.current) {
      resizeObserver.observe(voiceLayerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  // Effect to handle recorder data and create bars
  useEffect(() => {
    const currentRecorder = recorder.current;
    if (isRecordingActive && currentRecorder) {
      currentRecorder.onResamplerData = (rms: number) => {
        const AMPLIFICATION_FACTOR = 30;
        const amplifiedNorm = rms * AMPLIFICATION_FACTOR;
        const norm = Math.max(0, Math.min(1, amplifiedNorm));
        const height = Constants.MIN_H + norm * (Constants.MAX_H - Constants.MIN_H);
        const newBar = { id: nextId.current++, height };

        if (maxBars > 0) {
          setBars(prev => [...prev, newBar].slice(-maxBars));
        }
      };
    } else if (currentRecorder) {
      currentRecorder.onResamplerData = undefined;
    }

    return () => {
      if (currentRecorder) {
        currentRecorder.onResamplerData = undefined;
      }
    };
  }, [isRecordingActive, recorder, maxBars]);

  // Effect to clear bars when recording stops
  useEffect(() => {
    if (!isRecordingActive) {
      setBars([]);
    }
  }, [isRecordingActive]);

  if (!isRecordingActive && bars.length === 0) {
    return null;
  }

  return (
    <div className={styles.voiceLayer} ref={voiceLayerRef}>
      <div className={styles.baseline} />
      {bars.map((bar) => (
        <span
          key={bar.id}
          className={styles.bar}
          style={{ height: `${bar.height}px` }}
        />
      ))}
    </div>
  );
};

export default VoiceTicker;
