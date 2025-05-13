/**
 * Voice Module
 * 
 * A self-contained, embeddable JavaScript module for microphone audio streaming
 * via AudioWorklet and WebSocket, initialized only on user gesture.
 */

import { MODES } from './config/constants.js';
import { VoiceCore } from './core/voice-core.js';

/**
 * Main VoiceModule class
 * Provides a simple interface for voice input capabilities using AudioWorklet and WebSockets
 */
export class VoiceModule {
  /**
   * Create a new VoiceModule instance
   * 
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.core = new VoiceCore(config);
  }

  /* ---- public passthroughs ---- */
  async start() { return this.core.start(); }
  startRecording() { return this.core.startRecording(); }
  stopRecording() { return this.core.stopRecording(); }
  toggleRecording() { return this.core.toggleRecording(); }
  destroy() { return this.core.destroy(); }

  /* helpers */
  getState() { return this.core.getState?.(); }
  getTranscripts() { return this.core.getTranscripts?.(); }
}

// Export constants for convenience
export { MODES };

// Export as default
export default VoiceModule;

// Export the bus from voice-core
export { bus } from './core/voice-core.js';
