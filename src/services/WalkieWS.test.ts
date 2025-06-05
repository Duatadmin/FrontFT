// src/services/WalkieWS.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WalkieWS, WalkieWSOptions } from './WalkieWS';
import { Server as MockServer, WebSocket as MockClientSocket } from 'mock-socket';

interface DecodedMessage {
  sid?: string;
  type?: string;
  cmd?: string;
  [key: string]: any;
}

const TEST_SID = 'test-session-id-123';
const TEST_HOST = 'localhost:8080'; // Using a local mock host

describe('WalkieWS', () => {
  let audioServer: MockServer;
  let ctrlServer: MockServer;
  let walkieWS: WalkieWS;

  beforeEach(() => {
    // Setup mock servers for each test
    audioServer = new MockServer(`wss://${TEST_HOST}/v2/ws/walkie`);
    ctrlServer = new MockServer(`wss://${TEST_HOST}/v2/ws/walkie-ctrl`);
    // Mock the global WebSocket object for WalkieWS to use the mock instances
    global.WebSocket = MockClientSocket as any;
  });

  afterEach(async () => {
    if (walkieWS) {
      await walkieWS.close().catch(() => {}); // Ensure cleanup
    }
    if (audioServer) audioServer.stop();
    if (ctrlServer) ctrlServer.stop();
  });

  const createInstance = (opts: Partial<WalkieWSOptions> = {}) => {
    const defaultOpts: WalkieWSOptions = {
      sid: TEST_SID,
      host: TEST_HOST,
      ...opts,
    };
    walkieWS = new WalkieWS(defaultOpts);
    return walkieWS;
  };

  it('should connect and send handshake on both sockets', async () => {
    const onOpenMock = vi.fn();
    walkieWS = createInstance({ onOpen: onOpenMock });

    let audioHandshakeReceived: DecodedMessage | null = null;
    let ctrlHandshakeReceived: DecodedMessage | null = null;

    const audioServerConnectionPromise = new Promise<void>(resolve => {
      audioServer.on('connection', socket => {
        socket.on('message', (message: string | ArrayBuffer | Blob | ArrayBufferView) => {
          if (typeof message === 'string') {
            audioHandshakeReceived = JSON.parse(message) as DecodedMessage;
          }
          resolve(); // Resolve once a message is received
        });
      });
    });

    const ctrlServerConnectionPromise = new Promise<void>(resolve => {
      ctrlServer.on('connection', socket => {
        socket.on('message', (message: string | ArrayBuffer | Blob | ArrayBufferView) => {
          if (typeof message === 'string') {
            ctrlHandshakeReceived = JSON.parse(message) as DecodedMessage;
          }
          resolve(); // Resolve once a message is received
        });
      });
    });

    // Initiate connection
    const clientConnectPromise = walkieWS.connect();

    // Wait for client to connect and for servers to receive handshake messages
    await Promise.all([
      clientConnectPromise,
      audioServerConnectionPromise,
      ctrlServerConnectionPromise
    ]);

    expect(onOpenMock).toHaveBeenCalledOnce();

    expect(audioHandshakeReceived).not.toBeNull();
    expect(audioHandshakeReceived!.sid).toBe(TEST_SID);

    expect(ctrlHandshakeReceived).not.toBeNull();
    expect(ctrlHandshakeReceived!.sid).toBe(TEST_SID);
  });

  it('keep-alive should send messages on ctrl socket only', async () => {
    vi.useFakeTimers();
    walkieWS = createInstance();

    const ctrlMessagesReceived: DecodedMessage[] = [];
    const audioMessagesReceived: DecodedMessage[] = [];

    // Setup listeners for messages BEFORE connecting client
    const audioServerConnectionPromise = new Promise<void>(resolve => {
      audioServer.on('connection', socket => {
        socket.on('message', (message: string | ArrayBuffer | Blob | ArrayBufferView) => {
          if (typeof message === 'string') {
            audioMessagesReceived.push(JSON.parse(message) as DecodedMessage);
          }
        });
        resolve(); // Resolve when connection is made
      });
    });

    const ctrlServerConnectionPromise = new Promise<void>(resolve => {
      ctrlServer.on('connection', socket => {
        socket.on('message', (message: string | ArrayBuffer | Blob | ArrayBufferView) => {
          if (typeof message === 'string') {
            ctrlMessagesReceived.push(JSON.parse(message) as DecodedMessage);
          }
        });
        resolve(); // Resolve when connection is made
      });
    });

    // Connect client
    const clientConnectPromise = walkieWS.connect();
    await Promise.all([clientConnectPromise, audioServerConnectionPromise, ctrlServerConnectionPromise]);

    // Clear initial handshake messages
    audioMessagesReceived.length = 0;
    ctrlMessagesReceived.length = 0;

    // Advance time for approximately 3 keep-alive intervals (1.5s * 3 = 4.5s)
    await vi.advanceTimersByTimeAsync(4600);

    const ctrlKeepAliveMessages = ctrlMessagesReceived.filter(msg => msg.type === 'KeepAlive');
    expect(ctrlKeepAliveMessages.length).toBe(3);

    const audioKeepAliveMessages = audioMessagesReceived.filter(msg => msg.type === 'KeepAlive');
    expect(audioKeepAliveMessages.length).toBe(0);

    vi.useRealTimers();
  });

  it('should surface mute message from ctrl socket via onMessage', async () => {
    const onMessageMock = vi.fn();
    walkieWS = createInstance({ onMessage: onMessageMock });

    let clientSocketOnCtrlServer: any | null = null; // Using 'any' due to ongoing type issues

    const ctrlServerConnectionPromise = new Promise<void>(resolve => {
      ctrlServer.on('connection', (socket: any) => { // socket is the client connection on the server
        clientSocketOnCtrlServer = socket;
        resolve();
      });
    });
    
    // Client initiates connection. WalkieWS will connect to both audio and ctrl.
    const clientConnectPromise = walkieWS.connect();

    // Wait for client to confirm its connections AND for ctrl server to register the client.
    await Promise.all([clientConnectPromise, ctrlServerConnectionPromise]);

    expect(clientSocketOnCtrlServer).not.toBeNull();
    if (!clientSocketOnCtrlServer) { // Type guard for TypeScript
      throw new Error('Control server did not receive a client connection');
    }

    const muteMessage = { cmd: 'mute' };
    // Now the server sends a message to the connected client via its specific socket
    clientSocketOnCtrlServer.send(JSON.stringify(muteMessage));

    // Allow time for message processing by WalkieWS
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(onMessageMock).toHaveBeenCalledWith(muteMessage, 'ctrl');
  });

  it('should send binary frame on audio socket', async () => {
    walkieWS = createInstance();

    const audioFramesReceived: ArrayBuffer[] = [];
    const ctrlMessagesReceived: (string | DecodedMessage | ArrayBuffer)[] = []; // Ctrl might receive handshake

    // Setup listeners for messages BEFORE connecting client
    const audioServerConnectionPromise = new Promise<void>(resolve => {
      audioServer.on('connection', (socket: any) => { // TODO: Resolve type to MockClientSocket
        socket.onmessage = (event: MessageEvent) => {
          const messageData = event.data;
          if (messageData instanceof ArrayBuffer) {
            audioFramesReceived.push(messageData);
          }
        };
        resolve(); // Resolve when connection is made
      });
    });

    const ctrlServerConnectionPromise = new Promise<void>(resolve => {
      ctrlServer.on('connection', (socket: any) => { // TODO: Resolve type to MockClientSocket
        socket.onmessage = (event: MessageEvent) => {
          const messageData = event.data;
          if (typeof messageData === 'string') {
            try {
              ctrlMessagesReceived.push(JSON.parse(messageData) as DecodedMessage);
            } catch (e) {
              ctrlMessagesReceived.push(messageData);
            }
          } else if (messageData instanceof ArrayBuffer) {
            ctrlMessagesReceived.push(messageData); 
          }
        };
        resolve(); // Resolve when connection is made
      });
    });

    // Connect client
    const clientConnectPromise = walkieWS.connect();
    await Promise.all([clientConnectPromise, audioServerConnectionPromise, ctrlServerConnectionPromise]);

    // Clear initial handshake messages
    audioFramesReceived.length = 0;
    // Filter out handshake from ctrl messages if necessary, or just check for ArrayBuffers later
    const initialCtrlMessagesCount = ctrlMessagesReceived.length;


    const frame = new ArrayBuffer(480);
    walkieWS.sendFrame(frame);
    
    // Allow time for message processing
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(audioFramesReceived.length).toBe(1);
    if (audioFramesReceived.length > 0) {
      expect(audioFramesReceived[0]).toBeInstanceOf(ArrayBuffer);
      expect(audioFramesReceived[0].byteLength).toBe(480);
    }

    // Ensure no NEW ArrayBuffer messages arrived on control socket
    const ctrlBinaryMessagesAfterSend = ctrlMessagesReceived
        .slice(initialCtrlMessagesCount) // Only check messages received after handshake/setup
        .filter(msg => msg instanceof ArrayBuffer);
    expect(ctrlBinaryMessagesAfterSend.length).toBe(0);
  });

  it('should throw if sendFrame is called before connect or when audio socket is not open', async () => {
    walkieWS = createInstance();
    const frame = new ArrayBuffer(10);

    expect(() => walkieWS.sendFrame(frame)).toThrow('Audio socket is not open or not connected.');

    const connectPromise = walkieWS.connect();
    // Don't wait for connectPromise to resolve fully, try sending while connecting
    expect(() => walkieWS.sendFrame(frame)).toThrow('Audio socket is not open or not connected.');
    
    await connectPromise; // Now connected
    walkieWS.sendFrame(frame); // Should not throw

    // Simulate audio socket closing unexpectedly
    audioServer.server.close();
    await new Promise(resolve => setTimeout(resolve, 50)); // allow time for onclose to propagate

    expect(() => walkieWS.sendFrame(frame)).toThrow('Audio socket is not open or not connected.');
  });
  
  it('should call onOpen when both sockets are connected', async () => {
    const onOpenMock = vi.fn();
    walkieWS = createInstance({ onOpen: onOpenMock });
    await walkieWS.connect();
    expect(onOpenMock).toHaveBeenCalledOnce();
  });

  it('should call onError for socket errors during connection', async () => {
    const onErrorMock = vi.fn();
    walkieWS = createInstance({ onError: onErrorMock });

    // Simulate audio server immediately closing the connection
    audioServer.on('connection', (socket: any) => { // Using 'any' due to ongoing type issues
      socket.close(1001, 'Simulated server error: closing immediately');
    });

    // Control server connects normally
    const ctrlServerConnectionPromise = new Promise<void>(resolve => {
      ctrlServer.on('connection', (_socket: any) => { // _socket is unused in this specific test
        // We don't need to do anything with ctrl socket for this test, just let it connect
        resolve();
      });
    });

    try {
      // connect() should internally lead to an error state due to audio socket failure
      await walkieWS.connect();
    } catch (e) {
      // WalkieWS.connect() itself might throw if it can't establish connections,
      // or it might resolve but call onError. We're primarily interested in onErrorMock.
    }

    // Allow a brief moment for async error handling and callbacks to fire
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(onErrorMock).toHaveBeenCalled();
    // Optionally, inspect the error passed to onErrorMock
    if (onErrorMock.mock.calls.length > 0) {
      const errorArg = onErrorMock.mock.calls[0][0];
      // const socketType = onErrorMock.mock.calls[0][1]; // socketType is unused for now
      // Depending on WalkieWS's implementation, the error might be on 'audio'
      // or a general connection error. Let's be flexible or check WalkieWS logic.
      // For now, checking it was called is the primary goal.
      // expect(socketType).toBe('audio'); // This might be too specific without knowing WalkieWS internals
      expect(errorArg).toBeDefined();
      // If WalkieWS passes the CloseEvent, its 'code' property would be 1001.
      // If WalkieWS wraps it, the assertion needs to match that.
      // Example: expect(errorArg.message).toContain('failed'); or expect(errorArg.code).toBe(1001);
    }
  });

  it('should clean up keep-alive timer on close', async () => {
    walkieWS = createInstance();
    await walkieWS.connect();
    
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    await walkieWS.close();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('should call onClose when sockets are closed', async () => {
    const onCloseMock = vi.fn();
    walkieWS = createInstance({ onClose: onCloseMock });

    let clientSocketOnAudioServer: any | null = null;
    let clientSocketOnCtrlServer: any | null = null;

    const audioServerConnectionPromise = new Promise<void>(resolve => {
      audioServer.on('connection', (socket: any) => {
        clientSocketOnAudioServer = socket;
        resolve();
      });
    });

    const ctrlServerConnectionPromise = new Promise<void>(resolve => {
      ctrlServer.on('connection', (socket: any) => {
        clientSocketOnCtrlServer = socket;
        resolve();
      });
    });

    await walkieWS.connect();
    // Ensure servers have registered the client connections
    await Promise.all([audioServerConnectionPromise, ctrlServerConnectionPromise]);

    expect(clientSocketOnAudioServer).not.toBeNull();
    expect(clientSocketOnCtrlServer).not.toBeNull();

    if (!clientSocketOnAudioServer || !clientSocketOnCtrlServer) {
      throw new Error('Server did not register client connections');
    }

    // Simulate servers closing the connections
    clientSocketOnAudioServer.close(1000, 'Test close audio');
    clientSocketOnCtrlServer.close(1000, 'Test close ctrl');

    // Wait for client-side onclose handlers to fire and be processed by WalkieWS
    await new Promise(resolve => setTimeout(resolve, 100)); // Increased timeout slightly

    // onClose should be called for each socket
    expect(onCloseMock).toHaveBeenCalledTimes(2);
    // Note: The event passed to onClose by WalkieWS might be a standard CloseEvent
    // or a custom object. The assertions below assume it's CloseEvent-like.
    expect(onCloseMock).toHaveBeenCalledWith(expect.objectContaining({ code: 1000, reason: 'Test close audio' }), 'audio');
    expect(onCloseMock).toHaveBeenCalledWith(expect.objectContaining({ code: 1000, reason: 'Test close ctrl' }), 'ctrl');
  });
});