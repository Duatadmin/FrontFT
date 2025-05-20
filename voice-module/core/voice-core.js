/**
 * Voice Core Module
 * 
 * Coordinates audio capture, WebSocket communication and input modes
 * to provide a complete voice input experience.
 */

import { DEFAULTS, MODES } from '../config/constants.js';
import { PCMWorkletNodeController } from '../audio/pcm-worklet-node.js';
import { WebSocketClient } from '../streaming/ws-client.js';
import { PushToTalkMode } from '../modes/mode-push.js';
import { WalkieTalkieMode } from '../modes/mode-walkie.js';
import { EventBus, EVENTS } from './event-bus.js';
import { SessionState } from './session-state.js';

// Create a global bus instance
export const bus = new EventBus();

/**
 * Main VoiceModule class that integrates all voice input functionality
 */
export class VoiceCore {
  /**
   * Create a new Voice Core instance
   * 
   * @param {Object} config - Configuration object
   * @param {string} [config.mode='push'] - Input mode: 'push' or 'walkie'
   * @param {string} [config.websocketUrl] - WebSocket endpoint URL
   * @param {number} [config.sampleRate=16000] - Audio sample rate
   * @param {number} [config.frameSize=1024] - Audio frame size
   * @param {number} [config.threshold] - Voice detection threshold for walkie mode
   * @param {Function} [config.onTranscript] - Callback for transcript events
   * @param {Function} [config.onStateChange] - Callback for recording state changes
   * @param {boolean} [config.debug=false] - Enable verbose logging
   */
  constructor(config = {}) {
    // Merge default config with user-provided config
    this.config = { ...DEFAULTS, ...config };

    // Support legacy `serverUrl` option used in docs
    if (!this.config.websocketUrl && this.config.serverUrl) {
      this.config.websocketUrl = this.config.serverUrl;
    }
    
    // Create session state
    this.session = new SessionState({
      onStateChange: (state) => {
        this._log(`Session state changed: ${state}`);
      }
    });
    
    // Reference to the event bus
    this.bus = bus;
    
    // Tracking state
    this.isInitialized = false;
    this.isRecording = false;
    this.transcripts = [];
    
    // Components will be initialized later
    this.audioContext = null;
    this.workletController = null;
    this.wsClient = null;
    this.inputMode = null;
    
    // Audio graph nodes
    this.node = null;
    this.source = null;
    this.muteGain = null;
    
    // Bind methods to preserve 'this' context
    this._handleAudioChunk = this._handleAudioChunk.bind(this);
    this._handleActiveStateChange = this._handleActiveStateChange.bind(this);
    this._handleTranscript = this._handleTranscript.bind(this);
  }
  
  /**
   * Initialize the voice module
   * @returns {Promise<void>}
   */
  async init() {
    if (this.isInitialized) {
      console.warn('VoiceCore already initialized');
      return;
    }
    
    try {
      // 1. Create AudioContext
      this.audioContext = new AudioContext({
        sampleRate: this.config.sampleRate,
        latencyHint: 'interactive'
      });
      
      // 2. Initialize WebSocket client
      this.wsClient = new WebSocketClient({
        url: this.config.websocketUrl,
        onTranscript: this._handleTranscript,
        onStatusChange: (connected) => {
          this._log(`WebSocket ${connected ? 'connected' : 'disconnected'}`);
        }
      });
      
      // 3. Create input mode controller based on config
      this._initializeInputMode();
      
      // 4. Create and initialize audio worklet
      this.workletController = new PCMWorkletNodeController(
        this.audioContext,
        this._handleAudioChunk
      );
      
      // Initialization complete
      this.isInitialized = true;
      this._log('VoiceCore initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize VoiceCore:', error);
      this.cleanup();
      throw error;
    }
  }
  
