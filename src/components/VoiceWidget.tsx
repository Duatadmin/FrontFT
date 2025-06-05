// src/components/VoiceWidget.tsx
import React, { useRef, useState, Fragment, useEffect } from 'react';
import { useWalkie } from '../hooks/useWalkie'; 
import { v4 as uuid } from 'uuid';
import PTTButton from './PTTButton';
import type { PTTButtonState } from './PTTButton'; 
import Meter from './Meter';
import { Transition } from '@headlessui/react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Props for VoiceWidget, if any are needed in the future (e.g., config overrides)
// interface VoiceWidgetProps {}

const VoiceWidget: React.FC = () => {
  const walkie = useWalkie({
    wsUrl: import.meta.env.VITE_WALKIE_HOOK_WS_URL || 'ws://localhost:8080/ws',
    recorderConfig: { // Maps to CreateRecorderOptions from sepiaRecorder.ts
      targetSampleRate: 16000,
      mono: true,
      // sepiaModulesPath: '/custom-sepia-modules/' // Optional: if you need to override default path
    },
    onVadStatusChange: (isSpeaking: boolean) => {
      console.log('VAD Status changed:', isSpeaking);
      // You can add logic here if the VoiceWidget needs to react directly to VAD status
    },
    onTranscription: (transcript: { text: string; final: boolean; type: string }) => {
      console.log('VoiceWidget received transcript:', transcript);
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

  const pttState: PTTButtonState = walkie.state as PTTButtonState; // Cast if WalkieState and PTTButtonState differ slightly but are compatible

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-zinc-800 rounded-lg shadow-xl">
      <PTTButton
        state={pttState}
        onPress={handleStart}
        onRelease={handleStop}
      />
      <Meter level={walkie.state.level} />

      {/* Toast Notification Area for this widget */}
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
    </div>
  );
};

export default VoiceWidget;
