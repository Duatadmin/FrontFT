import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { 
  Plus, 
  Search, 
  Calendar,
  Target,
  Flame,
  Droplet,
  Activity,
  TrendingUp,
  Coffee,
  Sun,
  Sunset,
  Moon,
  Apple,
  BarChart3,
  Info,
  Camera,
  Barcode,
  ChevronRight,
  Clock,
  Star,
  X,
  Loader2,
  History
} from 'lucide-react';
import { toast } from '@/lib/utils/toast';
import { CameraCapture } from '@/components/nutrition/CameraCapture';
import { cloudflareUpload } from '@/services/cloudflareUpload';
import { nutritionAnalysisService, mealHistoryStorage, type NutritionAnalysisResponse } from '@/services/nutritionAnalysis';
import { MealAnalysisCard } from '@/components/nutrition/MealAnalysisCard';
import { Confetti } from '@/components/ui/Confetti';

interface NutrientGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}

interface NutrientProgress {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}

interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  isFavorite?: boolean;
}

interface MealEntry {
  id: string;
  foodItem: FoodItem;
  quantity: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp: Date;
}

const Nutrition: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddFood, setShowAddFood] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<NutritionAnalysisResponse | null>(null);
  const [showMealCard, setShowMealCard] = useState(false);
  const [mealHistory, setMealHistory] = useState(mealHistoryStorage.getAll());
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentCaption, setCurrentCaption] = useState('');
  const [currentFunFact, setCurrentFunFact] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Mock data - in real app, this would come from API/database
  const [goals] = useState<NutrientGoals>({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
    water: 8
  });

  // Personalized captions for analysis
  const analysisCaption = [
    `Finding proteins for your +${goals.protein}g/day target...`,
    'Calculating precise macro ratios...',
    'Checking micronutrient density...',
    'Analyzing portion sizes...',
    'Identifying fresh ingredients...',
    'Measuring calorie content...',
    'Detecting cooking methods...',
    'Evaluating nutritional balance...',
    'Comparing to your daily goals...',
    'Finalizing nutrition insights...'
  ];

  // Fun facts to show during analysis
  const funFacts = [
    '💡 Did you know? Taking photos of your meals can increase dietary awareness by up to 50%',
    '🥗 Colorful plates often mean more diverse nutrients and antioxidants',
    '🧠 Your brain uses about 20% of your daily calorie intake',
    '💪 Protein helps preserve muscle mass during weight loss',
    '🌊 Staying hydrated can boost your metabolism by up to 30%',
    '🍎 Fiber-rich foods help you feel fuller for longer',
    '⚡ Small, frequent meals can help maintain stable energy levels',
    '🌙 Quality sleep is crucial for healthy metabolism'
  ];

  const [progress, setProgress] = useState<NutrientProgress>({
    calories: 1245,
    protein: 78,
    carbs: 142,
    fat: 35,
    water: 5
  });

  const [todaysMeals, setTodaysMeals] = useState<MealEntry[]>([
    {
      id: '1',
      foodItem: {
        id: 'f1',
        name: 'Scrambled Eggs',
        calories: 180,
        protein: 13,
        carbs: 2,
        fat: 14,
        serving: '2 large eggs',
        isFavorite: true
      },
      quantity: 1,
      mealType: 'breakfast',
      timestamp: new Date()
    },
    {
      id: '2',
      foodItem: {
        id: 'f2',
        name: 'Whole Wheat Toast',
        calories: 80,
        protein: 3,
        carbs: 15,
        fat: 1,
        serving: '1 slice'
      },
      quantity: 2,
      mealType: 'breakfast',
      timestamp: new Date()
    }
  ]);

  const [recentFoods] = useState<FoodItem[]>([
    {
      id: 'r1',
      name: 'Chicken Breast',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      serving: '100g',
      isFavorite: true
    },
    {
      id: 'r2',
      name: 'Brown Rice',
      calories: 216,
      protein: 5,
      carbs: 45,
      fat: 1.8,
      serving: '1 cup cooked'
    },
    {
      id: 'r3',
      name: 'Greek Yogurt',
      brand: 'Chobani',
      calories: 100,
      protein: 18,
      carbs: 7,
      fat: 0,
      serving: '170g container'
    }
  ]);

  const getProgressPercentage = (consumed: number, goal: number) => {
    return Math.min((consumed / goal) * 100, 100);
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return <Coffee size={16} />;
      case 'lunch': return <Sun size={16} />;
      case 'dinner': return <Sunset size={16} />;
      case 'snack': return <Apple size={16} />;
      default: return <Moon size={16} />;
    }
  };

  const getMealCalories = (mealType: string) => {
    return todaysMeals
      .filter(meal => meal.mealType === mealType)
      .reduce((sum, meal) => sum + (meal.foodItem.calories * meal.quantity), 0);
  };

  const handleAddFood = (food: FoodItem, quantity: number) => {
    const newEntry: MealEntry = {
      id: Date.now().toString(),
      foodItem: food,
      quantity,
      mealType: selectedMealType,
      timestamp: new Date()
    };
    
    setTodaysMeals([...todaysMeals, newEntry]);
    setShowAddFood(false);
    
    // Update progress
    setProgress({
      calories: progress.calories + (food.calories * quantity),
      protein: progress.protein + (food.protein * quantity),
      carbs: progress.carbs + (food.carbs * quantity),
      fat: progress.fat + (food.fat * quantity),
      water: progress.water
    });
    
    toast.success(`Added ${food.name} to ${selectedMealType}`);
  };

  const handleDeleteMeal = (mealId: string) => {
    const meal = todaysMeals.find(m => m.id === mealId);
    if (!meal) return;
    
    setTodaysMeals(todaysMeals.filter(m => m.id !== mealId));
    
    // Update progress
    setProgress({
      calories: progress.calories - (meal.foodItem.calories * meal.quantity),
      protein: progress.protein - (meal.foodItem.protein * meal.quantity),
      carbs: progress.carbs - (meal.foodItem.carbs * meal.quantity),
      fat: progress.fat - (meal.foodItem.fat * meal.quantity),
      water: progress.water
    });
    
    toast.success('Meal removed');
  };

  const handleCameraCapture = async (file: File) => {
    setIsUploading(true);
    
    try {
      // Upload via server endpoint to avoid CORS issues
      const result = await cloudflareUpload.uploadViaServer(file);
      
      if (result.success && result.imageUrl) {
        // Close camera modal
        setShowCamera(false);
        
        // Start analyzing the image
        setIsAnalyzing(true);
        setAnalysisProgress(0);
        setCurrentCaption(analysisCaption[0]);
        setCurrentFunFact(funFacts[0]);
        
        // Start progress simulation
        const startTime = Date.now();
        const expectedDuration = 25000; // 25 seconds
        
        const progressInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min((elapsed / expectedDuration) * 100, 99);
          setAnalysisProgress(progress);
          
          // Update caption every 2.5 seconds
          const captionIndex = Math.floor((elapsed / 2500) % analysisCaption.length);
          setCurrentCaption(analysisCaption[captionIndex]);
          
          // Update fun fact every 5 seconds
          const funFactIndex = Math.floor((elapsed / 5000) % funFacts.length);
          setCurrentFunFact(funFacts[funFactIndex]);
        }, 100);
        
        try {
          const analysisData = await nutritionAnalysisService.analyzePhoto(result.imageUrl);
          
          // Ensure we show 100% completion
          clearInterval(progressInterval);
          setAnalysisProgress(100);
          
          // Save to history
          mealHistoryStorage.save(analysisData);
          
          // Update local state
          setMealHistory(mealHistoryStorage.getAll());
          
          // Show the meal card with celebration
          setAnalysisResult(analysisData);
          setShowMealCard(true);
          
          // Trigger confetti
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
          
          // Optional: Add haptic feedback if available
          if ('vibrate' in navigator) {
            navigator.vibrate(50);
          }
          
          toast.success('Meal analyzed successfully!');
        } catch (analysisError) {
          clearInterval(progressInterval);
          console.error('Analysis error:', analysisError);
          toast.error(
            analysisError instanceof Error 
              ? analysisError.message 
              : 'Couldn\'t analyze the photo. Please try again.'
          );
        } finally {
          setIsAnalyzing(false);
          setAnalysisProgress(0);
          setCurrentCaption('');
          setCurrentFunFact('');
        }
      } else {
        toast.error(result.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseMealCard = () => {
    setShowMealCard(false);
    setAnalysisResult(null);
  };

  const handleOpenFromHistory = (historyItem: any) => {
    setAnalysisResult(historyItem);
    setShowMealCard(true);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-20 sm:pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Nutrition Tracker</h1>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex-1 sm:flex-initial">
              <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="text-xs sm:text-sm">{selectedDate.toLocaleDateString()}</span>
            </button>
            <button
              onClick={() => navigate('/nutrition/goals')}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-accent-lime/20 hover:bg-accent-lime/30 text-accent-lime rounded-lg transition-colors flex-1 sm:flex-initial"
            >
              <Target size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="text-xs sm:text-sm">Goals</span>
            </button>
          </div>
        </div>

        {/* Camera Feature Highlight */}
        <Card className="p-4 sm:p-6 bg-gradient-to-r from-accent-lime/20 to-accent-orange/20 backdrop-blur-md border-accent-lime/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 text-center sm:text-left">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent-lime/30 flex items-center justify-center flex-shrink-0">
                <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-accent-lime" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white">Snap & Know Your Meal</h3>
                <p className="text-xs sm:text-sm text-white/70">Take a photo for instant nutrition analysis</p>
              </div>
            </div>
            <button
              onClick={() => setShowCamera(true)}
              className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-gradient-to-r from-accent-lime to-accent-orange rounded-lg text-dark-bg font-medium hover:shadow-lg hover:shadow-accent-lime/25 transition-all"
            >
              Try Now
            </button>
          </div>
        </Card>

        {/* Daily Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Calorie Summary */}
          <Card className="p-4 sm:p-6 bg-white/5 backdrop-blur-md border-white/10 lg:col-span-2">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Today's Progress</h2>
                <span className="text-sm text-gray-400">
                  {goals.calories - progress.calories} cal remaining
                </span>
              </div>
              
              {/* Calorie Ring */}
              <div className="flex items-center justify-center py-2 sm:py-4">
                <div className="relative w-40 h-40 sm:w-48 sm:h-48">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-gray-700"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 80}`}
                      strokeDashoffset={`${2 * Math.PI * 80 * (1 - getProgressPercentage(progress.calories, goals.calories) / 100)}`}
                      className="text-accent-lime transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-2xl sm:text-3xl font-bold text-white">{progress.calories}</p>
                    <p className="text-xs sm:text-sm text-gray-400">of {goals.calories} cal</p>
                  </div>
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-400">Protein</p>
                  <p className="text-base sm:text-lg font-semibold text-white">{progress.protein}g</p>
                  <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${getProgressPercentage(progress.protein, goals.protein)}%` }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-400">Carbs</p>
                  <p className="text-base sm:text-lg font-semibold text-white">{progress.carbs}g</p>
                  <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 transition-all duration-500"
                      style={{ width: `${getProgressPercentage(progress.carbs, goals.carbs)}%` }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-400">Fat</p>
                  <p className="text-base sm:text-lg font-semibold text-white">{progress.fat}g</p>
                  <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 transition-all duration-500"
                      style={{ width: `${getProgressPercentage(progress.fat, goals.fat)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-3 sm:space-y-4">
            <Card className="p-3 sm:p-4 bg-white/5 backdrop-blur-md border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg">
                    <Droplet className="text-blue-400 w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400">Water</p>
                    <p className="text-sm sm:text-lg font-semibold text-white">{progress.water} / {goals.water} glasses</p>
                  </div>
                </div>
                <button className="text-accent-lime hover:text-accent-lime/80">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </Card>

            <Card className="p-3 sm:p-4 bg-white/5 backdrop-blur-md border-white/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-orange-500/20 rounded-lg">
                  <Activity className="text-orange-400 w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Exercise</p>
                  <p className="text-sm sm:text-lg font-semibold text-white">320 cal burned</p>
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4 bg-white/5 backdrop-blur-md border-white/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="text-green-400 w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Weekly Avg</p>
                  <p className="text-sm sm:text-lg font-semibold text-white">1,850 cal</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Meals Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Today's Meals */}
          <Card className="p-4 sm:p-6 bg-white/5 backdrop-blur-md border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Today's Meals</h2>
              <button
                onClick={() => navigate('/nutrition/history')}
                className="text-accent-lime hover:text-accent-lime/80 text-sm"
              >
                View History
              </button>
            </div>

            <div className="space-y-4">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => (
                <div key={mealType} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getMealIcon(mealType)}
                      <h3 className="text-sm font-medium text-gray-300 capitalize">{mealType}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">{getMealCalories(mealType)} cal</span>
                      <button
                        onClick={() => {
                          setSelectedMealType(mealType as any);
                          setShowAddFood(true);
                        }}
                        className="text-accent-lime hover:text-accent-lime/80"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {todaysMeals
                      .filter(meal => meal.mealType === mealType)
                      .map(meal => (
                        <div
                          key={meal.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 group"
                        >
                          <div className="flex-1">
                            <p className="text-sm text-white">{meal.foodItem.name}</p>
                            <p className="text-xs text-gray-500">
                              {meal.quantity > 1 ? `${meal.quantity} × ` : ''}{meal.foodItem.serving} • {meal.foodItem.calories * meal.quantity} cal
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteMeal(meal.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    {todaysMeals.filter(meal => meal.mealType === mealType).length === 0 && (
                      <p className="text-sm text-gray-600 italic">No items added</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Add */}
          <div className="space-y-4">
            <Card className="p-4 sm:p-6 bg-white/5 backdrop-blur-md border-white/10">
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Quick Add</h2>
              
              <div className="mb-4">
                <button
                  onClick={() => setShowAddFood(true)}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-accent-lime/20 hover:bg-accent-lime/30 text-accent-lime rounded-lg transition-colors"
                >
                  <Search size={18} />
                  <span className="text-sm">Search Food</span>
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-400">Recent Foods</h3>
                {recentFoods.map(food => (
                  <button
                    key={food.id}
                    onClick={() => handleAddFood(food, 1)}
                    className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {food.isFavorite && <Star size={14} className="text-yellow-500" />}
                      <div className="text-left">
                        <p className="text-sm text-white">{food.name}</p>
                        <p className="text-xs text-gray-500">{food.brand || food.serving} • {food.calories} cal</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400" />
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-white/5 backdrop-blur-md border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Nutrition Insights</h3>
                <Info size={16} className="text-gray-400" />
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-400">Great protein intake today! You're on track to meet your daily goal.</p>
                </div>
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-400">Consider adding more vegetables to increase fiber intake.</p>
                </div>
              </div>
            </Card>

            {/* Meal History */}
            {mealHistory.length > 0 && (
              <Card className="p-4 sm:p-6 bg-white/5 backdrop-blur-md border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <History size={18} className="text-gray-400" />
                  <h3 className="text-lg font-medium text-white">Recent Analyses</h3>
                </div>
                <div className="space-y-2">
                  {mealHistory.slice(0, 3).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleOpenFromHistory(item)}
                      className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
                    >
                      <img
                        src={item.photo_url}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-white">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.energy_kcal} cal • {new Date(item.analyzed_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400" />
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Add Food Modal */}
        {showAddFood && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <Card className="w-full max-w-2xl p-6 bg-background-primary border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Add Food</h2>
                <button
                  onClick={() => setShowAddFood(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search for food..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-lime/50"
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentFoods.map(food => (
                  <button
                    key={food.id}
                    onClick={() => handleAddFood(food, 1)}
                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <div className="text-left">
                      <p className="text-white font-medium">{food.name}</p>
                      <p className="text-sm text-gray-400">{food.brand || food.serving}</p>
                      <div className="flex gap-4 mt-1">
                        <span className="text-xs text-gray-500">{food.calories} cal</span>
                        <span className="text-xs text-gray-500">P: {food.protein}g</span>
                        <span className="text-xs text-gray-500">C: {food.carbs}g</span>
                        <span className="text-xs text-gray-500">F: {food.fat}g</span>
                      </div>
                    </div>
                    <Plus size={20} className="text-accent-lime" />
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Modals - Outside of main container to avoid layout issues */}
      
      {/* Camera Capture Modal */}
      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCameraCapture}
      />

      {/* Upload Progress Overlay */}
      {isUploading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-dark-bg/90 backdrop-blur-xl rounded-3xl border border-white/10 p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-accent-lime animate-spin" />
            <p className="text-white font-medium">Uploading photo...</p>
            <p className="text-sm text-white/60">Please wait</p>
          </div>
        </div>
      )}

      {/* Analysis Progress Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-dark-bg/90 backdrop-blur-xl rounded-3xl border border-white/10 p-8 w-full max-w-md mx-4">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-lime/20 to-accent-orange/20 backdrop-blur-sm border border-white/10 mx-auto mb-4 flex items-center justify-center">
                <div className="relative">
                  <Loader2 className="w-8 h-8 text-accent-lime animate-spin" />
                  <div className="absolute inset-0 w-8 h-8 bg-accent-lime/20 blur-xl animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Analyzing your meal</h3>
              
              {/* Rotating captions */}
              <div className="h-6 flex items-center justify-center">
                <p className="text-sm text-white/70 animate-fade-in">
                  {currentCaption}
                </p>
              </div>
            </div>

            {/* Three-step progress */}
            <div className="space-y-6">
              {/* Progress bar background */}
              <div className="relative">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accent-lime to-accent-orange rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>
                
                {/* Progress milestones */}
                <div className="absolute inset-0 flex justify-between">
                  <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                    analysisProgress >= 0 
                      ? 'bg-accent-lime border-accent-lime scale-110' 
                      : 'bg-white/10 border-white/20'
                  }`} style={{ transform: 'translateY(-5px)' }} />
                  <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                    analysisProgress >= 33 
                      ? 'bg-gradient-to-r from-accent-lime to-accent-orange border-accent-orange scale-110' 
                      : 'bg-white/10 border-white/20'
                  }`} style={{ transform: 'translateY(-5px)' }} />
                  <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                    analysisProgress >= 66 
                      ? 'bg-accent-orange border-accent-orange scale-110' 
                      : 'bg-white/10 border-white/20'
                  }`} style={{ transform: 'translateY(-5px)' }} />
                </div>
              </div>

              {/* Step labels */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className={`transition-all duration-300 ${
                  analysisProgress >= 0 && analysisProgress < 33 
                    ? 'text-white scale-105' 
                    : analysisProgress >= 33 
                      ? 'text-white/40' 
                      : 'text-white/60'
                }`}>
                  <p className="text-xs font-medium">Identifying</p>
                  <p className="text-xs text-white/60">ingredients</p>
                </div>
                <div className={`transition-all duration-300 ${
                  analysisProgress >= 33 && analysisProgress < 66 
                    ? 'text-white scale-105' 
                    : analysisProgress >= 66 
                      ? 'text-white/40' 
                      : 'text-white/60'
                }`}>
                  <p className="text-xs font-medium">Counting</p>
                  <p className="text-xs text-white/60">calories & macros</p>
                </div>
                <div className={`transition-all duration-300 ${
                  analysisProgress >= 66 
                    ? 'text-white scale-105' 
                    : 'text-white/60'
                }`}>
                  <p className="text-xs font-medium">Building</p>
                  <p className="text-xs text-white/60">your meal card</p>
                </div>
              </div>
            </div>

            {/* Fun facts or tips (optional) */}
            <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-xs text-white/60 text-center animate-fade-in">
                {currentFunFact}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Meal Analysis Card Modal */}
      {showMealCard && analysisResult && (
        <div 
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm overflow-y-auto"
          onClick={handleCloseMealCard}
        >
          <div 
            className="min-h-screen flex items-start justify-center py-4 sm:py-8 px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-2xl">
              <MealAnalysisCard 
                data={analysisResult} 
                onClose={handleCloseMealCard}
              />
            </div>
          </div>
        </div>
      )}

      {/* Confetti Celebration */}
      <Confetti active={showConfetti} />
    </>
  );
};

export default Nutrition;