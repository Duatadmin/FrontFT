// src/components/chat/voiceTickerConstants.ts
export const DASH_W = 4; // px, width of a black dash in the baseline
export const GAP_W = 4; // px, gap between black dashes in the baseline
export const BASELINE_H = 2; // px, thickness of the baseline

export const BAR_W = 4; // bar width
export const BAR_M = 2; // bar margin of a white animated bar
export const BAR_GAP = 2; // px, right margin of a white animated bar
export const MIN_H = 2; // px, minimum height of a white animated bar
export const MAX_H = 24; // px, maximum height of a white animated bar

export const ANIM_MS = 1300; // ms, duration of the slideX animation
export const AUDIO_SCALE = 6000; // divisor for normalizing RMS audio levels

// Calculated values
export const BAR_STEP_PX = BAR_W + BAR_GAP; // 6px, total space one white bar takes horizontally including its gap
export const BASELINE_STEP_PX = DASH_W + GAP_W; // 8px, total space one black dash + gap takes horizontally
