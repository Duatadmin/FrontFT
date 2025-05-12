/**
 * WebSocketClient
 * 
 * Handles streaming audio data to ASR server and receiving transcription responses
 */
export class WebSocketClient {
  /**
   * Create a new WebSocket client for audio streaming
   * 
   * @param {Object} config - Configuration object
   * @param {string} config.url - WebSocket server URL
   * @param {Function} config.onTranscript - Callback for transcript events: ({ text, is_final }) => void
   * @param {Function} [config.onStatusChange] - Optional callback for connection status changes
   */
  constructor({ url, onTranscript, onStatusChange = null }) {
    this.url = url;
    this.onTranscript = onTranscript;
    this.onStatusChange = onStatusChange;
    this.socket = null;
    this.connected = false;
    
    // Bind methods to ensure correct 'this' context
    this._handleMessage = this._handleMessage.bind(this);
    this._handleError = this._handleError.bind(this);
    this._handleClose = this._handleClose.bind(this);
    this._handleOpen = this._handleOpen.bind(this);
  }

  /**
   * Establish WebSocket connection
   * 
   * @returns {Promise<void>} - Resolves when connected, rejects on error
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        // Clean up any existing connection
        if (this.socket) {
          this.disconnect();
        }

        // Create new WebSocket connection
        this.socket = new WebSocket(this.url);
        this.socket.binaryType = 'arraybuffer'; // Important for binary data

        // Setup connection success handler
        this.socket.onopen = (event) => {
          this._handleOpen(event);
          resolve();
        };

        // Setup error handler for initial connection
        this.socket.onerror = (error) => {
          if (!this.connected) {
            reject(new Error('Failed to connect to WebSocket server'));
          }
          this._handleError(error);
        };

        // Setup message and close handlers
        this.socket.onmessage = this._handleMessage;
        this.socket.onclose = this._handleClose;
      } catch (error) {
        console.error('[WS] Connection error:', error);
        reject(error);
      }
    });
  }

  /**
   * Send binary audio data to WebSocket server
   * 
   * @param {Int16Array} chunk - Audio data chunk to send
   */
  send(chunk) {
    if (!chunk || !(chunk instanceof Int16Array)) {
      console.warn('[WS] Invalid chunk provided to send()');
      return;
    }

    if (this.isConnected()) {
      try {
        // Send the buffer directly (transferable)
        this.socket.send(chunk.buffer);
      } catch (error) {
        console.error('[WS] Error sending data:', error);
      }
    } else {
      console.debug('[WS] Not connected, cannot send data');
    }
  }

  /**
   * Gracefully close the WebSocket connection
   */
  disconnect() {
    if (this.socket) {
      try {
        // Only attempt to close if the connection is open
        if (this.socket.readyState === WebSocket.OPEN) {
          this.socket.close(1000, 'Client disconnected');
        }
      } catch (error) {
        console.error('[WS] Error during disconnect:', error);
      } finally {
        this.socket = null;
        this.connected = false;
        this._notifyStatusChange(false);
      }
    }
  }

  /**
   * Check if socket is currently connected
   * 
   * @returns {boolean} - True if socket is open and ready
   */
  isConnected() {
    return this.socket !== null && 
           this.socket.readyState === WebSocket.OPEN &&
           this.connected;
  }

  // Private handlers

  /**
   * Handle WebSocket open event
   * @private
   */
  _handleOpen(event) {
    console.log('[WS] Connection established');
    this.connected = true;
    this._notifyStatusChange(true);
  }

  /**
   * Handle incoming WebSocket messages
   * @private
   */
  _handleMessage(event) {
    try {
      // Parse the JSON message
      const json = JSON.parse(event.data);
      
      // Check if it's a valid transcript response
      if (json.text !== undefined) {
        this.onTranscript({
          text: json.text,
          is_final: json.is_final === true
        });
      }
    } catch (error) {
      console.warn('[WS] Failed to parse message:', error);
    }
  }

  /**
   * Handle WebSocket errors
   * @private
   */
  _handleError(error) {
    console.error('[WS] Connection error:', error);
  }

  /**
   * Handle WebSocket close events
   * @private
   */
  _handleClose(event) {
    console.log(`[WS] Connection closed: ${event.code} ${event.reason}`);
    this.connected = false;
    this.socket = null;
    this._notifyStatusChange(false);
  }

  /**
   * Notify status change if callback exists
   * @private
   */
  _notifyStatusChange(connected) {
    if (typeof this.onStatusChange === 'function') {
      this.onStatusChange(connected);
    }
  }
}
