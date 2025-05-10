import React from 'react';
import { Mic, MicOff } from 'lucide-react';

interface WalkieToggleButtonProps {
  isWalkieMode: boolean;
  isListening: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const WalkieToggleButton: React.FC<WalkieToggleButtonProps> = ({
  isWalkieMode,
  isListening,
  onToggle,
  disabled = false
}) => {
  // Button appearance depends on mode and listening state
  const buttonClasses = `
    relative flex items-center justify-center p-2 rounded-lg
    transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/50
    ${isWalkieMode
      ? isListening
        ? 'bg-primary text-white shadow-lg'
        : 'bg-primary/90 text-white shadow-md'
      : 'bg-input hover:bg-input/80 text-textSecondary'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
  `;

  // Animation for the pulse effect when actively listening
  const pulseClasses = `
    absolute inset-0 rounded-lg bg-primary/20
    ${isWalkieMode && isListening ? 'animate-pulse' : 'opacity-0'}
  `;

  return (
    <button
      className={buttonClasses}
      onClick={onToggle}
      disabled={disabled}
      aria-label={isWalkieMode ? "Turn off walkie-talkie mode" : "Turn on walkie-talkie mode"}
      title={isWalkieMode ? "Walkie-talkie mode active" : "Enable walkie-talkie mode"}
    >
      <div className={pulseClasses} />
      {isWalkieMode ? <Mic size={18} /> : <MicOff size={18} />}
      <span className="ml-2 text-sm font-medium">
        {isWalkieMode ? "Listening" : "Walkie-talkie"}
      </span>
    </button>
  );
};

export default WalkieToggleButton;
