// src/hooks/useWalkieV3.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import { ASRServiceV3, ASRTranscriptMessage } from '../services/ASRServiceV3';
import { createRecorder, RecorderHandle, CreateRecorderOptions } from '../lib/sepiaRecorder';
import { useTTSPlaybackState } from './useTTSPlaybackState';
import { getASRAudioConstraints } from '../lib/audioConstraints';

const METER_EVERY_N_FRAMES = 4;

export interface WalkieState {
  isStreaming: boolean;
  level: number; // 0-1 RMS meter
  status: 'idle' | 'connecting' | 'active' | 'error';
  errorMessage?: string | null;
}

export interface UseWalkieV3Options {
  wsHost: string; // e.g., 'localhost:8000' or 'api.example.com'
  mode?: 'push' | 'walkie'; // Default to walkie for always-on listening
  recorderConfig?: Partial<CreateRecorderOptions>;
  onTranscription?: (transcript: { text: string; final: boolean }) => void;
  onError?: (error: Error) => void;
}

export function useWalkieV3(options: UseWalkieV3Options): {
  state: WalkieState;
  start(): Promise<void>;
  stop(): Promise<void>;
  resetError(): Promise<void>;
} {
  const { wsHost, mode = 'walkie', recorderConfig, onTranscription, onError } = options;

  const [state, setState] = useState<WalkieState>({
    isStreaming: false,
    level: 0,
    status: 'idle',
    errorMessage: null,
  });

  const frameCount = useRef<number>(0);
  const asrServiceRef = useRef<ASRServiceV3 | null>(null);
  const recorderInstanceRef = useRef<RecorderHandle | null>(null);
  const isActiveRef = useRef<boolean>(false);

  const handleInternalError = useCallback((error: Error, context: string) => {
    console.error(`[useWalkieV3] Error ${context}:`, error);
    setState(prevState => ({
      ...prevState,
      isStreaming: false,
      status: 'error',
      errorMessage: error.message || `An error occurred ${context}`,
    }));
    if (onError) {
      onError(error);
    }
  }, [onError]);

  const handleTranscript = useCallback((transcript: ASRTranscriptMessage) => {
    // Only process final transcripts as requested
    if (transcript.final) {
      console.log(`[useWalkieV3] Final transcript received: "${transcript.text}"`);
      if (onTranscription) {
        onTranscription(transcript);
      }
    }
  }, [onTranscription]);

  const handleConnectionChange = useCallback((connected: boolean) => {
    if (!connected && isActiveRef.current) {
      console.warn('[useWalkieV3] ASR connection lost while streaming');
      // Don't immediately error out - the service will try to reconnect
    }
  }, []);

  const calculateRMS = (pcmData: Int16Array): number => {
    if (pcmData.length === 0) return 0;
    let sumOfSquares = 0;
    for (let i = 0; i < pcmData.length; i++) {
      const sample = pcmData[i] / 32768.0;
      sumOfSquares += sample * sample;
    }
    const rms = Math.sqrt(sumOfSquares / pcmData.length);
    return Math.max(0, Math.min(1, rms)); // Clamp between 0 and 1
  };

  const cleanupResources = useCallback(async () => {
    isActiveRef.current = false;
    
    if (recorderInstanceRef.current) {
      try {
        await recorderInstanceRef.current.stop();
        recorderInstanceRef.current.close();
      } catch (e: any) {
        console.error('[useWalkieV3] Error closing recorder:', e);
      }
      recorderInstanceRef.current = null;
    }
    
    if (asrServiceRef.current) {
      try {
        await asrServiceRef.current.disconnect();
      } catch (e: any) {
        console.error('[useWalkieV3] Error disconnecting ASR service:', e);
      }
      asrServiceRef.current = null;
    }
  }, []);

  const failAndCleanup = useCallback(async (error: Error, context: string) => {
    handleInternalError(error, context);
    await cleanupResources();
  }, [handleInternalError, cleanupResources]);

  // Ensure microphone permission
  const ensureMicrophonePermission = async (): Promise<void> => {
    const permStartTime = performance.now();
    try {
      const status = await (navigator.permissions as any).query({ name: 'microphone' });
      if (status.state === 'granted') {
        console.log('[useWalkieV3] Microphone permission already granted');
        return;
      }
      if (status.state === 'denied') {
        throw new Error('Microphone access is blocked. Please enable it in your browser\'s site settings, then try again.');
      }
      // 'prompt' — fall through to getUserMedia which shows the browser prompt
    } catch (err: any) {
      // Re-throw our own permission-blocked error
      if (err?.message?.includes('Microphone access is blocked')) throw err;
      // Permissions API not available (Safari <16) — fall through
    }

    // Request permission
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    const permElapsed = performance.now() - permStartTime;
    console.log(`[useWalkieV3] Microphone permission obtained in ${permElapsed.toFixed(2)}ms`);
  };

  const start = useCallback(async () => {
    const startTime = performance.now();
    
    if (state.status === 'connecting' || state.status === 'active') {
      console.warn('[useWalkieV3] Already streaming or connecting');
      return;
    }

    setState(prevState => ({ 
      ...prevState, 
      status: 'connecting', 
      errorMessage: null, 
      isStreaming: false, 
      level: 0 
    }));
    
    isActiveRef.current = true;
    frameCount.current = 0;

    try {
      // Request microphone permission early
      await ensureMicrophonePermission();

      // Create ASR service
      const asrService = new ASRServiceV3({
        host: wsHost,
        mode,
        onTranscript: handleTranscript,
        onError: (error) => { failAndCleanup(error, 'ASR service'); },
        onConnectionChange: handleConnectionChange,
      });
      asrServiceRef.current = asrService;

      // Connect to ASR service
      await asrService.connect();

      // Create audio recorder with echo cancellation
      const audioConstraints = getASRAudioConstraints({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 16000
      });
      
      const recConfig = {
        targetSampleRate: 16000,
        mono: true,
        ...(recorderConfig || {}),
        audioConstraints: audioConstraints.audio as MediaTrackConstraints,
        onError: (err: any) => {
          failAndCleanup(
            err instanceof Error ? err : new Error(String(err || 'Unknown recorder error')),
            'recorder'
          );
        },
        owner: 'walkieV3',
      };
      
      const recorder = await createRecorder(recConfig);
      recorderInstanceRef.current = recorder;

      // Audio processing callback
      const onChunk = (pcm: Int16Array) => {
        if (!isActiveRef.current || !asrServiceRef.current) return;

        // Check if TTS is playing - if so, don't send audio to ASR
        const isTTSPlaying = useTTSPlaybackState.getState().isTTSPlaying;
        
        // Send audio to ASR service only if TTS is not playing
        if (asrServiceRef.current.isConnected() && !isTTSPlaying) {
          // Ensure we're sending the correct buffer slice
          const bufferToSend = pcm.buffer.slice(pcm.byteOffset, pcm.byteOffset + pcm.byteLength);
          asrServiceRef.current.sendAudio(bufferToSend);
        } else if (isTTSPlaying && frameCount.current % (METER_EVERY_N_FRAMES * 10) === 0) {
          // Log occasionally when audio is blocked due to TTS
          console.log('[useWalkieV3] Audio not sent - TTS is playing');
        }

        // Update level meter (always update to show mic is working)
        if (frameCount.current % METER_EVERY_N_FRAMES === 0) {
          const newLevel = calculateRMS(pcm);
          setState(prevState => ({ ...prevState, level: newLevel }));
        }
        frameCount.current += 1;
      };

      // Start recording
      await recorder.start(onChunk);
      
      setState(prevState => ({ 
        ...prevState, 
        isStreaming: true, 
        status: 'active', 
        level: 0 
      }));

      const elapsedTime = performance.now() - startTime;
      console.log(`[useWalkieV3] Streaming started successfully in ${elapsedTime.toFixed(2)}ms`);

    } catch (error: any) {
      await failAndCleanup(
        error instanceof Error ? error : new Error(String(error)),
        'starting stream'
      );
    }
  }, [wsHost, mode, recorderConfig, handleTranscript, failAndCleanup, handleConnectionChange, cleanupResources, state.status]);

  const stop = useCallback(async () => {
    console.log('[useWalkieV3] Stopping stream...');
    await cleanupResources();
    setState(prevState => ({
      ...prevState,
      isStreaming: false,
      status: 'idle',
      level: 0
    }));
  }, [cleanupResources]);

  const resetError = useCallback(async () => {
    console.log('[useWalkieV3] Resetting error state...');
    await cleanupResources().catch(e =>
      console.error('[useWalkieV3] Cleanup during resetError:', e)
    );
    setState({ isStreaming: false, level: 0, status: 'idle', errorMessage: null });
  }, [cleanupResources]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupResources().catch(e => console.error('[useWalkieV3] Cleanup error on unmount:', e));
    };
  }, [cleanupResources]);

  // Health monitoring for walkie mode
  useEffect(() => {
    let healthCheckInterval: NodeJS.Timeout | null = null;
    
    if (state.status === 'active' && mode === 'walkie' && asrServiceRef.current) {
      let consecutiveFailures = 0;
      
      healthCheckInterval = setInterval(() => {
        if (asrServiceRef.current && !asrServiceRef.current.isConnected()) {
          consecutiveFailures++;
          console.warn(`[useWalkieV3] ASR connection check failed (${consecutiveFailures}/5)`);
          
          // After 5 consecutive failures (10 seconds), trigger error
          if (consecutiveFailures >= 5) {
            console.error('[useWalkieV3] ASR connection persistently lost');
            failAndCleanup(
              new Error('ASR connection lost and could not be recovered'),
              'health check'
            );
          }
        } else {
          if (consecutiveFailures > 0) {
            console.log('[useWalkieV3] ASR connection recovered');
          }
          consecutiveFailures = 0;
        }
      }, 2000); // Check every 2 seconds
    }
    
    return () => {
      if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
      }
    };
  }, [state.status, mode, failAndCleanup]);

  return { state, start, stop, resetError };
}