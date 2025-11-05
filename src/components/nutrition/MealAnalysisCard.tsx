import React, { useState } from 'react';
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
  AlertCircle,
  X
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
    <div className="w-full max-w-2xl mx-auto">
      {/* Glassmorphic card container */}
      <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl shadow-black/20 overflow-hidden">
        {/* Close button - moved to top level */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/20 hover:bg-black/50 flex items-center justify-center transition-all z-50"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        )}
        
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-lime/10 via-transparent to-accent-orange/10 pointer-events-none" />
        
        {/* Photo Section with better aspect ratio */}
        <div className="relative h-[400px] sm:h-[500px] overflow-hidden">
          <img 
            src={data.photo_url} 
            alt={data.name}
            className="w-full h-full object-cover"
          />
          
          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Floating header info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="space-y-3">
              {/* Meal type badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                {getMealIcon(data.meal_type)}
                <span className="text-sm font-medium text-white capitalize">{data.meal_type}</span>
              </div>
              
              {/* Title and tagline */}
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-3">
                  {data.name}
                  {data.confidence < 0.8 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 backdrop-blur-sm rounded-full text-sm font-normal text-yellow-300 border border-yellow-500/30">
                      <AlertCircle className="w-3 h-3" />
                      <span title="These values are estimates">Estimate</span>
                    </span>
                  )}
                </h2>
                <p className="text-white/80 mt-2">{data.tagline}</p>
              </div>
              
              {/* Meta info row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                {data.prep_time_min > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {data.prep_time_min} min
                  </span>
                )}
                {data.rating > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    {data.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Calories - Hero Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-lime/20 to-accent-orange/20 backdrop-blur-sm border border-white/10 p-6 text-center">
            <div className="relative z-10">
              <p className="text-5xl sm:text-6xl font-bold text-white mb-2">{data.energy_kcal}</p>
              <p className="text-white/80 font-medium">calories</p>
              {data.daily_goal_pct.kcal > 0 && (
                <p className="text-sm text-white/60 mt-2">{data.daily_goal_pct.kcal}% of daily goal</p>
              )}
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full blur-xl" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-accent-lime/10 rounded-full blur-2xl" />
          </div>

          {/* Macros - Modern Cards */}
          <div className="grid grid-cols-3 gap-3">
            {/* Protein */}
            <div className="relative overflow-hidden rounded-xl bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-300">Protein</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-300">P</span>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{data.macros.protein_g}g</p>
                  {data.daily_goal_pct.protein > 0 && (
                    <p className="text-xs text-blue-300/80 mt-1">{data.daily_goal_pct.protein}% daily</p>
                  )}
                </div>
                {/* Progress bar */}
                <div className="h-1.5 bg-blue-500/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-700 rounded-full"
                    style={{ width: `${Math.min(data.daily_goal_pct.protein, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Carbs */}
            <div className="relative overflow-hidden rounded-xl bg-orange-500/10 backdrop-blur-sm border border-orange-500/20 p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-orange-300">Carbs</span>
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-orange-300">C</span>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{data.macros.carbs_g}g</p>
                  {data.daily_goal_pct.carbs > 0 && (
                    <p className="text-xs text-orange-300/80 mt-1">{data.daily_goal_pct.carbs}% daily</p>
                  )}
                </div>
                {/* Progress bar */}
                <div className="h-1.5 bg-orange-500/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-700 rounded-full"
                    style={{ width: `${Math.min(data.daily_goal_pct.carbs, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Fat */}
            <div className="relative overflow-hidden rounded-xl bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/20 p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-yellow-300">Fat</span>
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-yellow-300">F</span>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{data.macros.fat_g}g</p>
                  {data.daily_goal_pct.fat > 0 && (
                    <p className="text-xs text-yellow-300/80 mt-1">{data.daily_goal_pct.fat}% daily</p>
                  )}
                </div>
                {/* Progress bar */}
                <div className="h-1.5 bg-yellow-500/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-700 rounded-full"
                    style={{ width: `${Math.min(data.daily_goal_pct.fat, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
            <button
              onClick={() => setShowIngredients(!showIngredients)}
              className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent-lime/20 flex items-center justify-center">
                  <Apple className="w-4 h-4 text-accent-lime" />
                </div>
                Ingredients
              </h3>
              {showIngredients ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {showIngredients && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {data.ingredients.map((ingredient, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/5 hover:bg-white/10 transition-colors"
                    >
                      <span className="text-sm text-white font-medium">{ingredient.name}</span>
                      <span className="text-sm text-white/60">
                        {ingredient.qty}{ingredient.unit ? ` ${ingredient.unit}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recipe (if available) */}
          {data.recipe_steps.length > 0 && (
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
              <button
                onClick={() => setShowRecipe(!showRecipe)}
                className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors"
              >
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <span className="text-sm">👨‍🍳</span>
                  </div>
                  Recipe
                </h3>
                {showRecipe ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {showRecipe && (
                <div className="px-4 pb-4">
                  <ol className="space-y-3">
                    {data.recipe_steps.map((step, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-accent-lime to-accent-orange rounded-lg flex items-center justify-center text-xs font-bold text-dark-bg">
                          {index + 1}
                        </span>
                        <span className="text-sm text-white/80 leading-relaxed pt-1">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Micronutrients */}
          {Object.keys(data.micros).length > 0 && (
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
              <button
                onClick={() => setShowMicros(!showMicros)}
                className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors"
              >
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <span className="text-sm">🌿</span>
                  </div>
                  Nutrition Details
                </h3>
                {showMicros ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {showMicros && (
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(data.micros).map(([key, value]) => (
                      <div key={key} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/5 p-3 hover:bg-white/10 transition-colors">
                        <p className="text-xs text-white/60 font-medium">{formatMicroName(key)}</p>
                        <p className="text-base font-bold text-white mt-1">
                          {formatMicroValue(key, value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Low confidence warning */}
          {data.confidence < 0.8 && (
            <div className="rounded-2xl bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/20 p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <Info className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-yellow-400">Estimated Values</p>
                  <p className="text-xs text-yellow-400/80 leading-relaxed">
                    The nutritional information shown is an estimate based on visual analysis. 
                    Actual values may vary depending on preparation methods and portion sizes.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};