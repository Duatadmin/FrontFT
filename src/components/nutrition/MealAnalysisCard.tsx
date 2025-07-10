import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { 
  Clock, 
  Star, 
  Info, 
  ChevronDown, 
  ChevronUp,
  Coffee,
  Sun,
  Sunset,
  Apple,
  AlertCircle
} from 'lucide-react';
import type { NutritionAnalysisResponse } from '@/services/nutritionAnalysis';

interface MealAnalysisCardProps {
  data: NutritionAnalysisResponse;
  onClose?: () => void;
}

export const MealAnalysisCard: React.FC<MealAnalysisCardProps> = ({ data, onClose }) => {
  const [showIngredients, setShowIngredients] = useState(true);
  const [showRecipe, setShowRecipe] = useState(false);
  const [showMicros, setShowMicros] = useState(false);

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return <Coffee className="w-4 h-4" />;
      case 'lunch': return <Sun className="w-4 h-4" />;
      case 'dinner': return <Sunset className="w-4 h-4" />;
      case 'snack': return <Apple className="w-4 h-4" />;
      default: return null;
    }
  };

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'lunch': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'dinner': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'snack': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatMicroName = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/mg|g|iu/g, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();
  };

  const formatMicroValue = (key: string, value: any): string => {
    if (key.includes('_mg')) return `${value} mg`;
    if (key.includes('_g')) return `${value} g`;
    if (key.includes('_iu')) return `${value} IU`;
    return String(value);
  };

  return (
    <Card className="w-full bg-background-primary border-white/10 overflow-hidden">
      {/* Photo */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img 
          src={data.photo_url} 
          alt={data.name}
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background-primary to-transparent" />
      </div>

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                {data.name}
                {data.confidence < 0.8 && (
                  <span className="text-sm font-normal text-yellow-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    <span title="These values are estimates">≈</span>
                  </span>
                )}
              </h2>
              <p className="text-sm text-gray-400 mt-1">{data.tagline}</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            )}
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${getMealTypeColor(data.meal_type)}`}>
              {getMealIcon(data.meal_type)}
              <span className="capitalize">{data.meal_type}</span>
            </span>
            {data.prep_time_min > 0 && (
              <span className="flex items-center gap-1.5 text-gray-400">
                <Clock className="w-4 h-4" />
                {data.prep_time_min} min
              </span>
            )}
            {data.rating > 0 && (
              <span className="flex items-center gap-1.5 text-gray-400">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                {data.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {/* Calories and Macros */}
        <div className="space-y-4">
          {/* Big calorie display */}
          <div className="text-center py-4 bg-white/5 rounded-lg">
            <p className="text-4xl font-bold text-white">{data.energy_kcal}</p>
            <p className="text-sm text-gray-400">calories</p>
            {data.daily_goal_pct.kcal > 0 && (
              <p className="text-xs text-gray-500 mt-1">{data.daily_goal_pct.kcal}% of daily goal</p>
            )}
          </div>

          {/* Macro bars */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-gray-400">Protein</span>
                <span className="text-sm font-semibold text-white">{data.macros.protein_g}g</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${Math.min(data.daily_goal_pct.protein, 100)}%` }}
                />
              </div>
              {data.daily_goal_pct.protein > 0 && (
                <p className="text-xs text-gray-500">{data.daily_goal_pct.protein}% daily</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-gray-400">Carbs</span>
                <span className="text-sm font-semibold text-white">{data.macros.carbs_g}g</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 transition-all duration-500"
                  style={{ width: `${Math.min(data.daily_goal_pct.carbs, 100)}%` }}
                />
              </div>
              {data.daily_goal_pct.carbs > 0 && (
                <p className="text-xs text-gray-500">{data.daily_goal_pct.carbs}% daily</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-gray-400">Fat</span>
                <span className="text-sm font-semibold text-white">{data.macros.fat_g}g</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 transition-all duration-500"
                  style={{ width: `${Math.min(data.daily_goal_pct.fat, 100)}%` }}
                />
              </div>
              {data.daily_goal_pct.fat > 0 && (
                <p className="text-xs text-gray-500">{data.daily_goal_pct.fat}% daily</p>
              )}
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="space-y-3">
          <button
            onClick={() => setShowIngredients(!showIngredients)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-lg font-semibold text-white">Ingredients</h3>
            {showIngredients ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {showIngredients && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.ingredients.map((ingredient, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                >
                  <span className="text-sm text-white">{ingredient.name}</span>
                  <span className="text-sm text-gray-400">
                    {ingredient.qty}{ingredient.unit ? ` ${ingredient.unit}` : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recipe (if available) */}
        {data.recipe_steps.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => setShowRecipe(!showRecipe)}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-lg font-semibold text-white">Recipe</h3>
              {showRecipe ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {showRecipe && (
              <ol className="space-y-2">
                {data.recipe_steps.map((step, index) => (
                  <li key={index} className="flex gap-3 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 bg-accent-lime/20 text-accent-lime rounded-full flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </span>
                    <span className="text-gray-300">{step}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        {/* Micronutrients */}
        {Object.keys(data.micros).length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => setShowMicros(!showMicros)}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-lg font-semibold text-white">Nutrition Details</h3>
              {showMicros ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {showMicros && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(data.micros).map(([key, value]) => (
                  <div key={key} className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400">{formatMicroName(key)}</p>
                    <p className="text-sm font-semibold text-white mt-1">
                      {formatMicroValue(key, value)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Low confidence warning */}
        {data.confidence < 0.8 && (
          <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <Info className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-yellow-400">Estimated Values</p>
              <p className="text-xs text-yellow-400/80">
                The nutritional information shown is an estimate based on visual analysis. 
                Actual values may vary.
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};