import { useState, useEffect } from 'react';
import ChatLayout from './components/chat/ChatLayout';
import { VoiceProvider } from './hooks/VoiceContext';
import { Message } from './types';
import chatService from './services/chatService';
import { checkApiStatus } from './services/apiService';
import SupabaseTest from './SupabaseTest';
import VoiceWidget from './components/VoiceWidget';

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-1',
      content: "Hello! I'm Isinka, your fitness assistant. How can I help you today?",
      role: 'assistant'
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [showSupabaseTest, setShowSupabaseTest] = useState(false);

  // Check API connection on component mount
  useEffect(() => {
    const verifyApiConnection = async () => {
      const status = await checkApiStatus();
      
      // Add a system message if connection fails
      if (!status) {
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: `error-${Date.now()}`,
            content: 'Failed to connect to the API. Please check your connection and try again.',
            role: 'system'
          }
        ]);
      }
    };
    
    verifyApiConnection();
  }, []);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      role: 'user'
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);

    try {
      const assistantMessageContent = await chatService.sendMessage(content);
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: assistantMessageContent,
        role: 'assistant'
      };
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'system'
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    }
    setIsLoading(false);
  };

  return (
    <VoiceProvider>
      <div className="flex flex-col h-screen bg-background text-foreground">
        {/* Button to toggle SupabaseTest component */} 
        <button 
          onClick={() => setShowSupabaseTest(!showSupabaseTest)}
          className="absolute top-4 right-4 bg-primary text-primary-foreground p-2 rounded z-20"
        >
          {showSupabaseTest ? 'Hide' : 'Show'} Supabase Test
        </button>

        {showSupabaseTest && <SupabaseTest />}
        
        <ChatLayout 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading} 
        />
        
        {/* Voice Widget Integration */}
        <div className="fixed bottom-10 right-10 z-10">
            <VoiceWidget onFinalTranscriptCommitted={handleSendMessage} />
        </div>

      </div>
    </VoiceProvider>
  );
}

export default App;