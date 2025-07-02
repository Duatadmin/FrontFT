// src/hooks/useWalkie.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
// For React 17 or if @testing-library/react is < v13.1.0 use:
// import { renderHook, act } from '@testing-library/react-hooks';
import { renderHook, act } from '@testing-library/react'; // For React 18 and @testing-library/react >= v13.1.0
import { useWalkie, UseWalkieOptions } from './useWalkie';
import { WalkieWS, WalkieWSOptions } from '../services/WalkieWS';
import { createRecorder, RecorderHandle } from '../lib/sepiaRecorder';

// --- Mocks ---
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-session-id-spec'),
}));

// Mock navigator.mediaDevices and navigator.permissions for browser APIs
Object.defineProperty(global, 'navigator', {
  value: {
    mediaDevices: {
      getUserMedia: vi.fn(() => Promise.resolve({
        getTracks: () => [{ stop: vi.fn() }]
      }))
    },
    permissions: {
      query: vi.fn(() => Promise.resolve({ state: 'granted' }))
    }
  },
  writable: true
});

const mockWalkieWSInstance = {
  connect: vi.fn(() => Promise.resolve()),
  sendFrame: vi.fn(),
  close: vi.fn(() => Promise.resolve()),
  isConnected: vi.fn(() => true), // Added mock for isConnected
};
let capturedWalkieWSOnMessage: ((message: any, channel: 'audio' | 'ctrl') => void) | null = null;
vi.mock('../services/WalkieWS', () => ({
  WalkieWS: vi.fn((options: WalkieWSOptions) => {
    capturedWalkieWSOnMessage = options.onMessage || null;
    return mockWalkieWSInstance;
  }),
}));

const mockRecorderInstance: RecorderHandle = {
  start: vi.fn((_cb: (pcm: Int16Array) => void) => Promise.resolve()), // Will be modified in tests
  stop: vi.fn(() => Promise.resolve()),
  close: vi.fn(),
};
vi.mock('../lib/sepiaRecorder', () => ({
  createRecorder: vi.fn(() => Promise.resolve(mockRecorderInstance)),
}));

