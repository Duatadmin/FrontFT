import React, { useRef, useEffect, useState } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { Link } from 'react-router-dom';

interface DashboardButtonProps {
  className?: string;
}

export const DashboardButton: React.FC<DashboardButtonProps> = ({ className: passedClassName }) => {
  const playerRef = useRef<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Lottie animation trigger
    const animationTimer = setTimeout(() => {
      if (playerRef.current) {
        playerRef.current.play();
      }
    }, 1000);

    // Fade-in trigger
    const visibilityTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100); // Short delay to ensure transition is applied

    return () => {
      clearTimeout(animationTimer);
      clearTimeout(visibilityTimer);
    };
  }, []);

  return (
    <Link
      to="/dashboard"
      role="button"
      aria-label="Open Dashboard"
      className={`relative flex items-center justify-center text-white rounded-full transition-all duration-300 hover:scale-105 ${passedClassName || ''}`.trim()}
    >
      <span className="relative flex items-center gap-2">
        <Player
          ref={playerRef}
          src={'/icons/wired-gradient-399-grid-list-morph-unfold.json'}
          speed={1}
          keepLastFrame
          style={{ width: '24px', height: '24px' }}
          className={`flex-shrink-0 transition-opacity duration-[900ms] ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        />
        <span className="font-medium text-xs whitespace-nowrap text-white/50">Dashboard</span>
      </span>
    </Link>
  );
};
