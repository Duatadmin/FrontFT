/// <reference types="vite/client" />

import { VoiceModule, MODES } from 'voice-module/index.js';

let currentTargetId: string | null = null;
let isRecording = false;
let visualizationData: Uint8Array | null = null;

// Create the voice module with default push-to-talk mode
let voice = new VoiceModule({
  mode: MODES.PUSH_TO_TALK,
  serverUrl: import.meta.env.VITE_ASR_WS_URL,
  onTranscript: (data) => {
    if (!currentTargetId) return;
    
    // Check for 'is_final' or 'isFinal' property to handle different formats
    if (data.is_final || data.isFinal) {
      // Final transcript
      const el = document.getElementById(`${currentTargetId}-final`);
      if (el) el.textContent = data.transcript || '';
      
      const interim = document.getElementById(`${currentTargetId}-interim`);
      if (interim) interim.textContent = '';
    } else {
      // Interim transcript
      const el = document.getElementById(`${currentTargetId}-interim`);
      if (el) el.textContent = data.transcript || '';
    }
  },
  onStateChange: (state, error) => {
    if (state === 'recording') {
      isRecording = true;
    } else if (state === 'idle') {
      isRecording = false;
    }
    
    if (error) {
      console.error('Voice module error:', error);
    }
  },
  debug: true
});

export function setTranscriptTarget(id: string) {
  currentTargetId = id;
}

export async function initVoiceModule(): Promise<boolean> {
  // We don't call voice.start() here anymore - initialization happens on user interaction
  try {
    // Check if browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Browser does not support getUserMedia');
    }
    
    // Just test if we can access the microphone, but don't start anything
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Immediately stop all tracks since we're just checking permissions
    stream.getTracks().forEach(track => track.stop());
    
    console.log('Microphone permission granted');
    return true;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    return false;
  }
}

export async function startRecording() {
  try {
    console.log('[Voice] Starting recording...');
    await voice.startRecording(); // This will now handle lazy initialization
    isRecording = true;
    console.log('[Voice] Recording started successfully');
  } catch (error) {
    console.error('[Voice] Failed to start recording:', error);
    isRecording = false;
  }
}

export async function stopRecording() {
  try {
    console.log('[Voice] Stopping recording...');
    await voice.stopRecording();
    isRecording = false;
    console.log('[Voice] Recording stopped successfully');
  } catch (error) {
    console.error('[Voice] Failed to stop recording:', error);
  }
}

export function getIsRecording(): boolean {
  return isRecording;
}

export function getVisualizationData(): Uint8Array | null {
  return visualizationData;
}

export async function toggleMode(walkie: boolean) {
  try {
    console.log(`[Voice] Toggling mode to ${walkie ? 'walkie-talkie' : 'push-to-talk'}...`);
    
    // Re-create the voice module with the new mode since setMode was removed
    const mode = walkie ? MODES.VOICE_ACTIVATED : MODES.PUSH_TO_TALK;
    
    // Stop any existing recording
    if (isRecording) {
      console.log('[Voice] Stopping existing recording before mode change');
      await voice.stopRecording();
      isRecording = false;
    }
    
    // Clean up old instance
    console.log('[Voice] Destroying old instance');
    await voice.destroy();
    
    // Create new instance with desired mode
    console.log('[Voice] Creating new instance with updated mode');
    voice = new VoiceModule({
      mode,
      serverUrl: import.meta.env.VITE_ASR_WS_URL,
      onTranscript: (data) => {
        if (!currentTargetId) return;
        
        if (data.is_final) {
          // Final transcript
          const el = document.getElementById(`${currentTargetId}-final`);
          if (el) el.textContent = data.transcript || '';
          
          const interim = document.getElementById(`${currentTargetId}-interim`);
          if (interim) interim.textContent = '';
        } else {
          // Interim transcript
          const el = document.getElementById(`${currentTargetId}-interim`);
          if (el) el.textContent = data.transcript || '';
        }
      },
      onStateChange: (state, error) => {
        if (state === 'recording') {
          isRecording = true;
          console.log('[Voice] State changed to recording');
        } else if (state === 'idle') {
          isRecording = false;
          console.log('[Voice] State changed to idle');
        }
        
        if (error) {
          console.error('[Voice] State change error:', error);
        }
      },
      debug: true
    });
    
    return true;
  } catch (error) {
    console.error('Failed to toggle voice mode:', error);
    return false;
  }
}

export { default as VoiceButton } from './VoiceButton';
export { default as WalkieToggleButton } from './WalkieToggleButton';
export { default as AudioVisualizer } from './AudioVisualizer';
