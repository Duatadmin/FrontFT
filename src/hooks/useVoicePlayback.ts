import { useState, useEffect, useCallback, useRef } from 'react';

const TTS_BASE_URL = 'http://ft_voice_service.railway.internal/v1/tts';

interface UseVoicePlayback {
  voiceEnabled: boolean;
  isPlaying: boolean;
  toggleVoice: () => void;
  enqueueBotUtterance: (text: string, messageId: string) => void;
  stopCurrentPlayback: () => void; // Renamed for clarity from stopCurrent
}

export const useVoicePlayback = (): UseVoicePlayback => {
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('voiceEnabled');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [queue, setQueue] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [playedIds, setPlayedIds] = useState<Set<string>>(new Set());

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);

  const supportsOpus = MediaSource.isTypeSupported('audio/ogg;codecs=opus');

  useEffect(() => {
    localStorage.setItem('voiceEnabled', JSON.stringify(voiceEnabled));
  }, [voiceEnabled]);

  const playNext = useCallback(async () => {
    if (queue.length === 0 || !voiceEnabled) {
      setIsPlaying(false);
      setCurrentRequestId(null);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = ''; // Clear src to ensure it stops
      }
      return;
    }

    setIsPlaying(true);
    const textToPlay = queue[0]; // Peek at the next item
    const newRequestId = crypto.randomUUID();
    setCurrentRequestId(newRequestId);

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      const response = await fetch(TTS_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': newRequestId,
        },
        body: JSON.stringify({ text: textToPlay }),
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

      if (supportsOpus) {
        mediaSourceRef.current = new MediaSource();
        audio.src = URL.createObjectURL(mediaSourceRef.current);

        mediaSourceRef.current.addEventListener('sourceopen', async () => {
          if (!mediaSourceRef.current) return;
          try {
            sourceBufferRef.current = mediaSourceRef.current.addSourceBuffer('audio/ogg; codecs=opus');
            const reader = response.body!.getReader();
            
            sourceBufferRef.current.addEventListener('updateend', async () => {
              // Continue reading only if not aborted and mediaSource is still open
              if (abortControllerRef.current?.signal.aborted || mediaSourceRef.current?.readyState !== 'open') return;
              const { done, value } = await reader.read();
              if (done) {
                if (mediaSourceRef.current?.readyState === 'open' && sourceBufferRef.current && !sourceBufferRef.current.updating) {
                  mediaSourceRef.current.endOfStream();
                }
                return;
              }
              if (sourceBufferRef.current && !sourceBufferRef.current.updating) {
                 sourceBufferRef.current.appendBuffer(value);
              }
            });

            // Start the reading process
            const { done, value } = await reader.read();
            if (!done && sourceBufferRef.current && !sourceBufferRef.current.updating) {
              sourceBufferRef.current.appendBuffer(value);
            }
            if (done && mediaSourceRef.current?.readyState === 'open' && sourceBufferRef.current && !sourceBufferRef.current.updating) {
                mediaSourceRef.current.endOfStream();
            }

          } catch (err) {
            console.error('Error during MediaSource stream processing:', err);
            if (mediaSourceRef.current?.readyState === 'open') {
                mediaSourceRef.current.endOfStream();
            }
            setQueue(prev => prev.slice(1)); // Consume item from queue
            playNext(); // Attempt next item
          }
        }, { once: true });

        audio.onended = () => {
          setQueue(prev => prev.slice(1)); // Consume item from queue
          playNext();
        };
        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          setQueue(prev => prev.slice(1)); // Consume item from queue
          playNext(); // Attempt next item
        };
        await audio.play().catch(e => {
            console.error('Error playing audio:', e);
            setQueue(prev => prev.slice(1));
            playNext();
        });

      } else { // Fallback for non-Opus browsers (e.g., Mobile Safari)
        const audioBlob = await response.blob();
        audio.src = URL.createObjectURL(audioBlob);
        audio.onloadeddata = () => {
            audio.play().catch(e => {
                console.error('Error playing audio blob:', e);
                setQueue(prev => prev.slice(1));
                playNext();
            });
        };
        audio.onended = () => {
          setQueue(prev => prev.slice(1));
          playNext();
        };
        audio.onerror = (e) => {
          console.error('Audio blob playback error:', e);
          setQueue(prev => prev.slice(1));
          playNext();
        };
      }

    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('TTS fetch aborted for request ID:', newRequestId);
      } else {
        console.error('Error in playNext:', error);
      }
      // If not an abort, or if an abort happened but we still want to clear and move on
      // This ensures that an error in one playback doesn't stall the queue indefinitely.
      setQueue(prev => prev.slice(1)); // Consume item from queue
      setIsPlaying(false); // Ensure isPlaying is reset
      setCurrentRequestId(null);
      playNext(); // Attempt to play the next item in the queue
    }
  }, [queue, voiceEnabled, supportsOpus]);

  const stopCurrentPlayback = useCallback(async (calledByToggleOff = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
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
    if (!newVoiceEnabled) {
      stopCurrentPlayback(true); // Pass true to indicate it's due to toggle off
      setQueue([]); // Clear queue when disabling voice
    } else {
      // If enabling and queue has items, start playing
      if (queue.length > 0 && !isPlaying) {
        playNext();
      }
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
    if (voiceEnabled && queue.length > 0 && !isPlaying) {
      playNext();
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
