// src/components/VoiceWidget.tsx
import React, { useRef, useState, Fragment, useEffect } from 'react';
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
interface VoiceWidgetProps {
  onFinalTranscriptCommitted?: (transcript: string) => void;
  isChatProcessing?: boolean; 
  onStatusChange?: (status: string) => void; 
  isSendingRef: React.RefObject<boolean>;
  onRmsData?: (rms: number) => void;
}

const VoiceWidget: React.FC<VoiceWidgetProps> = ({ onFinalTranscriptCommitted, isChatProcessing, onStatusChange, isSendingRef, onRmsData }) => {
  console.log('[VoiceWidget] Initializing / Re-rendering. isChatProcessing:', isChatProcessing);
  const { voiceEnabled, toggleVoice } = useVoice();
  // Extract host from the full WebSocket URL
  const wsUrl = import.meta.env.VITE_WALKIE_HOOK_WS_URL || 'ws://localhost:8080/ws';
  const wsHost = wsUrl.replace(/^wss?:\/\//, '').replace(/\/.*$/, ''); // Remove protocol and path
  
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
      console.log('VoiceWidget received transcript:', transcript);
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

  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(walkie.state.status);
    }
  }, [walkie.state.status, onStatusChange]);

  useEffect(() => {
    if (onRmsData && typeof walkie.state.level === 'number') {
      onRmsData(walkie.state.level);
    }
  }, [walkie.state.level, onRmsData]);

  const handleStart = async () => {
    console.log(`[VoiceWidget] handleStart called. isChatProcessing: ${isChatProcessing}, isSendingRef.current: ${isSendingRef.current}, current walkie status: ${walkie.state.status}`);
    if (isSendingRef.current || isChatProcessing) {
      console.log('[VoiceWidget] handleStart blocked by isSendingRef or isChatProcessing.');
      return;
    }

    if (walkie.state.status === 'active') {
      console.warn('[VoiceWidget] Walkie is already active. Attempting to stop before starting new session.');
      try {
        await walkie.stop();
        console.log('[VoiceWidget] walkie.stop() called successfully during pre-start cleanup.');
      } catch (e) {
        console.error('[VoiceWidget] Error stopping walkie during pre-start cleanup:', e);
      }
    }

    const newSid = uuid();
    sidRef.current = newSid;
    console.log(`[VoiceWidget] Generated new SID for walkie.start: ${newSid}`);

    try {
      setShowErrorToast(false);
      setToastMessage('');
      if (!voiceEnabled) {
        console.log('[VoiceWidget] voiceEnabled is false, calling toggleVoice() to enable TTS.');
        toggleVoice();
      }
      await walkie.start(); // V3 doesn't need session ID
      console.log('[VoiceWidget] walkie.start() called successfully.');
    } catch (e: any) {
      console.error('Failed to start walkie:', e);
      setToastMessage(e.message || 'Failed to start recording.');
      setShowErrorToast(true);
    }
  };

  const handleStop = async () => {
    console.log(`[VoiceWidget] handleStop called. Current walkie status: ${walkie.state.status}`);
    try {
      await walkie.stop();
      console.log('[VoiceWidget] walkie.stop() called successfully.');
      if (voiceEnabled) {
        console.log('[VoiceWidget] voiceEnabled is true, calling toggleVoice() to disable TTS.');
        toggleVoice();
      }
    } catch (e: any) {
      console.error('Failed to stop walkie:', e);
      setToastMessage(e.message || 'Failed to stop recording.');
      setShowErrorToast(true);
    }
  };

  const { status, errorMessage } = walkie.state;
  const isActivated = status === 'active';

  // Determine button state and appearance
  let currentIcon;
  let currentLabel;
  let currentTitle;
  const baseButtonClasses = "relative flex items-center justify-center text-white rounded-full transition-all duration-300 hover:scale-105 overflow-hidden";
  let cursorClass = "cursor-pointer";
  let stateSpecificClasses = "";

  // Combined isDisabled logic for clarity and use in event handlers and ARIA attributes
  const effectiveIsDisabled = status === 'connecting' || status === 'error' || !!isChatProcessing || !!isSendingRef.current;

  switch (status) {
    case 'error':
      currentIcon = <ExclamationTriangleIcon className="h-5 w-5 text-yellow-300 flex-shrink-0" />;
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
      if (effectiveIsDisabled && status === 'idle') { // Specifically for idle but otherwise disabled (e.g. chat processing)
        cursorClass = "cursor-not-allowed";
        stateSpecificClasses = "opacity-50";
      }
      break;
  }

  if (effectiveIsDisabled) {
    cursorClass = "cursor-not-allowed";
    stateSpecificClasses = stateSpecificClasses ? `${stateSpecificClasses} opacity-50` : "opacity-50"; // Keep existing opacity if error/connecting
  }

  const dynamicButtonClasses = `${baseButtonClasses} ${cursorClass} ${stateSpecificClasses}`.replace(/\s+/g, ' ').trim();

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (effectiveIsDisabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (status === 'idle' || status === 'active') { // Allow starting if idle or active (handleStart will stop if active)
        handleStart();
      }
    }
  };

  const handleKeyRelease = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Stop only if it was active and we are not generally disabled
    if (status === 'active' && !effectiveIsDisabled) { 
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleStop();
      }
    }
  };

  return (
    <>
      {isActivated ? (
        // ACTIVE STATE BUTTON
        <div
          className={dynamicButtonClasses}
          onMouseUp={effectiveIsDisabled ? undefined : handleStop} // Only allow stop if not generally disabled
          onTouchEnd={effectiveIsDisabled ? undefined : handleStop}
          onKeyUp={handleKeyRelease} // handleKeyRelease has its own disabled check
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
      ) : (
        // INACTIVE/OTHER STATES BUTTON
        <div
          className={dynamicButtonClasses}
          onMouseDown={() => {
            if (!effectiveIsDisabled && (status === 'idle' || status === 'active')) {
              handleStart();
            } else {
              console.log(`[VoiceWidget] InactiveButton onMouseDown: handleStart() blocked. Status: ${status}, effectiveIsDisabled: ${effectiveIsDisabled}`);
            }
          }}
          onTouchStart={(_e) => {
            if (!effectiveIsDisabled && (status === 'idle' || status === 'active')) {
              // e.preventDefault(); // Removed to address passive event listener warning
              handleStart();
            } else {
              console.log(`[VoiceWidget] InactiveButton onTouchStart (bubbling): handleStart() blocked. Status: ${status}, effectiveIsDisabled: ${effectiveIsDisabled}`);
            }
          }}
          onKeyDown={handleKeyPress} // handleKeyPress has its own disabled check
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
      )}

      {/* Toast Notification Area */} 
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-50 safe-top safe-bot safe-left safe-right"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
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
            <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-red-600 shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-white">Voice Error</p>
                    <p className="mt-1 text-sm text-red-100">
                      {toastMessage || 'An unexpected error occurred.'}
                    </p>
                  </div>
                  <div className="ml-4 flex flex-shrink-0">
                    <button
                      type="button"
                      className="inline-flex rounded-md bg-red-600 text-red-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-red-600"
                      onClick={() => setShowErrorToast(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  );
};

export default VoiceWidget;
