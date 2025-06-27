import React from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { Message } from '../../types';

interface ChatLayoutProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ messages, isLoading, onSendMessage }) => {
  return (
    <div className="flex flex-col h-lvh">
      <ChatHeader />
      <main className="flex-1 overflow-hidden flex flex-col pt-[calc(64px+env(safe-area-inset-top))] pb-32">
        <ChatMessages messages={messages} isLoading={isLoading} />
      </main>
      <ChatInput 
        onSendMessage={onSendMessage} 
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChatLayout; 