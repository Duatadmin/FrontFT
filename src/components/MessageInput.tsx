import React, { useState, useRef, useEffect } from 'react';
import { SendIcon } from 'lucide-react';

// Custom paper airplane style icon
const PaperAirplaneIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    width="20" 
    height="20"
  >
    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
  </svg>
);

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading = false }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when component mounts
  useEffect(() => {
    // Add a small delay to ensure proper focusing
    const timer = setTimeout(() => {
      if (inputRef.current && !isLoading) {
        inputRef.current.focus();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="input-container">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="flex-1 px-sm py-3 min-h-[48px] bg-transparent border border-accent/30 rounded-full focus:outline-none focus:border-accent mr-sm text-sm text-text backdrop-blur-[30px]"
        disabled={isLoading}
        autoCapitalize="sentences"
        autoComplete="off"
        enterKeyHint="send"
      />
      <button
        onClick={handleSend}
        className="p-3 min-h-[48px] min-w-[48px] flex items-center justify-center bg-accent text-text rounded-full hover:shadow-accent-glow transition-all duration-200 disabled:opacity-50"
        disabled={!inputValue.trim() || isLoading}
        aria-label="Send message"
      >
        {isLoading ? (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        ) : (
          <PaperAirplaneIcon />
        )}
      </button>
    </div>
  );
};

export default MessageInput; 