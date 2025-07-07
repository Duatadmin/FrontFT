import React, { createContext, useContext, ReactNode } from 'react';
import { useVoicePlayback } from './useVoicePlayback'; // Adjusted path

interface VoiceContextType {
  voiceEnabled: boolean;
  isPlaying: boolean;
  toggleVoice: () => void;
  enqueueBotUtterance: (text: string, messageId: string) => void;
  stopCurrentPlayback: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Always initialize voice playback - let useVoicePlayback handle capability detection
  const voicePlayback = useVoicePlayback();

  return (
    <VoiceContext.Provider value={voicePlayback}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = (): VoiceContextType => {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};
