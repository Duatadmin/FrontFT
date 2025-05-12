import { VoiceModule, EVENTS, MODES } from '../../../voice-module/index.js';

let currentTargetId: string | null = null;
let isRecording = false;
let visualizationData: Uint8Array | null = null;

// Create the voice module with default push-to-talk mode
let voice = new VoiceModule({
  mode: MODES.PUSH_TO_TALK,
  serverUrl: 'wss://ftvoiceservice-production.up.railway.app/v1/asr/ws',
});

// Set up initial event listeners
setupEventListeners();

export function setTranscriptTarget(id: string) {
  currentTargetId = id;
}

export async function initVoiceModule() {
  try {
    await voice.start();
    console.log('Voice module initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize voice module:', error);
    return false;
  }
}

export function startRecording() {
  voice.startRecording();
  isRecording = true;
}

export function stopRecording() {
  voice.stopRecording();
  isRecording = false;
}

export function getIsRecording(): boolean {
  return isRecording;
}

export function getVisualizationData(): Uint8Array | null {
  return visualizationData;
}

// Since voice-module doesn't have a setMode method, we need to recreate the instance
export async function toggleMode(walkie: boolean) {
  // Stop and cleanup the current instance
  voice.destroy();
  
  // Create a new instance with the desired mode
  voice = new VoiceModule({
    mode: walkie ? MODES.VOICE_ACTIVATED : MODES.PUSH_TO_TALK,
    serverUrl: 'wss://ftvoiceservice-production.up.railway.app/v1/asr/ws',
  });
  
  // Initialize all event listeners
  setupEventListeners();
  
  // Start the new instance
  await voice.start();
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
