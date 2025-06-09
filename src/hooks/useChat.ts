import { useState, useCallback, useEffect } from 'react';
import { Message } from '../types'; // Assuming types.ts is in src/types.ts

export interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
}

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);

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
    }
  }, []);

  // Add an initial system message if desired
  useEffect(() => {
    setMessages([
      {
        id: crypto.randomUUID(),
        role: 'system',
        content: 'Welcome to the chat! Type a message to begin.',
        timestamp: Date.now()
      }
    ]);
  }, []);


  return { messages, isLoading, onSendMessage };
};
