import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useVoice } from '../../hooks/VoiceContext'; // Assuming this path will be correct

export const VoiceToggle: React.FC = () => {
  // Fallback logic in case context is not ready due to creation issues
  let voiceEnabled = false;
  let toggleVoice = () => console.warn('VoiceContext not yet available to VoiceToggle');
  try {
    const voiceContext = useVoice();
    voiceEnabled = voiceContext.voiceEnabled;
    toggleVoice = voiceContext.toggleVoice;
  } catch (error) {
    // console.warn('VoiceToggle: VoiceContext not ready, using fallback.', error);
    // This catch is to handle the case where VoiceProvider might not be in the tree yet
    // or if useVoice() throws due to VoiceContext.tsx not being created.
  }

  return (
    <button
      onClick={toggleVoice}
      className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
      aria-label={voiceEnabled ? 'Disable voice playback' : 'Enable voice playback'}
      title={voiceEnabled ? 'Disable voice playback' : 'Enable voice playback'}
    >
      {voiceEnabled ? (
        <VolumeX size={20} className="text-white" />
      ) : (
        <Volume2 size={20} className="text-gray-400" />
      )}
    </button>
  );
};
