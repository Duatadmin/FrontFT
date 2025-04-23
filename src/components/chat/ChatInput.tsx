import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { SendHorizonal } from 'lucide-react'; // Using lucide-react for icons

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
          {/* Send Button */}
          <button
            onClick={handleSend}
            className={`absolute right-2 bottom-2 flex items-center justify-center p-2 rounded-lg transition-all duration-200 
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
  );
};

export default ChatInput; 