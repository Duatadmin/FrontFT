import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';

import { DashboardButton } from '../chat/DashboardButton'; // Adjusted path
import VoiceWidget from '../VoiceWidget'; // Added import for VoiceWidget
// import { VoiceModeToggle } from '../chat/VoiceModeToggle';   // Adjusted path
// import { WalkieTalkieButton } from '../chat/WalkieTalkieButton';// Adjusted path
import { SendButton } from '../chat/SendButton';         // Adjusted path

import { useVoicePlayback } from '../../hooks/useVoicePlayback';
import { useWalkie } from '../../hooks/useWalkie'; 

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onTtsPlaybackStart?: () => void;
  onTtsPlaybackEnd?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading,
}) => {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatInputId = 'chat-input'; 

  useVoicePlayback(); // voiceEnabled and toggleVoice are not used after removing VoiceModeToggle
  
  const { transcript, isListening } = useWalkie(chatInputId); // isWalkieActive and toggleWalkie are not used after removing WalkieTalkieButton

  useEffect(() => {
    if (transcript) {
      setInputValue(prev => prev + transcript); 
    }
  }, [transcript]);
  
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

  const handleSend = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput && !isLoading) {
      onSendMessage(trimmedInput);
      setInputValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.overflowY = 'hidden';
        setTimeout(() => textareaRef.current?.focus(), 0);
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); 
      handleSend();
    }
  };

  return (
    <div 
      className="sticky bottom-0 z-10 pt-2 pb-2"
      style={{ paddingBottom: `calc(0.5rem + var(--safe-area-inset-bottom))` }}
    >
      {/* Further reduced height container */}
      <div className="w-[min(95vw,525px)] min-w-[min(95vw,525px)] bg-botBubble shadow-2xl rounded-3xl px-4 py-1.5 mx-auto flex flex-col gap-1.5">
        {/* Input area with SendButton - Corrected Alignment */}
        <div className="relative flex items-center w-full">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="w-full bg-transparent resize-none border-none focus:outline-none focus:ring-0 pr-12 py-1.5 text-text placeholder:text-text/60 text-sm max-h-[96px] font-normal font-sans"
            rows={1}
            disabled={isLoading}
            autoComplete="off"
            style={{ scrollbarWidth: 'none' }}
          />
          <SendButton 
            onClick={handleSend} 
            disabled={!inputValue.trim() || isLoading} 
            className="absolute right-0 top-1/2 -translate-y-1/2 h-[38px] w-[38px]"
          />
        </div>

        {/* Lower row for other action buttons */}
        <div className="flex items-center justify-start gap-2 pt-2">
          <DashboardButton className="text-xs px-2.5 py-1.5" /> {/* Compact styling */}
          <VoiceWidget onFinalTranscriptCommitted={onSendMessage} />
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
};

export default ChatInput;