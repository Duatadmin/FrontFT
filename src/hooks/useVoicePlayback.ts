console.log('[TTS Module] useVoicePlayback.ts module loaded');
import { useState, useEffect, useCallback, useRef } from 'react';
import { supportsMediaSource } from '../lib/supportsMediaSource';

const TTS_BASE_URL = 'https://ftvoiceservice-production-6960.up.railway.app/tts/v1/tts';
const VOICE_ENABLED_KEY = 'voiceEnabled';

interface UseVoicePlayback {
  voiceEnabled: boolean;
  isPlaying: boolean;
  toggleVoice: () => void;
  enqueueBotUtterance: (text: string, messageId: string) => void;
  stopCurrentPlayback: () => void; // Renamed for clarity from stopCurrent
}

export const useVoicePlayback = (): UseVoicePlayback => {
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false);
  const [queue, setQueue] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [playedIds, setPlayedIds] = useState<Set<string>>(new Set());

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const oggPageBufferRef = useRef<Uint8Array | null>(null); // Buffer for Ogg page aggregation

  const OGG_PAGE_HEADER = new Uint8Array([0x4f, 0x67, 0x67, 0x53]); // "OggS"

  function isOggPageStart(buffer: Uint8Array, index: number): boolean {
    if (index + OGG_PAGE_HEADER.length > buffer.length) return false;
    for (let i = 0; i < OGG_PAGE_HEADER.length; i++) {
      if (buffer[index + i] !== OGG_PAGE_HEADER[i]) return false;
    }
    return true;
  }

  // Extracts the first Ogg page from the buffer if one is complete.
  // A page is considered complete if another "OggS" follows or if isFinalChunk is true.
  function extractOggPage(buffer: Uint8Array, isFinalChunk: boolean): { page: Uint8Array | null; remainingBuffer: Uint8Array } {
    if (!buffer || buffer.length === 0 || !isOggPageStart(buffer, 0)) {
      // Buffer is empty or doesn't start with OggS (should not happen after first chunk)
      return { page: null, remainingBuffer: buffer };
    }

    let nextPageStartIndex = -1;
    // Start search for next 'OggS' after the first one (i.e., from index 1, effectively checking from OGG_PAGE_HEADER.length)
    for (let i = 1; i <= buffer.length - OGG_PAGE_HEADER.length; i++) {
      if (isOggPageStart(buffer, i)) {
        nextPageStartIndex = i;
        break;
      }
    }

    if (nextPageStartIndex !== -1) {
      // Found the start of the next page, so the current page is complete
      return { page: buffer.slice(0, nextPageStartIndex), remainingBuffer: buffer.slice(nextPageStartIndex) };
    } else if (isFinalChunk) {
      // No next "OggS" found, but this is the final chunk of the stream, so the entire buffer is the last page
      return { page: buffer.slice(0), remainingBuffer: new Uint8Array(0) };
    } else {
      // No next "OggS" found and not the final chunk, so the page might be incomplete
      return { page: null, remainingBuffer: buffer };
    }
  }

  const supportsOpus = (() => {
    if (typeof window === 'undefined') return false;
    const MS = (window as any).MediaSource;
    return !!MS && typeof MS.isTypeSupported === 'function'
      ? MS.isTypeSupported('audio/ogg; codecs="opus"') // Corrected MIME with space and quotes
      : false;
  })();

  useEffect(() => {
    localStorage.setItem('voiceEnabled', JSON.stringify(voiceEnabled));
  }, [voiceEnabled]);

  const playNext = useCallback(async () => {
    console.log('[TTS] playNext called. Queue length:', queue.length, 'Voice enabled:', voiceEnabled);
    if (queue.length === 0 || !voiceEnabled) {
      console.log('[TTS] No items in queue or voice disabled. Stopping playback.');
      setIsPlaying(false);
      setCurrentRequestId(null);
      if (audioPlayerRef.current) {
        // Clear handlers before changing src to prevent old errors firing
        audioPlayerRef.current.onerror = null;
        audioPlayerRef.current.onended = null;
        audioPlayerRef.current.onloadeddata = null;
        audioPlayerRef.current.src = ''; // Clear src to ensure it stops
      }
      return;
    }

    setIsPlaying(true);
    const textToPlay = queue[0]; // Peek at the next item
    const newRequestId = crypto.randomUUID();
    setCurrentRequestId(newRequestId);
    console.log('[TTS] Starting playback for text:', textToPlay.substring(0, 50) + (textToPlay.length > 50 ? '...' : ''), 'Request ID:', newRequestId);

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      const response = await fetch(TTS_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': newRequestId,
        },
        body: JSON.stringify({
          text: textToPlay,
          model: 'gpt-4o-mini-tts',
          voice: 'shimmer',
          speed: 1.0,
          response_format: 'opus',
          instructions: 'You are a personal trainer. Speak motivating and respectfull and calm.'
        }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`TTS API request failed: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('TTS API response has no body');
      }

      if (!audioPlayerRef.current) {
        const audio = new Audio();
        audio.id = 'tts-audio-player';
        document.body.appendChild(audio); // Hidden, or consider a more React-friendly way
        audioPlayerRef.current = audio;
      }
      const audio = audioPlayerRef.current;
      audio.pause();
      audio.currentTime = 0;
      // Clear previous event handlers to prevent stale events from firing
      audio.onerror = null;
      audio.onended = null;
      audio.onloadeddata = null;

      if (!supportsMediaSource()) {
        console.warn('[TTS] MediaSource API not supported. Streaming audio will be disabled.');
        setIsPlaying(false);
        setCurrentRequestId(null);
        setQueue(prev => prev.slice(1));
        if (audioPlayerRef.current) {
          audioPlayerRef.current.onerror = null;
          audioPlayerRef.current.onended = null;
          audioPlayerRef.current.src = '';
        }
        return;
      }

      if (!supportsOpus) {
        console.warn('[TTS] MediaSource is supported, but Opus (audio/ogg; codecs="opus") is not. Skipping playback for this item.');
        setIsPlaying(false);
        setCurrentRequestId(null);
        setQueue(prev => prev.slice(1));
        if (audioPlayerRef.current) {
          audioPlayerRef.current.onerror = null;
          audioPlayerRef.current.onended = null;
          audioPlayerRef.current.src = '';
        }
        return; // Exit playNext for this item
      }

      mediaSourceRef.current = new MediaSource();
      audio.src = URL.createObjectURL(mediaSourceRef.current);
      oggPageBufferRef.current = new Uint8Array(0); // Initialize Ogg page buffer

      mediaSourceRef.current.addEventListener('sourceopen', async () => {
        if (!mediaSourceRef.current || mediaSourceRef.current.readyState !== 'open') return;

        try {
          sourceBufferRef.current = mediaSourceRef.current.addSourceBuffer('audio/ogg; codecs="opus"');
          const reader = response.body!.getReader();
          let streamEndedByReader = false;

          const processData = async (isFinalAttempt: boolean) => {
            if (!sourceBufferRef.current || sourceBufferRef.current.updating || !oggPageBufferRef.current) {
              return;
            }
            const { page, remainingBuffer } = extractOggPage(oggPageBufferRef.current, isFinalAttempt);
            if (page && page.length > 0) {
              try {
                sourceBufferRef.current.appendBuffer(page);
                oggPageBufferRef.current = remainingBuffer;
              } catch (appendError) {
                console.error('[TTS] Error appending Ogg page:', appendError);
                if (mediaSourceRef.current && mediaSourceRef.current.readyState === 'open') {
                  try { mediaSourceRef.current.endOfStream(); } catch (eosErr) { console.warn('[TTS] Error ending stream after append error:', eosErr); }
                }
                throw appendError; // Propagate to be caught by outer try-catch
              }
            }
          };

          sourceBufferRef.current.addEventListener('updateend', async () => {
            // After an append, try to process more from buffer.
            // If stream has ended and buffer is now empty, finalize MediaSource.
            if (abortControllerRef.current?.signal.aborted) return;
            await processData(streamEndedByReader); // Process with current knowledge of stream end
            if (streamEndedByReader && mediaSourceRef.current?.readyState === 'open' &&
                (!oggPageBufferRef.current || oggPageBufferRef.current.length === 0) &&
                sourceBufferRef.current && !sourceBufferRef.current.updating) {
              console.log('[TTS] updateend: Stream ended, buffer empty, finalizing MediaSource.');
              mediaSourceRef.current.endOfStream();
            }
          });

          // eslint-disable-next-line no-constant-condition
          while (true) {
            if (abortControllerRef.current?.signal.aborted || mediaSourceRef.current?.readyState !== 'open') {
              console.log('[TTS] Streaming aborted or MediaSource closed, exiting read loop.');
              if (mediaSourceRef.current?.readyState === 'open' && sourceBufferRef.current && !sourceBufferRef.current.updating) {
                try { mediaSourceRef.current.endOfStream(); } catch (e) { console.warn('[TTS] Error ending stream during abort in read loop:', e); }
              }
              break;
            }

            const { done, value } = await reader.read();
            streamEndedByReader = done;

            if (value) {
              const newCombinedBuffer = new Uint8Array((oggPageBufferRef.current?.length || 0) + value.length);
              if (oggPageBufferRef.current) newCombinedBuffer.set(oggPageBufferRef.current, 0);
              newCombinedBuffer.set(value, oggPageBufferRef.current?.length || 0);
              oggPageBufferRef.current = newCombinedBuffer;
            }

            await processData(done); // Process accumulated data

            if (done) {
              console.log('[TTS] Stream finished (reader.read() done).');
              // Ensure any final data is processed and MediaSource is ended if buffer becomes empty.
              // The 'updateend' listener will handle ending the stream if an append occurs here.
              // If no append occurs (buffer was already empty or no full page), and not updating, end here.
              if (mediaSourceRef.current?.readyState === 'open' &&
                  (!oggPageBufferRef.current || oggPageBufferRef.current.length === 0) &&
                  sourceBufferRef.current && !sourceBufferRef.current.updating) {
                console.log('[TTS] Stream done, buffer empty post-process, finalizing MediaSource.');
                mediaSourceRef.current.endOfStream();
              }
              break; // Exit while loop
            }
          }
        } catch (err) {
          console.error('[TTS] Error during MediaSource stream processing:', err);
          if (mediaSourceRef.current?.readyState === 'open') {
            try { mediaSourceRef.current.endOfStream(); } catch (e) { console.warn('[TTS] Error ending MediaSource stream in catch:', e); }
          }
          throw err; // Let outer catch handle state updates
        }
      }, { once: true });

      audio.onended = () => {
        console.log('[TTS] Audio playback ended successfully (MediaSource path)');
        setIsPlaying(false); setCurrentRequestId(null);
        setQueue(prev => prev.slice(1));
      };
      audio.onerror = (e) => {
        console.error('[TTS] Audio playback error (MediaSource path):', e);
        setIsPlaying(false); setCurrentRequestId(null);
        setQueue(prev => prev.slice(1));
      };

      try {
        await audio.play();
      } catch (e) {
        console.error('[TTS] Error calling audio.play() (MediaSource path):', e);
        setIsPlaying(false); setCurrentRequestId(null);
        setQueue(prev => prev.slice(1));
        if (mediaSourceRef.current) {
          if (mediaSourceRef.current.readyState === 'open') try { mediaSourceRef.current.endOfStream(); } catch (eosErr) { console.warn('[TTS] Error ending stream after play() error:', eosErr); }
          URL.revokeObjectURL(audio.src); audio.src = '';
          mediaSourceRef.current = null;
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('TTS fetch aborted for request ID:', newRequestId);
        // Abort is usually intentional. Ensure state reflects not playing.
        // stopCurrentPlayback should handle resetting isPlaying and currentRequestId.
        // If abortControllerRef.current.abort() was called directly without stopCurrentPlayback,
        setIsPlaying(false); setCurrentRequestId(null);
        setIsPlaying(false); 
        setCurrentRequestId(null);
      } else {
        // For other errors (like failed to fetch or processing errors)
        console.error(`Error in playNext for text "${textToPlay}":`, error);
        setIsPlaying(false);
        setCurrentRequestId(null);
        // Remove the failed item from the queue.
        // The useEffect hook watching 'queue', 'isPlaying', 'voiceEnabled'
        // will determine if playNext should be called for the subsequent item.
        setQueue(prev => prev.slice(1));
      }
    }
  }, [queue, voiceEnabled, supportsOpus]);

  const stopCurrentPlayback = useCallback(async (calledByToggleOff = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      // Always clear handlers before changing src to prevent stale events
      audioPlayerRef.current.onerror = null;
      audioPlayerRef.current.onended = null;
      audioPlayerRef.current.onloadeddata = null;
      audioPlayerRef.current.src = ''; // Detach MediaSource or Blob URL
    }
    if (mediaSourceRef.current && mediaSourceRef.current.readyState === 'open') {
        try {
            if (sourceBufferRef.current && sourceBufferRef.current.updating) {
                sourceBufferRef.current.abort(); // Abort buffer operations if ongoing
            }
            mediaSourceRef.current.endOfStream();
        } catch (e) {
            console.warn('Error ending MediaSource stream during stop:', e);
        }
    }
    mediaSourceRef.current = null;
    sourceBufferRef.current = null;

    if (currentRequestId) {
      try {
        await fetch(`${TTS_BASE_URL}/stop`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ request_id: currentRequestId }),
        });
      } catch (error) {
        console.error('Error stopping TTS on server:', error);
      }
    }

    setIsPlaying(false);
    if (calledByToggleOff) { // Only clear queue if toggleVoice(false) called this
        setQueue([]);
    }
    // Do not reset currentRequestId here, as playNext might be called again if queue is not empty
    // and calledByToggleOff is false (e.g. navigating away)
  }, [currentRequestId]);

  const toggleVoice = useCallback(() => {
    const newVoiceEnabled = !voiceEnabled;
    setVoiceEnabled(newVoiceEnabled);
    localStorage.setItem(VOICE_ENABLED_KEY, JSON.stringify(newVoiceEnabled));

    if (newVoiceEnabled) {
      // Attempt to unlock audio when voice is enabled
      if (audioPlayerRef.current) {
        const playPromise = audioPlayerRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              audioPlayerRef.current?.pause(); // Pause immediately after unlocking
              console.log('[TTS] Audio context likely unlocked by toggle.');
              // If queue has items and not already playing, start
              if (queue.length > 0 && !isPlaying) {
                console.log('[TTS] Voice toggled on, queue has items, starting playNext after unlock attempt.');
                playNext();
              }
            })
            .catch(err => {
              if (err.name === 'AbortError') {
                console.info('[TTS] Audio unlock attempt (play then pause) resulted in an expected AbortError. Playback will proceed via playNext if items are in queue.');
              } else {
                console.warn('[TTS] Failed to unlock audio via toggle (unexpected error), play will be attempted by playNext:', err);
              }
              // If unlock attempt fails (for any reason), and conditions are still met, try to playNext.
              // This ensures that even if the explicit unlock logs an error, the queue processing continues.
              if (queue.length > 0 && !isPlaying) {
                playNext();
              }
            });
        } else {
          // Fallback if play() doesn't return a promise (older browsers) or if audioPlayerRef.current.play() is not available
          // Still try to playNext if conditions are met, as the audio might be unlocked by other means or not need unlocking.
          if (queue.length > 0 && !isPlaying) {
            console.log('[TTS] Voice toggled on (playPromise undefined), queue has items, attempting playNext.');
            playNext();
          }
        }
      } else if (queue.length > 0 && !isPlaying) {
        // Audio player not yet available, but queue has items. playNext will be called by useEffect.
        console.log('[TTS] Voice toggled on (audio player not ready), queue has items. Effect will call playNext.');
      }
    } else { // Voice is being disabled
      stopCurrentPlayback(true); // Pass true to indicate it's due to toggle off
      setQueue([]); // Clear queue when disabling voice
    }
  }, [voiceEnabled, stopCurrentPlayback, queue, isPlaying, playNext]);

  const enqueueBotUtterance = useCallback((text: string, messageId: string) => {
    if (!voiceEnabled || playedIds.has(messageId)) {
      return;
    }
    setPlayedIds(prev => new Set(prev).add(messageId));
    setQueue(prevQueue => [...prevQueue, text]);
  }, [voiceEnabled, playedIds]);

  useEffect(() => {
    console.log('[TTS] Queue effect triggered. Queue length:', queue.length, 'Voice enabled:', voiceEnabled, 'Is playing:', isPlaying);
    if (voiceEnabled && queue.length > 0 && !isPlaying) {
      console.log('[TTS] Conditions met to play next item from queue');
      playNext();
    } else {
      console.log('[TTS] Conditions not met to play next. Voice:', voiceEnabled, 'Queue length:', queue.length, 'Is playing:', isPlaying);
    }
  }, [queue, voiceEnabled, isPlaying, playNext]);

  // Cleanup on unmount or when dependencies change
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (voiceEnabled && isPlaying) {
        // Fire-and-forget stop call to server, browser might not wait for fetch
        if (currentRequestId) {
            navigator.sendBeacon(`${TTS_BASE_URL}/stop`, JSON.stringify({ request_id: currentRequestId }));
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Create audio player if it doesn't exist
    if (!document.getElementById('tts-audio-player')) {
        const audio = new Audio();
        audio.id = 'tts-audio-player';
        // audio.controls = true; // For debugging
        document.body.appendChild(audio);
        audioPlayerRef.current = audio;
    } else {
        audioPlayerRef.current = document.getElementById('tts-audio-player') as HTMLAudioElement;
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // stopCurrentPlayback(); // This will be handled by component unmount if needed
      // No need to remove audio player from DOM here, could be reused
    };
  }, [voiceEnabled, isPlaying, currentRequestId, stopCurrentPlayback]); // Added stopCurrentPlayback

  return { voiceEnabled, isPlaying, toggleVoice, enqueueBotUtterance, stopCurrentPlayback };
};
