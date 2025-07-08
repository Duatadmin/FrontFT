// src/lib/audioConstraints.ts

export interface AudioConstraintsConfig {
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
  sampleRate?: number;
}

/**
 * Get optimized audio constraints for ASR with echo cancellation
 * These settings help prevent the microphone from picking up TTS output
 */
export function getASRAudioConstraints(config: AudioConstraintsConfig = {}): MediaStreamConstraints {
  const {
    echoCancellation = true,  // Critical for preventing TTS feedback
    noiseSuppression = true,  // Helps with background noise
    autoGainControl = true,   // Normalizes audio levels
    sampleRate = 16000       // Standard ASR sample rate
  } = config;

  return {
    audio: {
      echoCancellation: {
        ideal: echoCancellation,
        exact: undefined  // Don't fail if not supported
      },
      noiseSuppression: {
        ideal: noiseSuppression,
        exact: undefined
      },
      autoGainControl: {
        ideal: autoGainControl,
        exact: undefined
      },
      sampleRate: {
        ideal: sampleRate,
        exact: undefined
      },
      // Additional constraints for better quality
      channelCount: {
        ideal: 1,  // Mono is sufficient for ASR
        exact: undefined
      },
      // Disable any audio processing that might interfere
      googEchoCancellation: echoCancellation,
      googNoiseSuppression: noiseSuppression,
      googAutoGainControl: autoGainControl,
      googHighpassFilter: true,
      // Browser-specific echo cancellation modes
      ...(echoCancellation && {
        echoCancellationType: 'browser',  // Let browser choose best method
        googEchoCancellation2: true,       // Chrome's advanced echo cancellation
      })
    } as MediaTrackConstraints
  };
}

/**
 * Check if echo cancellation is supported and working
 */
export async function checkEchoCancellationSupport(): Promise<boolean> {
  try {
    const constraints = getASRAudioConstraints({ echoCancellation: true });
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    const tracks = stream.getAudioTracks();
    if (tracks.length > 0) {
      const settings = tracks[0].getSettings();
      const capabilities = tracks[0].getCapabilities ? tracks[0].getCapabilities() : null;
      
      // Clean up
      tracks.forEach(track => track.stop());
      
      // Check if echo cancellation is actually enabled
      const echoEnabled = settings.echoCancellation === true;
      const echoSupported = capabilities?.echoCancellation !== undefined;
      
      console.log('[AudioConstraints] Echo cancellation check:', {
        supported: echoSupported,
        enabled: echoEnabled,
        settings,
        capabilities
      });
      
      return echoEnabled;
    }
    
    return false;
  } catch (error) {
    console.error('[AudioConstraints] Error checking echo cancellation support:', error);
    return false;
  }
}