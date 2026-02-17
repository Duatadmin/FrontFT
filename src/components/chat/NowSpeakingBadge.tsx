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
      <Volume2 size={18} className="animate-pulse flex-shrink-0" style={{ color: '#00ff88', filter: 'drop-shadow(0 0 6px #00ff88)' }} />
      <span className="font-medium text-xs whitespace-nowrap animate-pulse" style={{ color: '#00ff88' }}>Speaking...</span>
    </span>
  );
};
