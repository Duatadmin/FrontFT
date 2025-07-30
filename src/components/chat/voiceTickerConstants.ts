// src/components/chat/voiceTickerConstants.ts

export const DASH_W = 2; // px, width of a dash element
export const DASH_GAP = 2; // Gap between dashes in pixels.
export const DASH_STEP_PX = DASH_W + DASH_GAP; // Total space one dash element takes (4px)

export const MIN_DASH_H = 3; // px, minimum height of a dash (smaller for more range)
export const MAX_DASH_H = 40; // px, maximum height of a dash (much taller for dramatic effect)

export const SCROLL_SPEED_PX_SEC = 60; // px/s, speed of the scrolling animation (faster)

/** The color for dashes created on initial mount. */
export const INITIAL_DASH_COLOR = 'rgba(255, 255, 255, 0.1)'; // Very subtle white

/** The color for all new dashes created after the initial mount. */
export const NEW_DASH_COLOR = '#00ff88'; // Bright green

const MIN_DB = -40;       // More sensitive to quiet sounds
const MAX_DB = -5;        // Allow louder peaks for more dynamic range
const NOISE_FLOOR_DB = -38; // Lower noise floor for more sensitivity

/**
 * Converts a raw RMS value to its dBFS equivalent.
 * Clamps the input to a minimum value to avoid -Infinity from log10(0).
 */
const rmsToDb = (rms: number): number => {
  // Use a very small number to prevent log10(0)
  return 20 * Math.log10(Math.max(rms, 1e-8)); 
};

/**
 * Maps a raw RMS audio level to a dash height using a logarithmic dBFS scale.
 * @param rms Raw RMS value from the audio source.
 * @returns The calculated height for the dash, clamped between MIN_DASH_H and MAX_DASH_H.
 */
export const mapRmsToHeight = (rms: number): number => {
  // Typical RMS values:
  // - Silence/noise floor: 0.0001 - 0.001
  // - Background noise: 0.001 - 0.005
  // - Quiet speech: 0.005 - 0.02
  // - Normal speech: 0.02 - 0.1
  // - Loud speech: 0.1 - 0.3
  
  // Define thresholds (adjusted for more sensitivity)
  const NOISE_FLOOR = 0.003; // Below this is background noise
  const SPEECH_START = 0.006; // Clear speech starts here (lowered)
  const NORMAL_SPEECH = 0.025; // Comfortable speaking level (much lower)
  const LOUD_SPEECH = 0.08; // Loud but not shouting (much lower)
  
  // If below noise floor, return minimum height
  if (rms < NOISE_FLOOR) {
    return MIN_DASH_H;
  }
  
  // Map RMS to a 0-1 range based on speech levels
  let normalized = 0;
  
  if (rms < SPEECH_START) {
    // Background noise to quiet speech (0 to 0.15 range)
    normalized = ((rms - NOISE_FLOOR) / (SPEECH_START - NOISE_FLOOR)) * 0.15;
  } else if (rms < NORMAL_SPEECH) {
    // Quiet to normal speech (0.15 to 0.85 range) - most speech should hit this range
    normalized = 0.15 + ((rms - SPEECH_START) / (NORMAL_SPEECH - SPEECH_START)) * 0.7;
  } else {
    // Normal to loud speech (0.85 to 1.0 range)
    normalized = 0.85 + ((rms - NORMAL_SPEECH) / (LOUD_SPEECH - NORMAL_SPEECH)) * 0.15;
    normalized = Math.min(1, normalized); // Cap at 1
  }
  
  // Apply a very slight curve for more natural response (closer to linear)
  const curved = Math.pow(normalized, 0.9);
  
  // Add very subtle variation for organic feel (±1px)
  const variation = (Math.random() - 0.5) * 2;
  
  // Map to pixel height
  const height = MIN_DASH_H + curved * (MAX_DASH_H - MIN_DASH_H) + variation;
  
  return Math.round(Math.max(MIN_DASH_H, Math.min(MAX_DASH_H, height)));
};

/**
 * Calculates the animation duration in milliseconds required to scroll
 * one dash step at a given speed.
 * @returns The animation duration in milliseconds.
 */
export const calcAnimMs = (): number =>
  (DASH_STEP_PX / SCROLL_SPEED_PX_SEC) * 1000;

