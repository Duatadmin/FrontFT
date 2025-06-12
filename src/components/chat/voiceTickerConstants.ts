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

export const AUDIO_SCALE_FACTOR = 6000; // Divisor for normalizing RMS audio levels (higher means less sensitive)

/**
 * Maps an RMS audio level to a dash height.
 * @param rms Raw RMS value from the audio source.
 * @returns The calculated height for the dash, clamped between MIN_DASH_H and MAX_DASH_H.
 */
export const mapRmsToHeight = (rms: number): number => {
  const normalizedRms = Math.min(1, Math.max(0, rms / AUDIO_SCALE_FACTOR));
  const height = MIN_DASH_H + normalizedRms * (MAX_DASH_H - MIN_DASH_H);
  return Math.round(height); // Return an integer pixel value
};

/**
 * Calculates the animation duration in milliseconds required to scroll
 * one dash step at a given speed.
 * @returns The animation duration in milliseconds.
 */
export const calcAnimMs = (): number =>
  (DASH_STEP_PX / SCROLL_SPEED_PX_SEC) * 1000;

