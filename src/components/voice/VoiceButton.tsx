import React, { useRef, useState } from 'react';
import { Mic } from 'lucide-react';

interface VoiceButtonProps {
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  disabled?: boolean;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({
  isListening,
  onStartListening,
  onStopListening,
  disabled = false
}) => {
  const [isPressing, setIsPressing] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle mouse down - start listening
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    
    setIsPressing(true);
    onStartListening();
    
    // Add global event listeners to handle releasing outside the button
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('mouseleave', handleGlobalMouseUp);
  };

  // Handle mouse up - stop listening
  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    
    setIsPressing(false);
    onStopListening();
    
    // Remove global event listeners
    document.removeEventListener('mouseup', handleGlobalMouseUp);
    document.removeEventListener('mouseleave', handleGlobalMouseUp);
  };

  // Handle global mouse up (when released outside the button)
  const handleGlobalMouseUp = () => {
    if (isPressing) {
      setIsPressing(false);
      onStopListening();
      
      // Clean up event listeners
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mouseleave', handleGlobalMouseUp);
    }
  };

  // Add touch handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (disabled) return;
    
    setIsPressing(true);
    onStartListening();
    
    // Add global event listeners
    document.addEventListener('touchend', handleGlobalTouchEnd);
    document.addEventListener('touchcancel', handleGlobalTouchEnd);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (disabled) return;
    
    setIsPressing(false);
    onStopListening();
    
    // Remove global event listeners
    document.removeEventListener('touchend', handleGlobalTouchEnd);
    document.removeEventListener('touchcancel', handleGlobalTouchEnd);
  };

  const handleGlobalTouchEnd = () => {
    if (isPressing) {
      setIsPressing(false);
      onStopListening();
      
      // Clean up event listeners
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      document.removeEventListener('touchcancel', handleGlobalTouchEnd);
    }
  };

  // Button appearance depends on listening state
  const buttonClasses = `
    relative flex items-center justify-center p-3 rounded-full 
    transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/50
    ${isListening
      ? 'bg-primary text-white shadow-lg scale-110'
      : isPressing
        ? 'bg-primary text-white shadow-md scale-105'
        : 'bg-input hover:bg-input/80 text-textSecondary'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
  `;

  // Animation for the ripple effect when button is pressed
  const rippleClasses = `
    absolute inset-0 rounded-full bg-primary/20
    ${isListening ? 'animate-pulse-ring' : 'opacity-0'}
  `;

  return (
    <button
      ref={buttonRef}
      className={buttonClasses}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      disabled={disabled}
      aria-label="Push to talk"
      title="Push to talk"
    >
      <div className={rippleClasses} />
      <Mic size={22} />
    </button>
  );
};

export default VoiceButton;
