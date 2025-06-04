import React from 'react';
import { Radio } from 'lucide-react';
import { useVoice } from '../../hooks/VoiceContext'; // Assuming this path will be correct

export const NowSpeakingBadge: React.FC = () => {
  // Fallback logic in case context is not ready
  let voiceEnabled = false;
  let isPlaying = false;
  try {
    const voiceContext = useVoice();
    voiceEnabled = voiceContext.voiceEnabled;
    isPlaying = voiceContext.isPlaying;
  } catch (error) {
    // console.warn('NowSpeakingBadge: VoiceContext not ready, using fallback.', error);
  }

  if (!voiceEnabled || !isPlaying) {
    return null;
  }

  return (
    <div
      className="flex items-center gap-1 px-2 py-1 text-xs text-green-400 bg-green-900/50 rounded-md animate-pulse"
      title="Now Speaking"
    >
      <Radio size={14} />
      <span>Speaking...</span>
    </div>
  );
};
