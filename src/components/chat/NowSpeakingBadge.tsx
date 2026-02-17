import React from 'react';
import { Volume2 } from 'lucide-react';
import { useVoice } from '../../hooks/VoiceContext';

export const NowSpeakingBadge: React.FC = () => {
  let voiceEnabled = false;
  let isPlaying = false;
  try {
    const voiceContext = useVoice();
    voiceEnabled = voiceContext.voiceEnabled;
    isPlaying = voiceContext.isPlaying;
  } catch {
    // VoiceContext not ready
  }

  if (!voiceEnabled || !isPlaying) {
    return null;
  }

  return (
    <span className="flex items-center gap-2" title="Now Speaking">
      <Volume2 size={18} className="text-white/50 animate-pulse flex-shrink-0" />
      <span className="font-medium text-xs whitespace-nowrap text-white/50">Speaking...</span>
    </span>
  );
};
