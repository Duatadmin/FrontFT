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

// Onboarding API types
interface OnboardingData {
  goal: string;
  goal_detail: string;
  goal_timeline_weeks: number;
  level: string;
  age: number;
  sex: string;
  height_cm: number;
  weight_kg: number;
  available_days_per_week: number;
  preferred_days: string[];
  session_duration_minutes: number;
  split_preference: string;
  location: string;
  equipment: string[];
  injuries: string;
  sleep_hours_normalized: number;
  baseline_capacity: {
    pushups: number;
    squats: number;
    plank_seconds: number;
  };
  preferences: string;
}

interface OnboardingSubmitRequest {
  user_id: string;
  onboarding_data: OnboardingData;
}

interface OnboardingSubmitResponse {
  success: boolean;
  message: string;
  plan_id?: string;
}

// Submit onboarding data
export const submitOnboarding = async (
  userId: string,
  onboardingData: OnboardingData
): Promise<OnboardingSubmitResponse> => {
  const apiService = new ApiService();
  
  const requestBody: OnboardingSubmitRequest = {
    user_id: userId,
    onboarding_data: onboardingData
  };
  
  return apiService.post<OnboardingSubmitResponse>(
    '/api/v1/onboarding/submit',
    requestBody
  );
}; 