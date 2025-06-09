import React from 'react';
import ChatLayout from '../components/chat/ChatLayout'; // Adjust path as needed
import { useChat } from '../hooks/useChat';           // Adjust path as needed

const ChatPageWrapper: React.FC = () => {
  const { messages, isLoading, onSendMessage } = useChat();

  return (
    <ChatLayout
      messages={messages}
      isLoading={isLoading}
      onSendMessage={onSendMessage}
    />
  );
};

export default ChatPageWrapper;
