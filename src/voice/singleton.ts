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
  isRecording?: () => boolean; // Optional method that might be missing in some versions
};

let instance: VoiceModule | null = null;

// Create a new instance if needed
function createInstanceIfNeeded(): VoiceModule {
  if (!instance) {
    // Create a new instance
    instance = new VoiceModule({ 
      mode: MODES.PUSH_TO_TALK,
      debug: true,
      serverUrl: import.meta.env.VITE_ASR_WS_URL,
    });
    
    // 💉 Hot-patch for isRecording() method
    const moduleInstance = instance as any;
    if (typeof moduleInstance.isRecording !== 'function') {
      console.warn('[Voice] 🩹 Applying patch for missing isRecording() method');
      moduleInstance.isRecording = function() {
        return this.getState() === 'recording';
      };
    }
    
    console.log(`[Voice] ✅ Created instance`);
  }
  return instance;
}

// Safe wrapper for getting the module instance
export function getVoiceModule(): VoiceModule {
  return createInstanceIfNeeded();
}

// Safe wrapper methods for common operations
export async function startVoiceRecording(): Promise<void> {
  const voice = createInstanceIfNeeded();
  await voice.start();
  return voice.startRecording();
}

export async function stopVoiceRecording(): Promise<void> {
  const voice = createInstanceIfNeeded();
  return voice.stopRecording();
}

export async function toggleVoiceRecording(): Promise<boolean> {
  const voice = createInstanceIfNeeded();
  await voice.start();
  return voice.toggleRecording();
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