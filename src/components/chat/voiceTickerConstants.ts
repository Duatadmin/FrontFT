// src/components/chat/voiceTickerConstants.ts

export const DASH_W = 2; // px, width of a dash element
export const DASH_GAP = 2; // Gap between dashes in pixels.
export const DASH_STEP_PX = DASH_W + DASH_GAP; // Total space one dash element takes (4px)

export const MIN_DASH_H = 2; // px, minimum height of a dash
export const MAX_DASH_H = 24; // px, maximum height of a dash

export const SCROLL_SPEED_PX_SEC = 45; // px/s, speed of the scrolling animation

/** The color for dashes created on initial mount. */
export const INITIAL_DASH_COLOR = '#2e2f28';

/** The color for all new dashes created after the initial mount. */
export const NEW_DASH_COLOR = '#97a83b';

const MIN_DB = -60;       // The quietest sound we want to visualize
const MAX_DB = -14;       // The loudest sound, corresponding to a peak RMS of ~0.06

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
  const db = rmsToDb(rms);
  // Clamp the dB value to our desired visual range
  const clampedDb = Math.min(MAX_DB, Math.max(MIN_DB, db));
  // Normalize the clamped value to a 0-1 range
  const t = (clampedDb - MIN_DB) / (MAX_DB - MIN_DB);
  // Map the normalized value to our pixel height range
  return Math.round(MIN_DASH_H + t * (MAX_DASH_H - MIN_DASH_H));
};

/**
 * Calculates the animation duration in milliseconds required to scroll
 * one dash step at a given speed.
 * @returns The animation duration in milliseconds.
 */
export const calcAnimMs = (): number =>
  (DASH_STEP_PX / SCROLL_SPEED_PX_SEC) * 1000;

