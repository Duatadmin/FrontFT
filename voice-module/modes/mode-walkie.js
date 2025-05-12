/**
 * Walkie-Talkie Mode Controller
 * 
 * Implements voice-activated input mode using RMS energy detection.
 * Automatically starts and stops recording based on detected voice activity.
 */

import { VOICE_DETECTION } from '../config/constants.js';

// Voice activity states
const STATE = {
  IDLE: 'idle',       // No voice activity detected
  ACTIVE: 'active',   // Voice detected, streaming active
  HOLD: 'hold'        // Voice stopped, but still in holdover time
};

/**
 * Calculate Root Mean Square (RMS) energy from audio samples
 * @param {Int16Array|Float32Array} samples - Audio samples
 * @returns {number} - RMS value between 0-1
 */
function calculateRMS(samples) {
  let sum = 0;
  const isInt16 = samples instanceof Int16Array;
  const divisor = isInt16 ? 32768.0 : 1.0;
  
  for (let i = 0; i < samples.length; i++) {
    // Convert to float (-1.0 to 1.0) if needed
    const sample = samples[i] / divisor;
    sum += sample * sample;
  }
  
  return Math.sqrt(sum / samples.length);
}

export class WalkieTalkieMode {
  /**
   * Create a voice-activated mode controller
   * 
   * @param {Object} config - Configuration
   * @param {Function} config.onStateChange - (isActive: boolean) => void
   * @param {number} [config.threshold] - Optional custom RMS threshold
   * @param {number} [config.holdDuration] - Optional custom hold time (ms)
   * @param {number} [config.activationDuration] - Optional custom activation time (ms)
   */
  constructor({ 
    onStateChange, 
    threshold = VOICE_DETECTION.RMS_THRESHOLD,
    holdDuration = VOICE_DETECTION.HOLD_DURATION,
    activationDuration = VOICE_DETECTION.ACTIVATION_DURATION
  }) {
    // Configuration
    this.threshold = threshold;
    this.holdDuration = holdDuration;
    this.activationDuration = activationDuration;
    this.onStateChange = onStateChange;
    
    // State tracking
    this.state = STATE.IDLE;
    this.active = false;
    this.holdTimer = null;
    this.activationTimer = null;
    this.consecutiveAboveThreshold = 0;
    
    // Bind method context
    this._endHoldState = this._endHoldState.bind(this);
    this._changeState = this._changeState.bind(this);
  }

  /**
   * Analyze audio chunk for voice activity
   * @param {Int16Array|Float32Array} chunk - Audio data
   */
  analyze(chunk) {
    if (!chunk || chunk.length === 0) return;
    
    // Calculate RMS energy for this chunk
    const rms = calculateRMS(chunk);
    
    // State machine logic
    switch (this.state) {
      case STATE.IDLE:
        if (rms >= this.threshold) {
          // Increment counter for consecutive frames above threshold
          this.consecutiveAboveThreshold++;
          
          // Check if we've been above threshold long enough to activate
          if (!this.activationTimer) {
            this.activationTimer = setTimeout(() => {
              if (this.consecutiveAboveThreshold > 0) {
                this._changeState(STATE.ACTIVE);
              }
              this.activationTimer = null;
            }, this.activationDuration);
          }
        } else {
          // Reset counters if we drop below threshold
          this.consecutiveAboveThreshold = 0;
          if (this.activationTimer) {
            clearTimeout(this.activationTimer);
            this.activationTimer = null;
          }
        }
        break;
        
      case STATE.ACTIVE:
        if (rms < this.threshold) {
          // Voice activity stopped, transition to HOLD state
          this._changeState(STATE.HOLD);
          
          // Set timer to revert to IDLE after holdDuration
          this.holdTimer = setTimeout(this._endHoldState, this.holdDuration);
        }
        break;
        
      case STATE.HOLD:
        if (rms >= this.threshold) {
          // Voice activity resumed, go back to ACTIVE state
          this._changeState(STATE.ACTIVE);
          
          // Clear holdover timer
          if (this.holdTimer) {
            clearTimeout(this.holdTimer);
            this.holdTimer = null;
          }
        }
        break;
    }
  }
  
  /**
   * Check if voice mode is currently active
   * @returns {boolean}
   */
  isActive() {
    return this.active;
  }
  
  /**
   * Reset state machine to idle
   */
  reset() {
    // Clear any pending timers
    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }
    
    if (this.activationTimer) {
      clearTimeout(this.activationTimer);
      this.activationTimer = null;
    }
    
    // Reset to idle state
    this._changeState(STATE.IDLE);
  }
  
  /**
   * End the hold state and transition to idle
   * @private
   */
  _endHoldState() {
    if (this.state === STATE.HOLD) {
      this._changeState(STATE.IDLE);
      this.holdTimer = null;
    }
  }
  
  /**
   * Change state and notify listeners if activity changed
   * @param {string} newState - New state to transition to
   * @private
   */
  _changeState(newState) {
    const prevState = this.state;
    this.state = newState;
    
    // Determine active status based on state
    const wasActive = this.active;
    this.active = (newState === STATE.ACTIVE || newState === STATE.HOLD);
    
    // Notify if active status changed
    if (wasActive !== this.active && typeof this.onStateChange === 'function') {
      this.onStateChange(this.active);
    }
    
    // Debug logging
    console.debug(`[Walkie] State changed: ${prevState} -> ${newState}`);
  }
}
