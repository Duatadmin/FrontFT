// Type declarations for voice-module
declare module 'voice-module/index.js' {
  export const MODES: {
    PUSH_TO_TALK: string;
    VOICE_ACTIVATED: string;
  };

  // Transcript data interface
  interface TranscriptData {
    transcript?: string;
    is_final?: boolean;
    confidence?: number;
    [key: string]: any;
  }

  export class VoiceModule {
    // Make config accessible for compatibility
    config: {
      mode: string;
      serverUrl: string;
      audio: {
        sampleRate: number;
        frameSize: number;
      };
      onTranscript?: (data: TranscriptData) => void;
      onStateChange?: (state: string, error?: Error) => void;
      debug: boolean;
    };
    core: any;

    constructor(config?: {
      mode?: string;
      serverUrl?: string;
      audio?: {
        sampleRate?: number;
        frameSize?: number;
      };
      onTranscript?: (data: TranscriptData) => void;
      onStateChange?: (state: string, error?: Error) => void;
      debug?: boolean;
    });

    // Core methods
    start(): Promise<void>;
    isInitialized(): boolean;
    connectWebSocket(): Promise<void>;
    startRecording(): Promise<void>;
    stopRecording(): Promise<void>;
    toggleRecording(): Promise<boolean>;
    stop(): Promise<void>;
    setMode(mode: 'push' | 'walkie'): void;
    destroy(): Promise<void>;
    getState(): string;
    getTranscripts(): any[];
    isRecording?(): boolean;
    
    // Private methods
    _log(...args: any[]): void;
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
