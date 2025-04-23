import apiService from './apiService';
import { Message } from '../components/MessageBubble';

interface SendMessageRequest {
  user_id: string;
  message: string;
}

interface SendMessageResponse {
  reply: string;
}

// Generate a UUID v4 (browser-compatible method)
const generateUUID = (): string => {
  // Use the browser's crypto.randomUUID if available
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  
  // Fallback implementation (simplified)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Get or create a user ID from localStorage
const getUserId = (): string => {
  const storageKey = 'fitness_assistant_user_id';
  let userId = localStorage.getItem(storageKey);
  
  if (!userId) {
    userId = generateUUID();
    localStorage.setItem(storageKey, userId);
  }
  
  return userId;
};

class ChatService {
  /**
   * Send a message to the backend
   * @param message The message text to send
   * @returns Promise with the response from the server
   */
  async sendMessage(message: string): Promise<string> {
    try {
      // Get the user ID or generate a new one if it doesn't exist
      const userId = getUserId();
      
      // Create request payload with proper UUID
      const data: SendMessageRequest = { 
        user_id: userId,
        message: message 
      };
      
      // Log what we're sending for debugging
      console.log("Sending to API:", data);
      
      const response = await apiService.post<SendMessageResponse>('/api/send', data);
      
      // Log the response
      console.log("API response:", response);
      
      return response.reply;
    } catch (error) {
      console.error('Failed to send message:', error);
      return 'Sorry, I encountered an error processing your request.';
    }
  }

  /**
   * Format a new message object
   * @param text Message text
   * @param sender Who sent the message ('user' or 'bot')
   * @returns Formatted message object
   */
  createMessage(text: string, sender: 'user' | 'bot'): Message {
    return {
      id: Date.now(),
      text,
      sender,
    };
  }
}

export default new ChatService(); 