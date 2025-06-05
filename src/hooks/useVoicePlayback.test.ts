import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVoicePlayback } from './useVoicePlayback';

// Mock crypto.randomUUID
Object.defineProperty(globalThis, 'crypto', {
  value: { randomUUID: vi.fn(() => 'mocked-uuid') },
  writable: true,
  configurable: true,
});

// Mock fetch and Audio
global.fetch = vi.fn();

class MockAudio {
  src: string = '';
  id: string = '';
  paused: boolean = true;
  currentTime: number = 0;
  // Event handlers
  onended: (() => void) | null = null;
  onerror: ((e: any) => void) | null = null;
  onloadeddata: (() => void) | null = null;

  play = vi.fn(() => {
    this.paused = false;
    return Promise.resolve();
  });
  pause = vi.fn(() => {
    this.paused = true;
  });
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  addSourceBuffer = vi.fn();
  appendBuffer = vi.fn();
  endOfStream = vi.fn();
  // Mock MediaSource related properties if needed by your tests
  static isTypeSupported = vi.fn(() => true); // Assume Opus is supported by default
}

(global as any).Audio = MockAudio;
(global as any).MediaSource = {
    isTypeSupported: vi.fn(() => true), // Mock for MediaSource.isTypeSupported
    prototype: {
        addSourceBuffer: vi.fn(),
        endOfStream: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        readyState: 'closed' // or 'open' as needed
    }
};
URL.createObjectURL = vi.fn((obj: any) => `blob:${obj ? obj.toString() : 'mockURL'}`);
URL.revokeObjectURL = vi.fn();


// Mock localStorage
let mockLocalStorage: Record<string, string> = {};

beforeEach(() => {
  mockLocalStorage = {};
  global.localStorage = {
    getItem: (key: string) => mockLocalStorage[key] || null,
    setItem: (key: string, value: string) => {
      mockLocalStorage[key] = value;
    },
    removeItem: (key: string) => {
      delete mockLocalStorage[key];
    },
    clear: () => {
      mockLocalStorage = {};
    },
    key: (index: number) => Object.keys(mockLocalStorage)[index] || null,
    length: Object.keys(mockLocalStorage).length,
  };
  (global.fetch as Mock).mockClear();
  // Reset Audio mock calls if necessary, e.g., MockAudio.play.mockClear();
});

describe('useVoicePlayback', () => {
  it('should initialize voiceEnabled from localStorage (false if not set)', () => {
    const { result } = renderHook(() => useVoicePlayback());
    expect(result.current.voiceEnabled).toBe(false);
  });

  it('should initialize voiceEnabled from localStorage (true if set)', () => {
    localStorage.setItem('voiceEnabled', 'true');
    const { result } = renderHook(() => useVoicePlayback());
    expect(result.current.voiceEnabled).toBe(true);
  });

  it('should toggle voiceEnabled state and update localStorage', () => {
    const { result } = renderHook(() => useVoicePlayback());
    expect(result.current.voiceEnabled).toBe(false);
    expect(localStorage.getItem('voiceEnabled')).toBe('false');

    act(() => {
      result.current.toggleVoice();
    });

    expect(result.current.voiceEnabled).toBe(true);
    expect(localStorage.getItem('voiceEnabled')).toBe('true');

    act(() => {
      result.current.toggleVoice();
    });

    expect(result.current.voiceEnabled).toBe(false);
    expect(localStorage.getItem('voiceEnabled')).toBe('false');
  });

  it('should not enqueue utterance if voiceEnabled is false', () => {
    const { result } = renderHook(() => useVoicePlayback()); // voiceEnabled is false by default
    
    act(() => {
      result.current.enqueueBotUtterance('Hello there', 'msg1');
    });

    // Check internal queue state if possible, or if playNext was NOT called.
    // For this test, we'll infer by checking if fetch was called (it shouldn't be if queue is empty)
    // This requires playNext to be part of the hook's return or for queue to be exposed.
    // Since queue is not exposed, we rely on the side effect of playNext (fetch call).
    // However, playNext is called in an effect. We need to check if the queue remains empty.
    // A more direct way would be to expose the queue for testing or mock playNext.
    
    // Let's assume for now that if voice is disabled, no fetch should occur.
    // We need to ensure playNext doesn't run due to initial state or other effects.
    // The hook is designed to call playNext if queue.length > 0 && !isPlaying && voiceEnabled.
    // Since voiceEnabled is false, playNext shouldn't be triggered by enqueue.
    expect(global.fetch).not.toHaveBeenCalled();
    // We also need to ensure the internal `playedIds` set is not updated.
    // This is harder to test without exposing it. We trust the logic: `if (!voiceEnabled ... return;`
  });

  it('should enqueue utterance if voiceEnabled is true and message not played', () => {
    localStorage.setItem('voiceEnabled', 'true');
    const { result } = renderHook(() => useVoicePlayback());
    
    (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        body: {
            getReader: () => ({
                read: vi.fn()
                    .mockResolvedValueOnce({ done: false, value: new Uint8Array([1,2,3]) })
                    .mockResolvedValueOnce({ done: true }),
            }),
        } as any,
        status: 200
    });

    act(() => {
      result.current.enqueueBotUtterance('General Kenobi', 'msg2');
    });
    
    // Wait for effects to run
    // playNext should be called because voice is enabled, queue has an item, and not currently playing.
    // This will result in a fetch call.
    // Need to wait for async operations within playNext and its effects.
    return new Promise<void>(resolve => {
        setTimeout(() => {
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledWith(
                'http://ft_voice_service.railway.internal/v1/tts',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ text: 'General Kenobi' }),
                    headers: expect.objectContaining({ 'X-Request-ID': 'mocked-uuid' })
                })
            );
            resolve();
        }, 0); // setTimeout to allow promises/effects to resolve
    });
  });

  it('should not enqueue utterance if messageId has already been played', () => {
    localStorage.setItem('voiceEnabled', 'true');
    const { result } = renderHook(() => useVoicePlayback());

    (global.fetch as Mock).mockResolvedValueOnce({ /* ... mock successful fetch ... */ ok: true, body: { getReader: () => ({ read: vi.fn().mockResolvedValue({done: true}) }) } });

    act(() => {
      result.current.enqueueBotUtterance('First message', 'msg3');
    });
    // Simulate playback completion for 'msg3' which would remove it from queue and call playNext (which does nothing as queue is empty)
    // The key is that 'msg3' is now in playedIds
    // This part is tricky to simulate perfectly without more control over internal state or async flow.
    // For now, we assume the first call adds to playedIds internally.

    // Attempt to enqueue the same message again
    act(() => {
      result.current.enqueueBotUtterance('First message', 'msg3');
    });

    // Fetch should only have been called once for the first unique message
    // This relies on the previous test's fetch mock setup or a new one.
    return new Promise<void>(resolve => {
        setTimeout(() => {
            expect(global.fetch).toHaveBeenCalledTimes(1); // Still 1, not 2
            resolve();
        }, 0);
    });
  });

  // Add more tests for stopCurrentPlayback, error handling, queue management, etc.
});
