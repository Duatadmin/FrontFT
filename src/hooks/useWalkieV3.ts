// src/hooks/useWalkieV3.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import { ASRServiceV3, ASRTranscriptMessage } from '../services/ASRServiceV3';
import { createRecorder, RecorderHandle, CreateRecorderOptions } from '../lib/sepiaRecorder';
import { useIsTTSPlaying } from './useTTSPlaybackState';
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

  // Ensure microphone permission
  const ensureMicrophonePermission = async (): Promise<void> => {
    try {
      const status = await (navigator.permissions as any).query({ name: 'microphone' });
      if (status.state === 'granted') {
        return;
      }
    } catch {
      // Permissions API might not be available
    }
    
    // Request permission
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
  };

  const start = useCallback(async () => {
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
        onError: (error) => handleInternalError(error, 'ASR service'),
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
      
      const recConfig: CreateRecorderOptions = {
        targetSampleRate: 16000,
        mono: true,
        ...(recorderConfig || {}),
        audioConstraints: audioConstraints.audio as MediaTrackConstraints,
        onError: (err: any) => {
          handleInternalError(
            err instanceof Error ? err : new Error(String(err || 'Unknown recorder error')), 
            'recorder'
          );
        },
      };
      
      const recorder = await createRecorder(recConfig);
      recorderInstanceRef.current = recorder;

      // Audio processing callback
      const onChunk = (pcm: Int16Array) => {
        if (!isActiveRef.current || !asrServiceRef.current) return;

        // Check if TTS is playing - if so, don't send audio to ASR
        const isTTSPlaying = useIsTTSPlaying.getState();
        
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

      console.log('[useWalkieV3] Streaming started successfully');

    } catch (error: any) {
      handleInternalError(
        error instanceof Error ? error : new Error(String(error)), 
        'starting stream'
      );
      await cleanupResources();
    }
  }, [wsHost, mode, recorderConfig, handleTranscript, handleInternalError, handleConnectionChange, cleanupResources, state.status]);

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
            handleInternalError(
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
  }, [state.status, mode, handleInternalError]);

  return { state, start, stop };
}