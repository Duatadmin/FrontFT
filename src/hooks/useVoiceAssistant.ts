import { useState, useRef, useCallback, useEffect } from 'react';

// Voice Assistant API endpoints
const VOICE_API_BASE = 'https://ftvoiceservice-production.up.railway.app';
const ASR_WEBSOCKET_URL = `${VOICE_API_BASE}/v1/asr/ws`;
const TTS_URL = `${VOICE_API_BASE}/v1/tts`;
const TTS_STOP_URL = `${VOICE_API_BASE}/v1/tts/stop`;

// Audio Configuration 
const AUDIO_CONFIG = {
  sampleRate: 16000,
  channelCount: 1
};

export type VoiceMode = 'ptt' | 'walkie';

interface VoiceAssistantState {
  isListening: boolean;
  mode: VoiceMode;
  transcript: string;
  isProcessing: boolean;
  error: string | null;
  isTtsPlaying: boolean;
}

interface UseVoiceAssistantOptions {
  onTranscriptComplete?: (transcript: string) => void;
  onTtsPlaybackStart?: () => void;
  onTtsPlaybackEnd?: () => void;
  vadSensitivity?: number; // 0-1, for Voice Activity Detection in walkie mode
  initialMode?: VoiceMode;
}

export default function useVoiceAssistant({
  onTranscriptComplete,
  onTtsPlaybackStart,
  onTtsPlaybackEnd,
  vadSensitivity = 0.7,
  initialMode = 'ptt'
}: UseVoiceAssistantOptions = {}) {
  // State management
  const [state, setState] = useState<VoiceAssistantState>({
    isListening: false,
    mode: initialMode,
    transcript: '',
    isProcessing: false,
    error: null,
    isTtsPlaying: false
  });

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioDataRef = useRef<Uint8Array | null>(null);
  const currentRequestIdRef = useRef<string | null>(null);
  const vadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Initialize the audio element for TTS playback
  useEffect(() => {
    if (!audioElementRef.current) {
      const audioEl = new Audio();
      audioEl.addEventListener('play', () => {
        setState(prev => ({ ...prev, isTtsPlaying: true }));
        onTtsPlaybackStart?.();
      });
      audioEl.addEventListener('ended', () => {
        setState(prev => ({ ...prev, isTtsPlaying: false }));
        onTtsPlaybackEnd?.();
      });
      audioEl.addEventListener('pause', () => {
        setState(prev => ({ ...prev, isTtsPlaying: false }));
      });
      audioElementRef.current = audioEl;
    }

    return () => {
      const audioEl = audioElementRef.current;
      if (audioEl) {
        audioEl.pause();
        audioEl.src = '';
        audioEl.removeEventListener('play', () => {});
        audioEl.removeEventListener('ended', () => {});
        audioEl.removeEventListener('pause', () => {});
      }
    };
  }, [onTtsPlaybackStart, onTtsPlaybackEnd]);

  // Initialize WebSocket connection and media devices
  const init = useCallback(async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup Audio Context for visualization and analysis
      const audioContext = new AudioContext({ sampleRate: AUDIO_CONFIG.sampleRate });
      audioContextRef.current = audioContext;
      
      // Create analyzer for visualization and VAD
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current = analyser;
      audioDataRef.current = dataArray;

      // Connect stream to analyzer
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      return true;
    } catch (error) {
      console.error('Failed to initialize voice assistant:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to access microphone'
      }));
      return false;
    }
  }, []);

  // Setup WebSocket connection
  const setupWebSocket = useCallback(() => {
    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Create new WebSocket connection
    const ws = new WebSocket(ASR_WEBSOCKET_URL);
    
    ws.onopen = () => {
      console.log('[WS] WebSocket connection established, readyState:', ws.readyState);
    };
    
    ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        
        // Handle interim transcripts (during speech)
        if (response.type === 'partial_transcript') {
          setState(prev => ({ ...prev, transcript: response.text }));
        } 
        // Handle final transcript (after speech ends)
        else if (response.type === 'final_transcript') {
          const finalTranscript = response.text.trim();
          setState(prev => ({ 
            ...prev, 
            transcript: finalTranscript,
            isProcessing: false
          }));
          
          if (finalTranscript && onTranscriptComplete) {
            onTranscriptComplete(finalTranscript);
          }
          
          // Auto-play TTS response if provided
          if (response.audio_url) {
            playTtsResponse(response.audio_url, response.request_id);
          }
        }
        // Handle error messages
        else if (response.type === 'error') {
          setState(prev => ({ ...prev, error: response.message }));
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setState(prev => ({ ...prev, error: 'Connection error. Please try again.' }));
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
      if (state.isListening) {
        // If we were actively listening, stop listening
        stopListening();
      }
    };
    
    wsRef.current = ws;
  }, [onTranscriptComplete, state.isListening]);

  // Start recording and sending audio
  const startListening = useCallback(async () => {
    // Initialize if not already done
    if (!audioContextRef.current || !streamRef.current) {
      console.log('[VOICE] Initializing audio context and requesting microphone permissions...');
      const initialized = await init();
      if (!initialized) {
        console.error('[VOICE] Failed to initialize audio context or get microphone permissions');
        return;
      }
      console.log('[VOICE] Successfully initialized audio context and got microphone permissions');
    }
    
    // Setup WebSocket if needed
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setupWebSocket();
    }
    
    // Start recording
    try {
      // Reset transcript
      setState(prev => ({ 
        ...prev, 
        isListening: true, 
        transcript: '',
        error: null 
      }));
      
      // Create a MediaRecorder to capture audio
      const mediaRecorder = new MediaRecorder(streamRef.current!, {
        mimeType: 'audio/webm' // Most compatible format
      });
      
      // Send audio data chunks to server via WebSocket
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          // Convert Blob to ArrayBuffer before sending
          event.data.arrayBuffer().then((buffer) => {
            wsRef.current?.send(buffer);
            console.log('[WS] Sent audio chunk of size:', buffer.byteLength);
          }).catch(error => {
            console.error('[WS] Error converting audio chunk to ArrayBuffer:', error);
          });
        } else {
          if (event.data.size === 0) {
            console.warn('[WS] Received empty audio chunk, not sending');
          }
          if (wsRef.current?.readyState !== WebSocket.OPEN) {
            console.warn('[WS] WebSocket not open, current state:', wsRef.current?.readyState);
          }
        }
      };
      
      // Handle recording stop event
      mediaRecorder.onstop = () => {
        // Send the end_of_stream message to properly close the stream
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "end_of_stream" }));
          console.log('[WS] ✅ Sent end_of_stream to Deepgram');
        } else {
          console.warn('[WS] 🛑 Could not send end_of_stream, WebSocket state:', wsRef.current?.readyState);
        }
      };
      
      // Set small timeslice for low-latency streaming (100ms chunks)
      mediaRecorder.start(100);
      mediaRecorderRef.current = mediaRecorder;
      console.log('[VOICE] MediaRecorder started with 100ms chunks, state:', mediaRecorder.state);
      
      // For walkie-talkie mode, setup Voice Activity Detection
      if (state.mode === 'walkie') {
        setupVoiceActivityDetection(vadSensitivity);
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      setState(prev => ({ 
        ...prev, 
        isListening: false,
        error: error instanceof Error ? error.message : 'Failed to start recording' 
      }));
    }
  }, [init, setupWebSocket, state.mode, vadSensitivity]);

  // Stop recording and finalize transcript
  const stopListening = useCallback(() => {
    // Stop MediaRecorder if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      console.log('[VOICE] MediaRecorder stopped');
    }
    
    // Clear VAD timeout if active
    if (vadTimeoutRef.current) {
      clearTimeout(vadTimeoutRef.current);
      vadTimeoutRef.current = null;
    }
    
    // Send end_of_stream signal required by Deepgram
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Send the required end_of_stream message
      // Note: we've removed end_of_speech to avoid confusion
      wsRef.current.send(JSON.stringify({ type: 'end_of_stream' }));
      console.log('[WS] ✅ Sent end_of_stream to Deepgram');
      
      // Important: Don't close the WebSocket yet - we need to wait for the transcript response
      console.log('[WS] Keeping WebSocket open to receive transcript...');
    } else {
      console.warn('[WS] 🛑 Could not send end_of_stream, WebSocket state:', wsRef.current?.readyState);
    }
    
    // Update state
    setState(prev => ({ 
      ...prev, 
      isListening: false,
      isProcessing: true // Still processing the final transcript
    }));
  }, []);

  // Play TTS response
  const playTtsResponse = useCallback((audioUrl: string, requestId: string) => {
    if (!audioElementRef.current) return;
    
    // Store current request ID
    currentRequestIdRef.current = requestId;
    
    // Set audio source and play
    audioElementRef.current.src = audioUrl;
    audioElementRef.current.play().catch(error => {
      console.error('Failed to play TTS response:', error);
    });
  }, []);

  // Stop TTS playback (used for barge-in)
  const stopTtsPlayback = useCallback(async () => {
    // Pause audio element
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    
    // Send stop request to server with current request ID
    if (currentRequestIdRef.current) {
      try {
        await fetch(`${TTS_STOP_URL}?request_id=${currentRequestIdRef.current}`, {
          method: 'POST'
        });
      } catch (error) {
        console.error('Failed to stop TTS playback:', error);
      }
      
      // Clear current request ID
      currentRequestIdRef.current = null;
    }
    
    setState(prev => ({ ...prev, isTtsPlaying: false }));
  }, []);

  // Barge-in function: stop TTS and start listening
  const bargeIn = useCallback(async () => {
    // Stop TTS playback if active
    if (state.isTtsPlaying) {
      await stopTtsPlayback();
    }
    
    // Start listening
    startListening();
  }, [state.isTtsPlaying, stopTtsPlayback, startListening]);

  // Set mode (PTT or Walkie-Talkie)
  const setMode = useCallback((newMode: VoiceMode) => {
    // Stop listening when changing modes
    if (state.isListening) {
      stopListening();
    }
    
    setState(prev => ({ ...prev, mode: newMode }));
  }, [state.isListening, stopListening]);

  // Toggle walkie-talkie mode on/off
  const toggleWalkieMode = useCallback(() => {
    const isCurrentlyInWalkieMode = state.mode === 'walkie';
    
    // If currently in walkie mode, stop listening and switch to PTT
    if (isCurrentlyInWalkieMode) {
      if (state.isListening) {
        stopListening();
      }
      setMode('ptt');
    } 
    // Otherwise, switch to walkie mode and start listening
    else {
      setMode('walkie');
      startListening();
    }
  }, [state.mode, state.isListening, stopListening, setMode, startListening]);

  // Voice Activity Detection for walkie-talkie mode
  const setupVoiceActivityDetection = useCallback((sensitivity: number) => {
    if (!analyserRef.current || !audioDataRef.current) return;
    
    // Function to detect audio levels and determine if speech is present
    const checkAudioLevel = () => {
      // Get audio data
      analyserRef.current!.getByteTimeDomainData(audioDataRef.current!);
      
      // Calculate RMS (root mean square) to determine audio level
      let sum = 0;
      for (let i = 0; i < audioDataRef.current!.length; i++) {
        // Convert to signed value (-128 to 127)
        const signedValue = audioDataRef.current![i] - 128;
        sum += signedValue * signedValue;
      }
      const rms = Math.sqrt(sum / audioDataRef.current!.length);
      
      // Normalize to 0-1
      const normalizedRms = rms / 128;
      
      // Debug audio levels
      // console.log('Audio level:', normalizedRms);
      
      // Low audio level detected
      if (normalizedRms < sensitivity * 0.1) {
        // Add a delay before stopping to avoid cutting off speech
        if (!vadTimeoutRef.current && state.isListening) {
          vadTimeoutRef.current = setTimeout(() => {
            // Double-check we're still below threshold
            analyserRef.current!.getByteTimeDomainData(audioDataRef.current!);
            sum = 0;
            for (let i = 0; i < audioDataRef.current!.length; i++) {
              const signedValue = audioDataRef.current![i] - 128;
              sum += signedValue * signedValue;
            }
            const finalRms = Math.sqrt(sum / audioDataRef.current!.length) / 128;
            
            // Only stop if still below threshold
            if (finalRms < sensitivity * 0.1) {
              stopListening();
            }
            
            vadTimeoutRef.current = null;
          }, 1500); // 1.5s of silence before stopping
        }
      } 
      // Audio detected, clear timeout
      else if (vadTimeoutRef.current) {
        clearTimeout(vadTimeoutRef.current);
        vadTimeoutRef.current = null;
      }
      
      // Continue checking if in walkie mode and listening
      if (state.mode === 'walkie' && state.isListening) {
        requestAnimationFrame(checkAudioLevel);
      }
    };
    
    // Start checking audio levels
    checkAudioLevel();
  }, [state.mode, state.isListening, stopListening]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Stop media tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Close WebSocket
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      // Close AudioContext
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      // Stop MediaRecorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      
      // Clear VAD timeout
      if (vadTimeoutRef.current) {
        clearTimeout(vadTimeoutRef.current);
      }
    };
  }, []);

  // Get audio visualization data for custom visualizer components
  const getVisualizationData = useCallback(() => {
    if (!analyserRef.current || !audioDataRef.current) return null;
    
    analyserRef.current.getByteTimeDomainData(audioDataRef.current);
    return audioDataRef.current;
  }, []);

  // Return the hook API
  return {
    // State
    isListening: state.isListening,
    transcript: state.transcript,
    mode: state.mode,
    isProcessing: state.isProcessing,
    error: state.error,
    isTtsPlaying: state.isTtsPlaying,
    
    // Methods
    init,
    startListening,
    stopListening,
    bargeIn,
    setMode,
    toggleWalkieMode,
    getVisualizationData
  };
}
