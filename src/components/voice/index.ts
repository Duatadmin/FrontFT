import { VoiceModule, EVENTS, MODES } from '../../../voice-module/index.js';

let currentTargetId: string | null = null;
let isRecording = false;
let visualizationData: Uint8Array | null = null;

// Create the voice module with default push-to-talk mode
let voice = new VoiceModule({
  mode: MODES.PUSH_TO_TALK,
  serverUrl: import.meta.env.VITE_ASR_WS_URL,
});

// Set up initial event listeners
setupEventListeners();

export function setTranscriptTarget(id: string) {
  currentTargetId = id;
}

export async function initVoiceModule(): Promise<boolean> {
  // We don't call voice.start() here anymore - initialization happens on user interaction
  // This just checks if we have microphone permissions
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
    // Now we can use the new setMode method which handles initialization
    await voice.setMode(walkie ? MODES.VOICE_ACTIVATED : MODES.PUSH_TO_TALK);
    
    // Ensure event listeners are properly set up
    setupEventListeners();
    
    return true;
  } catch (error) {
    console.error('Failed to toggle voice mode:', error);
    return false;
  }
}

// Sets up all event listeners for the voice module
function setupEventListeners() {
  voice.on(EVENTS.TRANSCRIPT_INTERIM, ({ text }) => {
    if (!currentTargetId) return;
    const el = document.getElementById(`${currentTargetId}-interim`);
    if (el) el.textContent = text;
  });

  voice.on(EVENTS.TRANSCRIPT_FINAL, ({ text }) => {
    if (!currentTargetId) return;
    const el = document.getElementById(`${currentTargetId}-final`);
    if (el) el.textContent = text;
    const interim = document.getElementById(`${currentTargetId}-interim`);
    if (interim) interim.textContent = '';
  });

  voice.on(EVENTS.RECORDING_STARTED, () => {
    isRecording = true;
  });

  voice.on(EVENTS.RECORDING_STOPPED, () => {
    isRecording = false;
  });

  // Optional: subscribe to audio data if the module exposes it
  voice.on(EVENTS.AUDIO_DATA, (data) => {
    visualizationData = data.visualizationArray || null;
  });
}

export { default as VoiceButton } from './VoiceButton';
export { default as WalkieToggleButton } from './WalkieToggleButton';
export { default as AudioVisualizer } from './AudioVisualizer';

export default voice;
