import { useState, useEffect } from 'react';
import ChatLayout from './components/chat/ChatLayout';
import { VoiceProvider } from './hooks/VoiceContext';
import { Message } from './types';
import chatService from './services/chatService';
import { useUserStore } from '@/lib/stores/useUserStore'; // For currentUser selector
import { checkApiStatus } from './services/apiService';
import { useAuthGuard } from './hooks/useAuthGuard';
// import VoiceWidget from './components/VoiceWidget';

function App() {
  useAuthGuard(); // Enforce authentication for this component and its children
  const currentUser = useUserStore((state) => state.user);
  
  // Initialize messages with onboarding plan if available
  const [messages, setMessages] = useState<Message[]>(() => {
    // Check if there's an onboarding plan in sessionStorage
    const storedPlan = sessionStorage.getItem('onboarding_plan');
    
    if (storedPlan) {
      try {
        const planMessage = JSON.parse(storedPlan);
        console.log('[App] Found onboarding plan, displaying it');
        
        // Clear the stored plan so it doesn't show again
        sessionStorage.removeItem('onboarding_plan');
        
        // Return the plan as the first message
        return [{
          id: crypto.randomUUID(),
          content: planMessage.content,
          role: planMessage.role as 'assistant' | 'user' | 'system'
        }];
      } catch (error) {
        console.error('[App] Failed to parse onboarding plan:', error);
      }
    }
    
    // Default welcome message if no plan found
    return [{
      id: 'initial-1',
      content: "Hello! I'm Isinka, your fitness assistant. How can I help you today?",
      role: 'assistant'
    }];
  });
  
  const [isLoading, setIsLoading] = useState(false);

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
    console.log('[App.tsx] handleSendMessage called with content:', content);
    // Check if the content is likely from voice (non-empty and not just whitespace)
    if (content && content.trim().length > 0) {
        console.log('[App.tsx] Content appears valid for new message.');
    }
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      role: 'user'
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);

    if (!currentUser || !currentUser.id) {
      console.error('Cannot send message: User or User ID is not available.');
      setMessages(prevMessages => [...prevMessages, {
        id: `error-no-user-${Date.now()}`,
        content: 'Error: Could not send message. User not identified.',
        role: 'system'
      }]);
      setIsLoading(false);
      return;
    }

    try {
      const assistantMessageContent = await chatService.sendMessage(content, currentUser.id);
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
      <div className="flex flex-col h-lvh text-foreground overflow-hidden">
        <ChatLayout 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading} 
        />
        
        {/* Voice Widget Integration */}
        <div className="fixed bottom-10 right-10 z-10">
            {/* <VoiceWidget onFinalTranscriptCommitted={handleSendMessage} /> */}
        </div>

      </div>
    </VoiceProvider>
  );
}

export default App;