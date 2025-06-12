// src/components/chat/VoiceTicker.tsx
import React, { useState, useEffect, useRef } from 'react';
import * as Constants from './voiceTickerConstants';
import styles from './VoiceTicker.module.css';

// Placeholder: Define this more accurately based on the actual SepiaVoiceRecorder
export interface ISepiaVoiceRecorder { // Exporting for potential use in ChatInput
  onResamplerData?: (rms: number) => void;
}

interface VoiceTickerProps {
  isRecordingActive: boolean; // True when microphone is active and we should listen for RMS data
  recorder?: ISepiaVoiceRecorder | null; // The voice recorder instance
}

interface Bar {
  id: number;
  height: number;
}

const VoiceTicker: React.FC<VoiceTickerProps> = ({ isRecordingActive, recorder }) => {
  const [bars, setBars] = useState<Bar[]>([]);
  const nextId = useRef<number>(0);
  const internalRecorderRef = useRef<ISepiaVoiceRecorder | null | undefined>(null);

  useEffect(() => {
    // Store the recorder instance in a ref to ensure the callback always references the latest one
    // if the recorder prop instance changes, though ideally it should be stable.
    internalRecorderRef.current = recorder;
  }, [recorder]);

  useEffect(() => {
    const currentRecorder = internalRecorderRef.current;

    if (isRecordingActive && currentRecorder) {
      // console.log('VoiceTicker: Subscribing to onResamplerData');
      currentRecorder.onResamplerData = (rms: number) => {
        const norm = Math.max(0, Math.min(1, rms / Constants.AUDIO_SCALE));
        const height = Constants.MIN_H + norm * (Constants.MAX_H - Constants.MIN_H);
        setBars((prevBars) => [...prevBars, { id: nextId.current++, height }]);
      };
    } else if (currentRecorder && currentRecorder.onResamplerData) {
      // console.log('VoiceTicker: Unsubscribing from onResamplerData because recording stopped or no recorder');
      currentRecorder.onResamplerData = undefined;
    }

    // Cleanup function for when isRecordingActive changes or component unmounts
    return () => {
      const activeRecorderOnCleanup = internalRecorderRef.current;
      if (activeRecorderOnCleanup && activeRecorderOnCleanup.onResamplerData) {
        // console.log('VoiceTicker: Cleanup - Unsubscribing from onResamplerData');
        activeRecorderOnCleanup.onResamplerData = undefined;
      }
    };
  }, [isRecordingActive]); // Rerun effect if isRecordingActive changes

  const handleAnimationEnd = (barId: number) => {
    setBars((prevBars) => prevBars.filter((bar) => bar.id !== barId));
  };

  if (!isRecordingActive && bars.length === 0) {
    return null;
  }

  return (
    <div className={styles.voiceLayer} aria-hidden="true">
      <div className={styles.baseline}></div>
      {bars.map((bar) => (
        <span
          key={bar.id}
          className={styles.bar}
          style={{
            height: `${bar.height}px`,
            // animationDuration: `${Constants.ANIM_MS}ms`, // Already set in CSS module
          }}
          onAnimationEnd={() => handleAnimationEnd(bar.id)}
        />
      ))}
    </div>
  );
};

export default VoiceTicker;
