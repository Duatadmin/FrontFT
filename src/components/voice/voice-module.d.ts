// Type declarations for voice-module
declare module '../../../voice-module/index.js' {
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
    destroy(): Promise<void>;
    
    // Private methods
    _log(...args: any[]): void;
  }
}
