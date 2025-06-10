import React from 'react';
import GlassFrame from './GlassFrame';

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex mb-sm ${isUser ? 'justify-end' : 'justify-start'}`}>
      <GlassFrame color={isUser ? '#DFF250' : undefined}>
        <div className="px-4 py-2.5">
          {message.text}
        </div>
      </GlassFrame>
    </div>
  );
};

export default MessageBubble;