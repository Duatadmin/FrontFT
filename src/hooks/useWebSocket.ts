import { useEffect, useRef, useCallback } from 'react';

type UseWebSocketOptions = {
  onMessage?: (e: MessageEvent) => void;
  onOpen?: () => void;
  onClose?: (e: CloseEvent) => void;
  onError?: (e: Event) => void;
  enablePing?: boolean;
  pingInterval?: number;
  pingMessage?: string | object;
  immediateConnect?: boolean;
  protocols?: string | string[];
};

/**
 * A React hook that creates and manages a WebSocket connection with automatic cleanup,
 * lifecycle-safe initialization, and optional keep-alive support.
 * 
 * @param url The WebSocket URL to connect to
 * @param options Configuration options for the WebSocket
 * @returns A reference to the WebSocket instance and helper functions
 */
export function useWebSocket(
  url: string,
  options: UseWebSocketOptions = {}
) {
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef<boolean>(false);
  const isConnectingRef = useRef<boolean>(false);

  // Default options
  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    enablePing = false,
    pingInterval = 5000,
    pingMessage = { type: 'ping' },
    immediateConnect = true,
    protocols
  } = options;

  /**
   * Safely closes the WebSocket connection and cleans up resources
   */
  const cleanup = useCallback(() => {
    // Clear ping interval
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    // Clear reconnect timer
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    // Close WebSocket if open
    if (wsRef.current) {
      const ws = wsRef.current;
      
      // First remove all event listeners to prevent memory leaks
      ws.onopen = null;
      ws.onclose = null;
      ws.onerror = null;
      ws.onmessage = null;
      
      // Close the connection if it's not already closed
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        console.log('[WS] 🔌 Closing WebSocket connection');
        try {
          ws.close();
        } catch (err) {
          console.error('[WS] Error closing WebSocket:', err);
        }
      }
      
      wsRef.current = null;
    }
    
    // Reset connecting state
    isConnectingRef.current = false;
  }, []);

  /**
   * Creates a new WebSocket connection
   */
  const connect = useCallback(() => {
    // Skip if URL is empty
    if (!url) {
      console.warn('[WS] Skipping connection: URL is empty');
      return null;
    }

    // Skip if already unmounted
    if (isUnmountedRef.current) {
      console.warn('[WS] Component unmounted, skipping connection');
      return null;
    }
    
    // Skip if already connecting
    if (isConnectingRef.current) {
      console.log('[WS] Already connecting, skipping duplicate connection');
      return wsRef.current;
    }
    
    // Set connecting flag
    isConnectingRef.current = true;

    // Clean up any existing connection
    cleanup();

    try {
      console.log('[WS] 🔄 Connecting to:', url);
      const ws = new WebSocket(url, protocols);
      wsRef.current = ws;

      // Set up event handlers
      ws.onopen = () => {
        console.log('[WS] ✅ Connected:', url);
        isConnectingRef.current = false;
        
        // Set up ping interval if enabled
        if (enablePing && !pingIntervalRef.current) {
          pingIntervalRef.current = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              try {
                const message = typeof pingMessage === 'string' 
                  ? pingMessage 
                  : JSON.stringify(pingMessage);
                
                ws.send(message);
                console.log('[WS] 💓 Sent keep-alive ping');
              } catch (err) {
                console.warn('[WS] Error sending ping:', err);
              }
            }
          }, pingInterval);
        }
        
        // Call user provided onOpen handler
        if (onOpen) {
          try {
            onOpen();
          } catch (err) {
            console.error('[WS] Error in onOpen handler:', err);
          }
        }
      };

      ws.onmessage = (e) => {
        // Default message logging if no handler provided
        if (!onMessage) {
          console.log('[WS] 📩 Message:', typeof e.data === 'string' && e.data.length < 100 
            ? e.data 
            : '[data]');
        } else {
          try {
            onMessage(e);
          } catch (err) {
            console.error('[WS] Error in onMessage handler:', err);
          }
        }
      };

      ws.onerror = (e) => {
        console.error('[WS] ❌ Error:', e);
        isConnectingRef.current = false;
        
        if (onError) {
          try {
            onError(e);
          } catch (err) {
            console.error('[WS] Error in onError handler:', err);
          }
        }
      };

      ws.onclose = (e) => {
        console.warn('[WS] ❌ Disconnected:', e.code, e.reason || 'No reason');
        isConnectingRef.current = false;
        
        // Clear the ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        
        // Call user provided onClose handler
        if (onClose) {
          try {
            onClose(e);
          } catch (err) {
            console.error('[WS] Error in onClose handler:', err);
          }
        }
      };

      return ws;
    } catch (error) {
      console.error('[WS] ❌ Failed to create WebSocket:', error);
      isConnectingRef.current = false;
      return null;
    }
  }, [url, protocols, enablePing, pingInterval, pingMessage, onOpen, onMessage, onError, onClose, cleanup]);

  /**
   * Sends data through the WebSocket if it's open
   */
  const send = useCallback((data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    if (!wsRef.current) {
      console.warn('[WS] Cannot send: No WebSocket instance');
      return false;
    }
    
    if (wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('[WS] Cannot send: WebSocket is not open (state:', wsRef.current.readyState, ')');
      return false;
    }
    
    try {
      wsRef.current.send(data);
      return true;
    } catch (error) {
      console.error('[WS] Error sending data:', error);
      return false;
    }
  }, []);

  /**
   * Reconnects the WebSocket
   */
  const reconnect = useCallback(() => {
    console.log('[WS] 🔄 Reconnecting...');
    connect();
  }, [connect]);

  // Set up the WebSocket connection and cleanup on unmount
  useEffect(() => {
    isUnmountedRef.current = false;
    
    // Connect immediately if option is set
    if (immediateConnect) {
      connect();
    }
    
    // Cleanup on unmount
    return () => {
      isUnmountedRef.current = true;
      cleanup();
    };
  }, [url, connect, cleanup, immediateConnect]);

  // Check if WebSocket is connected
  const isConnected = useCallback(() => {
    return wsRef.current?.readyState === WebSocket.OPEN;
  }, []);

  return {
    wsRef,
    send,
    reconnect,
    connect,
    disconnect: cleanup,
    isConnected: isConnected()
  };
}
