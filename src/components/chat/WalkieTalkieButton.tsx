import { Mic } from 'lucide-react';

interface WalkieTalkieButtonProps {
  isVoiceEnabled: boolean; // To control icon color based on global voice mode
  isWalkieActive: boolean; // To control its own active state (e.g., VAD listening)
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

export const WalkieTalkieButton: React.FC<WalkieTalkieButtonProps> = ({
  isVoiceEnabled,
  isWalkieActive, // This prop might represent if VAD is actually listening/transmitting
  onClick,
  className,
  disabled,
}) => {
  const iconColor = isVoiceEnabled ? 'text-emerald-400' : 'text-slate-400';
  // Potentially, isWalkieActive could also influence appearance, e.g., a pulsing effect
  // For now, only isVoiceEnabled changes the base color as per requirement 7.

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isWalkieActive} // Reflects if the walkie-talkie function itself is active
      aria-label={isWalkieActive ? 'Stop voice input' : 'Start voice input'}
      disabled={disabled}
      className={`p-2 rounded-full hover:bg-slate-800 active:bg-slate-700 transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed ${iconColor} ${className}`}
    >
      <Mic size={22} aria-hidden="true" />
    </button>
  );
};
