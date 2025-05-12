// Type declarations for voice-module
declare module '../../../voice-module/index.js' {
  export class VoiceModule {
    constructor(config?: {
      mode?: string;
      serverUrl?: string;
      audio?: {
        sampleRate?: number;
        frameSize?: number;
      };
      voice?: {
        threshold?: number;
        holdDuration?: number;
      };
      onTranscript?: (transcript: any) => void;
      onStateChange?: (newState: string, error?: Error) => void;
      debug?: boolean;
    });

    start(): Promise<void>;
    stop(): void;
    destroy(): void;
    startRecording(): void;
    stopRecording(): void;
    toggleRecording(): boolean;
    on(event: string, callback: (data: any) => void): () => void;
    getState(): any;
    getLatestTranscript(): any;
    getFinalTranscripts(): any[];
    clearTranscripts(): void;
    getConfig(): any;
  }

  export const EVENTS: {
    SESSION_STATE_CHANGED: string;
    RECORDING_STARTED: string;
    RECORDING_STOPPED: string;
    TRANSCRIPT_INTERIM: string;
    TRANSCRIPT_FINAL: string;
    AUDIO_DATA: string;
    ERROR: string;
  };

  export const SESSION_STATE: {
    IDLE: string;
    CONNECTING: string;
    READY: string;
    RECORDING: string;
    ERROR: string;
  };

  export const MODES: {
    PUSH_TO_TALK: string;
    VOICE_ACTIVATED: string;
  };
}
