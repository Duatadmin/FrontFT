import { useState, useRef, useCallback, useEffect } from 'react';

// Voice Assistant API endpoints
const VOICE_API_BASE = 'https://ftvoiceservice-production.up.railway.app';
const ASR_WEBSOCKET_URL = `${VOICE_API_BASE}/v1/asr/ws`;
const TTS_URL = `${VOICE_API_BASE}/v1/tts`;
const TTS_STOP_URL = `${VOICE_API_BASE}/v1/tts/stop`;

// Audio Configuration - Deepgram requires 16kHz mono
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
  isBusy: boolean; // Prevents multiple concurrent sessions
}

interface UseVoiceAssistantOptions {
  onTranscriptComplete?: (transcript: string) => void;
  onTtsPlaybackStart?: () => void;
  onTtsPlaybackEnd?: () => void;
  vadSensitivity?: number; // 0-1, for Voice Activity Detection in walkie mode
  initialMode?: VoiceMode;
  
  // Auto-send transcripts to chat
  autoSendToChat?: boolean;
  setChatInputText?: (text: string) => void;
  sendChatMessage?: (text: string) => void;
}

export default function useVoiceAssistant({
  onTranscriptComplete,
  onTtsPlaybackStart,
  onTtsPlaybackEnd,
  vadSensitivity = 0.7,
  initialMode = 'ptt',
  autoSendToChat = false,
  setChatInputText,
  sendChatMessage
}: UseVoiceAssistantOptions = {}) {
  // State management
  const [state, setState] = useState<VoiceAssistantState>({
    isListening: false,
    mode: initialMode,
    transcript: '',
    isProcessing: false,
    error: null,
    isTtsPlaying: false,
    isBusy: false
  });

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const streamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioDataRef = useRef<Uint8Array | null>(null);
  const currentRequestIdRef = useRef<string | null>(null);
  const vadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const busyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const micActivationSoundRef = useRef<HTMLAudioElement | null>(null);
  const streamEndedRef = useRef<boolean>(false);
  const isAudioWorkletLoadedRef = useRef<boolean>(false);

  // Initialize the audio elements for TTS playback and mic activation sound
  useEffect(() => {
    // Initialize mic activation sound
    if (!micActivationSoundRef.current) {
      const activationSound = new Audio('/sounds/mic-activation.mp3');
      activationSound.volume = 0.5;
      activationSound.preload = 'auto';
      micActivationSoundRef.current = activationSound;
    }
    
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

  // Cleanup function for audio resources
  const cleanupAudio = useCallback(() => {
    // Disconnect and clean up the AudioWorkletNode
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.disconnect();
      audioWorkletNodeRef.current.port.onmessage = null;
      audioWorkletNodeRef.current = null;
    }
    
    // Note: we don't disconnect the source or close the context here
    // because we might want to reuse them for the next recording session
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
          
          // Clear the busy timeout as we've received a response
          if (busyTimeoutRef.current) {
            clearTimeout(busyTimeoutRef.current);
            busyTimeoutRef.current = null;
          }
          
          setState(prev => ({ 
            ...prev, 
            transcript: finalTranscript,
            isProcessing: false,
            isBusy: false // Release busy lock after receiving transcript
          }));
          
          console.log('[VOICE] ✅ Received final transcript, releasing busy state');
          
          if (finalTranscript) {
            // Call the original transcript complete callback if provided
            if (onTranscriptComplete) {
              onTranscriptComplete(finalTranscript);
            }
            
            // Auto-send to chat if enabled and functions are provided
            if (autoSendToChat && finalTranscript.trim() && setChatInputText && sendChatMessage) {
              console.log('[VOICE] 🚀 Auto-sending transcript to chat:', finalTranscript);
              
              // Set the transcript in the chat input
              setChatInputText(finalTranscript);
              
              // Trigger the send action
              sendChatMessage(finalTranscript);
            }
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
      
      // Also ensure busy state is released if WebSocket closes
      if (state.isBusy) {
        console.log('[VOICE] WebSocket closed, releasing busy state');
        setState(prev => ({ ...prev, isBusy: false }));
        
        // Clear busy timeout if it exists
        if (busyTimeoutRef.current) {
          clearTimeout(busyTimeoutRef.current);
          busyTimeoutRef.current = null;
        }
      }
    };
    
    wsRef.current = ws;
  }, []);
  
  // Initialize audio context and microphone
  const init = useCallback(async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: AUDIO_CONFIG.channelCount,
          sampleRate: AUDIO_CONFIG.sampleRate,
        } 
      });
      streamRef.current = stream;

      // Setup Audio Context for processing
      const audioContext = new AudioContext({ 
        latencyHint: 'interactive', 
        sampleRate: AUDIO_CONFIG.sampleRate 
      });
      audioContextRef.current = audioContext;
      
      // Create analyzer for visualization and VAD
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current = analyser;
      audioDataRef.current = dataArray;
      
      // Load the PCM processor worklet if not already loaded
      if (!isAudioWorkletLoadedRef.current) {
        try {
          await audioContext.audioWorklet.addModule('/pcm-processor.js');
          isAudioWorkletLoadedRef.current = true;
          console.log('[VOICE] PCM processor worklet loaded successfully');
        } catch (error) {
          console.error('[VOICE] Failed to load PCM processor worklet:', error);
          throw new Error('Failed to load audio processing module');
        }
      }
      
      return true;
    } catch (error) {
      console.error('[VOICE] Failed to initialize voice assistant:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to access microphone'
      }));
      return false;
    }
  }, []);

  /**
   * Helper function to send silence and end_of_stream message
   * Sends 1 second of silence followed by the end_of_stream message to help Deepgram detect the end of speech
   */
  const sendEndOfStreamWithSilence = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // 1 second of silence at 16kHz, mono, 16-bit PCM (Int16)
      const silenceSamples = 16000; // 1s × 16kHz
      const silence = new Int16Array(silenceSamples); // All zeros = silence
      
      // Send 1 second of silent audio
      wsRef.current.send(silence.buffer);
      console.log('[WS] 🔇 Sent 1 second of silence to Deepgram');

      // Wait 100ms (safety delay), then close the stream
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          // Send the required end_of_stream message that Deepgram expects
          wsRef.current.send(JSON.stringify({ type: 'end_of_stream' }));
          console.log('[WS] ✅ Sent end_of_stream to Deepgram');
          
          // Important: Don't close the WebSocket yet - we need to wait for the transcript response
          console.log('[WS] Keeping WebSocket open to receive transcript...');
        } else {
          console.warn('[WS] 🛑 Could not send end_of_stream, WebSocket state:', wsRef.current?.readyState);
        }
      }, 100);
    } else {
      console.warn('[WS] 🛑 Could not send silence buffer, WebSocket state:', wsRef.current?.readyState);
    }
  }, []);

  // Handle silence detection for walkie-talkie mode
  const handleSilenceDetection = useCallback((audioLevel: number) => {
    const silenceThreshold = 0.01; // Adjust based on testing
    
    if (audioLevel < silenceThreshold) {
      // If we're not already tracking silence, start a timer
      if (!vadTimeoutRef.current) {
        vadTimeoutRef.current = setTimeout(() => {
          // Check if we're still listening
          if (state.isListening && state.mode === 'walkie') {
            console.log('[VOICE] Silence detected for 1.5s, stopping recording automatically');
            stopListening();
          }
          vadTimeoutRef.current = null;
        }, 1500); // 1.5 seconds of silence
      }
    } else {
      // Cancel the silence timer if we hear something
      if (vadTimeoutRef.current) {
        clearTimeout(vadTimeoutRef.current);
        vadTimeoutRef.current = null;
      }
    }
  }, []);

  // Start recording and sending audio
  const startListening = useCallback(async () => {
    // Check if a session is already active and reject if busy
    if (state.isBusy) {
      console.warn('[VOICE] 🛑 Cannot start new session - voice system is busy');
      return;
    }
    
    // Set busy state immediately to prevent multiple calls
    setState(prev => ({ ...prev, isBusy: true }));
    
    // Play mic activation sound
    try {
      if (micActivationSoundRef.current) {
        await micActivationSoundRef.current.play();
        console.log('[VOICE] 🔊 Played mic activation sound');
      }
    } catch (error) {
      console.warn('[VOICE] Could not play mic activation sound:', error);
    }
    
    // Reset stream ended flag
    streamEndedRef.current = false;
    
    // Set a timeout to automatically clear busy state in case of hanging
    if (busyTimeoutRef.current) {
      clearTimeout(busyTimeoutRef.current);
    }
    busyTimeoutRef.current = setTimeout(() => {
      console.warn('[VOICE] ⚠️ Busy state timeout reached (10s), resetting state');
      setState(prev => ({ ...prev, isBusy: false }));
    }, 10000); // 10 second timeout
    
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
      
      const audioContext = audioContextRef.current!;
      
      // Create media stream source if needed
      if (!streamSourceRef.current && streamRef.current) {
        const source = audioContext.createMediaStreamSource(streamRef.current);
        streamSourceRef.current = source;
        
        // Connect to analyzer for visualization
        source.connect(analyserRef.current!);
      }
      
      // Create and connect the AudioWorkletNode for PCM processing
      const workletNode = new AudioWorkletNode(audioContext, 'pcm-processor');
      audioWorkletNodeRef.current = workletNode;
      
      // Handle messages from the audio processor
      workletNode.port.onmessage = (event) => {
        // Skip if stream has ended
        if (streamEndedRef.current) {
          return;
        }
        
        const { audioData, audioLevel, isSilent } = event.data;
        
        // Send audio data to WebSocket if connection is open
        if (wsRef.current?.readyState === WebSocket.OPEN && !streamEndedRef.current) {
          wsRef.current.send(audioData);
          console.log('[WS] Sent audio chunk as PCM Int16. Level:', audioLevel.toFixed(4));
          
          // For walkie-talkie mode, use audio level for VAD
          if (state.mode === 'walkie' && isSilent) {
            handleSilenceDetection(audioLevel);
          }
        }
      };
      
      // Connect the processing chain: mediaStream -> workletNode
      streamSourceRef.current.connect(workletNode);
      
      console.log('[VOICE] AudioWorklet started, streaming PCM audio data');
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      setState(prev => ({ 
        ...prev, 
        isListening: false,
        isBusy: false, // Release busy state on error
        error: error instanceof Error ? error.message : 'Failed to start recording' 
      }));
      
      // Clean up resources
      cleanupAudio();
      
      // Clear busy timeout on error
      if (busyTimeoutRef.current) {
        clearTimeout(busyTimeoutRef.current);
        busyTimeoutRef.current = null;
      }
    }
  }, [init, setupWebSocket, state.isBusy, state.mode, handleSilenceDetection, cleanupAudio]);

  // Stop recording and finalize transcript
  const stopListening = useCallback(() => {
    // Disconnect the audio worklet node
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.disconnect();
      audioWorkletNodeRef.current.port.onmessage = null;
      audioWorkletNodeRef.current = null;
      console.log('[VOICE] Disconnected AudioWorklet node');
    }
    
    // Clear VAD timeout if active
    if (vadTimeoutRef.current) {
      clearTimeout(vadTimeoutRef.current);
      vadTimeoutRef.current = null;
    }
    
    // Mark stream as ended to prevent any more audio chunks from being sent
    streamEndedRef.current = true;
    console.log('[WS] Marked stream as ended in stopListening()');
    
    // Send silence and end_of_stream signal required by Deepgram
    sendEndOfStreamWithSilence();
    
    // Update state
    setState(prev => ({ 
      ...prev, 
      isListening: false,
      isProcessing: true // Still processing the final transcript
    }));
  }, [sendEndOfStreamWithSilence]);

  // Play TTS response
  const playTtsResponse = useCallback((audioUrl: string, requestId: string) => {
    if (!audioElementRef.current) return;
    
    // Store current request ID
    currentRequestIdRef.current = requestId;
    
    // Set audio source and play
    audioElementRef.current.src = audioUrl;
    audioElementRef.current.play()
      .catch(error => console.error('Failed to play TTS response:', error));
  }, []);

  // Stop TTS playback
  const stopTts = useCallback(async () => {
    // Stop audio playback
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = '';
    }
    
    // Send stop request to server if we have a current request ID
    if (currentRequestIdRef.current) {
      try {
        await fetch(`${TTS_STOP_URL}?request_id=${currentRequestIdRef.current}`, { method: 'POST' });
        console.log('[TTS] Sent stop request for TTS playback');
      } catch (error) {
        console.error('Failed to stop TTS playback:', error);
      }
      
      currentRequestIdRef.current = null;
    }
    
    setState(prev => ({ ...prev, isTtsPlaying: false }));
  }, []);

  // Set voice mode (push-to-talk or walkie-talkie)
  const setMode = useCallback((mode: VoiceMode) => {
    setState(prev => ({ ...prev, mode }));
  }, []);

  // Get audio visualization data for the AudioVisualizer component
  const getAudioVisualizationData = useCallback(() => {
    if (!analyserRef.current || !audioDataRef.current) {
      return null;
    }

    // Get frequency data from analyzer
    analyserRef.current.getByteFrequencyData(audioDataRef.current);
    return audioDataRef.current;
  }, []);

  // Clean up resources on unmount
  useEffect(() => {
    return () => {
      // Stop recording if active
      if (state.isListening) {
        stopListening();
      }
      
      // Clean up audio resources
      cleanupAudio();
      
      // Close WebSocket connection
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      
      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(err => console.error('Error closing AudioContext:', err));
      }
      
      // Release microphone
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      // Clear any timeouts
      if (vadTimeoutRef.current) {
        clearTimeout(vadTimeoutRef.current);
      }
      if (busyTimeoutRef.current) {
        clearTimeout(busyTimeoutRef.current);
      }
    };
  }, [state.isListening, stopListening, cleanupAudio]);

  // Get audio level for visualization
  const getAudioLevel = useCallback(() => {
    if (!analyserRef.current || !audioDataRef.current) {
      return 0;
    }

    analyserRef.current.getByteFrequencyData(audioDataRef.current);
    const values = audioDataRef.current;
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
      sum += values[i];
    }
    return sum / values.length / 255; // Normalized 0-1
  }, []);

  return {
    // State
    isListening: state.isListening,
    transcript: state.transcript,
    isProcessing: state.isProcessing,
    error: state.error,
    isTtsPlaying: state.isTtsPlaying,
    isBusy: state.isBusy,
    mode: state.mode,
    
    // Actions
    startListening,
    stopListening,
    stopTts,
    setMode,
    
    // Visualization
    getAudioVisualizationData,
    getAudioLevel,
  };
}
