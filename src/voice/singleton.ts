// TODO(legacy-voice): VoiceModule is deprecated. Remove or replace.
// import VoiceModule, { MODES } from 'voice-module/index.js';
// import { bus } from 'voice-module/core/voice-core.js';

// TODO(legacy-voice): VoiceModule is deprecated. Remove or replace.
// // Define a type for our VoiceModule instance
// type VoiceModuleType = {
//   start: () => Promise<void>;
//   startRecording: () => Promise<void>;
//   stopRecording: () => Promise<void>;
//   toggleRecording: () => Promise<boolean>;
//   destroy: () => Promise<void>;
//   getState: () => string;
//   getTranscripts: () => any[];
//   isRecording?: () => boolean; // Optional method that might be missing in some versions
// };

// TODO(legacy-voice): VoiceModule is deprecated. Remove or replace.
// let instance: VoiceModule | null = null;
let instance: any = null; // Keep 'instance' for structure, but it won't be a VoiceModule

// Create a new instance if needed
function createInstanceIfNeeded(): any { // Changed VoiceModule to any
  // TODO(legacy-voice): VoiceModule is deprecated. Remove or replace.
  throw new Error('VoiceModule is deprecated and has been removed. This functionality needs to be reimplemented.');
  // if (!instance) {
  //   // Create a new instance
  //   instance = new VoiceModule({ 
  //     mode: MODES.PUSH_TO_TALK,
  //     debug: true,
  //     serverUrl: import.meta.env.VITE_ASR_WS_URL,
  //   });
    
  //   // 💉 Hot-patch for isRecording() method
  //   const moduleInstance = instance as any;
  //   if (typeof moduleInstance.isRecording !== 'function') {
  //     console.warn('[Voice] 🩹 Applying patch for missing isRecording() method');
  //     moduleInstance.isRecording = function() {
  //       return this.getState() === 'recording';
  //     };
  //   }
    
  //   console.log(`[Voice] ✅ Created instance`);
  //   void instance.start();  // pre-loads AudioContext and WS
  // }
  // return instance;
}

// Safe wrapper for getting the module instance
export function getVoiceModule(): any { // Changed VoiceModule to any
  // TODO(legacy-voice): VoiceModule is deprecated. Remove or replace.
  throw new Error('VoiceModule is deprecated and has been removed. This functionality needs to be reimplemented.');
  // return createInstanceIfNeeded();
}

// Safe wrapper methods for common operations
export async function startVoiceRecording(): Promise<void> {
  // TODO(legacy-voice): VoiceModule is deprecated. Remove or replace.
  throw new Error('VoiceModule is deprecated and has been removed. This functionality needs to be reimplemented.');
  // const voice = createInstanceIfNeeded();
  // return voice.startRecording();
}

export async function stopVoiceRecording(): Promise<void> {
  // TODO(legacy-voice): VoiceModule is deprecated. Remove or replace.
  throw new Error('VoiceModule is deprecated and has been removed. This functionality needs to be reimplemented.');
  // const voice = createInstanceIfNeeded();
  // return voice.stopRecording();
}

export async function toggleVoiceRecording(): Promise<boolean> {
  // TODO(legacy-voice): VoiceModule is deprecated. Remove or replace.
  throw new Error('VoiceModule is deprecated and has been removed. This functionality needs to be reimplemented.');
  // const voice = createInstanceIfNeeded();
  // return voice.toggleRecording();
}

export function destroyVoiceModule(): void {
  // TODO(legacy-voice): VoiceModule is deprecated. Remove or replace.
  throw new Error('VoiceModule is deprecated and has been removed. This functionality needs to be reimplemented.');
  // if (instance) {
  //   console.log(`[Voice] ❌ Destroying instance`);
  //   void instance.destroy();
  //   instance = null;
  // }
}

export function onVoiceState(cb: (state: string) => void): void {
  // TODO(legacy-voice): VoiceModule is deprecated. Remove or replace.
  console.warn('VoiceModule.onVoiceState is deprecated. Event bus no longer available.');
  // bus.on('state', cb);  // use to sync UI
} 