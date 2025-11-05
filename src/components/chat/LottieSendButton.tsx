import React, { useRef, useEffect } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';

interface LottieSendButtonProps {
  onClick: () => void;
  disabled: boolean;
  isSending: boolean;
  className?: string;
}

export const LottieSendButton: React.FC<LottieSendButtonProps> = ({ onClick, disabled, isSending, className }) => {
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (playerRef.current) {
      if (isSending) {
        playerRef.current.play();
      } else {
        playerRef.current.stop();
      }
    }
  }, [isSending]);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`transition-all duration-200 ease-in-out transform focus:outline-none ${
        disabled ? 'cursor-not-allowed grayscale' : 'cursor-pointer hover:scale-110'
      } ${className}`}
      style={{ width: '34px', height: '34px', background: 'none', border: 'none', padding: 0 }}
    >
      <Player
        ref={playerRef}
        src={'/icons/wired-gradient-143-paperplane-send-hover-wave.json'}
        speed={1}
        keepLastFrame
        style={{ width: '34px', height: '34px' }}
      />
    </button>
  );
};
