import { useState, useRef, useCallback, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';

// Voice Assistant API endpoints
const VOICE_API_BASE = 'https://ftvoiceservice-production.up.railway.app';
const ASR_WEBSOCKET_URL = `wss://${VOICE_API_BASE.replace('https://', '')}/v1/asr/ws`;
const TEST_WEBSOCKET_URL = `wss://${VOICE_API_BASE.replace('https://', '')}/v1/test/ws`; // Test WebSocket endpoint
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
  
  // Feature detection for fallback strategies
  const [features, setFeatures] = useState({
    websocketConnectable: null as boolean | null, // Can we connect to WebSocket?
    audioWorkletAvailable: null as boolean | null, // Is AudioWorklet supported?
    usingFallback: false // Are we using MediaRecorder fallback?
  });

  // Refs
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
  const hasSpokenRef = useRef<boolean>(false); // Track if user has spoken during session
  const mediaRecorderRef = useRef<MediaRecorder | null>(null); // For fallback mode

  // Use the WebSocket hook for ASR WebSocket connection
  const { 
    wsRef,
    send: sendToAsr,
    reconnect: reconnectAsr,
    connect: connectAsr,
    disconnect: disconnectAsr,
    isConnected: isAsrConnected 
  } = useWebSocket(ASR_WEBSOCKET_URL, {
    immediateConnect: false, // Connect manually when needed
    enablePing: true,        // Keep connection alive
    pingInterval: 8000,      // Send ping every 8 seconds
    onOpen: () => {
      console.log('[ASR] WebSocket connection established');
      
      // Send handshake message immediately after connection
      sendToAsr(JSON.stringify({ 
        type: 'handshake', 
        format: 'audio/raw', 
        sample_rate: AUDIO_CONFIG.sampleRate,
        channels: AUDIO_CONFIG.channelCount
      }));
      
      console.log('[ASR] Sent handshake message to server');
    },
    onMessage: (event) => {
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
        console.error('[ASR] Failed to parse WebSocket message:', error);
      }
    },
    onError: (error) => {
      console.error('[ASR] WebSocket error:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Connection error. Please try again.',
        isBusy: false // Release busy state on error
      }));
    },
    onClose: (event) => {
      console.log('[ASR] WebSocket connection closed. Code:', event.code, 'Reason:', event.reason || 'No reason provided');
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
    }
  });
  
  // Use another useWebSocket hook instance for testing connectivity
  const { 
    connect: connectTest,
    disconnect: disconnectTest
  } = useWebSocket(TEST_WEBSOCKET_URL, {
    immediateConnect: false,
    onOpen: () => {
      console.log('[WS-TEST] ✅ Test WebSocket connected successfully');
      setFeatures(prev => ({ ...prev, websocketConnectable: true }));
      // Close test connection after confirming it works
      setTimeout(() => disconnectTest(), 1000);
    },
    onError: () => {
      console.error('[WS-TEST] ❌ Test WebSocket connection failed');
      setFeatures(prev => ({ ...prev, websocketConnectable: false }));
    }
  });
  
  // Test if the WebSocket endpoint is reachable
  const testWebSocketConnection = useCallback(() => {
    console.log('[WS-TEST] Testing WebSocket connectivity to:', TEST_WEBSOCKET_URL);
    connectTest();
    
    // Set a timeout to consider the connection failed if no response after 5 seconds
    setTimeout(() => {
      if (features.websocketConnectable === null) {
        console.warn('[WS-TEST] WebSocket connection test timed out');
        disconnectTest();
        setFeatures(prev => ({ ...prev, websocketConnectable: false }));
      }
    }, 5000);
  }, [connectTest, disconnectTest, features.websocketConnectable]);
  
  // Test WebSocket connectivity on mount
  useEffect(() => {
    // Only run this test once on mount
    if (features.websocketConnectable === null) {
      testWebSocketConnection();
    }
  }, [features.websocketConnectable, testWebSocketConnection]);

  // Small base64-encoded beep sound as fallback (short beep)
  const FALLBACK_BEEP = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADmADMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYAAAAAAAAAA5jaabd9AAAAAAAAAAAAAAAAAAAAAP/7kGQAD/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';

  // Initialize the audio elements for TTS playback and mic activation sound
  useEffect(() => {
    // Initialize mic activation sound with fallback mechanisms
    if (!micActivationSoundRef.current) {
      try {
        // Create with browser-compatible format - use hyphen instead of underscore
        const activationSound = new Audio('/sounds/mic-activation.mp3');
        activationSound.volume = 0.5;
        activationSound.preload = 'auto';
        
        // Add error handler for loading failures
        activationSound.onerror = () => {
          console.log('[VOICE] External mic sound failed to load, using fallback beep');
          const fallbackSound = new Audio(FALLBACK_BEEP);
          fallbackSound.volume = 0.5;
          micActivationSoundRef.current = fallbackSound;
        };
        
        // Force preload to ensure the sound is ready when needed
        activationSound.load();
        micActivationSoundRef.current = activationSound;
      } catch (err) {
        console.warn('[VOICE] Error creating activation sound, using fallback:', err);
        // Create fallback beep as absolute fallback
        try {
          const fallbackBeep = new Audio(FALLBACK_BEEP);
          fallbackBeep.volume = 0.3;
          micActivationSoundRef.current = fallbackBeep;
        } catch (e) {
          console.error('[VOICE] Could not create any activation sound:', e);
        }
      }
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

  // Setup WebSocket connection (simplified with the hook)
  // Reference to track active session and debounce connect attempts
  const isSessionActiveRef = useRef<boolean>(false);

  // Set up WebSocket connection to ASR service with awaitable connection
  const setupWebSocket = useCallback(async () => {
    console.log('[WS-DEBUG] Setting up WebSocket connection to:', ASR_WEBSOCKET_URL);
    
    // Check if an existing connection is in CLOSING state and wait for it
    if (wsRef.current?.readyState === WebSocket.CLOSING) {
      console.log('[WS-DEBUG] WebSocket is in CLOSING state, waiting to complete...');
      // Wait for existing connection to fully close
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Close any existing connection that's not already closed
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      console.log('[WS-DEBUG] Cleaning up existing WebSocket connection');
      disconnectAsr();
      // Give time for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    try {
      // Wait for connection to be established
      const ws = await connectAsr();
      
      if (!ws) {
        throw new Error('WebSocket connection failed');
      }
      
      // Make sure the connection is fully open
      if (ws.readyState !== WebSocket.OPEN) {
        console.log('[WS-DEBUG] WebSocket connected but not yet open, waiting...');
        // Wait for it to transition to OPEN state
        await new Promise((resolve, reject) => {
          const checkOpenState = () => {
            if (ws.readyState === WebSocket.OPEN) {
              resolve(true);
            } else if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
              reject(new Error('WebSocket closed during connection establishment'));
            } else {
              // Still connecting, check again soon
              setTimeout(checkOpenState, 50);
            }
          };
          checkOpenState();
        });
      }
      
      // Send handshake immediately after connection is open
      try {
        const handshakeMessage = JSON.stringify({ type: 'handshake' });
        if (sendToAsr(handshakeMessage)) {
          console.log('[WS-DEBUG] Sent handshake message to ASR server');
        } else {
          console.warn('[WS-DEBUG] Failed to send handshake');
        }
      } catch (err) {
        console.warn('[WS-DEBUG] Error sending handshake:', err);
      }
      
      console.log('[WS-DEBUG] WebSocket connection established and ready');
      return ws;
    } catch (error) {
      console.error('[WS-ERROR] Failed to connect to WebSocket server:', error);
      setState(prev => ({
        ...prev,
        error: 'Could not connect to speech recognition service',
        isBusy: false // Reset busy state to prevent getting stuck
      }));
      
      // Reset session active flag if connection fails
      isSessionActiveRef.current = false;
      return null;
    }
  }, [connectAsr, disconnectAsr, sendToAsr]);
  
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
      
      // Check and set AudioWorklet availability
      const hasAudioWorklet = 'audioWorklet' in AudioContext.prototype;
      setFeatures(prev => ({ ...prev, audioWorkletAvailable: hasAudioWorklet }));
      
      // Try loading the PCM processor worklet if supported
      if (hasAudioWorklet && !isAudioWorkletLoadedRef.current) {
        try {
          console.log('[VOICE-DEBUG] Starting AudioWorklet loading process');
          console.log('[VOICE-DEBUG] AudioContext state:', audioContext.state);
          
          // Log the full URL we're trying to load
          const baseUrl = window.location.origin;
          const moduleUrl = `${baseUrl}/pcm-processor.js`;
          console.log('[VOICE-DEBUG] Attempting to load worklet from:', moduleUrl);
          
          await audioContext.audioWorklet.addModule('/pcm-processor.js');
          isAudioWorkletLoadedRef.current = true;
          console.log('[VOICE] ✅ PCM processor worklet loaded successfully');
        } catch (error) {
          console.error('[VOICE-ERROR] ❌ Failed to load PCM processor worklet:', error);
          console.error('[VOICE-ERROR] Error details:', { 
            name: error.name, 
            message: error.message, 
            stack: error.stack 
          });
          
          // Don't throw here - we'll fall back to MediaRecorder
          setFeatures(prev => ({ ...prev, usingFallback: true }));
          console.log('[VOICE] Falling back to MediaRecorder due to AudioWorklet load failure');
        }
      } else {
        if (!hasAudioWorklet) {
          console.log('[VOICE] AudioWorklet not supported in this browser, using MediaRecorder fallback');
          setFeatures(prev => ({ ...prev, usingFallback: true }));
        } else {
          console.log('[VOICE-DEBUG] AudioWorklet already loaded, skipping initialization');
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
    // Rigorously check WebSocket state before sending any data
    if (!wsRef.current) {
      console.warn('[WS] Cannot send end of stream: WebSocket instance does not exist');
      return;
    }
    
    if (wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('[WS] Cannot send end of stream: WebSocket is not in OPEN state (current state:', 
        wsRef.current.readyState === WebSocket.CONNECTING ? 'CONNECTING' :
        wsRef.current.readyState === WebSocket.CLOSING ? 'CLOSING' : 'CLOSED', ')');
      return;
    }
    
    try {
      // 1 second of silence at 16kHz, mono, 16-bit PCM (Int16)
      const silenceSamples = 16000; // 1s × 16kHz
      const silence = new Int16Array(silenceSamples); // All zeros = silence
      
      // Send 1 second of silent audio
      if (sendToAsr(silence.buffer)) {
        console.log('[WS] 🔇 Sent 1 second of silence to server');
      } else {
        console.warn('[WS] 🛑 Failed to send silence buffer');
        return;
      }

      // Wait 100ms (safety delay), then send end of stream marker
      setTimeout(() => {
        // Verify the connection is still open before sending
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          console.warn('[WS] 🛑 Cannot send end of stream marker: WebSocket no longer open');
          return;
        }
        
        // Send end of stream marker to WebSocket to get final transcript
        try {
          console.log('[WS] Sending end_of_stream marker');
          if (sendToAsr(JSON.stringify({ type: 'end_of_stream' }))) {
            // Important: Don't close the WebSocket yet - we need to wait for the transcript response
            console.log('[WS] Keeping WebSocket open to receive transcript...');
          } else {
            console.warn('[WS] 🛑 Failed to send end_of_stream marker');
          }
        } catch (e) {
          console.warn('[WS] 🛑 Could not send end_of_stream', e);
        }
      }, 100);
    } catch (error) {
      console.error('[WS] Error in sendEndOfStreamWithSilence:', error);
    }
  }, []);

  // Handle silence detection for walkie-talkie mode
  const handleSilenceDetection = useCallback((audioLevel: number) => {
    const silenceThreshold = 0.01; // Adjust based on testing
    
    if (audioLevel < silenceThreshold && hasSpokenRef.current) {
      // Only start silence timer if user has actually spoken during this session
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
    } else if (audioLevel >= silenceThreshold) {
      // User has spoken - mark this and cancel any silence timer
      hasSpokenRef.current = true;
      
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
    
    // Reset stream ended flag and speech detection flags
    streamEndedRef.current = false;
    hasSpokenRef.current = false; // Reset speech detection state for new session
    
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
    
    // Check if another session is already active
    if (isSessionActiveRef.current) {
      console.warn('[VOICE] 🛑 A voice session is already active');
      setState(prev => ({ ...prev, isBusy: false }));
      return;
    }
    
    // Set session active flag to prevent multiple connections
    isSessionActiveRef.current = true;
    
    // Helper function to ensure audio context is ready
    const waitForContextReady = async () => {
      if (audioContextRef.current?.state !== 'running') {
        console.log('[VOICE] Resuming audio context...');
        await audioContextRef.current?.resume();
        console.log('[VOICE] Audio context resumed successfully');
      }
    };
    
    // Setup WebSocket if needed
    if (!isAsrConnected) {
      console.log('[WS-DEBUG] WebSocket not open, setting up new connection');
      try {
        // Wait for WebSocket connection to be established
        const ws = await setupWebSocket();
        
        if (!ws) {
          console.error('[WS-ERROR] Failed to set up WebSocket, aborting recording');
          setState(prev => ({ 
            ...prev, 
            isBusy: false, 
            error: 'Failed to establish a connection to the voice service' 
          }));
          isSessionActiveRef.current = false;
          return;
        }
        
        console.log('[WS-DEBUG] WebSocket connection established');
      } catch (error) {
        console.error('[WS-ERROR] WebSocket connection error:', error);
        setState(prev => ({ 
          ...prev, 
          isBusy: false, 
          error: 'Connection error' 
        }));
        isSessionActiveRef.current = false;
        return;
      }
    } else {
      console.log('[WS-DEBUG] Using existing WebSocket connection');
    }
    
    // Ensure audio context is ready
    await waitForContextReady();
    
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
      
      // Decide which audio capture method to use
      if (!features.usingFallback && isAudioWorkletLoadedRef.current) {
        // Use AudioWorklet approach
        console.log('[VOICE-DEBUG] Creating AudioWorkletNode with processor name: "pcm-processor"');
        try {
          const workletNode = new AudioWorkletNode(audioContext, 'pcm-processor');
          audioWorkletNodeRef.current = workletNode;
          console.log('[VOICE-DEBUG] ✅ AudioWorkletNode created successfully');
          
          // Handle messages from the audio processor
          console.log('[VOICE-DEBUG] Setting up message port handler for AudioWorkletNode');
          let messageCount = 0;
          workletNode.port.onmessage = (event) => {
            // Log first few messages to confirm data is flowing
            if (messageCount < 5) {
              console.log(`[VOICE-DEBUG] Received message #${messageCount} from AudioWorklet:`, 
                event.data ? { hasAudioData: !!event.data.audioData } : 'No data');
              messageCount++;
            }
            
            // Skip if stream has ended
            if (streamEndedRef.current) {
              return;
            }
            
            const { audioData, audioLevel, isSilent } = event.data;
            
            // Send audio data to WebSocket if connection is open
            if (!streamEndedRef.current) {
              sendToAsr(audioData);
              console.log('[WS] Sent audio chunk as PCM Int16. Level:', audioLevel.toFixed(4));
              
              // For walkie-talkie mode, use audio level for VAD
              if (state.mode === 'walkie' && isSilent) {
                handleSilenceDetection(audioLevel);
              }
            }
          };
          
          // Connect the processing chain: mediaStream -> workletNode
          console.log('[VOICE-DEBUG] Connecting audio nodes: streamSource -> workletNode');
          try {
            if (!streamSourceRef.current) {
              throw new Error('Stream source is not available');
            }
            streamSourceRef.current.connect(workletNode);
            console.log('[VOICE-DEBUG] ✅ Audio processing chain connected successfully');
          } catch (error) {
            console.error('[VOICE-ERROR] ❌ Failed to connect audio processing chain:', error);
            // Instead of throwing, we'll fall back to MediaRecorder
            setFeatures(prev => ({ ...prev, usingFallback: true }));
            setupMediaRecorderFallback();
            return; // Exit the AudioWorklet setup
          }
          
          console.log('[VOICE] ✅ AudioWorklet started, streaming PCM audio data');
          
        } catch (error) {
          console.error('[VOICE-ERROR] ❌ Failed to create AudioWorkletNode:', error);
          console.error('[VOICE-ERROR] Available processors:', audioContext.audioWorklet);
          // Fall back to MediaRecorder
          setFeatures(prev => ({ ...prev, usingFallback: true }));
          setupMediaRecorderFallback();
        }
      } else {
        // Use MediaRecorder fallback
        setupMediaRecorderFallback();
      }
      
      // Removed duplicate content that's now integrated in the workletNode creation block above
      
    } catch (error) {
      console.error('[VOICE-ERROR] ❌ Failed to start recording:', error);
      console.error('[VOICE-ERROR] Error details:', { 
        name: error?.name, 
        message: error?.message, 
        stack: error?.stack,
        audioContextState: audioContextRef.current?.state || 'no context',
        isWorkletLoaded: isAudioWorkletLoadedRef.current
      });
      
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

  // Stop recording and send end-of-stream signal
  const stopListening = useCallback(() => {
    console.log('[VOICE] Stopping voice recording...');
    
    // Cancel busy timeout since we're explicitly stopping
    if (busyTimeoutRef.current) {
      clearTimeout(busyTimeoutRef.current);
      busyTimeoutRef.current = null;
    }
    
    // Determine which cleanup method to use based on active recording method
    if (features.usingFallback && mediaRecorderRef.current) {
      // Stop MediaRecorder if it's active
      try {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          console.log('[VOICE] MediaRecorder stopped');
        }
      } catch (err) {
        console.warn('[VOICE] Error stopping MediaRecorder:', err);
      }
      mediaRecorderRef.current = null;
    } else if (audioWorkletNodeRef.current) {
      // Disconnect the audio worklet node
      try {
        audioWorkletNodeRef.current.disconnect();
        audioWorkletNodeRef.current.port.onmessage = null;
        console.log('[VOICE] Disconnected AudioWorklet node');
      } catch (err) {
        console.warn('[VOICE] Error disconnecting AudioWorklet:', err);
      }
      audioWorkletNodeRef.current = null;
    }
    
    // Clear VAD timeout if active
    if (vadTimeoutRef.current) {
      clearTimeout(vadTimeoutRef.current);
    }
    
    // Mark stream as ended to prevent any more audio chunks from being sent
    streamEndedRef.current = true;
    console.log('[WS] Marked stream as ended in stopListening()');
    
    // Send silence and end_of_stream signal with state validation
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        sendEndOfStreamWithSilence();
      } else {
        console.warn('[WS] Cannot send end of stream - WebSocket is not in OPEN state');
      }
    } catch (err) {
      console.warn('[VOICE] Error sending end of stream:', err);
    }
    
    // Update state - ALWAYS reset busy state to prevent getting stuck
    setState(prev => ({ 
      ...prev, 
      isListening: false,
      isBusy: false,       // Explicitly release busy state
      isProcessing: true   // Still processing the final transcript
    }));
    
    // Reset session active flag to allow new recording sessions
    isSessionActiveRef.current = false;
    
    // Safety timeout to ensure busy state is released if server doesn't respond
    setTimeout(() => {
      setState(prev => {
        if (prev.isProcessing) {
          console.log('[VOICE] Safety timeout: Forcing processing state to reset');
          return { ...prev, isProcessing: false };
        }
        return prev;
      });
    }, 10000); // 10 second timeout
    
    // Reset session active flag to allow new recording sessions
    isSessionActiveRef.current = false;
  }, [sendEndOfStreamWithSilence, features.usingFallback]);

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
      
      // Close audio context with safety wrap to prevent runtime crashes
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close().catch(err => console.error('Error closing AudioContext:', err));
        } catch (err) {
          console.warn('[VOICE] AudioContext was already closed or invalid:', err);
          // Already closed or invalid state, just continue
        }
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

  // Setup MediaRecorder as a fallback option
  const setupMediaRecorderFallback = useCallback(() => {
    console.log('[VOICE] Setting up MediaRecorder fallback');
    
    try {
      if (!streamRef.current) {
        console.error('[VOICE] Cannot set up MediaRecorder: No media stream available');
        return;
      }
      
      // Use PCM codec for best compatibility with Deepgram
      // NOTE: This will fall back to browser default if PCM is not supported
      const options = { mimeType: 'audio/webm;codecs=pcm' };
      
      // Create MediaRecorder with requested options
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(streamRef.current, options);
        console.log('[VOICE] MediaRecorder created with requested MIME type:', options.mimeType);
      } catch (e) {
        // If PCM is not supported, use default format
        recorder = new MediaRecorder(streamRef.current);
        console.warn('[VOICE] PCM codec not supported, using fallback format:', recorder.mimeType);
      }
      
      // Log the actual MIME type being used
      console.log('[VOICE] Actual MediaRecorder MIME type:', recorder.mimeType);
      
      // Set up data handler to forward chunks to WebSocket
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0 && isAsrConnected && !streamEndedRef.current) {
          // Convert Blob to ArrayBuffer for sending over WebSocket
          event.data.arrayBuffer().then(buffer => {
            if (!streamEndedRef.current) {
              sendToAsr(buffer);
              console.log('[WS] Sent chunk as ArrayBuffer to backend. Size:', buffer.byteLength);
            } else {
              console.warn('[WS] Cannot send: Stream has ended');
            }
          });
          
          console.log('[VOICE] Received media chunk of type:', event.data.type, 'size:', event.data.size);
        }
      };
      
      // Store reference for later use
      mediaRecorderRef.current = recorder;
      
      // Start recording with small chunk size for responsiveness
      const CHUNK_SIZE_MS = 100; // 100ms chunks for real-time transmission
      recorder.start(CHUNK_SIZE_MS);
      console.log('[VOICE] MediaRecorder started with ' + CHUNK_SIZE_MS + 'ms chunks, state:', recorder.state);
      
    } catch (error) {
      console.error('[VOICE] Failed to set up MediaRecorder fallback:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to set up audio recording',
        isListening: false,
        isBusy: false
      }));
    }
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
    
    // Technical details
    features,
    
    // Actions
    startListening,
    stopListening,
    stopTts,
    setMode,
    init, // Export the init function to fix initialization error
    
    // Visualization
    getAudioVisualizationData,
    getAudioLevel,
  };
}
