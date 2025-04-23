/**
 * Base API service for handling HTTP requests
 */

// Default API URL to Railway backend
const API_URL = 'https://whatsapp-bot-production-ea3b.up.railway.app';

interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

class ApiService {
  async fetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    const config: RequestInit = {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    };

    try {
      console.log(`API Request to ${url}:`, {
        method: config.method,
        body: options.body,
      });
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Get more detailed error information if available
        let errorMessage = `API error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = `API error: ${response.status} - ${JSON.stringify(errorData)}`;
        } catch (e) {
          // If response can't be parsed as JSON, use text content
          try {
            const errorText = await response.text();
            errorMessage = `API error: ${response.status} - ${errorText}`;
          } catch (textError) {
            // If text extraction fails, stick with the basic error
          }
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
  
  get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.fetch<T>(endpoint, { headers });
  }
  
  post<T>(endpoint: string, data: any, headers?: Record<string, string>): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: data,
      headers,
    });
  }
}

export default new ApiService();

// Add a health check function to the exported object
export const checkApiStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/api/ping`);
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}; 