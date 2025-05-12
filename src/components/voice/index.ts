import { VoiceModule, MODES } from '../../../voice-module/index.js';

let currentTargetId: string | null = null;
let isRecording = false;
let visualizationData: Uint8Array | null = null;

// Create the voice module with default push-to-talk mode
let voice = new VoiceModule({
  mode: MODES.PUSH_TO_TALK,
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
    await voice.startRecording(); // This will now handle lazy initialization
    isRecording = true;
  } catch (error) {
    console.error('Failed to start recording:', error);
    isRecording = false;
  }
}

export async function stopRecording() {
  try {
    await voice.stopRecording();
    isRecording = false;
  } catch (error) {
    console.error('Failed to stop recording:', error);
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
    // Re-create the voice module with the new mode since setMode was removed
    const mode = walkie ? MODES.VOICE_ACTIVATED : MODES.PUSH_TO_TALK;
    
    // Stop any existing recording
    if (isRecording) {
      await voice.stopRecording();
      isRecording = false;
    }
    
    // Clean up old instance
    await voice.destroy();
    
    // Create new instance with desired mode
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
        } else if (state === 'idle') {
          isRecording = false;
        }
        
        if (error) {
          console.error('Voice module error:', error);
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
