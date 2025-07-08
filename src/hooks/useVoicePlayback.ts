// Only log module loading in debug mode
const DEBUG_MODULE_LOADING = false;
if (DEBUG_MODULE_LOADING) {
  console.log('[TTS Module] useVoicePlayback.ts module loaded');
}
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supportsMediaSource, getManagedMediaSource, canUseStreamingAudio } from '../lib/supportsMediaSource';

const TTS_BASE_URL = 'https://ftvoiceservice-production-6960.up.railway.app/tts/v1/tts';
const VOICE_ENABLED_KEY = 'voiceEnabled';

// Debug flags to control TTS behavior
const FORCE_PROGRESSIVE_FALLBACK = false; // Set to true to force fallback, false for original logic
const FORCE_STREAMING_MODE = false; // Set to true to force streaming even if codec detection fails
const DEBUG_STREAMING = false; // Enable detailed streaming debug logs
const FORCE_DEBUG_RECALC = false; // Force recalculation of capabilities to see debug output

interface UseVoicePlayback {
  voiceEnabled: boolean;
  isPlaying: boolean;
  toggleVoice: () => void;
  enqueueBotUtterance: (text: string, messageId: string) => void;
  stopCurrentPlayback: () => void; // Renamed for clarity from stopCurrent
}

export const useVoicePlayback = (): UseVoicePlayback => {
  if (DEBUG_MODULE_LOADING) {
    console.log('[TTS Module] useVoicePlayback hook initialized');
  }
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
  const isStreamingRef = useRef<boolean>(false); // Track ManagedMediaSource streaming state
  const pendingBuffersRef = useRef<Uint8Array[]>([]); // Queue buffers when not streaming
  const playbackStartedRef = useRef<boolean>(false); // Track if playback has started

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

  const OGG_OPUS_MIME = 'audio/ogg; codecs="opus"';
  const WEBM_OPUS_MIME = 'audio/webm; codecs="opus"';
  const MP4_AAC_MIME = 'audio/mp4; codecs="mp4a.40.2"';
  
  // Use WebM for streaming since MediaSource doesn't support Ogg containers
  const STREAMING_MIME = WEBM_OPUS_MIME;
  
  // Enhanced MediaSource support detection for mobile compatibility
  const mediaSourceCapabilities = useMemo(() => {
    console.log('[TTS] Calculating MediaSource capabilities...');
    const MediaSourceConstructor = getManagedMediaSource();
    
    if (!MediaSourceConstructor) {
      console.log('[TTS] No MediaSource API available - will use progressive download fallback');
      return {
        hasMediaSource: false,
        canStreamOggOpus: false,
        canStreamMP4AAC: false,
        isManagedMediaSource: false,
        constructor: null,
        preferredMimeType: null
      };
    }
    
    const isManagedMediaSource = window.ManagedMediaSource && MediaSourceConstructor === window.ManagedMediaSource;
    
    // Enhanced debugging for streaming capability detection
    let canStreamOggOpus = false;
    let canStreamMP4AAC = false;
    let preferredMimeType = null;
    
    try {
      if (FORCE_PROGRESSIVE_FALLBACK) {
        console.log('[TTS] FORCE_PROGRESSIVE_FALLBACK is enabled - forcing fallback mode');
        canStreamOggOpus = false;
        canStreamMP4AAC = false;
      } else if (FORCE_STREAMING_MODE) {
        console.log('[TTS] FORCE_STREAMING_MODE is enabled - forcing streaming mode');
        canStreamOggOpus = true;
        preferredMimeType = STREAMING_MIME;
      } else {
        // Test WebM container support for Opus (MediaSource doesn't support Ogg containers)
        canStreamOggOpus = canUseStreamingAudio(STREAMING_MIME);
        
        // For Safari/ManagedMediaSource, also test MP4/AAC support
        if (isManagedMediaSource && !canStreamOggOpus) {
          canStreamMP4AAC = canUseStreamingAudio(MP4_AAC_MIME);
          if (canStreamMP4AAC) {
            console.log('[TTS] Safari/ManagedMediaSource supports MP4/AAC but not WebM/Opus');
            preferredMimeType = MP4_AAC_MIME;
          }
        } else if (canStreamOggOpus) {
          preferredMimeType = STREAMING_MIME;
        }
        
        if (DEBUG_STREAMING) {
          console.log(`[TTS] MediaSource.isTypeSupported('${STREAMING_MIME}'): ${MediaSourceConstructor.isTypeSupported?.(STREAMING_MIME)}`);
          console.log(`[TTS] canUseStreamingAudio result for WebM/Opus: ${canStreamOggOpus}`);
          console.log(`[TTS] MediaSource.isTypeSupported('${MP4_AAC_MIME}'): ${MediaSourceConstructor.isTypeSupported?.(MP4_AAC_MIME)}`);
          console.log(`[TTS] canUseStreamingAudio result for MP4/AAC: ${canStreamMP4AAC}`);
          // Also log Ogg support for comparison
          console.log(`[TTS] For comparison - Ogg/Opus support: ${MediaSourceConstructor.isTypeSupported?.(OGG_OPUS_MIME)}`);
        }
      }
    } catch (e) {
      console.error('[TTS] Error checking streaming audio support:', e);
      canStreamOggOpus = false;
      canStreamMP4AAC = false;
    }
    
    const canStream = canStreamOggOpus || canStreamMP4AAC;
    console.log(`[TTS] MediaSource capabilities: ${isManagedMediaSource ? 'ManagedMediaSource' : 'MediaSource'}, WebM/Opus: ${canStreamOggOpus}, MP4/AAC: ${canStreamMP4AAC}`);
    console.log(`[TTS] Preferred MIME type: ${preferredMimeType}`);
    console.log(`[TTS] Will use: ${canStream ? 'STREAMING' : 'PROGRESSIVE DOWNLOAD'}`);
    
    return {
      hasMediaSource: true,
      canStreamOggOpus,
      canStreamMP4AAC,
      isManagedMediaSource,
      constructor: MediaSourceConstructor,
      preferredMimeType
    };
  }, []); // Empty dependency array means this only runs once per component lifecycle

  useEffect(() => {
    localStorage.setItem('voiceEnabled', JSON.stringify(voiceEnabled));
  }, [voiceEnabled]);

  // Mobile browser detection utility
  const isMobileBrowser = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    return isMobile || isTouch;
  }, []);

  // Enhanced audio context unlock for mobile browsers
  const unlockAudioContext = useCallback(async (): Promise<boolean> => {
    if (!audioPlayerRef.current) return false;
    
    const audio = audioPlayerRef.current;
    
    try {
      console.log('[TTS] Attempting to unlock audio context via user gesture...');
      
      // Create a silent play attempt to unlock the audio context
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        audio.pause();
        audio.currentTime = 0;
        console.log('[TTS] Audio context successfully unlocked');
        return true;
      } else {
        // Fallback for browsers that don't return a promise
        audio.pause();
        audio.currentTime = 0;
        console.log('[TTS] Audio unlock attempted (no promise returned)');
        return true;
      }
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        console.warn('[TTS] Audio unlock failed: User gesture required');
        return false;
      } else if (error.name === 'AbortError') {
        console.log('[TTS] Audio unlock: Expected AbortError from immediate pause');
        return true;
      } else {
        console.warn('[TTS] Audio unlock failed with unexpected error:', error);
        return false;
      }
    }
  }, []);

  // Progressive download fallback for browsers without MediaSource support
  const playWithProgressiveDownload = useCallback(async (response: Response, audio: HTMLAudioElement, textToPlay: string) => {
    console.log('[TTS] Using progressive download fallback');
    try {
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      audio.src = blobUrl;

      const cleanup = () => {
        URL.revokeObjectURL(blobUrl);
        audio.onerror = null;
        audio.onended = null;
      };

      audio.onended = () => {
        console.log('[TTS] Audio playback ended successfully (Progressive download)');
        cleanup();
        setIsPlaying(false);
        setCurrentRequestId(null);
        setQueue(prev => prev.slice(1));
      };
      
      audio.onerror = (e) => {
        console.error('[TTS] Audio playback error (Progressive download):', e);
        cleanup();
        setIsPlaying(false);
        setCurrentRequestId(null);
        setQueue(prev => prev.slice(1));
      };

      await audio.play();
    } catch (error) {
      console.error('[TTS] Progressive download error:', error);
      setIsPlaying(false);
      setCurrentRequestId(null);
      setQueue(prev => prev.slice(1));
    }
  }, []);

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
      console.log('[TTS] Sending request to:', TTS_BASE_URL);
      const response = await fetch(TTS_BASE_URL, {
        method: 'POST',
        headers: {
          'Accept': 'audio/webm; codecs=opus, audio/ogg; codecs=opus',
          'Content-Type': 'application/json',
          'X-Request-ID': newRequestId,
        },
        body: JSON.stringify({
          text: textToPlay,
          model: 'gpt-4o-mini-tts',
          voice: 'shimmer',
          speed: 1.0,
          response_format: 'opus',
          container_format: 'webm', // Request WebM container for streaming
          instructions: 'You are a personal trainer. Speak motivating and respectfull and calm.'
        }),
        signal,
      });
      console.log('[TTS] Response received:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`TTS API request failed: ${response.status} ${response.statusText}`);
      }

      // Log response content type to verify WebM format
      const contentType = response.headers.get('content-type');
      console.log('[TTS] Response Content-Type:', contentType);
      console.log('[TTS] Response headers:', Array.from(response.headers.entries()));
      
      if (!response.body) {
        throw new Error('TTS API response has no body');
      }

      if (!audioPlayerRef.current) {
        const audio = new Audio();
        audio.id = 'tts-audio-player';
        // Important for iOS Safari
        audio.playsInline = true;
        audio.preload = 'auto';
        document.body.appendChild(audio); // Hidden, or consider a more React-friendly way
        audioPlayerRef.current = audio;
      }
      const audio = audioPlayerRef.current;
      
      // Reset playback state for new request
      playbackStartedRef.current = false;
      
      // For ManagedMediaSource on iOS Safari - must disable remote playback BEFORE setting src
      if (mediaSourceCapabilities.isManagedMediaSource && 'disableRemotePlayback' in audio) {
        try {
          (audio as any).disableRemotePlayback = true;
          console.log('[TTS] disableRemotePlayback set for ManagedMediaSource');
        } catch (e) {
          console.warn('[TTS] Failed to set disableRemotePlayback:', e);
        }
      }
      
      audio.pause();
      audio.currentTime = 0;
      // Clear previous event handlers to prevent stale events from firing
      audio.onerror = null;
      audio.onended = null;
      audio.onloadeddata = null;
      audio.oncanplay = null;
      audio.onloadedmetadata = null;

      // Determine playback strategy based on browser capabilities
      if (!mediaSourceCapabilities.hasMediaSource) {
        console.log('[TTS] Using progressive download fallback (no MediaSource support)');
        await playWithProgressiveDownload(response, audio, textToPlay);
        return;
      }

      // Backend now supports WebM/Opus format for streaming via MediaSource API
      // WebM container enables true streaming with lower latency compared to Ogg/Opus
      const backendSupportsWebM = true; // Backend now supports WebM streaming
      
      console.log('[TTS] Streaming decision - canStreamOggOpus:', mediaSourceCapabilities.canStreamOggOpus, 'backendSupportsWebM:', backendSupportsWebM);
      
      // Additional debugging for Safari
      if (mediaSourceCapabilities.isManagedMediaSource) {
        console.log('[TTS] ManagedMediaSource codec support check:');
        console.log('[TTS] - WebM/Opus:', mediaSourceCapabilities.constructor?.isTypeSupported?.(WEBM_OPUS_MIME));
        console.log('[TTS] - MP4/AAC:', mediaSourceCapabilities.constructor?.isTypeSupported?.(MP4_AAC_MIME));
        console.log('[TTS] - Ogg/Opus:', mediaSourceCapabilities.constructor?.isTypeSupported?.(OGG_OPUS_MIME));
      }
      
      if (mediaSourceCapabilities.canStreamOggOpus && backendSupportsWebM) {
        // Branch 1: Real-time streaming for compatible browsers
        const msType = mediaSourceCapabilities.isManagedMediaSource ? 'ManagedMediaSource' : 'MediaSource';
        console.log(`[TTS] Using ${msType} streaming with WebM/Opus support`);
        console.log('[TTS] Content-Type indicates:', contentType?.includes('webm') ? 'WebM format' : contentType?.includes('ogg') ? 'Ogg format' : 'Unknown format');
        
        // Check if we actually received WebM
        if (!contentType?.includes('webm')) {
          console.warn('[TTS] Backend returned non-WebM format despite request. Falling back to progressive download.');
          await playWithProgressiveDownload(response, audio, textToPlay);
          return;
        }
        
        try {
          mediaSourceRef.current = new mediaSourceCapabilities.constructor!();
          console.log('[TTS] Created MediaSource, initial readyState:', mediaSourceRef.current.readyState);
          console.log('[TTS] MediaSource constructor type:', mediaSourceCapabilities.isManagedMediaSource ? 'ManagedMediaSource' : 'MediaSource');
          
          const sourceUrl = URL.createObjectURL(mediaSourceRef.current);
          console.log('[TTS] Created blob URL for MediaSource:', sourceUrl);
          
          // For Safari, ensure audio element is ready before setting src
          if (mediaSourceCapabilities.isManagedMediaSource) {
            // Clear any existing src first
            audio.removeAttribute('src');
            audio.load();
            console.log('[TTS] Cleared src and called load() for ManagedMediaSource');
          }
          
          // Set up audio element event handlers BEFORE setting src
          // This ensures they're ready when the browser starts loading
          
          // Start playback as soon as audio element has enough data
          audio.oncanplay = () => {
            if (!playbackStartedRef.current) {
              console.log('[TTS] Audio canplay event - starting playback immediately');
              audio.play().catch(e => console.error('[TTS] Play on canplay error:', e));
              playbackStartedRef.current = true;
            }
          };
          
          // For mobile Safari, also listen to loadedmetadata
          audio.onloadedmetadata = () => {
            console.log('[TTS] Audio loadedmetadata event');
            if (!playbackStartedRef.current && audio.buffered.length > 0) {
              console.log('[TTS] Attempting play on loadedmetadata');
              audio.play().catch(e => console.error('[TTS] Play on loadedmetadata error:', e));
              playbackStartedRef.current = true;
            }
          };
          
          audio.onended = () => {
            console.log('[TTS] Audio playback ended successfully (MediaSource path)');
            setIsPlaying(false); 
            setCurrentRequestId(null);
            setQueue(prev => prev.slice(1));
          };
          
          audio.onerror = (e) => {
            console.error('[TTS] Audio playback error (MediaSource path):', e);
            setIsPlaying(false); 
            setCurrentRequestId(null);
            setQueue(prev => prev.slice(1));
          };
          
          // Now set the src
          audio.src = sourceUrl;
          oggPageBufferRef.current = new Uint8Array(0); // Initialize buffer for WebM chunks
          console.log('[TTS] MediaSource URL assigned to audio element');
          console.log('[TTS] MediaSource readyState after URL assignment:', mediaSourceRef.current.readyState);
          console.log('[TTS] Audio element readyState:', audio.readyState);
        } catch (msError) {
          console.error('[TTS] Failed to create MediaSource:', msError);
          console.log('[TTS] Falling back to progressive download due to MediaSource error');
          await playWithProgressiveDownload(response, audio, textToPlay);
          return;
        }
        
        // For Safari, we need to ensure the audio element is ready
        if (mediaSourceCapabilities.isManagedMediaSource) {
          console.log('[TTS] ManagedMediaSource detected, setting up Safari-specific handling');
          // Safari requires the audio element to be in the DOM and visible
          if (!audio.parentElement) {
            document.body.appendChild(audio);
          }
          // Important: Don't call load() here - it can interfere with MediaSource setup
          // The browser will handle loading when we set the src
        }

        // Add ManagedMediaSource specific event listeners for iOS Safari 17+
        if (mediaSourceCapabilities.isManagedMediaSource) {
          const managedMS = mediaSourceRef.current as ManagedMediaSource;
          
          managedMS.addEventListener('startstreaming', () => {
            console.log('[TTS] ManagedMediaSource: Start streaming event');
            isStreamingRef.current = true;
            
            // Process any pending buffers
            if (pendingBuffersRef.current.length > 0 && sourceBufferRef.current && !sourceBufferRef.current.updating) {
              console.log('[TTS] Processing', pendingBuffersRef.current.length, 'pending buffers');
              const buffers = pendingBuffersRef.current;
              pendingBuffersRef.current = [];
              
              // Append buffers sequentially
              const appendNext = () => {
                if (buffers.length > 0 && sourceBufferRef.current && !sourceBufferRef.current.updating && isStreamingRef.current) {
                  const buffer = buffers.shift()!;
                  try {
                    sourceBufferRef.current.appendBuffer(buffer);
                  } catch (e) {
                    console.error('[TTS] Error appending pending buffer:', e);
                  }
                }
              };
              
              sourceBufferRef.current.addEventListener('updateend', appendNext, { once: true });
              appendNext();
            }
            
            // Ensure audio plays when streaming starts
            if (!playbackStartedRef.current && audio.paused) {
              audio.play().catch(e => console.error('[TTS] Play on startstreaming error:', e));
              playbackStartedRef.current = true;
            }
          });
          
          managedMS.addEventListener('endstreaming', () => {
            console.log('[TTS] ManagedMediaSource: End streaming event - pause processing');
            isStreamingRef.current = false;
          });
        }

        
        const handleSourceOpen = async () => {
          console.log('[TTS] MediaSource opened, readyState:', mediaSourceRef.current?.readyState);
          if (!mediaSourceRef.current || mediaSourceRef.current.readyState !== 'open') return;

          try {
            // Use WebM container for streaming (MediaSource doesn't support Ogg)
            sourceBufferRef.current = mediaSourceRef.current.addSourceBuffer(STREAMING_MIME);
            console.log('[TTS] Created SourceBuffer with MIME type:', STREAMING_MIME);
            const reader = response.body!.getReader();
            let streamEndedByReader = false;
            const MIN_BUFFER_DURATION = 0.3; // Start playback after 0.3 seconds of audio
            const startTime = Date.now();

            const processData = async (isFinalAttempt: boolean) => {
              if (!sourceBufferRef.current || sourceBufferRef.current.updating || !oggPageBufferRef.current) {
                return;
              }
              
              // For WebM streaming, we can append chunks directly without page extraction
              if (backendSupportsWebM && oggPageBufferRef.current.length > 0) {
                try {
                  // For ManagedMediaSource, only append during streaming windows
                  if (mediaSourceCapabilities.isManagedMediaSource && !isStreamingRef.current) {
                    console.log('[TTS] ManagedMediaSource not streaming, queuing buffer');
                    pendingBuffersRef.current.push(new Uint8Array(oggPageBufferRef.current));
                    oggPageBufferRef.current = new Uint8Array(0);
                    return;
                  }
                  
                  sourceBufferRef.current.appendBuffer(oggPageBufferRef.current);
                  oggPageBufferRef.current = new Uint8Array(0); // Clear buffer after appending
                  
                  // Start playback as soon as we have enough buffered data
                  if (!playbackStartedRef.current && audio.buffered.length > 0) {
                    const bufferedEnd = audio.buffered.end(0);
                    if (bufferedEnd >= MIN_BUFFER_DURATION) {
                      console.log('[TTS] Starting playback - buffered:', bufferedEnd, 'seconds');
                      audio.play().catch(e => console.error('[TTS] Early play() error:', e));
                      playbackStartedRef.current = true;
                    }
                  }
                } catch (appendError) {
                  console.error('[TTS] Error appending WebM chunk:', appendError);
                  if (mediaSourceRef.current && mediaSourceRef.current.readyState === 'open') {
                    try { mediaSourceRef.current.endOfStream(); } catch (eosErr) { console.warn('[TTS] Error ending stream after append error:', eosErr); }
                  }
                  throw appendError;
                }
              } else {
                // Legacy Ogg page extraction (kept for backwards compatibility)
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
                    throw appendError;
                  }
                }
              }
            };

            sourceBufferRef.current.addEventListener('updateend', async () => {
              if (abortControllerRef.current?.signal.aborted) return;
              await processData(streamEndedByReader);
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
                console.log('[TTS] Received chunk:', value.length, 'bytes at', (Date.now() - startTime), 'ms');
                const newCombinedBuffer = new Uint8Array((oggPageBufferRef.current?.length || 0) + value.length);
                if (oggPageBufferRef.current) newCombinedBuffer.set(oggPageBufferRef.current, 0);
                newCombinedBuffer.set(value, oggPageBufferRef.current?.length || 0);
                oggPageBufferRef.current = newCombinedBuffer;
                console.log('[TTS] Buffer size after append:', oggPageBufferRef.current.length, 'bytes');
                
                // Process data immediately after receiving each chunk
                await processData(false);
              } else {
                // Only process with isFinalAttempt=true when done and no value
                if (done) {
                  await processData(true);
                }
              }

              if (done) {
                console.log('[TTS] Stream finished (reader.read() done).');
                if (mediaSourceRef.current?.readyState === 'open' &&
                    (!oggPageBufferRef.current || oggPageBufferRef.current.length === 0) &&
                    sourceBufferRef.current && !sourceBufferRef.current.updating) {
                  console.log('[TTS] Stream done, buffer empty post-process, finalizing MediaSource.');
                  mediaSourceRef.current.endOfStream();
                }
                break;
              }
            }
          } catch (err) {
            console.error('[TTS] Error during MediaSource stream processing:', err);
            if (mediaSourceRef.current?.readyState === 'open') {
              try { mediaSourceRef.current.endOfStream(); } catch (e) { console.warn('[TTS] Error ending MediaSource stream in catch:', e); }
            }
            throw err;
          }
        };
        
        // For ManagedMediaSource, we might need to trigger sourceopen differently
        if (mediaSourceCapabilities.isManagedMediaSource && mediaSourceRef.current.readyState === 'open') {
          console.log('[TTS] ManagedMediaSource already open, handling immediately');
          handleSourceOpen();
        } else {
          console.log('[TTS] Adding sourceopen event listener. Current readyState:', mediaSourceRef.current.readyState);
          mediaSourceRef.current.addEventListener('sourceopen', () => {
            console.log('[TTS] sourceopen event fired!');
            handleSourceOpen();
          }, { once: true });
          
          // Safari sometimes needs an explicit load() call to trigger sourceopen
          if (mediaSourceCapabilities.isManagedMediaSource) {
            console.log('[TTS] Setting up timeout to check sourceopen for ManagedMediaSource');
            setTimeout(() => {
              if (mediaSourceRef.current && mediaSourceRef.current.readyState !== 'open') {
                console.log('[TTS] ManagedMediaSource not open after timeout, readyState:', mediaSourceRef.current.readyState);
                console.log('[TTS] Calling audio.load() to trigger sourceopen');
                audio.load();
                
                // If still not open after load, try progressive download
                setTimeout(() => {
                  if (mediaSourceRef.current && mediaSourceRef.current.readyState !== 'open') {
                    console.warn('[TTS] ManagedMediaSource failed to open, falling back to progressive download');
                    URL.revokeObjectURL(audio.src);
                    playWithProgressiveDownload(response, audio, textToPlay);
                  }
                }, 500);
              } else {
                console.log('[TTS] ManagedMediaSource opened successfully within timeout');
              }
            }, 100);
          }
        }
      } else {
        // Branch 2: Progressive download for browsers without WebM/Opus streaming support
        console.log('[TTS] MediaSource available but WebM/Opus streaming not supported. Using progressive download.');
        await playWithProgressiveDownload(response, audio, textToPlay);
        return;
      }

      // Don't try to play here - let the sourceopen event or the event handlers trigger playback
      // The audio will start playing when:
      // 1. sourceopen event fires and streaming starts
      // 2. oncanplay event fires
      // 3. onloadedmetadata event fires
      // This prevents AbortError from trying to play too early
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
  }, [queue, voiceEnabled, playWithProgressiveDownload]);

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
    isStreamingRef.current = false;
    pendingBuffersRef.current = [];

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

  const toggleVoice = useCallback(async () => {
    const newVoiceEnabled = !voiceEnabled;
    setVoiceEnabled(newVoiceEnabled);
    localStorage.setItem(VOICE_ENABLED_KEY, JSON.stringify(newVoiceEnabled));

    if (newVoiceEnabled) {
      const mobile = isMobileBrowser();
      console.log(`[TTS] Voice enabled on ${mobile ? 'mobile' : 'desktop'} browser`);
      
      // Enhanced mobile audio unlock
      if (mobile && audioPlayerRef.current) {
        console.log('[TTS] Mobile browser detected - attempting audio context unlock');
        const unlocked = await unlockAudioContext();
        
        if (!unlocked) {
          console.warn('[TTS] Failed to unlock audio context - TTS may not work until user interacts with audio');
        }
      } else if (audioPlayerRef.current) {
        // Desktop browser - simple unlock attempt
        try {
          const playPromise = audioPlayerRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
            audioPlayerRef.current.pause();
            audioPlayerRef.current.currentTime = 0;
            console.log('[TTS] Desktop audio context unlocked');
          }
        } catch (err) {
          console.log('[TTS] Desktop audio unlock attempt completed with expected error:', err);
        }
      }

      // Start playing queued items if available
      if (queue.length > 0 && !isPlaying) {
        console.log('[TTS] Voice enabled with queued items - starting playback');
        playNext();
      }
    } else {
      // Voice is being disabled
      console.log('[TTS] Voice disabled - stopping playback and clearing queue');
      stopCurrentPlayback(true);
      setQueue([]);
    }
  }, [voiceEnabled, stopCurrentPlayback, queue, isPlaying, playNext, isMobileBrowser, unlockAudioContext]);

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
