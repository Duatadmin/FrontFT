import { useState, useCallback, useEffect } from 'react';
import { Message } from '../types'; // Assuming types.ts is in src/types.ts

export interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
}

export const useChat = (): UseChatReturn => {
  console.log('[useChat] Hook initialized.');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  console.log('[useChat] Initial isLoading state:', false);

  const onSendMessage = useCallback(async (text: string) => {
    console.log('[useChat] onSendMessage called with text:', text, 'Current isLoading before set:', isLoading);
    if (!text.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    console.log('[useChat] setIsLoading(true) called.');

    // Simulate API call or actual backend interaction for receiving a response
    // For now, let's just add a mock assistant response after a delay
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Echo: ${text}`, // Simple echo response for now
        timestamp: Date.now(),
      };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      console.log('[useChat] Assistant message added.');
    } catch (error) {
      console.error("Error sending message or getting response:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'system',
        content: `Error: Could not get a response. Please try again.`,
        timestamp: Date.now(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      console.log('[useChat] setIsLoading(false) called in finally block.');
    }
  }, []);

  // Check for onboarding plan or add initial message
  useEffect(() => {
    // Check if there's an onboarding plan in sessionStorage
    const storedPlan = sessionStorage.getItem('onboarding_plan');
    
    if (storedPlan) {
      try {
        const planMessage = JSON.parse(storedPlan);
        console.log('[useChat] Found onboarding plan, displaying it');
        
        // Add the plan as the first message
        setMessages([
          {
            id: crypto.randomUUID(),
            role: planMessage.role as 'assistant',
            content: planMessage.content,
            timestamp: planMessage.timestamp
          }
        ]);
        
        // Clear the stored plan so it doesn't show again
        sessionStorage.removeItem('onboarding_plan');
      } catch (error) {
        console.error('[useChat] Failed to parse onboarding plan:', error);
        // Fall back to welcome message
        setMessages([
          {
            id: crypto.randomUUID(),
            role: 'system',
            content: 'Welcome to the chat! Type a message to begin.',
            timestamp: Date.now()
          }
        ]);
      }
    } else {
      // No onboarding plan, show welcome message
      setMessages([
        {
          id: crypto.randomUUID(),
          role: 'system',
          content: 'Welcome to the chat! Type a message to begin.',
          timestamp: Date.now()
        }
      ]);
    }
  }, []);


  return { messages, isLoading, onSendMessage };
};
