import React, { useState, useRef, useEffect, KeyboardEvent, memo, useCallback } from 'react';
import { AnimatePresence, motion } from "motion/react";

import { DashboardButton } from '../chat/DashboardButton'; // Adjusted path
import VoiceWidget from '../VoiceWidget'; // Import original VoiceWidget
import VoiceTicker, { ISepiaVoiceRecorder } from './VoiceTicker'; // Import original VoiceTicker
// import { VoiceModeToggle } from '../chat/VoiceModeToggle';   // Adjusted path
// import { WalkieTalkieButton } from '../chat/WalkieTalkieButton';// Adjusted path
import { LottieSendButton } from './LottieSendButton';

import { useVoicePlayback } from '../../hooks/useVoicePlayback';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onTtsPlaybackStart?: () => void;
  onTtsPlaybackEnd?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = memo(({ 
  onSendMessage, 
  isLoading,
}) => {
  const [voiceWidgetStatus, setVoiceWidgetStatus] = useState<string>('idle'); // To track VoiceWidget state
    const [isDemoActive, /* setIsDemoActive */] = useState(false); // For testing the ticker animation
  const voiceTickerRecorderRef = useRef<ISepiaVoiceRecorder>({ onResamplerData: undefined });
  const [isSending, setIsSending] = useState(false); // Local state to prevent race conditions
  // console.log('[ChatInput] Initializing: isSending = false, isLoading =', isLoading); // Initial state log
  const isSendingRef = useRef(false); // Ref for immediate synchronous check
  const [inputValue, setInputValue] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ---------------- Animated Placeholder ----------------
  const placeholders = [
    "Let's start a new training session!",
    "I am borred with my current training plan. Lets create a new one!",
    "Tell me a joke!",
    "Ask anything...",
  ];
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);
  // ------------------------------------------------------
  const chatInputId = 'chat-input'; 


  // const chatInputId = 'chat-input'; // This was the duplicate, original is near line 25

  useVoicePlayback(); // voiceEnabled and toggleVoice are not used after removing VoiceModeToggle
  
  useEffect(() => {
    const initVoice = async () => {
      try {
      } catch (error) {
        console.error('Failed to initialize voice module in chat input:', error);
      }
    };
    
    initVoice();
  }, []);
  
  useEffect(() => {
    const finalTranscriptEl = document.getElementById(`${chatInputId}-final`);
    const interimTranscriptEl = document.getElementById(`${chatInputId}-interim`);

    if (!finalTranscriptEl || !interimTranscriptEl) {
      const transcriptContainer = document.createElement('div');
      transcriptContainer.style.display = 'none';
      transcriptContainer.id = `${chatInputId}-transcript-container`;
      
      const interimEl = document.createElement('div');
      interimEl.id = `${chatInputId}-interim`;
      
      const finalEl = document.createElement('div');
      finalEl.id = `${chatInputId}-final`;
      
      transcriptContainer.appendChild(interimEl);
      transcriptContainer.appendChild(finalEl);
      if (!document.getElementById(transcriptContainer.id)) {
        document.body.appendChild(transcriptContainer);
      }
    }
    
    return () => {}; 
  }, [onSendMessage]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; 
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 128; 
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  }, [inputValue]);

  // When parent signals loading is done, reset our local sending state
  useEffect(() => {
    // console.log('[ChatInput] isLoading prop changed to:', isLoading);
    if (!isLoading) {
      // console.log('[ChatInput] isLoading is false, resetting lock. isSendingRef was:', isSendingRef.current);
      setIsSending(false);
      isSendingRef.current = false; // Reset the lock when parent is done
      // console.log('[ChatInput] Lock reset. isSendingRef is now:', isSendingRef.current);
      
    } else {
      // console.log('[ChatInput] isLoading is true, lock remains active or will be set by send action.');
    }
  }, [isLoading]);

  // Moved after variable definitions to avoid reference error

    // Voice widget should be disabled if the parent is loading OR if we've just sent a voice message
  const isVoiceWidgetDisabled = isLoading || isSending;

  // Text input should be disabled if the voice widget is, OR if the voice widget is actively listening.
  const isRealVoiceActive = voiceWidgetStatus === 'active';
  const isTickerActive = isRealVoiceActive || isDemoActive;
  const isTextInputDisabled = isVoiceWidgetDisabled || isTickerActive || voiceWidgetStatus === 'connecting';
  

  // Define callbacks after all dependencies are available
  const handleVoiceSend = useCallback((message: string) => {
    // console.log('[ChatInput] handleVoiceSend called. Current isSendingRef.current:', isSendingRef.current);
    if (isSendingRef.current) {
      // console.log('[ChatInput] Voice send blocked because isSendingRef.current is true.');
      return;
    }
    // console.log('[ChatInput] Setting lock: isSendingRef.current = true, setIsSending(true)');
    isSendingRef.current = true; // Set lock immediately
    setIsSending(true); // Set state to trigger UI re-render
    onSendMessage(message);
    
    // console.log('[ChatInput] onSendMessage called with voice message.');
  }, [onSendMessage]);

  const handleSend = useCallback(() => {
    if (isSendingRef.current) {
      // console.log('[ChatInput] Text send blocked because a message is already in flight.');
      return;
    }
    const trimmedInput = inputValue.trim();
    if (trimmedInput && !isTextInputDisabled) {
      // console.log('[ChatInput] Setting lock for text send.');
      isSendingRef.current = true;
      setIsSending(true);
      onSendMessage(trimmedInput);
      setInputValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.overflowY = 'hidden';
        setTimeout(() => textareaRef.current?.focus(), 0);
      }
    }
  }, [inputValue, isTextInputDisabled, onSendMessage]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); 
      handleSend();
    }
  };

  // Focus management: when input becomes enabled after bot response, focus if user interacted before
  useEffect(() => {
    if (!isTextInputDisabled && hasInteracted) {
      // small delay to let DOM update
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [isTextInputDisabled, hasInteracted]);

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-10 pt-2"
      style={{ paddingBottom: `calc(1rem + var(--safe-area-inset-bottom))` }}
    >
      {/* Further reduced height container */}
      <div className="w-[95%] max-w-md bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg px-4 py-1.5 mx-auto flex flex-col gap-1.5 transition-all duration-150">
        {/* Input area with SendButton - Corrected Alignment */}
        <div className="relative flex items-center w-full py-1.5">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value) }
             onFocus={() => {
               if (!hasInteracted) setHasInteracted(true);
             }}
            onKeyDown={handleKeyDown}
            
            className="w-full bg-transparent resize-none border-none focus:outline-none focus:ring-0 pr-4 text-text placeholder:text-text/60 text-sm max-h-[96px] font-normal font-sans"
            rows={1}
            disabled={isTextInputDisabled}
            autoComplete="off"
            style={{ scrollbarWidth: 'none' }}
          />
           {/* Animated placeholder overlay */}
           <div className="absolute inset-0 flex items-center pointer-events-none">
             <AnimatePresence mode="wait">
               {!inputValue && !isTickerActive && !hasInteracted && (
                 <motion.p
                   key={`animated-placeholder-${currentPlaceholder}`}
                   initial={{ y: 5, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   exit={{ y: -15, opacity: 0 }}
                   transition={{ duration: 0.3, ease: "linear" }}
                   className="text-text/60 text-sm font-normal font-sans pl-4 text-left w-[calc(100%-2rem)] truncate"
                 >
                   {placeholders[currentPlaceholder]}
                 </motion.p>
               )}
             </AnimatePresence>
           </div>

           {/* VoiceTicker is rendered here, its internal logic handles visibility */}
          {isTickerActive && (
            <div className="absolute inset-0 pointer-events-none">
              <VoiceTicker isRecordingActive={true} recorder={voiceTickerRecorderRef} />
           </div>
          )}
        </div>

        {/* Lower row for other action buttons */}
        {/* Lower row for other action buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
            <DashboardButton className="text-xs px-2.5 py-1.5" /> {/* Compact styling */}
            
            <VoiceWidget 
              onFinalTranscriptCommitted={handleVoiceSend} 
              isChatProcessing={isVoiceWidgetDisabled}
              isSendingRef={isSendingRef} 

              onStatusChange={setVoiceWidgetStatus}
              onRmsData={(rms) => {
                if (voiceTickerRecorderRef.current && voiceTickerRecorderRef.current.onResamplerData) {
                  voiceTickerRecorderRef.current.onResamplerData(rms);
                }
              }}
            />
          </div>
          <LottieSendButton
            onClick={handleSend}
            disabled={!inputValue.trim() || isTextInputDisabled}
            isSending={isSending}
            className="shadow-none"
          />
          {/* <VoiceModeToggle 
            isVoiceEnabled={voiceEnabled} 
            toggleVoiceEnabled={toggleVoice} 
            disabled={isLoading} 
            className="p-1.5" 
          /> */}
          {/* <WalkieTalkieButton 
            isVoiceEnabled={voiceEnabled} 
            isWalkieActive={isWalkieActive} 
            onClick={toggleWalkie} 
            disabled={isLoading} 
            className="p-1.5" 
          /> */}
        </div>
      </div>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;