import React, { useRef, useEffect } from 'react';
import { Message } from '../../types';
import MessageBubble from './MessageBubble';
import { useVoice } from '../../hooks/VoiceContext';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isLoading }) => {
  const { enqueueBotUtterance } = useVoice();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // Use instant scrolling for new messages for a more immediate feel
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant', block: 'end' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    messages.forEach(msg => {
      if (msg.role === 'assistant' && msg.content) {
        enqueueBotUtterance(msg.content, msg.id);
      }
    });
  }, [messages, enqueueBotUtterance]);

  return (
    // Apply background, overflow, and smooth scroll
    <div ref={containerRef} className="flex-1 overflow-y-auto bg-background scroll-smooth">
      {/* Centering container with max-width and responsive padding */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Spacing between messages */}
        <div className="space-y-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          
          {isLoading && (
            <MessageBubble message={{ id: 'loading', role: 'assistant', content: '' }} isLoading={true} />
          )}
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} className="h-0" /> 
        </div>
      </div>
    </div>
  );
};

export default ChatMessages; 