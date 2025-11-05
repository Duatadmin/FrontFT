import { supabase } from '@/lib/supabase';
import type { NutritionAnalysisResponse } from './nutritionAnalysis';

// Interface removed - using direct mapping to match your exact table structure

export const mealService = {
  /**
   * Save a meal to the database
   */
  async saveMeal(
    analysisData: NutritionAnalysisResponse, 
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    userId: string
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      const mealData = {
        user_id: userId,
        image_url: analysisData.photo_url,
        photo_url: analysisData.photo_url, // Your table has both image_url and photo_url
        meal_name: analysisData.name,
        name: analysisData.name, // Your table has both meal_name and name
        calories: analysisData.energy_kcal,
        energy_kcal: analysisData.energy_kcal, // Your table has both calories and energy_kcal
        protein_g: analysisData.macros.protein_g,
        carbs_g: analysisData.macros.carbs_g,
        fat_g: analysisData.macros.fat_g,
        fiber_g: analysisData.macros.fiber_g,
        sugar_g: analysisData.macros.sugar_g,
        sodium_mg: analysisData.macros.sodium_mg,
        meal_type: mealType,
        analysis_date: new Date().toISOString(),
        confidence_score: analysisData.confidence,
        confidence: analysisData.confidence, // Your table has both confidence_score and confidence
        ingredients: analysisData.ingredients,
        recipe_steps: analysisData.recipe_steps,
        daily_goal_pct: analysisData.daily_goal_pct,
        tagline: analysisData.tagline,
        prep_time_min: analysisData.prep_time_min,
        rating: analysisData.rating,
        micros: analysisData.micros,
        macros: analysisData.macros // Store the full macros object in JSONB
      };

      // Insert into meal_images table - let Supabase generate the UUID
      const { data, error } = await supabase
        .from('meal_images')
        .insert([mealData])
        .select()
        .single();

      if (error) {
        console.error('Error saving meal:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in saveMeal:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save meal' 
      };
    }
  },

  /**
   * Get meals for a specific user
   */
  async getUserMeals(
    userId: string, 
    options?: {
      meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      date?: Date;
      limit?: number;
    }
  ): Promise<{ success: boolean; error?: string; data?: any[] }> {
    try {
      let query = supabase
        .from('meal_images')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options?.meal_type) {
        query = query.eq('meal_type', options.meal_type);
      }

      if (options?.date) {
        const startOfDay = new Date(options.date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(options.date);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString());
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching user meals:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error in getUserMeals:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch meals' 
      };
    }
  },

  /**
   * Delete a meal from the database
   */
  async deleteMeal(mealId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('meal_images')
        .delete()
        .eq('id', mealId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting meal:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteMeal:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete meal' 
      };
    }
  }
};