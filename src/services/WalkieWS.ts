// src/services/WalkieWS.ts
const KEEP_ALIVE_INTERVAL_MS = 1500;

// Define message types that can be received from the server
export type WalkieCommandMessage = { cmd: 'mute' | 'unmute'; sid?: string };
export type WalkieTranscriptionMessage = { type: 'transcription'; text: string; final: boolean; sid?: string };
export type WalkieVadStatusMessage = { type: 'vad_status'; speaking: boolean; sid?: string };
export type WalkieErrorResponseMessage = { type: 'error'; message: string; code?: number; sid?: string };
// A general type for other JSON messages or to allow extensibility
export type WalkieGenericJsonMessage = { type: string; [key: string]: any; sid?: string };

// Union type for all possible messages from the server on data channels
export type WalkieMessage =
  | WalkieCommandMessage
  | WalkieTranscriptionMessage
  | WalkieVadStatusMessage
  | WalkieErrorResponseMessage
  | WalkieGenericJsonMessage
  | ArrayBuffer; // For binary data, though less common from server to client in this app

export interface WalkieWSOptions {
  sid: string;
  host?: string;
  onOpen?: () => void;
  onMessage?: (data: WalkieMessage, channel: 'audio' | 'ctrl') => void;
  onError?: (ev: Event | Error, channel: 'audio' | 'ctrl' | 'general') => void;
  onClose?: (ev: CloseEvent, channel: 'audio' | 'ctrl') => void;
}

export class WalkieWS {
  private sid: string;
  private host: string;
  private audioSocket: WebSocket | null = null;
  private ctrlSocket: WebSocket | null = null;

  public onOpen?: () => void;
  public onMessage?: (data: WalkieMessage, channel: 'audio' | 'ctrl') => void;
  public onError?: (ev: Event | Error, channel: 'audio' | 'ctrl' | 'general') => void;
  public onClose?: (ev: CloseEvent, channel: 'audio' | 'ctrl') => void;

  private keepAliveTimer: NodeJS.Timeout | number | null = null;
  private connectionPromise: Promise<void> | null = null;
  private resolveConnectionPromise: (() => void) | null = null;
  private rejectConnectionPromise: ((reason?: any) => void) | null = null;

  private audioSocketOpened = false;
  private ctrlSocketOpened = false;

  constructor(opts: WalkieWSOptions) {
    this.sid = opts.sid;
    this.host = opts.host!;
    this.onOpen = opts.onOpen;
    this.onMessage = opts.onMessage;
    this.onError = opts.onError;
    this.onClose = opts.onClose;
  }

  private getAudioUrl(): string {
    return `wss://${this.host}/v2/ws/walkie`;
  }

  private getCtrlUrl(): string {
    return `wss://${this.host}/v2/ws/walkie-ctrl`;
  }

  connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise<void>((resolve, reject) => {
      this.resolveConnectionPromise = resolve;
      this.rejectConnectionPromise = reject;

      try {
        this.audioSocket = new WebSocket(this.getAudioUrl());
        this.ctrlSocket = new WebSocket(this.getCtrlUrl());

        this.audioSocket.binaryType = 'arraybuffer';

        this.setupSocketEventListeners(this.audioSocket, 'audio');
        this.setupSocketEventListeners(this.ctrlSocket, 'ctrl');
      } catch (error) {
        this.handleGeneralError(error);
        if (this.rejectConnectionPromise) {
          this.rejectConnectionPromise(error);
        }
      }
    });
    return this.connectionPromise;
  }

  private setupSocketEventListeners(socket: WebSocket, channel: 'audio' | 'ctrl') {
    socket.onopen = () => {
      if (channel === 'audio') this.audioSocketOpened = true;
      if (channel === 'ctrl') this.ctrlSocketOpened = true;

      // Send handshake
      socket.send(JSON.stringify({ sid: this.sid }));

      if (this.audioSocketOpened && this.ctrlSocketOpened) {
        if (this.onOpen) {
          this.onOpen();
        }
        if (this.resolveConnectionPromise) {
          this.resolveConnectionPromise();
        }
        this.startKeepAlive();
      }
    };

    socket.onmessage = (event: MessageEvent) => {
      if (this.onMessage) {
        try {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          if (channel === 'ctrl') {
            console.log('[WalkieWS] Received on CTRL channel:', JSON.stringify(data));
          } else if (channel === 'audio') {
            console.log('[WalkieWS] Received on AUDIO channel:', JSON.stringify(data));
          } else {
            console.log('[WalkieWS] Received on UNKNOWN channel (' + channel + '):', JSON.stringify(data));
          }
          this.onMessage(data, channel);
        } catch (e) {
          // If JSON.parse fails for string data, pass raw string data
          if (typeof event.data === 'string') {
             // Wrap the non-JSON string into a generic message object
             this.onMessage({ type: 'raw_string_message', content: event.data }, channel);
          } else {
            const error = new Error(`Error parsing ${channel} message: ${e instanceof Error ? e.message : String(e)}`);
            console.error(error.message, e);
            if (this.onError) this.onError(error, channel);
          }
        }
      }
    };

    socket.onerror = (event: Event) => {
      if (channel === 'audio') this.audioSocketOpened = false;
      if (channel === 'ctrl') this.ctrlSocketOpened = false;
      if (this.onError) {
        this.onError(event, channel);
      }
      if (this.rejectConnectionPromise) {
        this.rejectConnectionPromise(event);
      }
      this.cleanup();
    };

    socket.onclose = (event: CloseEvent) => {
      const wasAudioOpen = this.audioSocketOpened;
      const wasCtrlOpen = this.ctrlSocketOpened;

      if (channel === 'audio') this.audioSocketOpened = false;
      if (channel === 'ctrl') this.ctrlSocketOpened = false;

      if (this.onClose) {
        this.onClose(event, channel);
      }

      // If the connection promise hasn't settled yet and this close was unclean,
      // reject the main connection promise.
      if (!event.wasClean && this.rejectConnectionPromise) {
        // Check if the main connect() promise was still pending
        // (i.e., not both sockets had successfully reached the 'open' state for the first time)
        if (!(wasAudioOpen && wasCtrlOpen)) {
            this.rejectConnectionPromise(new Error(`Socket ${channel} closed uncleanly during connection setup: ${event.code}`));
            this.resolveConnectionPromise = null; // Mark promise as settled
            this.rejectConnectionPromise = null;  // Mark promise as settled
        }
      }

      // If both sockets are now confirmed closed, perform full cleanup.
      if (this.audioSocket?.readyState === WebSocket.CLOSED && this.ctrlSocket?.readyState === WebSocket.CLOSED) {
        this.cleanup();
      } else if ((channel === 'audio' && !this.audioSocketOpened && this.ctrlSocket?.readyState === WebSocket.CLOSED) || 
                 (channel === 'ctrl' && !this.ctrlSocketOpened && this.audioSocket?.readyState === WebSocket.CLOSED)){
        // If one channel closed and the other was already closed
        this.cleanup();
      }
    };
  }

  private startKeepAlive() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
    }
    this.keepAliveTimer = setInterval(() => {
      if (this.ctrlSocket && this.ctrlSocket.readyState === WebSocket.OPEN) {
        this.ctrlSocket.send(JSON.stringify({ type: 'KeepAlive' }));
      } else {
        // If ctrlSocket is not open, stop keep-alive to prevent errors
        this.stopKeepAlive();
        // Optionally, trigger an error or attempt reconnection if that logic were added
      }
    }, KEEP_ALIVE_INTERVAL_MS);
  }

  private stopKeepAlive() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  public isConnected(): boolean {
    return (
      this.audioSocket !== null &&
      this.audioSocket.readyState === WebSocket.OPEN &&
      this.ctrlSocket !== null &&
      this.ctrlSocket.readyState === WebSocket.OPEN &&
      this.audioSocketOpened && // Confirms handshake completed for audio
      this.ctrlSocketOpened   // Confirms handshake completed for ctrl
    );
  }

  sendFrame(frame: ArrayBuffer): void {
    if (!this.audioSocket || this.audioSocket.readyState !== WebSocket.OPEN) {
      const error = new Error('Audio socket is not open or not connected. Call connect() first.');
      this.handleGeneralError(error);
      throw error;
    }
    this.audioSocket.send(frame);
  }

  private handleGeneralError(error: any) {
    if (this.onError) {
      this.onError(error instanceof Event ? error : new Error(String(error)), 'general');
    } else {
      console.error('WalkieWS General Error:', error);
    }
  }

  private cleanup() {
    this.stopKeepAlive();
    this.audioSocketOpened = false;
    this.ctrlSocketOpened = false;
    // Reset connection promise state for potential future connect calls
    this.connectionPromise = null;
    this.resolveConnectionPromise = null;
    this.rejectConnectionPromise = null;
  }

  async close(): Promise<void> {
    this.stopKeepAlive();
    
    const closePromises: Promise<void>[] = [];

    const createClosePromise = (socket: WebSocket | null, channelName: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.onclose = (event) => {
                    if (this.onClose) this.onClose(event, channelName as 'audio' | 'ctrl');
                    if (event.wasClean) {
                        resolve();
                    } else {
                        // Don't reject here for unclean close if it's an intentional close call
                        // Let higher level logic decide if this is an error.
                        // For the purpose of `close()` promise, we resolve if it closes.
                        resolve(); 
                    }
                };
                socket.onerror = (event) => { // Also handle error during closing
                    if (this.onError) this.onError(event, channelName as 'audio' | 'ctrl');
                    reject(new Error(`Error closing ${channelName} socket`));
                };
                socket.close();
            } else if (socket && (socket.readyState === WebSocket.CLOSING || socket.readyState === WebSocket.CLOSED)) {
                resolve(); // Already closing or closed
            }
             else {
                resolve(); // Not open, nothing to close
            }
        });
    };

    if (this.audioSocket) {
        closePromises.push(createClosePromise(this.audioSocket, 'audio'));
    }
    if (this.ctrlSocket) {
        closePromises.push(createClosePromise(this.ctrlSocket, 'ctrl'));
    }

    try {
        await Promise.all(closePromises);
    } catch (error) {
        this.handleGeneralError(error);
        // We still want to proceed with cleanup even if one close fails.
    } finally {
        this.audioSocket = null;
        this.ctrlSocket = null;
        this.cleanup();
    }
  }
}