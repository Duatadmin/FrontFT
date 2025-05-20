/// <reference types="vite/client" />

import { bus } from 'voice-module/core/voice-core.js';
// Re-export voice utilities from the singleton to avoid accidental
// instantiation of additional VoiceModule instances
export * from '../../voice/singleton';

let currentTargetId: string | null = null;

// Listen for transcript events and update DOM targets
bus.on('transcript:interim', (text) => {
  if (!currentTargetId) return;
  const el = document.getElementById(`${currentTargetId}-interim`);
  if (el) el.textContent = text || '';
});

bus.on('transcript:final', (data) => {
  if (!currentTargetId) return;
  const finalEl = document.getElementById(`${currentTargetId}-final`);
  if (finalEl) finalEl.textContent = data.text || '';
  const interimEl = document.getElementById(`${currentTargetId}-interim`);
  if (interimEl) interimEl.textContent = '';
});

export function setTranscriptTarget(id: string) {
  currentTargetId = id;
}


export { default as VoiceButton } from './VoiceButton';
export { default as WalkieToggleButton } from './WalkieToggleButton';
export { default as AudioVisualizer } from './AudioVisualizer';
