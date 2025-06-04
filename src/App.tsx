import { useState, useEffect } from 'react';
import ChatLayout from './components/chat/ChatLayout';
import { VoiceProvider } from './hooks/VoiceContext';
import { Message } from './types';
import chatService from './services/chatService';
import { checkApiStatus } from './services/apiService';
import SupabaseTest from './SupabaseTest';

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
      // setIsConnected(status); // Removed as isConnected is no longer used
      
      // Add a system message if connection fails
      if (!status) {
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: `error-${Date.now()}`,
            content: "⚠️ Cannot connect to the backend service. Some features might not work properly.",
            role: 'assistant'
          }
        ]);
      }
    };
    
    verifyApiConnection();
  }, []);

  // Handle keyboard visibility
  useEffect(() => {
    function handleResize() {
      // Force repainting to prevent stuck layouts
      document.documentElement.style.height = `${window.innerHeight}px`;
    }

    window.addEventListener('resize', handleResize);
    
    // Initial call
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSendMessage = async (text: string) => {
    // Create and add user message
    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      content: text,
      role: 'user'
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    
    // Show loading state
    setIsLoading(true);
    
    try {
      // Send message to API and get response
      const responseText = await chatService.sendMessage(text);
      
      // Create and add bot message with response
      const newBotMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: responseText,
        role: 'assistant'
      };
      setMessages((prevMessages) => [...prevMessages, newBotMessage]);
    } catch (error) {
      console.error('Error handling message:', error);
      // Add error message if request fails
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant'
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="fixed top-0 right-0 z-50 p-2">
        <button 
          onClick={() => setShowSupabaseTest(!showSupabaseTest)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {showSupabaseTest ? 'Show Chat App' : 'Test Supabase'}
        </button>
      </div>
      
      {showSupabaseTest ? (
        <SupabaseTest />
      ) : (
        <VoiceProvider>
          <ChatLayout
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
          />
        </VoiceProvider>
      )}
    </div>
  );
}

export default App;