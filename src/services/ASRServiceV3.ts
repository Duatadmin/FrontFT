// src/services/ASRServiceV3.ts

export type ASRTranscriptMessage = {
  text: string;
  final: boolean;
};

export type ASRErrorMessage = {
  error: string;
};

export type ASRMessage = ASRTranscriptMessage | ASRErrorMessage;

export interface ASRServiceOptions {
  host: string;
  mode?: 'push' | 'walkie'; // Default to walkie for always-on listening
  onTranscript?: (transcript: ASRTranscriptMessage) => void;
  onError?: (error: Error) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export class ASRServiceV3 {
  private static readonly INITIAL_RECONNECT_DELAY = 200;
  private static readonly DEFAULT_CONNECT_TIMEOUT = 7000;

  private socket: WebSocket | null = null;
  private options: ASRServiceOptions;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectDelay = ASRServiceV3.INITIAL_RECONNECT_DELAY;
  private maxReconnectDelay = 30000;
  private isIntentionalClose = false;
  private connectionPromise: Promise<void> | null = null;
  private resolveConnection: (() => void) | null = null;
  private rejectConnection: ((error: Error) => void) | null = null;
  private connectTimer: NodeJS.Timeout | null = null;

  constructor(options: ASRServiceOptions) {
    this.options = {
      mode: 'walkie',
      ...options
    };
  }

  private getWebSocketUrl(): string {
    const protocol = this.options.host.startsWith('localhost') || this.options.host.includes('127.0.0.1') ? 'ws' : 'wss';
    const endpoint = this.options.mode === 'push' ? '/v2/ws/push' : '/v2/ws/walkie';
    return `${protocol}://${this.options.host}${endpoint}`;
  }

  async connect(timeoutMs: number = ASRServiceV3.DEFAULT_CONNECT_TIMEOUT): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.isIntentionalClose = false;

    this.connectionPromise = new Promise<void>((resolve, reject) => {
      this.resolveConnection = resolve;
      this.rejectConnection = reject;

      // Connection timeout
      this.connectTimer = setTimeout(() => {
        console.error(`[ASRServiceV3] Connection timed out after ${timeoutMs}ms`);
        if (this.socket) {
          this.socket.close();
          this.socket = null;
        }
        if (this.rejectConnection) {
          this.rejectConnection(new Error(`WebSocket connection timed out after ${timeoutMs}ms`));
          this.resolveConnection = null;
          this.rejectConnection = null;
        }
      }, timeoutMs);

      try {
        const url = this.getWebSocketUrl();
        console.log(`[ASRServiceV3] Connecting to ${url}`);

        this.socket = new WebSocket(url);
        this.socket.binaryType = 'arraybuffer';

        this.socket.onopen = () => {
          if (this.connectTimer) {
            clearTimeout(this.connectTimer);
            this.connectTimer = null;
          }
          console.log('[ASRServiceV3] WebSocket connected');
          this.reconnectDelay = ASRServiceV3.INITIAL_RECONNECT_DELAY;

          if (this.options.onConnectionChange) {
            this.options.onConnectionChange(true);
          }

          if (this.resolveConnection) {
            this.resolveConnection();
            this.resolveConnection = null;
            this.rejectConnection = null;
          }
        };

        this.socket.onmessage = (event) => {
          try {
            const data: ASRMessage = JSON.parse(event.data);

            if ('error' in data) {
              console.error('[ASRServiceV3] Server error:', data.error);
              if (this.options.onError) {
                this.options.onError(new Error(data.error));
              }
            } else if ('text' in data && 'final' in data) {
              console.log(`[ASRServiceV3] Transcript received - Text: "${data.text}", Final: ${data.final}`);

              // Only process final transcripts as requested
              if (data.final && this.options.onTranscript) {
                this.options.onTranscript(data);
              }
            }
          } catch (error) {
            console.error('[ASRServiceV3] Failed to parse message:', error);
            if (this.options.onError) {
              this.options.onError(error instanceof Error ? error : new Error(String(error)));
            }
          }
        };

        this.socket.onerror = (event) => {
          console.error('[ASRServiceV3] WebSocket error:', event);
          if (this.options.onError) {
            this.options.onError(new Error('WebSocket connection error'));
          }
        };

        this.socket.onclose = (event) => {
          if (this.connectTimer) {
            clearTimeout(this.connectTimer);
            this.connectTimer = null;
          }
          console.log(`[ASRServiceV3] WebSocket closed - Code: ${event.code}, Reason: ${event.reason}`);

          if (this.options.onConnectionChange) {
            this.options.onConnectionChange(false);
          }

          // Reject pending connect on ANY close before onopen resolved
          if (this.rejectConnection) {
            this.rejectConnection(new Error(`WebSocket closed before open: code=${event.code}, reason=${event.reason || 'none'}`));
            this.resolveConnection = null;
            this.rejectConnection = null;
          }

          // Cleanup connection promise state
          this.connectionPromise = null;

          // Auto-reconnect for walkie mode unless intentionally closed
          if (this.options.mode === 'walkie' && !this.isIntentionalClose && !event.wasClean) {
            this.scheduleReconnect();
          }
        };

      } catch (error) {
        if (this.connectTimer) {
          clearTimeout(this.connectTimer);
          this.connectTimer = null;
        }
        console.error('[ASRServiceV3] Failed to create WebSocket:', error);
        if (this.rejectConnection) {
          this.rejectConnection(error instanceof Error ? error : new Error(String(error)));
          this.resolveConnection = null;
          this.rejectConnection = null;
        }
      }
    });

    return this.connectionPromise;
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    console.log(`[ASRServiceV3] Scheduling reconnect in ${this.reconnectDelay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      console.log('[ASRServiceV3] Attempting to reconnect...');
      this.connect().catch(error => {
        console.error('[ASRServiceV3] Reconnection failed:', error);
      });
    }, this.reconnectDelay);

    // Exponential backoff
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
  }

  sendAudio(audioData: ArrayBuffer): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('[ASRServiceV3] Cannot send audio - WebSocket not connected');
      return;
    }

    try {
      this.socket.send(audioData);
    } catch (error) {
      console.error('[ASRServiceV3] Failed to send audio:', error);
      if (this.options.onError) {
        this.options.onError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  }

  finalizeUtterance(): void {
    if (this.options.mode !== 'push') {
      console.warn('[ASRServiceV3] Finalize command is only available in push mode');
      return;
    }

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('[ASRServiceV3] Cannot finalize - WebSocket not connected');
      return;
    }

    try {
      this.socket.send(JSON.stringify({ type: 'Finalize' }));
      console.log('[ASRServiceV3] Sent finalize command');
    } catch (error) {
      console.error('[ASRServiceV3] Failed to send finalize command:', error);
      if (this.options.onError) {
        this.options.onError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  async disconnect(): Promise<void> {
    console.log('[ASRServiceV3] Disconnecting...');
    this.isIntentionalClose = true;

    if (this.connectTimer) {
      clearTimeout(this.connectTimer);
      this.connectTimer = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Reject any pending connection promise so callers aren't left hanging
    if (this.rejectConnection) {
      this.rejectConnection(new Error('Disconnected by client'));
    }

    if (this.socket) {
      if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
        this.socket.close(1000, 'Client disconnect');
      }
      this.socket = null;
    }

    // Reset connection state
    this.connectionPromise = null;
    this.resolveConnection = null;
    this.rejectConnection = null;
    this.reconnectDelay = ASRServiceV3.INITIAL_RECONNECT_DELAY;
  }
}