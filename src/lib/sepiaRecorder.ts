// src/lib/sepiaRecorder.ts

// Assume SepiaFW and SepiaVoiceRecorder are globally available.
// These are placeholder type definitions.
declare const SepiaFW: {
  webAudio: {
    defaultProcessorOptions: {
      moduleFolder: string;
    };
  };
};
declare const SepiaVoiceRecorder: {
  onProcessorReady: (() => void) | null;
  onProcessorInitError: ((error: any) => void) | null;
  onResamplerData: ((data: { samples: Int16Array[]; rms: number }) => void) | null;
  create: (options: any) => void;
  start: () => void;
  stop: () => void;
  release?: () => void; // Optional release method
  destroy?: () => void; // Optional destroy method
};

export type ErrorCallback = (error: any) => void;
export type PcmChunkCallback = (pcmChunk: Int16Array) => void;

export interface RecorderHandle {
  start: (onChunk: PcmChunkCallback) => Promise<void>;
  stop: () => Promise<void>;
  close: () => void;
}

const CHUNK_DURATION_MS = 30; // Corresponds to useWalkie CHUNK_MS

// Module-level state for SEPIA's global recorder
let internalIsRecorderReady = false;
let internalOnReadyPromise: Promise<void> | null = null;
let internalOnReadyResolve: (() => void) | null = null;
let internalOnReadyReject: ((reason?: any) => void) | null = null;

let activePcmDataCallback: PcmChunkCallback | null = null;
let activeErrorCallback: ErrorCallback | null = null;

let isSepiaInitialized = false;

function initializeSepiaGlobalHandlers() {
  if (isSepiaInitialized || typeof SepiaVoiceRecorder === 'undefined') {
    return;
  }

  SepiaVoiceRecorder.onProcessorReady = () => {
    internalIsRecorderReady = true;
    if (internalOnReadyResolve) {
      internalOnReadyResolve();
    }
    console.log('SEPIA Voice Processor is ready.');
  };

  SepiaVoiceRecorder.onProcessorInitError = (err: any) => {
    console.error('[sepiaRecorder] Raw onProcessorInitError object:', err);
    if (err && typeof err === 'object') {
      // Attempt to log common error properties
      for (const key in err) {
        if (Object.prototype.hasOwnProperty.call(err, key)) {
          try {
            console.error(`[sepiaRecorder] Raw error detail - ${key}:`, err[key]);
          } catch (e) {
            console.error(`[sepiaRecorder] Raw error detail - ${key}: (could not stringify property)`);
          }
        }
      }
      if (err.name && err.message) {
        console.error(`[sepiaRecorder] Error name: ${err.name}, message: ${err.message}`);
      }
      if (err instanceof Event) {
        console.error('[sepiaRecorder] Error is an Event of type:', err.type);
      }
    }

    internalIsRecorderReady = false;
    if (internalOnReadyReject) {
      internalOnReadyReject(err);
    }
    if (activeErrorCallback) {
      activeErrorCallback(err);
    } else {
      // This fallback console.error might be redundant now but is harmless
      console.error('[sepiaRecorder] SEPIA Voice Processor initialization error (default console):', err);
    }
  };

  SepiaVoiceRecorder.onResamplerData = (data: { samples: Int16Array[]; rms: number }) => {
    if (activePcmDataCallback && data && data.samples && data.samples[0]) {
      activePcmDataCallback(data.samples[0]); // Pass only the PCM data as per useWalkie
    }
  };
  isSepiaInitialized = true;
}

export interface CreateRecorderOptions {
  targetSampleRate: number;
  mono: boolean;
  onError?: ErrorCallback;
  sepiaModulesPath?: string;
  audioConstraints?: MediaTrackConstraints; // Custom audio constraints for echo cancellation
}

