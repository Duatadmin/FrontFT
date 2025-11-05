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

  const lastEnqueuedMessageIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (
        lastMessage.role === 'assistant' &&
        lastMessage.content &&
        lastMessage.id !== lastEnqueuedMessageIdRef.current
      ) {
        console.log('[ChatMessages] Enqueueing new assistant message:', lastMessage.id, lastMessage.content.substring(0,30));
        enqueueBotUtterance(lastMessage.content, lastMessage.id);
        lastEnqueuedMessageIdRef.current = lastMessage.id;
      }
    }
  }, [messages, enqueueBotUtterance]);

  return (
    // Apply background, overflow, and smooth scroll
    <div ref={containerRef} className="flex-1 overflow-y-auto scroll-smooth">
      {/* Centering container with max-width and responsive padding */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Spacing between messages */}
        <div className="flex flex-col space-y-4">
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