import React, { useState, useCallback } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { Message } from '../../types';

interface ChatLayoutProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onNewAssistantMessage?: (message: Message) => void;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ messages, isLoading, onSendMessage, onNewAssistantMessage }) => {
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  
  const handleTtsPlaybackStart = useCallback(() => {
    setIsTtsPlaying(true);
  }, []);
  
  const handleTtsPlaybackEnd = useCallback(() => {
    setIsTtsPlaying(false);
  }, []);
  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader />
      <main className="flex-1 overflow-hidden flex flex-col pt-[calc(64px+env(safe-area-inset-top))]">
        <ChatMessages messages={messages} isLoading={isLoading} />
      </main>
      <ChatInput 
        onSendMessage={onSendMessage} 
        isLoading={isLoading} 
        onTtsPlaybackStart={handleTtsPlaybackStart}
        onTtsPlaybackEnd={handleTtsPlaybackEnd}
      />
    </div>
  );
};

export default ChatLayout; 