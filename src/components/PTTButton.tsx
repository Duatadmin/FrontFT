import React from 'react';
import { MicrophoneIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

export interface PTTButtonState {
  isStreaming: boolean;
  status: 'idle' | 'connecting' | 'active' | 'error';
  errorMessage?: string | null;
  level?: number; // Added for completeness, though not directly used by PTTButton visuals
}

interface PTTButtonProps {
  state: PTTButtonState;
  onPress: () => void;
  onRelease: () => void;
}

const PTTButton: React.FC<PTTButtonProps> = ({ state, onPress, onRelease }) => {
  const { isStreaming, status, errorMessage } = state;

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (status === 'idle' || status === 'active') onPress();
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isStreaming || status === 'active') onRelease();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (status === 'idle' || status === 'active') onPress();
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isStreaming || status === 'active') onRelease();
  };

  let buttonContent;
  let buttonClasses = 'w-24 h-24 rounded-full flex items-center justify-center focus:outline-none transition-all duration-150 ease-in-out shadow-lg';
  let title = '';

  switch (status) {
    case 'error':
      buttonClasses += ' bg-rose-500 cursor-not-allowed';
      buttonContent = <ExclamationCircleIcon className="w-12 h-12 text-white" />;
      title = errorMessage || 'Microphone error';
      break;
    case 'connecting':
      buttonClasses += ' bg-sky-500 cursor-wait';
      buttonContent = (
        <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      );
      title = 'Connecting...';
      break;
    case 'active': // This implies isStreaming is true
      buttonClasses += ' bg-red-600 hover:bg-red-700';
      buttonContent = <MicrophoneIcon className="w-12 h-12 text-white" />;
      title = 'Streaming... Release to stop';
      break;
    case 'idle':
    default:
      buttonClasses += ' bg-gray-600 hover:bg-gray-700 cursor-pointer';
      buttonContent = <MicrophoneIcon className="w-12 h-12 text-gray-300" />;
      title = 'Press and hold to talk';
      break;
  }

  return (
    <button
      type="button"
      className={buttonClasses}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      disabled={status === 'connecting' || status === 'error'} // Disable button during connecting or error states
      title={title}
      aria-label={title}
    >
      {buttonContent}
    </button>
  );
};

export default PTTButton;
