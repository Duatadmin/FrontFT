import { Volume2, VolumeX } from 'lucide-react';

interface VoiceModeToggleProps {
  isVoiceEnabled: boolean;
  toggleVoiceEnabled: () => void;
  className?: string;
  disabled?: boolean;
}

export const VoiceModeToggle: React.FC<VoiceModeToggleProps> = ({
  isVoiceEnabled,
  toggleVoiceEnabled,
  className,
  disabled,
}) => {
  return (
    <button
      type="button"
      onClick={toggleVoiceEnabled}
      aria-pressed={isVoiceEnabled}
      aria-label={isVoiceEnabled ? 'Disable voice mode' : 'Enable voice mode'}
      disabled={disabled}
      className={`p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 active:bg-slate-700 transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isVoiceEnabled ? (
        <Volume2 size={22} aria-hidden="true" />
      ) : (
        <VolumeX size={22} aria-hidden="true" />
      )}
    </button>
  );
};
