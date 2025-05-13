declare module 'voice-module/index.js' {
  export const MODES: {
    PUSH_TO_TALK: 'push';
    VOICE_ACTIVATED: 'walkie';
  };

  export class VoiceModule {
    constructor(config: any);
    core: any;
    start(): Promise<void>;
    startRecording(): Promise<void>;
    stopRecording(): Promise<void>;
    toggleRecording(): Promise<boolean>;
    destroy(): Promise<void>;
    getState(): string;
    getTranscripts(): any[];
  }

  export default VoiceModule;
}

declare module 'voice-module/core/voice-core.js' {
  export class EventBus {
    on(event: string, callback: (data: any) => void): { off: () => void };
    off(event: string, callback: (data: any) => void): void;
    emit(event: string, data?: any): void;
  }

  export const bus: EventBus;
} 