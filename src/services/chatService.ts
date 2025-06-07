import apiService from './apiService';
import { Message } from '../components/MessageBubble';

interface SendMessageRequest {
  user_id: string;
  message: string;
}

interface SendMessageResponse {
  reply: string;
}

class ChatService {
  /**
   * Send a message to the backend
   * @param message The message text to send
   * @param userId The authenticated Supabase user's ID
   * @returns Promise with the response from the server
   */
  async sendMessage(message: string, userId: string): Promise<string> {
    if (!userId) {
      console.error('sendMessage called without a userId.');
      throw new Error('User ID is required to send a message.');
    }
    try {
      const requestData: SendMessageRequest = { user_id: userId, message };
      const response = await apiService.post<SendMessageResponse>('/chat/send_message', requestData);
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