  /**
   * Start the voice input system based on current mode
   * @returns {Promise<void>}
   */
  async start() {
    if (!this.isInitialized) {
      await this.init();
    }
    
    try {
      // Resume audio context if suspended
      if (this.audioContext?.state === 'suspended') {
        try {
          await this.audioContext.resume();
          console.log('[AUDIO] after resume:', this.audioContext.state);
        } catch (resumeError) {
          console.error('Failed to resume AudioContext:', resumeError);
        }
      }
      
      // Initialize audio worklet if not already done
      if (!this.workletController.node) {
        await this.workletController.init();
        
        // Store references to audio nodes for later use
        this.node = this.workletController.node;
        this.source = this.workletController.source;
        
        // Create a mute gain node to prevent feedback
        this.muteGain = new GainNode(this.audioContext, { gain: 0 });
      }
      
      // Connect to WebSocket server
      await this.wsClient.connect();
      
      // Handle based on input mode
      if (this.config.mode === MODES.PUSH_TO_TALK) {
        // For push-to-talk, user will explicitly call startRecording/stopRecording
        this._log('Push-to-talk mode ready');
      } else {
        // For walkie-talkie, system automatically starts recording when voice detected
        this._log('Voice activation mode ready, monitoring audio...');
      }
      
    } catch (error) {
      console.error('Failed to start VoiceCore:', error);
      throw error;
    }
  }
  
  /**
   * Stop the voice input system
   */
  stop() {
    // Stop recording if active
    if (this.isRecording) {
      this.stopRecording();
    }
    
    // Disconnect WebSocket
    if (this.wsClient) {
      this.wsClient.disconnect();
    }
    
    // Stop audio processing
    if (this.workletController) {
      this.workletController.stop();
    }
    
    this._log('VoiceCore stopped');
  }
  
  /**
   * Clean up resources
   */
  cleanup() {
    this.stop();
    
    // Reset state
    this.isInitialized = false;
    this.isRecording = false;
    this.transcripts = [];
    
    // Nullify components
    this.audioContext = null;
    this.workletController = null;
    this.wsClient = null;
    this.inputMode = null;
    
    this._log('VoiceCore resources cleaned up');
  }
  
  /**
   * Manually start recording (primarily for push-to-talk mode)
   */
  async startRecording() {
    if (this.session?.isRecording()) return;

    // Reconnect WebSocket if it was closed in a previous session
    if (this.wsClient && !this.wsClient.isConnected()) {
      try {
        await this.wsClient.connect();
      } catch (err) {
        console.error('Failed to reconnect WebSocket:', err);
      }
    }

    // если контекст был приостановлен, вернём его
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
      // подключаем граф заново
      this.source.connect(this.node).connect(this.muteGain);
    }

    if (this.config.mode === MODES.PUSH_TO_TALK && this.inputMode) {
      this.inputMode.start();
    }
    
