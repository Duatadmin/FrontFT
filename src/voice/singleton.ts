import VoiceModule, { MODES } from 'voice-module/index.js';
import { bus } from 'voice-module/core/voice-core.js';

// Define a type for our VoiceModule instance
type VoiceModuleType = {
  start: () => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  toggleRecording: () => Promise<boolean>;
  destroy: () => Promise<void>;
  getState: () => string;
  getTranscripts: () => any[];
};

let instance: VoiceModule | null = null;

export function getVoiceModule(): VoiceModule {
  if (!instance) {
    // Create a new instance
    instance = new VoiceModule({ 
      mode: MODES.PUSH_TO_TALK,
      debug: true,
      serverUrl: import.meta.env.VITE_ASR_WS_URL,
    });
    
    console.log(`[Voice] ✅ Created instance`);
    void instance.start();  // pre-loads AudioContext and WS
  }
  return instance;
}

export function destroyVoiceModule(): void {
  if (instance) {
    console.log(`[Voice] ❌ Destroying instance`);
    void instance.destroy();
    instance = null;
  }
}

export function onVoiceState(cb: (state: string) => void): void {
  bus.on('state', cb);  // use to sync UI
} 