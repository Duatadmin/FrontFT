// src/hooks/useWalkie.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import { WalkieWS, WalkieWSOptions, WalkieMessage } from '../services/WalkieWS'; // Verify path, added WalkieMessage
import { createRecorder, RecorderHandle, CreateRecorderOptions } from '../lib/sepiaRecorder'; // Verify path, added CreateRecorderOptions

const METER_EVERY_N_FRAMES = 4;
const CHUNK_MS = 30; // Define CHUNK_MS if it's used for recorder config implicitly

export interface WalkieState {
  isStreaming: boolean;
  level: number; // 0-1 RMS meter
  status: 'idle' | 'connecting' | 'active' | 'error';
  errorMessage?: string | null;
}

export interface UseWalkieOptions {
  wsUrl: string; // e.g., 'ws://localhost:8080/ws' or 'wss://your-prod-url/ws'
  recorderConfig?: Partial<CreateRecorderOptions>; // To override default recorder settings
  onVadStatusChange?: (isSpeaking: boolean) => void;
  onTranscription?: (transcription: { text: string; final: boolean; type: string }) => void;
  onError?: (error: Error) => void;
}

export function useWalkie(options: UseWalkieOptions): {
  state: WalkieState;
  start(sessionId: string): Promise<void>;
  stop(): Promise<void>;
} {
  const { wsUrl, recorderConfig, onVadStatusChange, onTranscription, onError } = options;

  const [state, setState] = useState<WalkieState>({
    isStreaming: false,
    level: 0,
    status: 'idle',
    errorMessage: null,
  });

  const micLocked = useRef<boolean>(false);
  const frameCount = useRef<number>(0);
  // sidRef is now passed to start method, so not needed as a ref here for that purpose.
  const walkieWSInstanceRef = useRef<WalkieWS | null>(null);
  const recorderInstanceRef = useRef<RecorderHandle | null>(null);
  const currentSessionIdRef = useRef<string | null>(null);

  const handleInternalError = useCallback((error: Error, context: string) => {
    console.error(`Error ${context}:`, error);
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

  const handleWalkieWSMessage = useCallback((message: WalkieMessage, channel: 'audio' | 'ctrl') => {
    // Assuming WalkieMessage is a more specific type like: 
    // { type: 'transcription', text: string, final: boolean } | { type: 'vad_status', speaking: boolean } | { cmd: 'mute' | 'unmute' }
    if (typeof message === 'object' && message !== null) {
      if (channel === 'audio') {
        // Messages from audio channel are expected to be transcripts: {text: string, final: boolean}
        if ('text' in message && typeof message.text === 'string' && 'final' in message && typeof message.final === 'boolean') {
          const transcriptMessage = {
            text: message.text,
            final: message.final,
            type: 'transcription' // Add type for consistent handling by onTranscription callback
          };
          console.log('[useWalkie] Processing AUDIO channel transcript:', transcriptMessage);
          if (onTranscription) {
            onTranscription(transcriptMessage);
          }
          if (transcriptMessage.final) {
            console.log('[useWalkie] Final transcript received, unmuting mic.');
            micLocked.current = false;
          }
        } else {
          console.warn('[useWalkie] Received unexpected message on AUDIO channel:', message);
        }
      } else if (channel === 'ctrl') {
        // Messages from control channel
        if ('cmd' in message && message.cmd === 'mute') {
          console.log('[useWalkie] Processing CTRL channel MUTE command:', message);
          micLocked.current = true;
        } else if ('cmd' in message && message.cmd === 'unmute') {
          console.log('[useWalkie] Processing CTRL channel UNMUTE command:', message);
          micLocked.current = false;
        } else if ('type' in message && message.type === 'vad_status' && onVadStatusChange) {
          console.log('[useWalkie] Processing CTRL channel VAD status:', message);
          onVadStatusChange((message as { speaking: boolean; type: 'vad_status' }).speaking);
        } else {
          console.warn('[useWalkie] Received unexpected message on CTRL channel:', message);
        }
      }
    }
  }, [onTranscription, onVadStatusChange]);

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
    if (recorderInstanceRef.current) {
      try {
        await recorderInstanceRef.current.stop(); // ensure stop is called before close if necessary
        recorderInstanceRef.current.close();
      } catch (e:any) {
        handleInternalError(e instanceof Error ? e : new Error(String(e)), 'closing recorder');
      }
      recorderInstanceRef.current = null;
    }
    if (walkieWSInstanceRef.current) {
      try {
        await walkieWSInstanceRef.current.close();
      } catch (e:any) {
        handleInternalError(e instanceof Error ? e : new Error(String(e)), 'closing WebSocket');
      }
      walkieWSInstanceRef.current = null;
    }
    currentSessionIdRef.current = null;
  }, [handleInternalError]);

  const start = useCallback(async (sessionId: string) => {
    if (state.status === 'connecting' || state.status === 'active') {
      console.warn('Streaming already in progress or connecting. Call stop() first.');
      return;
    }

    setState(prevState => ({ ...prevState, status: 'connecting', errorMessage: null, isStreaming: false, level: 0 }));
    currentSessionIdRef.current = sessionId;
    micLocked.current = false;
    frameCount.current = 0;

    try {
      let effectiveHost = wsUrl;
      if (effectiveHost.includes('://')) {
        try {
          effectiveHost = new URL(effectiveHost).host; // .host includes hostname and port
        } catch (e) {
          console.error(`Failed to parse wsUrl '${wsUrl}' even with a scheme. Using as is. Error: ${e}`);
          // Keep effectiveHost as wsUrl if parsing fails unexpectedly (e.g. malformed scheme part)
        }
      } 
      // At this point, effectiveHost should be 'hostname' or 'hostname:port'
      // WalkieWS will prepend 'wss://'

      const wsOptions: WalkieWSOptions = {
        sid: sessionId,
        host: effectiveHost, 
        onMessage: handleWalkieWSMessage,
        onError: (err) => {
          if (err instanceof Error) {
            handleInternalError(err, 'WebSocket connection');
          } else {
            // Convert Event to Error
            handleInternalError(new Error(`WebSocket connection event: ${JSON.stringify(err)}`), 'WebSocket connection');
          }
        },
      };
      const ws = new WalkieWS(wsOptions);
      walkieWSInstanceRef.current = ws;
      await ws.connect();

      const recConfig: CreateRecorderOptions = {
        targetSampleRate: 16000, // Default
        mono: true,             // Default
        ...(recorderConfig || {}),
        onError: (err: any) => { // Explicitly type err as any or unknown as per CreateRecorderOptions
          if (err instanceof Error) {
            handleInternalError(err, 'recorder initialization');
          } else {
            handleInternalError(new Error(String(err || 'Unknown recorder error')), 'recorder initialization');
          }
        },
      };
      const recorder = await createRecorder(recConfig);
      recorderInstanceRef.current = recorder;

      const onChunk = (pcm: Int16Array) => {
        if (walkieWSInstanceRef.current && walkieWSInstanceRef.current.isConnected()) {
          if (!micLocked.current) {
            // Ensure we are sending a slice of the buffer if pcm is a view
            const bufferToSend = pcm.buffer.slice(pcm.byteOffset, pcm.byteOffset + pcm.byteLength);
            walkieWSInstanceRef.current.sendFrame(bufferToSend);
          }
        }

        if (frameCount.current % METER_EVERY_N_FRAMES === 0) {
          const newLevel = calculateRMS(pcm);
          setState(prevState => ({ ...prevState, level: newLevel }));
        }
        frameCount.current += 1;
      };

      await recorder.start(onChunk);
      setState(prevState => ({ ...prevState, isStreaming: true, status: 'active', level: 0 }));

    } catch (error: any) {
      handleInternalError(error instanceof Error ? error : new Error(String(error)), 'starting walkie');
      await cleanupResources(); // Ensure cleanup on error
      // State is already set to 'error' by handleInternalError
    }
  }, [wsUrl, recorderConfig, handleWalkieWSMessage, cleanupResources, handleInternalError, state.status]);

  const stop = useCallback(async () => {
    await cleanupResources();
    setState(prevState => ({ ...prevState, isStreaming: false, status: 'idle', level: 0 }));
  }, [cleanupResources]);

  useEffect(() => {
    // This effect handles cleanup when the component unmounts.
    return () => {
      // Perform cleanup by calling the memoized cleanup function.
      // No need to await here as it's unmount phase.
      cleanupResources().then(() => {
         console.log('useWalkie unmounted, resources cleaned up.');
      }).catch(e => console.error('Error during unmount cleanup:', e));
      // Reset state on unmount to ensure clean state if re-mounted, though usually not necessary
      // setState({ isStreaming: false, level: 0, status: 'idle', errorMessage: null });
    };
  }, [cleanupResources]); // Ensure cleanupResources is stable or correctly listed

  return { state, start, stop };
}