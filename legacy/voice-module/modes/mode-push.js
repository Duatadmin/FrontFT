/**
 * Push-to-Talk Mode Controller
 * 
 * Implements manual push-to-talk mode where recording is explicitly
 * started and stopped by user action.
 */

/**
 * Simple controller for push-to-talk recording mode
 */
export class PushToTalkMode {
  /**
   * Create a push-to-talk mode controller
   * 
   * @param {Object} config - Configuration
   * @param {Function} config.onStateChange - Callback when active state changes: (isActive: boolean) => void
   */
  constructor({ onStateChange }) {
    this.active = false;
    this.onStateChange = onStateChange;
  }

  /**
   * Start recording (e.g., when button is pressed)
   */
  start() {
    if (!this.active) {
      this.active = true;
      this._notifyStateChange();
      console.debug('[Push] Recording started');
    }
  }

  /**
   * Stop recording (e.g., when button is released)
   */
  stop() {
    if (this.active) {
      this.active = false;
      this._notifyStateChange();
      console.debug('[Push] Recording stopped');
    }
  }

  /**
   * Check if recording is active
   * @returns {boolean}
   */
  isActive() {
    return this.active;
  }

  /**
   * Toggle recording state
   * @returns {boolean} - New active state
   */
  toggle() {
    this.active = !this.active;
    this._notifyStateChange();
    console.debug(`[Push] Recording ${this.active ? 'started' : 'stopped'}`);
    return this.active;
  }

  /**
   * Notify state change if callback exists
   * @private
   */
  _notifyStateChange() {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange(this.active);
    }
  }
}
