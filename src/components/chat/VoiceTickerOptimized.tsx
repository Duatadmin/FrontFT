import React, { useState, useEffect, useRef } from 'react';
import styles from './VoiceTicker.module.css';
import * as Constants from './voiceTickerConstants';
import { audioAnalyzer } from '../../services/audioAnalyzer';

interface Dash {
  id: number;
  color: string;
  height: number;
}

interface VoiceTickerOptimizedProps {
  isRecordingActive: boolean;
  audioContext?: AudioContext; // Optional audio context for analyzer
}

// Singleton ResizeObserver to reduce overhead
let sharedResizeObserver: ResizeObserver | null = null;
const resizeCallbacks = new WeakMap<Element, (entry: ResizeObserverEntry) => void>();

const getSharedResizeObserver = (): ResizeObserver => {
  if (!sharedResizeObserver) {
    sharedResizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const callback = resizeCallbacks.get(entry.target);
        if (callback) {
          callback(entry);
        }
      });
    });
  }
  return sharedResizeObserver;
};

const VoiceTickerOptimized: React.FC<VoiceTickerOptimizedProps> = ({ 
  isRecordingActive, 
  audioContext 
}) => {
  const [dashes, setDashes] = useState<Dash[]>([]);
  const voiceLayerRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const latestRms = useRef<number>(0);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Subscribe to audio analyzer for RMS data
  useEffect(() => {
    if (isRecordingActive && audioContext) {
      // Initialize analyzer if needed
      audioAnalyzer.initialize(audioContext);
      
      // Subscribe to RMS updates
      unsubscribeRef.current = audioAnalyzer.subscribe((rms: number) => {
        latestRms.current = rms;
      });
      
      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
      };
    }
  }, [isRecordingActive, audioContext]);

  // Setup resize observer with shared instance
  useEffect(() => {
    const voiceLayer = voiceLayerRef.current;
    if (!voiceLayer) return;

    const handleResize = (entry: ResizeObserverEntry) => {
      const containerWidth = entry.contentRect.width;
      const numDashes = Math.ceil(containerWidth / Constants.DASH_STEP_PX) + 2;
      
      setDashes(
        Array.from({ length: numDashes }, (_) => ({
          id: nextId.current++,
          color: Constants.INITIAL_DASH_COLOR,
          height: Constants.MIN_DASH_H,
        }))
      );
      
      voiceLayer.style.setProperty('--dash-w', `${Constants.DASH_W}px`);
      voiceLayer.style.setProperty('--dash-gap', `${Constants.DASH_GAP}px`);
      voiceLayer.style.setProperty('--dur', `${Constants.calcAnimMs()}ms`);
    };

    // Store callback in WeakMap
    resizeCallbacks.set(voiceLayer, handleResize);
    
    // Use shared observer
    const observer = getSharedResizeObserver();
    observer.observe(voiceLayer);

    return () => {
      observer.unobserve(voiceLayer);
      resizeCallbacks.delete(voiceLayer);
    };
  }, []);

  const rotateDash = () => {
    const layer = voiceLayerRef.current;
    if (!layer) return;
    const first = layer.firstElementChild as HTMLElement;
    if (!first) return;

    // Update only the recycled dash
    first.style.height = `${Constants.mapRmsToHeight(latestRms.current)}px`;
    first.style.backgroundColor = Constants.NEW_DASH_COLOR;

    // Move it to the end
    layer.appendChild(first);
  };

  // Handle animation iteration
  useEffect(() => {
    const layer = voiceLayerRef.current;
    if (!layer || !isRecordingActive) return;

    const onIter = () => rotateDash();
    layer.addEventListener('animationiteration', onIter);

    return () => {
      layer.removeEventListener('animationiteration', onIter);
    };
  }, [isRecordingActive]);

  if (!isRecordingActive) {
    return null;
  }

  return (
    <div
      className={styles.voiceLayer}
      ref={voiceLayerRef}
    >
      {dashes.map(dash => (
        <div
          key={dash.id}
          className={styles.dash}
          style={{ 
            backgroundColor: dash.color,
            height: `${dash.height}px`,
          }}
        />
      ))}
    </div>
  );
};

export default VoiceTickerOptimized;