// --- Test Suite ---
describe('useWalkie Hook', () => {
  const mockWalkieOptions: UseWalkieOptions = {
    wsUrl: 'ws://localhost:8080/test-ws',
    onVadStatusChange: vi.fn(),
    onTranscription: vi.fn(),
    onError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    capturedWalkieWSOnMessage = null;
    // Reset mockRecorderInstance.start for each test to allow specific implementations
    mockRecorderInstance.start = vi.fn(() => Promise.resolve());
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useWalkie(mockWalkieOptions));
    expect(result.current.state.isStreaming).toBe(false);
    expect(result.current.state.level).toBe(0);
  });

  it('start() should initiate streaming, connect WS, and start recorder', async () => {
    const { result } = renderHook(() => useWalkie(mockWalkieOptions));

    await act(async () => {
      await result.current.start('test-session-id-spec');
    });

    expect(WalkieWS).toHaveBeenCalledWith(expect.objectContaining({ sid: 'test-session-id-spec' }));
    expect(mockWalkieWSInstance.connect).toHaveBeenCalledOnce();
    expect(createRecorder).toHaveBeenCalledOnce();
    expect(mockRecorderInstance.start).toHaveBeenCalledOnce();
    expect(result.current.state.isStreaming).toBe(true);
  });

  it('should send frames and update level when recorder provides chunks', async () => {
    const { result } = renderHook(() => useWalkie(mockWalkieOptions));
    let onChunkCallback: ((pcm: Int16Array) => void) | null = null;

    // Override mockRecorderInstance.start to capture onChunk
    mockRecorderInstance.start = vi.fn(async (cb: (pcm: Int16Array) => void) => {
      onChunkCallback = cb;
    });

    await act(async () => {
      await result.current.start('test-session-id-spec');
    });

    expect(onChunkCallback).not.toBeNull();

    const silentFrame = new Int16Array(16000 * 0.03); // 30ms of silence
    const loudFrame = new Int16Array(16000 * 0.03);
    loudFrame.fill(16384); // Half of max amplitude

    // Simulate 4 frames (METER_EVERY_N_FRAMES = 4)
    // Frame 0 (silent)
    await act(async () => {
      onChunkCallback!(silentFrame);
    });
    expect(mockWalkieWSInstance.sendFrame).toHaveBeenCalledTimes(1);
    expect(mockWalkieWSInstance.sendFrame).toHaveBeenLastCalledWith(silentFrame.buffer.slice(silentFrame.byteOffset, silentFrame.byteOffset + silentFrame.byteLength));
    expect(result.current.state.level).toBeCloseTo(0); // Meter updates on frame 0

    // Frame 1 (loud)
    await act(async () => {
      onChunkCallback!(loudFrame);
    });
    expect(mockWalkieWSInstance.sendFrame).toHaveBeenCalledTimes(2);
    // Level not updated yet (frame 1 % 4 !== 0)

    // Frame 2 (silent)
    await act(async () => {
      onChunkCallback!(silentFrame);
    });
    expect(mockWalkieWSInstance.sendFrame).toHaveBeenCalledTimes(3);
    // Level not updated yet (frame 2 % 4 !== 0)

    // Frame 3 (loud) - meter should update here
    await act(async () => {
      onChunkCallback!(loudFrame);
    });
    expect(mockWalkieWSInstance.sendFrame).toHaveBeenCalledTimes(4);
    expect(result.current.state.level).toBeGreaterThan(0); // Meter should have some positive value
  });

  it('should skip sending frames if micLocked is true, then resume when unlocked', async () => {
    const { result } = renderHook(() => useWalkie(mockWalkieOptions));
    let onChunkCallback: ((pcm: Int16Array) => void) | null = null;
    mockRecorderInstance.start = vi.fn(async (cb: (pcm: Int16Array) => void) => { onChunkCallback = cb; });

    await act(async () => { result.current.start('test-session-id-spec'); });
    expect(capturedWalkieWSOnMessage).not.toBeNull();

    const frame = new Int16Array(480);

    // 1. Send a frame normally
    await act(async () => { onChunkCallback!(frame); });
    expect(mockWalkieWSInstance.sendFrame).toHaveBeenCalledTimes(1);

    // 2. Simulate mute message
    await act(async () => {
      capturedWalkieWSOnMessage!({ cmd: 'mute' }, 'ctrl');
    });

    // 3. Send another frame - should be skipped
    await act(async () => { onChunkCallback!(frame); });
    expect(mockWalkieWSInstance.sendFrame).toHaveBeenCalledTimes(1); // Still 1

    // 4. Simulate unmute command from server via control channel (NEW BEHAVIOR: final transcripts no longer auto-unmute)
    await act(async () => {
      capturedWalkieWSOnMessage!({ cmd: 'unmute' }, 'ctrl');
    });

    // 5. Send another frame - should be sent now
    await act(async () => { onChunkCallback!(frame); });
    expect(mockWalkieWSInstance.sendFrame).toHaveBeenCalledTimes(2);
  });

  it('stop() should close WS, stop recorder, and update state', async () => {
    const { result } = renderHook(() => useWalkie(mockWalkieOptions));

    await act(async () => {
      await result.current.start('test-session-id-spec');
    });
    expect(result.current.state.isStreaming).toBe(true);

    await act(async () => {
      await result.current.stop();
    });

    expect(mockRecorderInstance.stop).toHaveBeenCalledOnce();
    expect(mockWalkieWSInstance.close).toHaveBeenCalledOnce();
    expect(result.current.state.isStreaming).toBe(false);
    expect(result.current.state.level).toBe(0);
  });

  it('should clean up on unmount', async () => {
    const { unmount, result } = renderHook(() => useWalkie(mockWalkieOptions));
    await act(async () => {
      await result.current.start('test-session-id-spec');
    });

    await act(async () => {
      unmount();
      // Allow cleanup promises to resolve
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockRecorderInstance.close).toHaveBeenCalledOnce();
    expect(mockWalkieWSInstance.close).toHaveBeenCalledOnce(); // Should be called by cleanup
  });

  it('should handle control commands via audio channel fallback', async () => {
    const { result } = renderHook(() => useWalkie(mockWalkieOptions));
    let onChunkCallback: ((pcm: Int16Array) => void) | null = null;
    mockRecorderInstance.start = vi.fn(async (cb: (pcm: Int16Array) => void) => { onChunkCallback = cb; });

    await act(async () => { result.current.start('test-session-id-fallback'); });
    expect(capturedWalkieWSOnMessage).not.toBeNull();

    const frame = new Int16Array(480);

    // 1. Send a frame normally
    await act(async () => { onChunkCallback!(frame); });
    expect(mockWalkieWSInstance.sendFrame).toHaveBeenCalledTimes(1);

    // 2. Simulate mute command via audio channel fallback
    await act(async () => {
      capturedWalkieWSOnMessage!({ type: 'control', data: { cmd: 'mute' } }, 'audio');
    });

    // 3. Send another frame - should be skipped
    await act(async () => { onChunkCallback!(frame); });
    expect(mockWalkieWSInstance.sendFrame).toHaveBeenCalledTimes(1); // Still 1

    // 4. Simulate unmute command via audio channel fallback
    await act(async () => {
      capturedWalkieWSOnMessage!({ type: 'control', data: { cmd: 'unmute' } }, 'audio');
    });

    // 5. Send another frame - should be sent now
    await act(async () => { onChunkCallback!(frame); });
    expect(mockWalkieWSInstance.sendFrame).toHaveBeenCalledTimes(2);
  });

  it('should maintain infinite message loop without connection drops', async () => {
    const { result } = renderHook(() => useWalkie(mockWalkieOptions));

    await act(async () => {
      await result.current.start('test-session-infinite-loop');
    });

    expect(result.current.state.status).toBe('active');

    // Simulate multiple message exchanges (more than 5 to test the fix)
    for (let i = 1; i <= 10; i++) {
      // User speaks (interim transcript)
      act(() => {
        if (capturedWalkieWSOnMessage) {
          capturedWalkieWSOnMessage({ text: `Message ${i} in progress`, final: false }, 'audio');
        }
      });

      // Final transcript (should NOT automatically unlock mic anymore)
      act(() => {
        if (capturedWalkieWSOnMessage) {
          capturedWalkieWSOnMessage({ text: `Message ${i} complete`, final: true }, 'audio');
        }
      });

      // Server response
      act(() => {
        if (capturedWalkieWSOnMessage) {
          capturedWalkieWSOnMessage({ text: `Server response to message ${i}`, final: true }, 'audio');
        }
      });
    }

    // Connection should still be active after 10 message exchanges (30 total messages)
    expect(result.current.state.status).toBe('active');
    expect(mockWalkieOptions.onTranscription).toHaveBeenCalledTimes(30);
    
    // WebSocket should not have been closed due to connection issues
    expect(mockWalkieWSInstance.close).not.toHaveBeenCalled();
  });
});
