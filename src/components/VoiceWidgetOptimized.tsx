// src/components/VoiceWidgetOptimized.tsx
import React, { useRef, useState, Fragment, useEffect, memo, useCallback } from 'react';
import { useVoice } from '../hooks/VoiceContext';
import { useWalkieV3 } from '../hooks/useWalkieV3';
import { v4 as uuid } from 'uuid';
import { Player } from '@lottiefiles/react-lottie-player';
import { Mic } from 'lucide-react';
import { Transition } from '@headlessui/react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const EarbudIcon = () => {
  const playerRef = useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (playerRef.current) {
        playerRef.current.play();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Player
      ref={playerRef}
      src={'/icons/wired-gradient-1055-earbud-wireless-earphones-in-reveal.json'}
      speed={1}
      keepLastFrame
      style={{ width: '24px', height: '24px' }}
      className="flex-shrink-0"
    />
  );
};

// Props for VoiceWidget
interface VoiceWidgetOptimizedProps {
  onFinalTranscriptCommitted?: (transcript: string) => void;
  isChatProcessing?: boolean; 
  onStatusChange?: (status: string) => void; 
  isSendingRef: React.RefObject<boolean>;
  onRmsData?: (rms: number) => void;
}

const VoiceWidgetOptimized: React.FC<VoiceWidgetOptimizedProps> = memo(({ 
  onFinalTranscriptCommitted, 
  isChatProcessing, 
  onStatusChange, 
  isSendingRef, 
  onRmsData 
}) => {
  const { voiceEnabled, toggleVoice } = useVoice();
  // Extract host from the full WebSocket URL
  const wsUrl = import.meta.env.VITE_WALKIE_HOOK_WS_URL || 'ws://localhost:8080/ws';
  const wsHost = wsUrl.replace(/^wss?:\/\//, '').replace(/\/.*$/, ''); // Remove protocol and path
  
  // Use a ref to store the RMS callback to prevent re-renders
  const rmsCallbackRef = useRef(onRmsData);
  rmsCallbackRef.current = onRmsData;
  
  const walkie = useWalkieV3({
    wsHost,
    mode: 'walkie', // Always-on listening mode
    recorderConfig: {
      targetSampleRate: 16000,
      mono: true,
      sepiaModulesPath: '/sepia/modules/'
      // Audio constraints with echo cancellation are set in useWalkieV3
    },
    onTranscription: (transcript: { text: string; final: boolean }) => {
      // console.log('VoiceWidget received transcript:', transcript);
      // Only final transcripts are passed through by useWalkieV3
      if (transcript.text.trim() && onFinalTranscriptCommitted) {
        onFinalTranscriptCommitted(transcript.text);
      }
    },
  });

  const sidRef = useRef<string | null>(null);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (walkie.state.status === 'error' && walkie.state.errorMessage) {
      setToastMessage(walkie.state.errorMessage);
      setShowErrorToast(true);
    }
  }, [walkie.state.status, walkie.state.errorMessage]);

  // Use a separate effect with a ref to handle status changes without re-renders
  const statusCallbackRef = useRef(onStatusChange);
  statusCallbackRef.current = onStatusChange;
  
  useEffect(() => {
    if (statusCallbackRef.current) {
      statusCallbackRef.current(walkie.state.status);
    }
  }, [walkie.state.status]);

  // Handle RMS data updates
  useEffect(() => {
    if (onRmsData && typeof walkie.state.level === 'number') {
      onRmsData(walkie.state.level);
    }
  }, [walkie.state.level, onRmsData]);

  const handleStart = useCallback(async () => {
    // console.log(`[VoiceWidget] handleStart called. isChatProcessing: ${isChatProcessing}, isSendingRef.current: ${isSendingRef.current}, current walkie status: ${walkie.state.status}`);
    if (isSendingRef.current || isChatProcessing) {
      // console.log('[VoiceWidget] handleStart blocked by isSendingRef or isChatProcessing.');
      return;
    }

    // With the new single button approach, we should never reach here if already active
    if (walkie.state.status === 'active') {
      return;
    }

    try {
      // Enforce single session constraint
      const newSid = uuid();
      sidRef.current = newSid;
      // console.log(`[VoiceWidget] Generated new SID for walkie.start: ${newSid}`);

      // Enable TTS if needed
      if (!voiceEnabled) {
        // console.log('[VoiceWidget] voiceEnabled is false, calling toggleVoice() to enable TTS.');
        toggleVoice();
      }
      await walkie.start();
      // console.log('[VoiceWidget] walkie.start() called successfully.');
    } catch (error) {
      console.error('[VoiceWidget] handleStart error:', error);
      setToastMessage('Failed to start voice recording');
      setShowErrorToast(true);
    }
  }, [isChatProcessing, isSendingRef, walkie, voiceEnabled, toggleVoice]);

  const handleStop = useCallback(async () => {
    // console.log(`[VoiceWidget] handleStop called. Current walkie status: ${walkie.state.status}`);
    try {
      await walkie.stop();
      // console.log('[VoiceWidget] walkie.stop() called successfully.');
      if (voiceEnabled) {
        // console.log('[VoiceWidget] voiceEnabled is true, calling toggleVoice() to disable TTS.');
        toggleVoice();
      }
      sidRef.current = null;
    } catch (error) {
      console.error('[VoiceWidget] handleStop error:', error);
    }
  }, [walkie, voiceEnabled, toggleVoice]);

  // Voice widget state and styling logic (matching original)
  const status = walkie.state.status;
  const effectiveIsDisabled = isChatProcessing || isSendingRef.current;
  const isActivated = status === 'active';
  
  let currentIcon;
  let currentLabel;
  let currentTitle;
  const baseButtonClasses = "relative flex items-center justify-center text-white rounded-full transition-all duration-300 hover:scale-105 overflow-hidden";
  let cursorClass = "cursor-pointer";
  let stateSpecificClasses = "";

  switch (status) {
    case 'error':
      const errorMessage = walkie.state.errorMessage || "Unknown error";
      currentIcon = <ExclamationTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0" />;
      currentLabel = "Error";
      currentTitle = errorMessage || 'Microphone error';
      cursorClass = "cursor-not-allowed";
      stateSpecificClasses = "opacity-80";
      break;
    case 'connecting':
      currentIcon = (
        <svg className="animate-spin h-5 w-5 text-white/50 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      );
      currentLabel = "Connecting...";
      currentTitle = "Connecting...";
      cursorClass = "cursor-wait";
      stateSpecificClasses = "opacity-90";
      break;
    case 'active':
      currentIcon = <Mic size={18} className="text-white/50 scale-110 transition-transform duration-150 flex-shrink-0" />;
      currentLabel = "Listening...";
      currentTitle = "Streaming... Release to stop";
      break;
    default: // idle or other unhandled states
      currentIcon = <EarbudIcon />;
      currentLabel = "Voice Mode";
      currentTitle = "Press and hold to talk";
      if (effectiveIsDisabled && status === 'idle') {
        cursorClass = "cursor-not-allowed";
        stateSpecificClasses = "opacity-50";
      }
      break;
  }

  if (effectiveIsDisabled) {
    cursorClass = "cursor-not-allowed";
    stateSpecificClasses = stateSpecificClasses ? `${stateSpecificClasses} opacity-50` : "opacity-50";
  }

  const dynamicButtonClasses = `${baseButtonClasses} ${cursorClass} ${stateSpecificClasses}`.replace(/\s+/g, ' ').trim();

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (effectiveIsDisabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (status === 'idle') {
        handleStart();
      }
    }
  };

  const handleKeyRelease = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (effectiveIsDisabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (status === 'active') {
        handleStop();
      }
    }
  };

  // Event handlers for the single button approach
  const handleMouseDown = () => {
    if (effectiveIsDisabled) return;
    if (status === 'idle') {
      handleStart();
    }
  };

  const handleMouseUp = () => {
    if (effectiveIsDisabled) return;
    if (status === 'active') {
      handleStop();
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (effectiveIsDisabled) return;
    if (status === 'idle') {
      e.preventDefault();
      handleStart();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (effectiveIsDisabled) return;
    if (status === 'active') {
      e.preventDefault();
      handleStop();
    }
  };

  return (
    <>
      {/* Single button element with conditional event handlers based on state */}
      <div
        className={dynamicButtonClasses}
        onMouseDown={isActivated ? undefined : handleMouseDown}
        onMouseUp={isActivated ? handleMouseUp : undefined}
        onTouchStart={isActivated ? undefined : handleTouchStart}
        onTouchEnd={isActivated ? handleTouchEnd : undefined}
        onKeyDown={handleKeyPress}
        onKeyUp={handleKeyRelease}
        role="button"
        tabIndex={effectiveIsDisabled ? -1 : 0}
        aria-disabled={effectiveIsDisabled}
        title={currentTitle}
        aria-label={currentTitle}
      >
        <span className="relative flex items-center gap-2 z-10">
          {currentIcon}
          <span className="font-medium text-xs whitespace-nowrap text-white/50">{currentLabel}</span>
        </span>
      </div>

      {/* Error Toast */}
      <Transition
        show={showErrorToast}
        as={Fragment}
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed bottom-20 right-4 bg-red-900/90 backdrop-blur-sm text-white p-4 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">Voice Error</p>
              <p className="mt-1 text-sm text-red-200">{toastMessage}</p>
            </div>
            <button
              onClick={() => setShowErrorToast(false)}
              className="ml-4 text-red-400 hover:text-red-300"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Transition>
    </>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent re-renders from RMS updates
  return (
    prevProps.isChatProcessing === nextProps.isChatProcessing &&
    prevProps.isSendingRef === nextProps.isSendingRef &&
    prevProps.onFinalTranscriptCommitted === nextProps.onFinalTranscriptCommitted &&
    prevProps.onStatusChange === nextProps.onStatusChange &&
    prevProps.onRmsData === nextProps.onRmsData
  );
});

VoiceWidgetOptimized.displayName = 'VoiceWidgetOptimized';

export default VoiceWidgetOptimized;