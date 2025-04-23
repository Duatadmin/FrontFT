import React from 'react';

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
      <div
        className={`message-bubble ${isUser ? 'message-bubble-user' : 'message-bubble-bot'}`}
      >
        {message.text}
      </div>
    </div>
  );
};

export default MessageBubble; 