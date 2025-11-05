// src/hooks/useTTSPlaybackState.ts
import { create } from 'zustand';

interface TTSPlaybackState {
  isTTSPlaying: boolean;
  setTTSPlaying: (playing: boolean) => void;
}

// Global TTS playback state to coordinate between TTS and ASR
export const useTTSPlaybackState = create<TTSPlaybackState>((set) => ({
  isTTSPlaying: false,
  setTTSPlaying: (playing) => set({ isTTSPlaying: playing }),
}));

// Helper hook to get just the playing state
export const useIsTTSPlaying = () => useTTSPlaybackState((state) => state.isTTSPlaying);