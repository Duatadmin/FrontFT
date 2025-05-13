/**
 * Voice Module
 * 
 * A self-contained, embeddable JavaScript module for microphone audio streaming
 * via AudioWorklet and WebSocket, initialized only on user gesture.
 */

import { MODES, AUDIO } from './config/constants.js';

/**
 * Main VoiceModule class
 * Provides a simple interface for voice input capabilities using AudioWorklet and WebSockets
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
   * @param {Function} [config.onTranscript] - Callback for transcript events
   * @param {Function} [config.onStateChange] - Callback for state changes
   * @param {boolean} [config.debug=false] - Enable debug logging
   */
  constructor(config = {}) {
    this.config = {
      mode: config.mode || MODES.PUSH_TO_TALK,
      serverUrl: config.serverUrl || import.meta.env.VITE_ASR_WS_URL,
      audio: {
        sampleRate: config.audio?.sampleRate || AUDIO.SAMPLE_RATE,
        frameSize: config.audio?.frameSize || AUDIO.FRAME_SIZE
      },
      onTranscript: config.onTranscript,
      onStateChange: config.onStateChange,
      debug: !!config.debug
    };
    
    // Audio and WebSocket components will be initialized in start()
    this.audioContext = null;
    this.mediaStream = null;
    this.source = null;
    this.node = null;
    this.socket = null;
    this.isRecording = false;
  }
  
  /**
   * Initialize the voice module - creates AudioContext, loads WorkletProcessor
   * and sets up WebSocket
   * @returns {Promise<void>}
   */
  async start() {
    try {
      if (this.audioContext) {
        this._log('VoiceModule already initialized');
        return;
      }
      
      // Create AudioContext
      this.audioContext = new AudioContext({
        sampleRate: this.config.audio.sampleRate,
        latencyHint: 'interactive'
      });
      
      // Get microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      // Create media stream source
      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      // Load AudioWorklet module - use absolute public path
      await this.audioContext.audioWorklet.addModule('/audio/worklet/pcm-processor.js');
      
      // Create and connect AudioWorkletNode
      this.node = new AudioWorkletNode(this.audioContext, 'pcm-processor', {
        processorOptions: {
          sampleRate: this.config.audio.sampleRate,
          frameSize: this.config.audio.frameSize
        }
      });
      
      // Connect the audio graph
      this.source.connect(this.node).connect(this.audioContext.destination); // ensure processor receives pull
      
      this._log('VoiceModule initialized successfully');
      
      if (this.config.onStateChange) {
        this.config.onStateChange('ready');
      }
      
    } catch (error) {
      this._log('Failed to start VoiceModule:', error);
      if (this.config.onStateChange) {
        this.config.onStateChange('error', error);
      }
      throw error;
    }
  }
  
  /**
   * Check if the voice module has been initialized
   * @returns {boolean} - True if the module is initialized
   */
  isInitialized() {
    return !!this.audioContext;
  }
  
  /**
   * Connect to WebSocket server
   * @returns {Promise<void>}
   */
  async connectWebSocket() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }
    
    try {
      this._log('Connecting to WebSocket server...');
      this.socket = new WebSocket(this.config.serverUrl);
      this.socket.binaryType = 'arraybuffer';
      
      return new Promise((resolve, reject) => {
        this.socket.onopen = () => {
          this._log('WebSocket connected');
          resolve();
        };
        
        this.socket.onerror = (error) => {
          this._log('WebSocket error:', error);
          reject(error);
        };
        
        this.socket.onmessage = (event) => {
          // Handle transcript messages
          if (typeof event.data === 'string') {
            try {
              const data = JSON.parse(event.data);
              if (data.transcript && this.config.onTranscript) {
                this.config.onTranscript(data);
              }
            } catch (e) {
              this._log('Error parsing transcript:', e);
            }
          }
        };
      });
    } catch (error) {
      this._log('Failed to connect WebSocket:', error);
      throw error;
    }
  }

  /**
   * Start recording and streaming audio to WebSocket
   * @returns {Promise<void>}
   */
  async startRecording() {
    try {
      // Lazy initialization on user gesture
      if (!this.isInitialized()) {
        await this.start();
      }
      
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      // Connect to WebSocket if not already connected
      await this.connectWebSocket();
      
      // Set up message handler to stream audio chunks
      this.node.port.onmessage = (event) => {
        // Direct processing of AudioWorklet message, matching the successful console example
        try {
          if (this.isRecording && this.socket?.readyState === WebSocket.OPEN) {
            // Check if we have direct data or data in event.data.data
            let chunk;
            if (event.data instanceof Int16Array) {
              chunk = event.data;
            } else if (event.data && event.data.type === 'pcm' && event.data.data) {
              chunk = event.data.data;
            } else {
              // Try to process as new Int16Array like in console example
              chunk = new Int16Array(event.data);
            }
            
            // Calculate RMS like in the console example
            if (this.config.debug) {
              const rms = Math.sqrt(chunk.reduce((s, x) => s + x * x, 0) / chunk.length) / 32768;
              this._log(`[RMS] ${rms.toFixed(4)}`);
            }
            
            // Send binary buffer to WebSocket
            this.socket.send(chunk.buffer);
          }
        } catch (error) {
          this._log('Error processing audio chunk:', error);
        }
      };
      
      this.isRecording = true;
      
      if (this.config.onStateChange) {
        this.config.onStateChange('recording');
      }
      
      this._log('Recording started');
    } catch (error) {
      this._log('Failed to start recording:', error);
      throw error;
    }
  }
  
  /**
   * Stop recording and disconnect WebSocket
   * @returns {Promise<void>}
   */
  async stopRecording() {
    if (!this.isRecording) return;
    
    try {
      // Stop streaming audio
      this.isRecording = false;
      
      // Remove message handler
      if (this.node) {
        this.node.port.onmessage = null;
      }
      
      // Close WebSocket
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.close();
        this.socket = null;
      }
      
      if (this.config.onStateChange) {
        this.config.onStateChange('idle');
      }
      
      this._log('Recording stopped');
    } catch (error) {
      this._log('Error stopping recording:', error);
      throw error;
    }
  }
  
  /**
   * Toggle recording state
   * @returns {Promise<boolean>} - New recording state
   */
  async toggleRecording() {
    if (this.isRecording) {
      await this.stopRecording();
      return false;
    } else {
      await this.startRecording();
      return true;
    }
  }
  
  /**
   * Clean up and release all resources
   */
  async destroy() {
    try {
      // Stop recording if active
      if (this.isRecording) {
        await this.stopRecording();
      }
      
      // Close WebSocket
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }
      
      // Stop all media tracks
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = null;
      }
      
      // Disconnect audio nodes
      if (this.source) {
        this.source.disconnect();
        this.source = null;
      }
      
      if (this.node) {
        this.node.disconnect();
        this.node = null;
      }
      
      // Close audio context
      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }
      
      this._log('VoiceModule destroyed');
    } catch (error) {
      this._log('Error destroying VoiceModule:', error);
    }
  }
  
  /**
   * Utility for logging messages when debug is enabled
   * @private
   * @param {...any} args - Arguments to log
   */
  _log(...args) {
    if (this.config.debug) {
      console.log('[VoiceModule]', ...args);
    }
  }
}

// Export constants for convenience
export { MODES };

// Export as default
export default VoiceModule;

// Export the bus from voice-core
export { bus } from './core/voice-core.js';
