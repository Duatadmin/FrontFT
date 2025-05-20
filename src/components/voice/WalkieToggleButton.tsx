import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { setTranscriptTarget } from './index';
import {
  getVoiceModule,
  onVoiceState,
  setVoiceMode,
  stopVoice
} from '../../voice/singleton';
import { MODES } from 'voice-module/index.js';

interface WalkieToggleButtonProps {
  targetId: string;
  disabled?: boolean;
}

const WalkieToggleButton: React.FC<WalkieToggleButtonProps> = ({
  targetId,
  disabled = false
}) => {
  const [active, setActive] = useState(false);
  const [micReady, setMicReady] = useState<boolean | null>(null);

  // Initialize voice module and check mic permissions
  useEffect(() => {
    setTranscriptTarget(targetId);

    try {
      const voice = getVoiceModule();
      setMicReady(true);

      onVoiceState((state) => {
        if (voice.core.config.mode === MODES.VOICE_ACTIVATED) {
          setActive(state === 'recording');
        }
      });
    } catch (error) {
      console.error('Failed to initialize voice module', error);
      setMicReady(false);
    }
  }, [targetId]);

  // Button appearance depends on active state
  const buttonClasses = `
    relative flex items-center justify-center p-2 rounded-lg
    transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/50
    ${active
      ? 'bg-primary text-white shadow-lg'
      : 'bg-input hover:bg-input/80 text-textSecondary'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
  `;

  // Animation for the pulse effect when actively listening
  const pulseClasses = `
    absolute inset-0 rounded-lg bg-primary/20
    ${active ? 'animate-pulse' : 'opacity-0'}
  `;

  const handleClick = async () => {
    const voice = getVoiceModule();

    if (!active) {
      try {
        setVoiceMode(MODES.VOICE_ACTIVATED);
        await voice.start();
        setActive(true);
      } catch (error) {
        console.error('Failed to enable walkie mode', error);
      }
    } else {
      try {
        stopVoice();
        setVoiceMode(MODES.PUSH_TO_TALK);
        setActive(false);
      } catch (error) {
        console.error('Failed to disable walkie mode', error);
      }
    }
  };

  // Show fallback message if microphone permission is denied
  if (micReady === false) {
    return <div className="flex items-center justify-center p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-200">Please enable microphone access</div>;
  }

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || micReady !== true}
      aria-label={active ? "Turn off walkie-talkie mode" : "Turn on walkie-talkie mode"}
      title={active ? "Walkie-talkie mode active" : "Enable walkie-talkie mode"}
    >
      <div className={pulseClasses} />
      {active ? <Mic size={18} /> : <MicOff size={18} />}
      <span className="ml-2 text-sm font-medium">
        {active ? "Listening" : "Walkie-talkie"}
      </span>
    </button>
  );
};

export default WalkieToggleButton;
