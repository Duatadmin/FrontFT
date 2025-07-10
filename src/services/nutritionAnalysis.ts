// Nutrition Analysis API Service
interface NutritionAnalysisRequest {
  image_url: string;
  prompt_version?: string;
}

interface Ingredient {
  qty: string;
  unit?: string;
  name: string;
}

interface Macros {
  protein_g: number;
  fat_g: number;
  carbs_g: number;
}

interface DailyGoalPercentage {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionAnalysisResponse {
  dish_id: string;
  name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  tagline: string;
  prep_time_min: number;
  rating: number;
  energy_kcal: number;
  ingredients: Ingredient[];
  macros: Macros;
  daily_goal_pct: DailyGoalPercentage;
  micros: Record<string, any>;
  recipe_steps: string[];
  confidence: number;
  photo_url: string;
}

interface ErrorResponse {
  error: string;
  message: string;
}

class NutritionAnalysisService {
  private static instance: NutritionAnalysisService;
  private baseUrl: string;

  private constructor() {
    // Use environment variable or default to production URL
    this.baseUrl = import.meta.env.VITE_NUTRITION_API_URL || 'https://nutritionservicev2-production.up.railway.app';
  }

  static getInstance(): NutritionAnalysisService {
    if (!NutritionAnalysisService.instance) {
      NutritionAnalysisService.instance = new NutritionAnalysisService();
    }
    return NutritionAnalysisService.instance;
  }

  async analyzePhoto(imageUrl: string): Promise<NutritionAnalysisResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/photo/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageUrl,
          prompt_version: 'v1',
        }),
      });

      if (!response.ok) {
        const error: ErrorResponse = await response.json().catch(() => ({
          error: 'unknown_error',
          message: 'Failed to analyze photo',
        }));
        
        // Handle specific error cases
        switch (response.status) {
          case 400:
            throw new Error('Invalid image URL. Please try again.');
          case 404:
            throw new Error('Unable to access the image. Please try again.');
          case 408:
            throw new Error('Analysis timed out. Please try again.');
          case 422:
            throw new Error('Unable to process the image. Please try a different photo.');
          case 500:
          case 502:
            throw new Error('Server error. Please try again later.');
          default:
            throw new Error(error.message || 'Failed to analyze photo');
        }
      }

      const data: NutritionAnalysisResponse = await response.json();
      return data;
    } catch (error) {
      // Re-throw if it's already a formatted error
      if (error instanceof Error) {
        throw error;
      }
      
      // Handle network errors
      throw new Error('Network error. Please check your connection and try again.');
    }
  }
}

// Export singleton instance
export const nutritionAnalysisService = NutritionAnalysisService.getInstance();

// Storage for meal history
const MEAL_HISTORY_KEY = 'meal_analysis_history';
const MAX_HISTORY_ITEMS = 10;

export interface MealHistoryItem extends NutritionAnalysisResponse {
  analyzed_at: string;
  id: string;
}

export const mealHistoryStorage = {
  save(analysis: NutritionAnalysisResponse): void {
    try {
      const history = this.getAll();
      const newItem: MealHistoryItem = {
        ...analysis,
        analyzed_at: new Date().toISOString(),
        id: `meal_${Date.now()}`,
      };
      
      // Add to beginning and limit size
      const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(MEAL_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to save meal history:', error);
    }
  },

  getAll(): MealHistoryItem[] {
    try {
      const stored = localStorage.getItem(MEAL_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load meal history:', error);
      return [];
    }
  },

  getById(id: string): MealHistoryItem | null {
    const history = this.getAll();
    return history.find(item => item.id === id) || null;
  },

  clear(): void {
    localStorage.removeItem(MEAL_HISTORY_KEY);
  },
};