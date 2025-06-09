import React, { createContext, useContext, ReactNode } from 'react';
import { useVoicePlayback } from './useVoicePlayback'; // Adjusted path
import { supportsMediaSource } from '../lib/supportsMediaSource';

interface VoiceContextType {
  voiceEnabled: boolean;
  isPlaying: boolean;
  toggleVoice: () => void;
  enqueueBotUtterance: (text: string, messageId: string) => void;
  stopCurrentPlayback: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

const defaultDisabledVoiceContext: VoiceContextType = {
  voiceEnabled: false,
  isPlaying: false,
  toggleVoice: () => console.warn('[VoiceContext] Voice features disabled: MediaSource not supported.'),
  enqueueBotUtterance: () => console.warn('[VoiceContext] Voice features disabled: MediaSource not supported.'),
  stopCurrentPlayback: () => console.warn('[VoiceContext] Voice features disabled: MediaSource not supported.'),
};

export const VoiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  if (!supportsMediaSource()) {
    console.warn('[VoiceProvider] MediaSource not supported. Voice features will be disabled.');
    return (
      <VoiceContext.Provider value={defaultDisabledVoiceContext}>
        {children}
      </VoiceContext.Provider>
    );
  }

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