    this.session.setRecording(true);
    this.bus.emit(EVENTS.STATE, 'recording');
  }
  
  /**
   * Manually stop recording (primarily for push-to-talk mode)
   */
  async stopRecording() {
    if (!this.session?.isRecording()) return;

    // 1) Прерываем поток в аудиографе
    if (this.node)   this.node.disconnect();
    if (this.source) this.source.disconnect();
    // 2) Останавливаем обработку CPU
    if (this.audioContext.state === 'running') {
      await this.audioContext.suspend();   // мгновенно
    }

    if (this.config.mode === MODES.PUSH_TO_TALK && this.inputMode) {
      this.inputMode.stop();
    }
   
    this.session.setRecording(false);
    this.bus.emit(EVENTS.STATE, 'idle');

    // Осознанно завершаем WS
    this.wsClient.close(1000, 'done');  // чтобы Deepgram не ждал таймаута
  }
  
  /**
   * Toggle recording state (for push-to-talk mode)
   * @returns {boolean} - New recording state
   */
  toggleRecording() {
    if (this.config.mode === MODES.PUSH_TO_TALK && this.inputMode) {
      return this.inputMode.toggle();
    }
    return false;
  }

  /**
   * Change input mode at runtime
   * @param {'push' | 'walkie'} mode
   */
  setMode(mode) {
    if (this.config.mode === mode) return;
    if (this.isRecording) {
      this.stopRecording();
    }
    this.config.mode = mode;
    this._initializeInputMode();
  }
  
  /**
   * Get latest transcript
   * @returns {Object|null} - Latest transcript or null if none available
   */
  getLatestTranscript() {
    if (this.transcripts.length > 0) {
      return this.transcripts[this.transcripts.length - 1];
    }
    return null;
  }
  
  /**
   * Initialize the appropriate input mode based on configuration
   * @private
   */
  _initializeInputMode() {
    if (this.config.mode === MODES.PUSH_TO_TALK) {
      // Create push-to-talk controller
      this.inputMode = new PushToTalkMode({
        onStateChange: this._handleActiveStateChange
      });
      this._log('Push-to-talk mode initialized');
    } else {
      // Create walkie-talkie (voice-activated) controller
      this.inputMode = new WalkieTalkieMode({
        onStateChange: this._handleActiveStateChange,
        threshold: this.config.threshold
      });
      this._log('Voice activation mode initialized');
    }
  }
  
  /**
   * Handle audio chunks from the worklet
   * @param {Int16Array} chunk - PCM audio chunk
   * @private
   */
  _handleAudioChunk(chunk) {
    // For voice activation mode, analyze the chunk
    if (this.config.mode === MODES.VOICE_ACTIVATED && this.inputMode) {
      this.inputMode.analyze(chunk);
    }
    
    // Send to WebSocket if recording is active
    if (this.isRecording && this.wsClient) {
      // Make sure we're connected before sending
      if (this.wsClient.isConnected()) {
        this.wsClient.send(chunk);
      } else {
        // Try to use socketReady in a non-blocking way
        this._log('WebSocket not ready, waiting...');
        this.wsClient.socketReady()
          .then(() => {
            this._log('WebSocket now ready, sending audio');
            this.wsClient.send(chunk);
          })
          .catch(err => {
            this._log(`Failed to connect WebSocket: ${err.message}`);
          });
      }
    }
  }
  
  /**
   * Handle active state changes from input modes
   * @param {boolean} isActive - New active state
   * @private
   */
  _handleActiveStateChange(isActive) {
    this.isRecording = isActive;
    
    // Emit event to the bus
    bus.emit(isActive ? EVENTS.RECORDING_STARTED : EVENTS.RECORDING_STOPPED);
    
    // Notify state change if callback provided
    if (typeof this.config.onStateChange === 'function') {
      this.config.onStateChange(isActive);
    }
    
    this._log(`Recording ${isActive ? 'started' : 'stopped'}`);
  }
  
  /**
   * Handle incoming transcripts from WebSocket
   * @param {Object} transcript - Transcript data {text, is_final}
   * @private
   */
  _handleTranscript(transcript) {
    // Add timestamp to transcript
    const timestampedTranscript = {
      ...transcript,
      timestamp: new Date().toISOString()
    };
    
    // Store transcript
    this.transcripts.push(timestampedTranscript);
    
    // Keep transcript history limited
    if (this.transcripts.length > 10) {
      this.transcripts.shift();
    }
    
    // Emit event to the bus
    const eventType = transcript.is_final ? EVENTS.TRANSCRIPT_FINAL : EVENTS.TRANSCRIPT_INTERIM;
    bus.emit(eventType, timestampedTranscript);
    bus.emit('transcript:partial', transcript.text);
    
    // Forward to callback if provided
    if (typeof this.config.onTranscript === 'function') {
      this.config.onTranscript(timestampedTranscript);
    }
  }
  
  /**
   * Conditional logging for debug mode
   * @param {string} message - Log message
   * @private
   */
  _log(message) {
    if (this.config.debug) {
      console.log(`[VoiceCore] ${message}`);
    }
  }
  
  /**
   * Get the current state of the voice module
   * @returns {string} - Current state (idle, recording, etc.)
   */
  getState() {
    if (!this.isInitialized) return 'uninitialized';
    if (this.isRecording) return 'recording';
    return 'idle';
  }
  
  /**
   * Get all transcripts
   * @returns {Array} - List of transcripts
   */
  getTranscripts() {
    return [...this.transcripts];
  }
  
  /**
   * For compatibility with the old API, to handle destroy method
   */
  destroy() {
    this.cleanup();
  }
}
