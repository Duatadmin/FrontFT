import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { SendHorizonal } from 'lucide-react'; // Using lucide-react for icons
import { VoiceButton, WalkieToggleButton, AudioVisualizer } from '../voice';
import { getVoiceModule } from '../../voice/singleton';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onTtsPlaybackStart?: () => void;
  onTtsPlaybackEnd?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading,
  onTtsPlaybackStart,
  onTtsPlaybackEnd 
}) => {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Unique ID for transcript targeting
  const chatInputId = 'chat-input';
  
  // Initialize voice module on component mount
  useEffect(() => {
    // Ensure a single voice module instance is created
    getVoiceModule();
  }, []);
  
  // Handle final transcript
  useEffect(() => {
    const handleFinalTranscript = () => {
      const finalTranscript = document.getElementById(`${chatInputId}-final`);
      if (finalTranscript && finalTranscript.textContent) {
        const transcript = finalTranscript.textContent.trim();
        if (transcript) {
          setInputValue(transcript);
          // Clear the transcript
          finalTranscript.textContent = '';
        }
      }
    };
    
    // Listen for mutations to the final transcript element
    const observer = new MutationObserver(handleFinalTranscript);
    const finalTranscriptEl = document.getElementById(`${chatInputId}-final`);
    
    if (finalTranscriptEl) {
      observer.observe(finalTranscriptEl, { childList: true, characterData: true, subtree: true });
    } else {
      // Create the transcript containers if they don't exist yet
      const transcriptContainer = document.createElement('div');
      transcriptContainer.style.display = 'none';
      
      const interimEl = document.createElement('div');
      interimEl.id = `${chatInputId}-interim`;
      
      const finalEl = document.createElement('div');
      finalEl.id = `${chatInputId}-final`;
      
      transcriptContainer.appendChild(interimEl);
      transcriptContainer.appendChild(finalEl);
      document.body.appendChild(transcriptContainer);
      
      // Now observe the final element
      observer.observe(finalEl, { childList: true, characterData: true, subtree: true });
    }
    
    return () => observer.disconnect();
  }, [onSendMessage]);

  // Auto-resize textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 128; // Max height ~ 5 rows
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      // Show scrollbar if content exceeds max height
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
        // Briefly delay focus to allow potential layout shifts
        setTimeout(() => textareaRef.current?.focus(), 0);
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent default newline on Enter
      handleSend();
    }
    // Shift+Enter will create a newline by default
  };

  return (
    // Sticky container with background and safe area padding
    <div 
      className="sticky bottom-0 z-10 bg-gradient-to-t from-background via-background/95 to-background/0 pt-2 pb-2"
      // Apply safe area padding only to the bottom
      style={{ paddingBottom: `calc(0.5rem + var(--safe-area-inset-bottom))` }}
    >
      {/* Centering container */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Input field container */}
        <div className="relative flex items-end bg-input rounded-xl border border-border shadow-sm transition-all duration-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/30">
        {/* Visualization display */}
        <div className="absolute -top-12 left-0 right-0 flex justify-center items-center h-10">
          <div className="flex items-center justify-center px-3 py-1 rounded-full bg-black/60 backdrop-blur-md">
            <AudioVisualizer 
              width={120} 
              height={24}
            />
            <span className="ml-2 text-xs text-white/80">
              <span id={`${chatInputId}-interim`}></span>
              Listening...
            </span>
          </div>
        </div>
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            className="flex-1 bg-transparent resize-none border-none focus:ring-0 outline-none py-3 pl-4 pr-12 text-text placeholder-textSecondary/70 text-base max-h-[128px] font-normal"
            rows={1}
            disabled={isLoading}
            autoComplete="off"
            style={{ scrollbarWidth: 'thin' }}
          />
          {/* Voice & Send buttons */}
          <div className="absolute right-2 bottom-2 flex items-center space-x-2">
            {/* Push-to-talk button */}
            <VoiceButton 
              targetId={chatInputId}
              disabled={isLoading}
            />
            
            {/* Walkie-talkie toggle button */}
            <WalkieToggleButton 
              targetId={chatInputId}
              disabled={isLoading}
            />
            
            {/* Send Button */}
            <button
              onClick={handleSend}
              className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 
                      ${inputValue.trim() && !isLoading 
                        ? 'bg-primary text-white hover:opacity-80 active:scale-95' 
                        : 'bg-input text-textSecondary cursor-not-allowed opacity-60'}`}
              disabled={!inputValue.trim() || isLoading}
              aria-label="Send message"
            >
              <SendHorizonal size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;