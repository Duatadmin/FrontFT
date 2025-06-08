/**
 * Voice Module Configuration Constants
 */

// Helper function to safely get environment variables
function getEnvVariable(viteName, denoName) {
  // Check for Deno environment first
  // @ts-ignore
  if (typeof Deno !== 'undefined' && Deno.env && typeof Deno.env.get === 'function') {
    // @ts-ignore
    return Deno.env.get(denoName || viteName); // Use denoName if provided, else fallback to viteName
  }
  // Check for Vite environment (import.meta.env)
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env[viteName];
  }
  return undefined; // Or null, or a default string like ''
}

// WebSocket endpoints
export const WEBSOCKET = {
  // Main WebSocket endpoint for ASR (Automatic Speech Recognition)
  ASR_ENDPOINT: getEnvVariable('VITE_ASR_WS_URL', 'ASR_WS_URL'), // Suggests ASR_WS_URL for Deno env
  
  // Test endpoint for connection debugging (echoes back messages)
  TEST_ENDPOINT: getEnvVariable('VITE_ASR_WS_URL', 'ASR_WS_URL'), // Same here
};

// Audio configuration
export const AUDIO = {
  // Preferred sample rate for optimal ASR performance
  SAMPLE_RATE: 16000,
  
  // Number of audio channels (mono)
  CHANNELS: 1,
  
  // Recommended frame size for audio processing
  FRAME_SIZE: 1024,
  
  // Audio processing buffer size for walkie-talkie mode voice activation
  ANALYSIS_BUFFER_SIZE: 2048,
};

// Voice detection thresholds for walkie-talkie mode
export const VOICE_DETECTION = {
  // Root Mean Square (RMS) amplitude threshold for voice activation
  RMS_THRESHOLD: 0.01,
  
  // Minimum duration (ms) of audio above threshold to trigger activation
  ACTIVATION_DURATION: 300,
  
  // Time (ms) to keep streaming after voice drops below threshold
  HOLD_DURATION: 1500,
};

// Module operational modes
export const MODES = {
  PUSH_TO_TALK: 'push',
  VOICE_ACTIVATED: 'walkie',
};

// Default configuration
export const DEFAULTS = {
  mode: MODES.PUSH_TO_TALK,
  websocketUrl: WEBSOCKET.ASR_ENDPOINT,
  sampleRate: AUDIO.SAMPLE_RATE,
  frameSize: AUDIO.FRAME_SIZE,
  debug: false,
};
