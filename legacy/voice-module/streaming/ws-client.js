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
        // Check readyState again as an extra precaution
        if (this.socket.readyState === WebSocket.OPEN) {
          // Log diagnostic info before sending
          console.log('[SEND]', chunk.byteLength, 'bytes');
          this.socket.send(chunk.buffer);
        } else {
          console.debug('[WS] Socket not in OPEN state:', this.socket.readyState);
        }
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

  /**
   * Returns a promise that resolves when the socket is ready
   * @returns {Promise<void>}
   */
  socketReady() {
    return new Promise((resolve, reject) => {
      if (this.isConnected()) {
        resolve();
        return;
      }
      
      const checkInterval = 100; // ms
      const maxWait = 5000; // 5 seconds timeout
      let waited = 0;
      
      const checkLoop = () => {
        if (this.isConnected()) {
          resolve();
          return;
        }
        
        waited += checkInterval;
        if (waited >= maxWait) {
          reject(new Error('Timed out waiting for WebSocket to be ready'));
          return;
        }
        
        setTimeout(checkLoop, checkInterval);
      };
      
      checkLoop();
    });
  }

  /**
   * Close the WebSocket connection with optional code and reason
   * 
   * @param {number} [code=1000] - Status code
   * @param {string} [reason='Normal closure'] - Close reason
   */
  close(code = 1000, reason = 'Normal closure') {
    if (this.socket) {
      try {
        // Only attempt to close if the connection is open
        if (this.socket.readyState === WebSocket.OPEN) {
          console.log(`[WS] Closing with code=${code}, reason="${reason}"`);
          this.socket.close(code, reason);
        }
      } catch (error) {
        console.error('[WS] Error during close:', error);
      } finally {
        this.socket = null;
        this.connected = false;
        this._notifyStatusChange(false);
      }
    }
  }

  // Private handlers

  /**
   * Handle WebSocket open event
   * @private
   */
  _handleOpen(event) {
    console.log('[WS] ✅ open');
    this.connected = true;
    this._notifyStatusChange(true);
  }

  /**
   * Handle incoming WebSocket messages
   * @private
   */
  _handleMessage(event) {
    try {
      console.log('[RX]', typeof event.data === 'string' ? event.data.slice(0, 80) : 'Binary data received');
      
      // Parse the JSON message
      const msg = JSON.parse(event.data);
      
      // Check if it's a valid transcript response in standard format
      if (msg.text !== undefined) {
        this.onTranscript({
          text: msg.text,
          is_final: msg.is_final === true
        });
      } 
      // Check for Deepgram format
      else if (msg.channel?.alternatives?.length) {
        const txt = msg.channel.alternatives[0].transcript;
        if (txt && txt.trim()) {
          console.log('[TRANSCRIPT]', txt, 'final:', msg.is_final);
          this.onTranscript({
            text: txt,
            is_final: msg.is_final === true
          });
        }
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
    console.log(`[WS] ❌ close ${event.code} ${event.reason}`);
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
