/**
 * Event Bus
 * 
 * Simple event emitter/subscriber system for communication between
 * different components of the voice module.
 */

/**
 * List of events used in the voice module
 */
export const EVENTS = {
  // Audio and recording events
  RECORDING_STARTED: 'recording:started',
  RECORDING_STOPPED: 'recording:stopped',
  AUDIO_LEVEL: 'audio:level',
  VOICE_DETECTED: 'voice:detected',
  VOICE_ENDED: 'voice:ended',
  
  // WebSocket and connection events
  WS_CONNECTED: 'ws:connected',
  WS_DISCONNECTED: 'ws:disconnected',
  WS_ERROR: 'ws:error',
  
  // Transcript events
  TRANSCRIPT_INTERIM: 'transcript:interim',
  TRANSCRIPT_FINAL: 'transcript:final',
  
  // Session events
  SESSION_STATE_CHANGED: 'session:stateChanged',
  ERROR: 'error'
};

/**
 * Simple event bus implementation
 */
export class EventBus {
  /**
   * Create a new event bus
   */
  constructor() {
    this.listeners = {};
  }

  /**
   * Subscribe to an event
   * 
   * @param {string} event - Event name to subscribe to
   * @param {Function} callback - Function to call when event occurs
   * @returns {Function} - Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    this.listeners[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  /**
   * Unsubscribe from an event
   * 
   * @param {string} event - Event name to unsubscribe from
   * @param {Function} callback - Function to remove
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    
    const index = this.listeners[event].indexOf(callback);
    if (index !== -1) {
      this.listeners[event].splice(index, 1);
    }
  }

  /**
   * Emit an event with data
   * 
   * @param {string} event - Event name to emit
   * @param {*} data - Data to pass to listeners
   */
  emit(event, data) {
    if (!this.listeners[event]) return;
    
    // Make a copy of listeners array to avoid issues if listeners unsubscribe during execution
    const callbacks = [...this.listeners[event]];
    
    for (const callback of callbacks) {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    }
  }

  /**
   * Subscribe to an event for a single occurrence
   * 
   * @param {string} event - Event name to subscribe to once
   * @param {Function} callback - Function to call when event occurs
   * @returns {Function} - Unsubscribe function
   */
  once(event, callback) {
    const onceWrapper = (data) => {
      callback(data);
      this.off(event, onceWrapper);
    };
    
    return this.on(event, onceWrapper);
  }

  /**
   * Clear all event listeners
   * 
   * @param {string} [event] - Optional event to clear. If not provided, clears all events.
   */
  clear(event) {
    if (event) {
      this.listeners[event] = [];
    } else {
      this.listeners = {};
    }
  }

  /**
   * Get count of listeners for an event
   * 
   * @param {string} event - Event name to check
   * @returns {number} - Number of listeners
   */
  listenerCount(event) {
    return this.listeners[event]?.length || 0;
  }
}
