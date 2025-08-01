/// <reference types="vite/client" />

// TODO(legacy-voice): VoiceModule is deprecated. Remove or replace.
// import { VoiceModule, MODES } from 'voice-module/index.js';

let currentTargetId: string | null = null;
let isRecording = false;
let visualizationData: Uint8Array | null = null;

// TODO(legacy-voice): VoiceModule is deprecated. Remove or replace.
// // Create the voice module with default push-to-talk mode
// let voice = new VoiceModule({
//   mode: MODES.PUSH_TO_TALK,
//   serverUrl: import.meta.env.VITE_ASR_WS_URL,
//   onTranscript: (data) => {
//     if (!currentTargetId) return;
    
//     // Check for 'is_final' or 'isFinal' property to handle different formats
//     if (data.is_final || data.isFinal) {
//       // Final transcript
//       const el = document.getElementById(`${currentTargetId}-final`);
//       if (el) el.textContent = data.transcript || '';
      
//       const interim = document.getElementById(`${currentTargetId}-interim`);
//       if (interim) interim.textContent = '';
//     } else {
//       // Interim transcript
//       const el = document.getElementById(`${currentTargetId}-interim`);
//       if (el) el.textContent = data.transcript || '';
//     }
//   },
//   onStateChange: (state, error) => {
//     if (state === 'recording') {
//       isRecording = true;
//     } else if (state === 'idle') {
//       isRecording = false;
//     }
    
//     if (error) {
//       console.error('Voice module error:', error);
//     }
//   },
//   debug: true
// });
let voice: any = null; // Placeholder for the deprecated module

export function setTranscriptTarget(id: string) {
  // TODO(legacy-voice): VoiceModule is deprecated. Remove or replace.
  console.warn('VoiceModule.setTranscriptTarget is deprecated.');
  currentTargetId = id;
}

export async function initVoiceModule(): Promise<boolean> {
  // TODO(legacy-voice): VoiceModule is deprecated. Remove or replace.
  console.error('VoiceModule.initVoiceModule is deprecated. Functionality removed.');
  return false;
  // try {
  //   // Check if browser supports getUserMedia
  //   if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  //     throw new Error('Browser does not support getUserMedia');
  //   }
    
  //   // Just test if we can access the microphone
  //   const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  //   // Immediately stop all tracks since we're just checking permissions
  //   stream.getTracks().forEach(track => track.stop());
    
  //   console.log('Microphone permission granted');
    
  //   // Pre-initialize the worklet and WebSocket
  //   await voice.start();
  //   console.log('Voice module initialized');
    
  //   return true;
  // } catch (error) {
  //   console.error('Microphone permission denied or initialization failed:', error);
  //   return false;
  // }
}

export async function startRecording() {
  // TODO(legacy-voice): VoiceModule is deprecated. Remove or replace.
  console.error('VoiceModule.startRecording is deprecated. Functionality removed.');
  isRecording = false;
  // try {
  //   console.log('[Voice] Starting recording...');
  //   await voice.startRecording(); // This will now handle lazy initialization
  //   isRecording = true;
  //   console.log('[Voice] Recording started successfully');
  // } catch (error) {
  //   console.error('[Voice] Failed to start recording:', error);
  //   isRecording = false;
  // }
}

export async function stopRecording() {
  // TODO(legacy-voice): VoiceModule is deprecated. Remove or replace.
  console.error('VoiceModule.stopRecording is deprecated. Functionality removed.');
  isRecording = false;
  // try {
  //   console.log('[Voice] Stopping recording...');
  //   await voice.stopRecording();
  //   isRecording = false;
  //   console.log('[Voice] Recording stopped successfully');
  // } catch (error) {
  //   console.error('[Voice] Failed to stop recording:', error);
  // }
}

export function getIsRecording(): boolean {
  // TODO(legacy-voice): VoiceModule is deprecated. Remove or replace.
  return false;
  // return isRecording;
}

export function getVisualizationData(): Uint8Array | null {
  // TODO(legacy-voice): VoiceModule is deprecated. Remove or replace.
  return null;
  // return visualizationData;
}

export async function toggleMode(walkie: boolean) {
  // TODO(legacy-voice): VoiceModule is deprecated. Remove or replace.
  console.error('VoiceModule.toggleMode is deprecated. Functionality removed.');
  return false;
  // try {
  //   console.log(`[Voice] Toggling mode to ${walkie ? 'walkie-talkie' : 'push-to-talk'}...`);
    
  //   // Re-create the voice module with the new mode since setMode was removed
  //   const mode = walkie ? MODES.VOICE_ACTIVATED : MODES.PUSH_TO_TALK;
    
  //   // Stop any existing recording
  //   if (isRecording) {
  //     console.log('[Voice] Stopping existing recording before mode change');
  //     await voice.stopRecording();
  //     isRecording = false;
  //   }
    
  //   // Clean up old instance
  //   console.log('[Voice] Destroying old instance');
  //   await voice.destroy();
    
  //   // Create new instance with desired mode
  //   console.log('[Voice] Creating new instance with updated mode');
  //   voice = new VoiceModule({
  //     mode,
  //     serverUrl: import.meta.env.VITE_ASR_WS_URL,
  //     onTranscript: (data) => {
  //       if (!currentTargetId) return;
        
  //       if (data.is_final) {
  //         // Final transcript
  //         const el = document.getElementById(`${currentTargetId}-final`);
  //         if (el) el.textContent = data.transcript || '';
          
  //         const interim = document.getElementById(`${currentTargetId}-interim`);
  //         if (interim) interim.textContent = '';
  //       } else {
  //         // Interim transcript
  //         const el = document.getElementById(`${currentTargetId}-interim`);
  //         if (el) el.textContent = data.transcript || '';
  //       }
  //     },
  //     onStateChange: (state, error) => {
  //       if (state === 'recording') {
  //         isRecording = true;
  //         console.log('[Voice] State changed to recording');
  //       } else if (state === 'idle') {
  //         isRecording = false;
  //         console.log('[Voice] State changed to idle');
  //       }
        
  //       if (error) {
  //         console.error('[Voice] State change error:', error);
  //       }
  //     },
  //     debug: true
  //   });
    
  //   return true;
  // } catch (error) {
  //   console.error('Failed to toggle voice mode:', error);
  //   return false;
  // }
}

export { default as VoiceButton } from './VoiceButton';
export { default as WalkieToggleButton } from './WalkieToggleButton';
