/**
 * Voice Module
 * 
 * A self-contained, embeddable JavaScript module for microphone audio streaming
 * via AudioWorklet and WebSocket with support for both push-to-talk and
 * voice-activated (walkie-talkie) input modes.
 */

import { VoiceCore } from './core/voice-core.js';
import { EventBus, EVENTS } from './core/event-bus.js';
import { SessionState, SESSION_STATE } from './core/session-state.js';
import { MODES, WEBSOCKET, AUDIO, VOICE_DETECTION } from './config/constants.js';

/**
 * Main VoiceModule class
 * Provides a simple interface for integrating voice input capabilities
 * into web applications.
 */
export class VoiceModule {
  /**
   * Create a new VoiceModule instance
   * 
   * @param {Object} config - Configuration options
   * @param {string} [config.mode='push'] - Input mode: 'push' (push-to-talk) or 'walkie' (voice-activated)
   * @param {string} [config.serverUrl] - WebSocket server URL
   * @param {Object} [config.audio] - Audio configuration options
   * @param {number} [config.audio.sampleRate=16000] - Audio sample rate
   * @param {number} [config.audio.frameSize=1024] - Audio frame size
   * @param {Object} [config.voice] - Voice detection options for walkie-talkie mode
   * @param {number} [config.voice.threshold] - Voice activation threshold (0-1)
   * @param {number} [config.voice.holdDuration] - Hold time after voice ends (ms)
   * @param {Function} [config.onTranscript] - Callback for transcript events
   * @param {Function} [config.onStateChange] - Callback for state changes
   * @param {boolean} [config.debug=false] - Enable debug logging
   */
  constructor(config = {}) {
    // Initialize the event bus
    this.events = new EventBus();
    
    // Initialize session state
    this.session = new SessionState({
      onStateChange: (newState, prevState, error) => {
        this.events.emit(EVENTS.SESSION_STATE_CHANGED, { newState, prevState, error });
        
        if (typeof config.onStateChange === 'function') {
          config.onStateChange(newState, error);
        }
      }
    });
    
    // Process and normalize configuration
    this.config = this._processConfig(config);
    
    // Initialize the voice core
    this.core = new VoiceCore({
      mode: this.config.mode,
      websocketUrl: this.config.serverUrl,
      sampleRate: this.config.audio.sampleRate,
      frameSize: this.config.audio.frameSize,
      threshold: this.config.voice?.threshold,
      debug: this.config.debug,
      onTranscript: (transcript) => {
        // Add to session state
        const processedTranscript = this.session.addTranscript(transcript);
        
        // Emit appropriate event
        const eventType = transcript.is_final ? 
          EVENTS.TRANSCRIPT_FINAL : EVENTS.TRANSCRIPT_INTERIM;
        this.events.emit(eventType, processedTranscript);
        
        // Call user callback if provided
        if (typeof this.config.onTranscript === 'function') {
          this.config.onTranscript(processedTranscript);
        }
      },
      onStateChange: (isActive) => {
        // Update session recording state
        this.session.setRecording(isActive);
        
        // Emit appropriate event
        const eventType = isActive ? 
          EVENTS.RECORDING_STARTED : EVENTS.RECORDING_STOPPED;
        this.events.emit(eventType, null);
      }
    });
  }
  
  /**
   * Initialize and start the voice module
   * @returns {Promise<void>}
   */
  async start() {
    try {
      // Update session state
      this.session.setState(SESSION_STATE.CONNECTING);
      
      // Initialize and start the core
      await this.core.init();
      await this.core.start();
      
      // Update microphone access status
      this.session.setMicAccess(true);
      
      // Success - ready to use
      this.session.setState(SESSION_STATE.READY);
    } catch (error) {
      console.error('Failed to start VoiceModule:', error);
      this.session.setError(error);
      throw error;
    }
  }
  
  /**
   * Stop the voice module and release resources
   */
  stop() {
    // Stop the core
    this.core.stop();
    
    // Update session state
    this.session.setState(SESSION_STATE.IDLE);
  }
  
  /**
   * Clean up and release all resources
   */
  destroy() {
    this.stop();
    this.core.cleanup();
    this.events.clear();
  }
  
  /**
   * Check if the voice module has been initialized
   * @returns {boolean} - True if the module is initialized and ready
   */
  isInitialized() {
    return this.core?.isInitialized || false;
  }

