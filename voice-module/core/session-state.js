/**
 * Session State Manager
 * 
 * Manages the state of the voice module session, including transcripts,
 * connection status, and recording state.
 */

/**
 * Session states
 */
export const SESSION_STATE = {
  IDLE: 'idle',              // Not connected, not recording
  CONNECTING: 'connecting',  // Connecting to server
  READY: 'ready',            // Connected, not recording
  RECORDING: 'recording',    // Connected and recording
  ERROR: 'error'             // Error state
};

/**
 * Session state manager for voice module
 */
export class SessionState {
  /**
   * Create a new session state manager
   * @param {Object} config - Configuration object
   * @param {Function} [config.onStateChange] - Optional callback for state changes
   */
  constructor({ onStateChange = null }) {
    this.state = SESSION_STATE.IDLE;
    this.error = null;
    this.wsConnected = false;
    this.micAccess = false;
    this.transcripts = [];
    this.onStateChange = onStateChange;
    
    // Keep only the most recent transcripts (configurable limit)
    this.transcriptLimit = 10;
  }
  
  /**
   * Set the current session state
   * @param {string} newState - New state to set
   * @param {Error} [error] - Optional error object if in error state
   */
  setState(newState, error = null) {
    const prevState = this.state;
    this.state = newState;
    this.error = error;
    
    if (prevState !== newState && typeof this.onStateChange === 'function') {
      this.onStateChange(newState, prevState, error);
    }
  }
  
  /**
   * Update WebSocket connection status
   * @param {boolean} connected - Connection status
   */
  setWSConnected(connected) {
    this.wsConnected = connected;
    
    // Update state based on connection status
    if (connected && this.state === SESSION_STATE.CONNECTING) {
      this.setState(SESSION_STATE.READY);
    } else if (!connected && 
              (this.state === SESSION_STATE.READY || 
               this.state === SESSION_STATE.RECORDING)) {
      this.setState(SESSION_STATE.IDLE);
    }
  }
  
  /**
   * Update microphone access status
   * @param {boolean} hasAccess - Whether microphone access is granted
   */
  setMicAccess(hasAccess) {
    this.micAccess = hasAccess;
  }
  
  /**
   * Update recording status
   * @param {boolean} isRecording - Whether recording is active
   */
  setRecording(isRecording) {
    if (isRecording && this.state === SESSION_STATE.READY) {
      this.setState(SESSION_STATE.RECORDING);
    } else if (!isRecording && this.state === SESSION_STATE.RECORDING) {
      this.setState(SESSION_STATE.READY);
    }
  }
  
  /**
   * Add a new transcript to the session history
   * @param {Object} transcript - Transcript object {text, is_final, timestamp}
   */
  addTranscript(transcript) {
    // Add timestamp if not present
    const timestampedTranscript = transcript.timestamp ? 
      transcript : {
        ...transcript,
        timestamp: new Date().toISOString()
      };
    
    // Add to transcript history
    this.transcripts.push(timestampedTranscript);
    
    // Keep transcript history limited
    if (this.transcripts.length > this.transcriptLimit) {
      this.transcripts.shift();
    }
    
    return timestampedTranscript;
  }
  
  /**
   * Get the latest transcript
   * @returns {Object|null} Latest transcript or null if none exist
   */
  getLatestTranscript() {
    if (this.transcripts.length > 0) {
      return this.transcripts[this.transcripts.length - 1];
    }
    return null;
  }
  
  /**
   * Get all transcripts
   * @returns {Array} Array of transcript objects
   */
  getAllTranscripts() {
    return [...this.transcripts];
  }
  
  /**
   * Get only final transcripts
   * @returns {Array} Array of final transcript objects
   */
  getFinalTranscripts() {
    return this.transcripts.filter(t => t.is_final === true);
  }
  
  /**
   * Clear all transcripts
   */
  clearTranscripts() {
    this.transcripts = [];
  }
  
  /**
   * Set error state with error information
   * @param {Error} error - Error object
   */
  setError(error) {
    this.setState(SESSION_STATE.ERROR, error);
  }
  
  /**
   * Reset error state
   */
  clearError() {
    this.error = null;
    
    // Determine appropriate state based on connection status
    if (this.wsConnected) {
      this.setState(SESSION_STATE.READY);
    } else {
      this.setState(SESSION_STATE.IDLE);
    }
  }
  
  /**
   * Check if session is in a specific state
   * @param {string} stateToCheck - State to check
   * @returns {boolean} - Whether session is in specified state
   */
  isInState(stateToCheck) {
    return this.state === stateToCheck;
  }

  /**
   * Check if the session is currently recording
   * @returns {boolean}
   */
  isRecording() {
    return this.state === SESSION_STATE.RECORDING;
  }
  
  /**
   * Get summary of current session state
   * @returns {Object} - State summary object
   */
  getStateSummary() {
    return {
      state: this.state,
      wsConnected: this.wsConnected,
      micAccess: this.micAccess,
      isRecording: this.state === SESSION_STATE.RECORDING,
      hasError: this.state === SESSION_STATE.ERROR,
      error: this.error,
      transcriptCount: this.transcripts.length,
      latestTranscript: this.getLatestTranscript()
    };
  }
}
