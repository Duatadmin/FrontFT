// src/components/VoiceWidget.tsx
import React, { useRef, useState, Fragment, useEffect } from 'react';
import { useVoice } from '../hooks/VoiceContext';
import { useWalkie } from '../hooks/useWalkie'; 
import { v4 as uuid } from 'uuid';
import { Mic } from 'lucide-react';
import { Transition } from '@headlessui/react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Props for VoiceWidget, if any are needed in the future (e.g., config overrides)
interface VoiceWidgetProps {
  onFinalTranscriptCommitted?: (transcript: string) => void;
}

const VoiceWidget: React.FC<VoiceWidgetProps> = ({ onFinalTranscriptCommitted }) => {
  const { voiceEnabled, toggleVoice } = useVoice();
  const walkie = useWalkie({
    wsUrl: import.meta.env.VITE_WALKIE_HOOK_WS_URL || 'ws://localhost:8080/ws',
    recorderConfig: { // Maps to CreateRecorderOptions from sepiaRecorder.ts
      targetSampleRate: 16000,
      mono: true,
      sepiaModulesPath: '/sepia/modules/' // Path to Sepia engine modules
    },
    onVadStatusChange: (isSpeaking: boolean) => {
      console.log('VAD Status changed:', isSpeaking);
      // You can add logic here if the VoiceWidget needs to react directly to VAD status
    },
    onTranscription: (transcript: { text: string; final: boolean; type: string }) => {
      console.log('VoiceWidget received transcript:', transcript);
      if (transcript.final && transcript.text.trim() && onFinalTranscriptCommitted) {
        onFinalTranscriptCommitted(transcript.text);
      }
      // You can add logic here, e.g., display transcript or send to another component
    },
    // onError: (error) => {
    //   console.error('VoiceWidget received error from useWalkie:', error);
    //   // Custom handling if needed, though useEffect already handles toast for state.errorMessage
    // }
  });

  const sidRef = useRef<string>();
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (walkie.state.status === 'error' && walkie.state.errorMessage) {
      setToastMessage(walkie.state.errorMessage);
      setShowErrorToast(true);
    }
  }, [walkie.state.status, walkie.state.errorMessage]);

  const handleStart = async () => {
    if (!sidRef.current) sidRef.current = uuid();
    try {
      setShowErrorToast(false);
      setToastMessage('');
      if (!voiceEnabled) {
        toggleVoice(); // Ensure TTS is on
      }
      await walkie.start(sidRef.current); // Assuming start takes a session ID
    } catch (e: any) {
      console.error('Failed to start walkie:', e);
      setToastMessage(e.message || 'Failed to start recording.');
      setShowErrorToast(true);
      // The hook should ideally set its status to 'error' upon such failures
    }
  };

  const handleStop = async () => {
    try {
      await walkie.stop();
    } catch (e: any) {
      console.error('Failed to stop walkie:', e);
      setToastMessage(e.message || 'Failed to stop recording.');
      setShowErrorToast(true);
    }
  };

  const { status, errorMessage } = walkie.state;

  let currentIcon;
  let currentLabel;
  let currentTitle;
  const baseButtonClasses = "relative overflow-hidden group flex items-center justify-center h-12 min-w-[120px] text-white rounded-full py-2 px-3 shadow-lg transition-all duration-300 focus:outline-none";
  let bgGradient;
  let hoverEffects;
  let cursorClass;
  let stateSpecificClasses = "";

  const isDisabled = status === 'connecting' || status === 'error';

  switch (status) {
    case 'error':
      currentIcon = <ExclamationTriangleIcon className="h-5 w-5 text-yellow-300 mr-2 flex-shrink-0" />;
      currentLabel = "Error";
      currentTitle = errorMessage || 'Microphone error';
      bgGradient = "bg-gradient-to-r from-red-500 to-rose-600";
      hoverEffects = ""; 
      cursorClass = "cursor-not-allowed";
      stateSpecificClasses = "opacity-80";
      break;
    case 'connecting':
      currentIcon = (
        <svg className="animate-spin h-5 w-5 text-white mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      );
      currentLabel = "Connecting...";
      currentTitle = "Connecting...";
      bgGradient = "bg-gradient-to-r from-sky-500 to-blue-600";
      hoverEffects = ""; 
      cursorClass = "cursor-wait";
      stateSpecificClasses = "opacity-90";
      break;
    case 'active':
      currentIcon = <Mic size={18} className="mr-2 text-white scale-110 transition-transform duration-150 flex-shrink-0" />;
      currentLabel = "Listening...";
      currentTitle = "Streaming... Release to stop";
      bgGradient = "bg-gradient-to-r from-[#0da37f] to-[#4f23ff]"; 
      hoverEffects = "hover:shadow-xl hover:scale-105";
      cursorClass = "cursor-pointer";
      // Add a subtle visual cue for audio level if desired here
      break;
    default: // idle
      currentIcon = <Mic size={18} className="mr-2 text-white flex-shrink-0" />;
      currentLabel = "Voice Mode";
      currentTitle = "Press and hold to talk";
      bgGradient = "bg-gradient-to-r from-[#10a37f] to-[#5533ff]";
      hoverEffects = "hover:shadow-xl hover:scale-105";
      cursorClass = "cursor-pointer";
      break;
  }

  const dynamicButtonClasses = `${baseButtonClasses} ${bgGradient} ${hoverEffects} ${cursorClass} ${stateSpecificClasses}`.replace(/\s+/g, ' ').trim();

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (status === 'idle') {
        handleStart();
      }
    }
  };

  const handleKeyRelease = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (status === 'active') {
        handleStop();
      }
    }
  };

  return (
    <>
      <div
        className={dynamicButtonClasses}
        onMouseDown={!isDisabled && status === 'idle' ? handleStart : undefined}
        onMouseUp={!isDisabled && status === 'active' ? handleStop : undefined} // Only call stop if streaming
        onTouchStart={!isDisabled && status === 'idle' ? handleStart : undefined}
        onTouchEnd={!isDisabled && status === 'active' ? handleStop : undefined} // Only call stop if streaming
        onKeyDown={handleKeyPress}
        onKeyUp={handleKeyRelease}
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        aria-disabled={isDisabled}
        title={currentTitle}
        aria-label={currentTitle}
      >
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full"></div>
        <div className={`absolute inset-0 opacity-0 transition-opacity duration-500 rounded-full ${!isDisabled && status !== 'connecting' ? 'group-hover:opacity-100 bg-gradient-to-r from-[#5533ff] to-[#10a37f]' : ''}`}></div>
        <span className="relative flex items-center z-10">
          {currentIcon}
          <span className="font-medium text-sm whitespace-nowrap">{currentLabel}</span>
        </span>
      </div>

      {/* Toast Notification Area (sibling) */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-50"
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