export async function createRecorder(options: CreateRecorderOptions): Promise<RecorderHandle> {
  if (typeof SepiaFW === 'undefined' || typeof SepiaVoiceRecorder === 'undefined') {
    const err = new Error('SEPIA libraries (SepiaFW, SepiaVoiceRecorder) not found. Ensure they are loaded globally.');
    if (options.onError) options.onError(err);
    throw err;
  }

  initializeSepiaGlobalHandlers(); // Ensure global handlers are set up

  activeErrorCallback = options.onError || null;
  
  const sepiaModulesPath = options.sepiaModulesPath || '/sepia-modules/';
  SepiaFW.webAudio.defaultProcessorOptions.moduleFolder = sepiaModulesPath;

  // Reset ready state for this creation attempt if not already ready
  // This logic assumes one 'active' configuration of SEPIA recorder at a time.
  if (!internalIsRecorderReady || !internalOnReadyPromise) {
    internalIsRecorderReady = false;
    internalOnReadyPromise = new Promise<void>((resolve, reject) => {
      internalOnReadyResolve = resolve;
      internalOnReadyReject = reject;
    });
  }
  
  // Calculate bufferSize based on options.targetSampleRate
  const bufferSize = (options.targetSampleRate * CHUNK_DURATION_MS) / 1000;

  SepiaVoiceRecorder.create({
    targetSampleRate: options.targetSampleRate,
    mono: options.mono,
    processorOptions: {
      bufferSize: bufferSize, 
      calculateRmsVolume: true, // RMS might be useful for SEPIA internally or for debugging
    },
    // Pass custom audio constraints if provided
    ...(options.audioConstraints && { audioConstraints: options.audioConstraints }),
    // VAD settings might be needed here if SEPIA enables it by default
  });

  // Wait for the recorder to be ready if it's not already
  if (!internalIsRecorderReady && internalOnReadyPromise) {
    try {
      await internalOnReadyPromise;
    } catch (err) {
      // Error already handled by onProcessorInitError via activeErrorCallback
      throw err; // Re-throw to indicate creation failure
    }
  }
  if (!internalIsRecorderReady) {
    // Should not happen if await internalOnReadyPromise resolved without error
    throw new Error('SEPIA recorder did not become ready.');
  }

  return {
    start: async (onChunk: PcmChunkCallback): Promise<void> => {
      if (!internalIsRecorderReady) {
        // This check might be redundant if createRecorder ensures readiness
        const initError = new Error('Recorder not ready before start.');
        if (activeErrorCallback) activeErrorCallback(initError);
        throw initError;
      }
      activePcmDataCallback = onChunk; // Set the active callback for PCM data
      SepiaVoiceRecorder.start();
    },
    stop: async (): Promise<void> => {
      SepiaVoiceRecorder.stop();
      // No need to clear activePcmDataCallback here, start can overwrite it
    },
    close: (): void => {
      SepiaVoiceRecorder.stop(); // Ensure stopped
      activePcmDataCallback = null; // Clear callback
      activeErrorCallback = null; // Clear error callback

      // Reset module-level state to allow for re-initialization
      internalIsRecorderReady = false;
      internalOnReadyPromise = null;
      internalOnReadyResolve = null;
      internalOnReadyReject = null;
      isSepiaInitialized = false; // Allow global handlers to be re-assigned on next create

      // Attempt to call a release or destroy method on the SepiaVoiceRecorder global object
      if (typeof SepiaVoiceRecorder.release === 'function') {
        console.log('[sepiaRecorder] Attempting SepiaVoiceRecorder.release()...');
        try {
          SepiaVoiceRecorder.release();
          console.log('[sepiaRecorder] SepiaVoiceRecorder.release() called.');
        } catch (e) {
          console.error('[sepiaRecorder] Error calling SepiaVoiceRecorder.release():', e);
        }
      } else if (typeof SepiaVoiceRecorder.destroy === 'function') {
        console.log('[sepiaRecorder] Attempting SepiaVoiceRecorder.destroy()...');
        try {
          SepiaVoiceRecorder.destroy();
          console.log('[sepiaRecorder] SepiaVoiceRecorder.destroy() called.');
        } catch (e) {
          console.error('[sepiaRecorder] Error calling SepiaVoiceRecorder.destroy():', e);
        }
      } else {
        console.warn('[sepiaRecorder] Neither SepiaVoiceRecorder.release() nor .destroy() method found.');
      }

      console.log('RecorderHandle closed and internal state reset.');
    },
  };
}