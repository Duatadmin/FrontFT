import React, { useRef, useEffect } from 'react';
import MessageBubble, { Message } from './MessageBubble';

interface ChatWindowProps {
  messages: Message[];
  isLoading?: boolean;
}

const TypingIndicator = () => (
  <div className="flex ml-2 mb-sm">
    <div className="message-bubble message-bubble-bot py-3 px-4">
      <div className="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </div>
);

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading = false }) => {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const containerRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial scroll without animation
  useEffect(() => {
    scrollToBottom('auto');
  }, []);

  return (
    <div ref={containerRef} className="message-container">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      
      {isLoading && <TypingIndicator />}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow; 