  /**
   * Start recording (for push-to-talk mode)
   * @returns {Promise<void>}
   */
  async startRecording() {
    if (this.config.mode === MODES.PUSH_TO_TALK) {
      // Lazy initialization on user gesture
      if (!this.isInitialized()) {
        await this.start();
      }
      await this.core.startRecording();
    }
  }
  
  /**
   * Stop recording (for push-to-talk mode)
   * @returns {Promise<void>}
   */
  async stopRecording() {
    if (this.config.mode === MODES.PUSH_TO_TALK && this.isInitialized()) {
      await this.core.stopRecording();
    }
  }
  
  /**
   * Toggle recording state (for push-to-talk mode)
   * @returns {Promise<boolean>} - New recording state
   */
  async toggleRecording() {
    if (this.config.mode === MODES.PUSH_TO_TALK) {
      // Lazy initialization on user gesture
      if (!this.isInitialized()) {
        await this.start();
      }
      return await this.core.toggleRecording();
    }
    return false;
  }
  
  /**
   * Set the input mode (push-to-talk or walkie-talkie)
   * @param {string} mode - Mode identifier ('push' or 'walkie')
   * @returns {Promise<void>}
   */
  async setMode(mode) {
    if (mode !== MODES.PUSH_TO_TALK && mode !== MODES.VOICE_ACTIVATED) {
      throw new Error(`Invalid mode: ${mode}. Use 'push' or 'walkie'`);
    }
    
    this.config.mode = mode;
    
    // Lazy initialization on user gesture
    if (!this.isInitialized()) {
      await this.start();
      return;
    }
    
    // If already initialized, reconfigure the input mode
    // Implementation would depend on your voice-core structure
    // For this example, we'll assume we need to reinitialize the module
    await this.stop();
    await this.start();
  }
  
  /**
   * Subscribe to an event
   * 
   * @param {string} event - Event name from EVENTS object
   * @param {Function} callback - Function to call when event occurs
   * @returns {Function} - Unsubscribe function
   */
  on(event, callback) {
    return this.events.on(event, callback);
  }
  
  /**
   * Get the current session state
   * @returns {Object} - Session state summary
   */
  getState() {
    return this.session.getStateSummary();
  }
  
  /**
   * Get the latest transcript
   * @returns {Object|null} - Latest transcript or null if none available
   */
  getLatestTranscript() {
    return this.session.getLatestTranscript();
  }
  
  /**
   * Get all final transcripts
   * @returns {Array} - Array of final transcripts
   */
  getFinalTranscripts() {
    return this.session.getFinalTranscripts();
  }
  
  /**
   * Clear all stored transcripts
   */
  clearTranscripts() {
    this.session.clearTranscripts();
  }
  
  /**
   * Get module configuration
   * @returns {Object} - Current configuration
   */
  getConfig() {
    return { ...this.config };
  }
  
  /**
   * Process and normalize the configuration
   * @param {Object} config - User configuration
   * @returns {Object} - Processed configuration
   * @private
   */
  _processConfig(config) {
    // Default configuration
    const defaultConfig = {
      mode: MODES.PUSH_TO_TALK,
      serverUrl: WEBSOCKET.ASR_ENDPOINT,
      audio: {
        sampleRate: AUDIO.SAMPLE_RATE,
        frameSize: AUDIO.FRAME_SIZE
      },
      voice: {
        threshold: VOICE_DETECTION.RMS_THRESHOLD,
        holdDuration: VOICE_DETECTION.HOLD_DURATION
      },
      debug: false
    };
    
    // Merge configurations
    const mergedConfig = { ...defaultConfig, ...config };
    
    // Ensure audio config is properly structured
    if (!mergedConfig.audio || typeof mergedConfig.audio !== 'object') {
      mergedConfig.audio = { ...defaultConfig.audio };
    } else {
      mergedConfig.audio = { ...defaultConfig.audio, ...mergedConfig.audio };
    }
    
    // Ensure voice config is properly structured
    if (!mergedConfig.voice || typeof mergedConfig.voice !== 'object') {
      mergedConfig.voice = { ...defaultConfig.voice };
    } else {
      mergedConfig.voice = { ...defaultConfig.voice, ...mergedConfig.voice };
    }
    
    return mergedConfig;
  }
}

// Export constants and events for convenience
export { MODES, EVENTS, SESSION_STATE };

// Export as default
export default VoiceModule;
