export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number; // Optional timestamp
} 