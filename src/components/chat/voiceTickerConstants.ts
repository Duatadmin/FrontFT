// src/components/chat/voiceTickerConstants.ts
export const BAR_W = 4; // px, width of a dynamic bar
export const BAR_M = 2; // px, right margin of a dynamic bar (for BAR_STEP_PX calculation)
export const MIN_H = 2; // px, minimum height of a dynamic bar
export const MAX_H = 24; // px, maximum height of a dynamic bar

export const BASELINE_H = 2; // px, thickness of the baseline (used for visual, not step calc)
export const DASH_W = 4; // px, width of a baseline dash element
export const GAP_W = 4; // px, gap after a baseline dash element

export const BASELINE_STEP_PX = DASH_W + GAP_W; // 8px, total space one baseline dash-gap unit takes
export const BAR_STEP_PX = BAR_W + BAR_M; // 6px, total space one dynamic bar takes horizontally including its margin

export const SCROLL_SPEED_PX_SEC = 30; // px/s, speed of the scrolling animation
export const AUDIO_SCALE = 6000; // divisor for normalizing RMS audio levels (higher means less sensitive)

/**
 * Calculates the animation duration in milliseconds for a full scroll cycle.
 * The animation needs to cover the container width plus one step of the baseline
 * to ensure seamless looping/replacement of elements appearing from the left.
 * @param containerWidth The width of the VoiceTicker container in pixels.
 * @returns The animation duration in milliseconds.
 */
export const calcAnimMs = (containerWidth: number): number => {
  return ((containerWidth + BASELINE_STEP_PX) / SCROLL_SPEED_PX_SEC) * 1000;
};

