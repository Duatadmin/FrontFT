/// <reference types="vite/client" />

import { bus } from 'voice-module/core/voice-core.js';
import {
  getVoiceModule,
} from '../../voice/singleton';

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

export async function initVoiceModule(): Promise<boolean> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Browser does not support getUserMedia');
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());

    const voice = getVoiceModule();
    await voice.start();
    return true;
  } catch (error) {
    console.error('Microphone permission denied or initialization failed:', error);
    return false;
  }
}

export function getIsRecording(): boolean {
  const voice = getVoiceModule();
  if (typeof (voice as any).isRecording === 'function') {
    return (voice as any).isRecording();
  }
  return voice.getState() === 'recording';
}

export function getVisualizationData(): Uint8Array | null {
  return null;
}

export { default as VoiceButton } from './VoiceButton';
export { default as WalkieToggleButton } from './WalkieToggleButton';
export { default as AudioVisualizer } from './AudioVisualizer';
