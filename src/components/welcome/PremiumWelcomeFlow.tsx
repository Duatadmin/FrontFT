import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useDragControls } from 'framer-motion';
import { useInViewport } from '@/hooks/useInViewport';
import { useIsMobile } from '@/hooks/useIsMobile';
import { AICoachVisual } from './AICoachVisual';
import { HeroPhoneMockup } from './HeroPhoneMockup';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight,
  Sparkles,
  Activity,
  TrendingUp,
  Users,
  Award,
  Zap,
  Brain,
  BarChart3,
  Shield,
  Smartphone,
  Target,
  Calendar,
  Dumbbell,
  Home,
  MapPin,
  Heart,
  Moon,
  Clock,
  User,
  ArrowLeft,
  Ruler,
  Weight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '../../../assets/Logo.svg?react';
import { useUserStore } from '@/lib/stores/useUserStore';
import { supabase } from '@/lib/supabase';
import Orb from '@/components/Orb/Orb';
import ShinyText from '@/components/ShinyText/ShinyText';
import { submitOnboarding } from '@/services/apiService';
import { toast } from '@/lib/utils/toast';
import { BiometricInput } from '@/components/ui/biometric-input';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface WelcomeScreen {
  id: string;
  badge?: string;
  title: string;
  subtitle: string;
  description: string;
  visual?: React.ReactNode;
  features?: Feature[];
  cta?: string;
  isOnboarding?: boolean;
  inputType?: 'select' | 'multiselect' | 'slider' | 'text' | 'number' | 'strength' | 'chips_text';
  options?: { value: string; label: string; icon?: React.ReactNode }[];
  chipOptions?: string[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  placeholder?: string;
  fieldName?: string;
  strengthExercises?: { key: string; label: string; unit: string; min: number; max: number; icon?: React.ReactNode }[];
}

const screens: WelcomeScreen[] = [
  {
    id: 'hero',
    title: 'Transform Your',
    subtitle: 'Fitness Journey',
    description: 'AI-powered coaching meets personalized training for unprecedented results.',
    visual: <HeroPhoneMockup />,
  },
  {
    id: 'ai-coach',
    title: 'Your Personal',
    subtitle: 'AI Coach',
    description: 'Get real-time form corrections, personalized workouts, and intelligent progress tracking.',
    visual: <AICoachVisual />,
    features: [
      {
        icon: <Brain className="w-5 h-5" />,
        title: 'Smart Analysis',
        description: 'AI analyzes your form in real-time'
      },
      {
        icon: <Activity className="w-5 h-5" />,
        title: 'Adaptive Workouts',
        description: 'Plans that evolve with your progress'
      },
      {
        icon: <TrendingUp className="w-5 h-5" />,
        title: 'Progress Insights',
        description: 'Deep analytics for better results'
      },
    ],
  },
  {
    id: 'features',
    title: 'Everything You Need',
    subtitle: 'To Succeed',
    description: 'Professional tools designed for serious athletes and fitness enthusiasts.',
    visual: (
      <div className="w-full h-full flex items-center justify-center">
        <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
          {[
            { icon: <Activity className="w-6 h-6" />, color: 'from-accent-lime/20 to-accent-lime/10' },
            { icon: <BarChart3 className="w-6 h-6" />, color: 'from-accent-orange/20 to-accent-orange/10' },
            { icon: <Users className="w-6 h-6" />, color: 'from-purple-500/20 to-purple-500/10' },
            { icon: <Award className="w-6 h-6" />, color: 'from-blue-500/20 to-blue-500/10' },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className={cn(
                "aspect-square rounded-2xl bg-gradient-to-br p-4",
                "border border-white/10 backdrop-blur-sm",
                "flex items-center justify-center",
                item.color
              )}
            >
              <div className="text-white/80">{item.icon}</div>
            </motion.div>
          ))}
        </div>
      </div>
    ),
    features: [
      {
        icon: <Smartphone className="w-5 h-5" />,
        title: 'Hands-free workouts',
        description: 'Fully voice-controled system'
      },
      {
        icon: <Shield className="w-5 h-5" />,
        title: 'Private & Secure',
        description: 'Your data stays yours'
      },
      {
        icon: <Sparkles className="w-5 h-5" />,
        title: 'Premium Support',
        description: '24/7 expert assistance'
      },
    ],
  },
  {
    id: 'community',
    badge: 'Join 50K+ Athletes',
    title: 'Train With',
    subtitle: 'The Best',
    description: 'Connect with a global community of dedicated athletes pushing boundaries together.',
    visual: (
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Community Grid */}
        <div className="grid grid-cols-4 gap-2 w-full max-w-[280px]">
          {[...Array(16)].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: index * 0.05,
                type: "spring",
                stiffness: 200
              }}
              className="aspect-square"
            >
              <div className={cn(
                "w-full h-full rounded-lg",
                "bg-gradient-to-br",
                index % 4 === 0 ? "from-accent-lime/20 to-accent-lime/10" :
                index % 4 === 1 ? "from-accent-orange/20 to-accent-orange/10" :
                index % 4 === 2 ? "from-purple-500/20 to-purple-500/10" :
                "from-blue-500/20 to-blue-500/10",
                "border border-white/10"
              )} />
            </motion.div>
          ))}
        </div>
        
        {/* Central Badge */}
        <motion.div
          className="absolute"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
        >
          <div className="bg-dark-bg/90 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-accent-lime" />
              <span className="text-white font-semibold">50K+ Active</span>
            </div>
          </div>
        </motion.div>
      </div>
    ),
    cta: 'Start Your Journey',
  },
  // Onboarding Questions - All 18 in backend order
  // 1. goal
  {
    id: 'goal',
    badge: "Let's personalize",
    title: "What brings you",
    subtitle: "here today?",
    description: "I'll create a personalized plan just for you.",
    isOnboarding: true,
    inputType: 'select',
    fieldName: 'goal',
    options: [
      { value: 'muscle', label: 'Build Muscle', icon: <Dumbbell className="w-5 h-5" /> },
      { value: 'strength', label: 'Get Stronger', icon: <Zap className="w-5 h-5" /> },
      { value: 'weight_loss', label: 'Lose Weight', icon: <Activity className="w-5 h-5" /> },
      { value: 'endurance', label: 'Improve Endurance', icon: <Heart className="w-5 h-5" /> },
      { value: 'general', label: 'Stay Healthy', icon: <Sparkles className="w-5 h-5" /> },
    ]
  },
  // 2. goal_detail
  {
    id: 'goal_detail',
    title: "Any specific areas",
    subtitle: "to focus on?",
    description: "Tell me what matters most to you.",
    isOnboarding: true,
    inputType: 'chips_text',
    fieldName: 'goal_detail',
    placeholder: 'Add your own...',
    chipOptions: [
      'Bigger Arms',
      'Stronger Core',
      'Better Stamina',
      'Leg Strength',
      'Flexibility & Mobility',
      'Back & Posture',
      'Weight Loss',
      'Overall Strength',
    ],
  },
  // 3. goal_timeline_weeks
  {
    id: 'goal_timeline',
    title: "When do you want",
    subtitle: "to see results?",
    description: "Let's set realistic expectations.",
    isOnboarding: true,
    inputType: 'select',
    fieldName: 'goal_timeline_weeks',
    options: [
      { value: '4', label: '4 weeks - Quick wins' },
      { value: '8', label: '8 weeks - Solid progress' },
      { value: '12', label: '12 weeks - Major transformation' },
      { value: '24', label: '6 months - Complete overhaul' },
      { value: '0', label: 'No rush - Sustainable lifestyle' },
    ]
  },
  // 4. level
  {
    id: 'level',
    title: "How would you describe",
    subtitle: "your fitness journey?",
    description: "This helps me understand where you're starting from.",
    isOnboarding: true,
    inputType: 'select',
    fieldName: 'level',
    options: [
      { value: 'beginner', label: "I'm just starting out", icon: <User className="w-5 h-5" /> },
      { value: 'intermediate', label: "I've been training for a while", icon: <TrendingUp className="w-5 h-5" /> },
      { value: 'advanced', label: "I'm very experienced", icon: <Award className="w-5 h-5" /> },
    ]
  },
  // 5. age
  {
    id: 'age',
    title: "What's your",
    subtitle: "age?",
    description: "This helps me tailor intensity and recovery.",
    isOnboarding: true,
    inputType: 'number',
    fieldName: 'age',
    placeholder: 'Enter your age',
    min: 16,
    max: 100
  },
  // 6. sex
  {
    id: 'sex',
    title: "What's your",
    subtitle: "biological sex?",
    description: "For accurate calorie and recovery recommendations.",
    isOnboarding: true,
    inputType: 'select',
    fieldName: 'sex',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ]
  },
  // 7. height_cm
  {
    id: 'height',
    title: "What's your",
    subtitle: "height?",
    description: "Let's get your measurements.",
    isOnboarding: true,
    inputType: 'slider',
    fieldName: 'height_cm',
    min: 140,
    max: 220,
    step: 1,
    unit: 'cm'
  },
  // 8. weight_kg
  {
    id: 'weight',
    title: "What's your",
    subtitle: "current weight?",
    description: "We'll track your progress from here.",
    isOnboarding: true,
    inputType: 'slider',
    fieldName: 'weight_kg',
    min: 40,
    max: 150,
    step: 1,
    unit: 'kg'
  },
  // 9. available_days_per_week
  {
    id: 'days',
    title: "How many days",
    subtitle: "can you train?",
    description: "Let's be realistic - consistency beats perfection!",
    isOnboarding: true,
    inputType: 'slider',
    fieldName: 'available_days_per_week',
    min: 2,
    max: 7,
    step: 1,
    unit: 'days per week'
  },
  // 10. preferred_days
  {
    id: 'preferred_days',
    title: "Which days work",
    subtitle: "best for you?",
    description: "I'll build your schedule around your life.",
    isOnboarding: true,
    inputType: 'multiselect',
    fieldName: 'preferred_days',
    options: [
      { value: 'monday', label: 'Monday' },
      { value: 'tuesday', label: 'Tuesday' },
      { value: 'wednesday', label: 'Wednesday' },
      { value: 'thursday', label: 'Thursday' },
      { value: 'friday', label: 'Friday' },
      { value: 'saturday', label: 'Saturday' },
      { value: 'sunday', label: 'Sunday' },
    ]
  },
  // 11. session_duration_minutes
  {
    id: 'duration',
    title: "How much time",
    subtitle: "per workout?",
    description: "Quality over quantity - we'll make every minute count.",
    isOnboarding: true,
    inputType: 'select',
    fieldName: 'session_duration_minutes',
    options: [
      { value: '30', label: '30 minutes', icon: <Clock className="w-5 h-5" /> },
      { value: '45', label: '45 minutes', icon: <Clock className="w-5 h-5" /> },
      { value: '60', label: '60 minutes', icon: <Clock className="w-5 h-5" /> },
      { value: '90', label: '90+ minutes', icon: <Clock className="w-5 h-5" /> },
    ]
  },
  // 12. split_preference
  {
    id: 'split',
    title: "What training style",
    subtitle: "appeals to you?",
    description: "Different splits work better for different goals.",
    isOnboarding: true,
    inputType: 'select',
    fieldName: 'split_preference',
    options: [
      { value: 'full_body', label: 'Full Body - All muscles each session' },
      { value: 'upper_lower', label: 'Upper/Lower - Split by body half' },
      { value: 'push_pull_legs', label: 'Push/Pull/Legs - By movement pattern' },
      { value: 'body_part', label: 'Body Part Split - Focus one area per day' },
      { value: 'no_preference', label: 'No preference - You decide!' },
    ]
  },
  // 13. location
  {
    id: 'location',
    title: "Where will you",
    subtitle: "be training?",
    description: "I'll tailor exercises to your environment.",
    isOnboarding: true,
    inputType: 'select',
    fieldName: 'location',
    options: [
      { value: 'gym', label: 'At the gym', icon: <Dumbbell className="w-5 h-5" /> },
      { value: 'home', label: 'At home', icon: <Home className="w-5 h-5" /> },
      { value: 'both', label: 'Both gym & home', icon: <MapPin className="w-5 h-5" /> },
    ]
  },
  // 14. equipment
  {
    id: 'equipment',
    title: "What equipment",
    subtitle: "do you have?",
    description: "Select all that apply.",
    isOnboarding: true,
    inputType: 'multiselect',
    fieldName: 'equipment',
    options: [
      { value: 'dumbbells', label: 'Dumbbells' },
      { value: 'barbell', label: 'Barbell & Plates' },
      { value: 'pull_up_bar', label: 'Pull-up Bar' },
      { value: 'resistance_bands', label: 'Resistance Bands' },
      { value: 'kettlebells', label: 'Kettlebells' },
      { value: 'machines', label: 'Gym Machines' },
      { value: 'none', label: 'Just Bodyweight' },
    ]
  },
  // 15. injuries
  {
    id: 'injuries',
    title: "Any injuries or",
    subtitle: "limitations?",
    description: "Your safety is my priority.",
    isOnboarding: true,
    inputType: 'text',
    fieldName: 'injuries',
    placeholder: 'E.g., bad knee, lower back pain, or none'
  },
  // 16. sleep_hours_normalized
  {
    id: 'sleep',
    title: "How many hours",
    subtitle: "do you sleep?",
    description: "Recovery is just as important as training!",
    isOnboarding: true,
    inputType: 'slider',
    fieldName: 'sleep_hours_normalized',
    min: 4,
    max: 10,
    step: 0.5,
    unit: 'hours per night'
  },
  // 17. baseline_capacity
  {
    id: 'baseline',
    badge: "Almost done",
    title: "Your current",
    subtitle: "strength levels?",
    description: "Move the sliders to match your ability - be honest!",
    isOnboarding: true,
    inputType: 'strength',
    fieldName: 'baseline_capacity',
    strengthExercises: [
      { 
        key: 'pushups', 
        label: 'Push-ups', 
        unit: 'reps',
        min: 0,
        max: 50,
        icon: <ChevronRight className="w-4 h-4" />
      },
      { 
        key: 'squats', 
        label: 'Bodyweight Squats', 
        unit: 'reps',
        min: 0,
        max: 50,
        icon: <ChevronRight className="w-4 h-4" />
      },
      { 
        key: 'plank', 
        label: 'Plank Hold', 
        unit: 'seconds',
        min: 0,
        max: 180,
        icon: <Clock className="w-4 h-4" />
      }
    ]
  },
  // 18. preferences
  {
    id: 'preferences',
    title: "Exercise",
    subtitle: "preferences?",
    description: "What do you love or hate?",
    isOnboarding: true,
    inputType: 'text',
    fieldName: 'preferences',
    placeholder: 'E.g., Love deadlifts, hate burpees'
  },
  {
    id: 'complete',
    badge: "All set! 🎉",
    title: "Preparing your",
    subtitle: "personalized plan",
    description: "Let's start your transformation journey together!",
    visual: 'COMPLETE_VISUAL', // Will be rendered dynamically
    cta: "Let's Go!"
  }
];

export function PremiumWelcomeFlow() {
  // Load saved state from localStorage
  const loadSavedState = () => {
    const saved = localStorage.getItem('onboarding_progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          currentScreen: parsed.currentScreen || 0,
          onboardingData: parsed.onboardingData || {},
          strengthValues: parsed.strengthValues || { pushups: 0, squats: 0, plank: 0 }
        };
      } catch (e) {
        console.error('Failed to parse saved onboarding state');
      }
    }
    return {
      currentScreen: 0,
      onboardingData: {},
      strengthValues: { pushups: 0, squats: 0, plank: 0 }
    };
  };

  const savedState = loadSavedState();
  const [currentScreen, setCurrentScreen] = useState(savedState.currentScreen);
  const [onboardingData, setOnboardingData] = useState<Record<string, any>>(savedState.onboardingData);
  const [inputValue, setInputValue] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [strengthValues, setStrengthValues] = useState<Record<string, number>>(savedState.strengthValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const dragX = useMotionValue(0);
  const dragControls = useDragControls();
  const { user, updateOnboardingStatus } = useUserStore();
  const [backgroundRef, isBackgroundInView] = useInViewport<HTMLDivElement>();
  const isMobile = useIsMobile();
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);

  // Autosave to localStorage whenever state changes
  useEffect(() => {
    const saveState = {
      currentScreen,
      onboardingData,
      strengthValues,
      timestamp: Date.now()
    };
    localStorage.setItem('onboarding_progress', JSON.stringify(saveState));
  }, [currentScreen, onboardingData, strengthValues]);

  // Auto-scroll to input when screen changes or keyboard opens
  useEffect(() => {
    if (isMobile && inputContainerRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        inputContainerRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center'
        });
      }, 300);
    }
  }, [currentScreen, isMobile]);

  // Handle viewport resize (keyboard open/close) on mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleViewportResize = () => {
      if (document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA') {
        // Keyboard is likely open
        setTimeout(() => {
          document.activeElement?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }, 100);
      }
    };

    window.visualViewport?.addEventListener('resize', handleViewportResize);
    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportResize);
    };
  }, [isMobile]);
  
  const screen = screens[currentScreen];
  const isOnboardingScreen = screen.isOnboarding;
  const isPreparingPlanScreen = screen.id === 'complete';
  
  // Remove auto-navigation - we'll navigate after API response instead

  const handleNext = async () => {
    if (isOnboardingScreen && screen.fieldName) {
      // For slider inputs, use the current value from onboardingData
      if (screen.inputType === 'slider') {
        const value = onboardingData[screen.fieldName] || screen.min || 0;
        setOnboardingData(prev => ({ ...prev, [screen.fieldName!]: value }));
      }
      // For strength inputs, format the values as a string
      else if (screen.inputType === 'strength') {
        const strengthString = `${strengthValues.pushups} pushups, ${strengthValues.squats} squats, ${strengthValues.plank} sec plank`;
        setOnboardingData(prev => ({ ...prev, [screen.fieldName!]: strengthString }));
      }
      // For chips_text inputs, compose selected chips + custom text into a string
      else if (screen.inputType === 'chips_text') {
        const parts = [...selectedChips];
        if (inputValue.trim()) {
          parts.push(inputValue.trim());
        }
        const composedValue = parts.join(', ');
        setOnboardingData(prev => ({ ...prev, [screen.fieldName!]: composedValue }));
      }
    }

    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
      setInputValue(''); // Reset input for next screen
      setSelectedChips([]); // Reset chips for next screen
    } else {
      // On the final "complete" screen, navigate to chat
      navigate('/');
    }
  };

  const submitOnboardingData = async (finalOnboardingData: Record<string, any>) => {
    console.log('[PremiumWelcomeFlow] Starting submitOnboardingData...');
    if (!user) {
      console.log('[PremiumWelcomeFlow] No user, navigating to login');
      navigate('/login');
      return;
    }
    
    setIsSubmitting(true);
    console.log('[PremiumWelcomeFlow] Set isSubmitting to true');
    
    try {
      // Transform data to match API requirements
      const transformedData = {
        goal: finalOnboardingData.goal === 'muscle' ? 'Build Muscle' : 
              finalOnboardingData.goal === 'strength' ? 'Get Stronger' :
              finalOnboardingData.goal === 'weight_loss' ? 'Lose Weight' :
              finalOnboardingData.goal === 'endurance' ? 'Improve Endurance' :
              'Stay Healthy',
        goal_detail: finalOnboardingData.goal_detail || '',
        goal_timeline_weeks: finalOnboardingData.goal_timeline_weeks || 12,
        level: finalOnboardingData.level || 'beginner',
        age: finalOnboardingData.age || 25,
        sex: finalOnboardingData.sex || 'male',
        height_cm: finalOnboardingData.height_cm || 170,
        weight_kg: finalOnboardingData.weight_kg || 70,
        available_days_per_week: finalOnboardingData.available_days_per_week || 3,
        preferred_days: finalOnboardingData.preferred_days?.map((day: string) => 
          day.charAt(0).toUpperCase() + day.slice(1).substring(0, 2)
        ) || ['Mon', 'Wed', 'Fri'],
        session_duration_minutes: finalOnboardingData.session_duration_minutes || 60,
        split_preference: finalOnboardingData.split_preference || 'no_preference',
        location: finalOnboardingData.location || 'gym',
        equipment: finalOnboardingData.equipment?.map((eq: string) => {
          if (eq === 'machines') return 'gym machines';
          if (eq === 'none') return 'bodyweight';
          if (eq === 'pull_up_bar') return 'pull-up bar';
          return eq;
        }) || ['bodyweight'],
        injuries: finalOnboardingData.injuries || 'none',
        sleep_hours_normalized: finalOnboardingData.sleep_hours_normalized || 7,
        baseline_capacity: (() => {
          if (finalOnboardingData.baseline_capacity && typeof finalOnboardingData.baseline_capacity === 'string') {
            // Parse the string format "X pushups, Y squats, Z sec plank"
            const matches = finalOnboardingData.baseline_capacity.match(/(\d+) pushups, (\d+) squats, (\d+) sec plank/);
            if (matches) {
              return {
                pushups: parseInt(matches[1], 10),
                squats: parseInt(matches[2], 10),
                plank_seconds: parseInt(matches[3], 10)
              };
            }
          }
          return { pushups: 0, squats: 0, plank_seconds: 0 };
        })(),
        preferences: finalOnboardingData.preferences || ''
      };

      // Submit to API - this triggers plan generation
      console.log('[PremiumWelcomeFlow] Submitting to API...');
      const response = await submitOnboarding(user.id, transformedData);
      console.log('[PremiumWelcomeFlow] API response:', response);
      
      if (response && response.reply) {
        console.log('[PremiumWelcomeFlow] Got plan, storing and updating status...');
        
        // FIRST: Store the plan in sessionStorage
        sessionStorage.setItem('onboarding_plan', JSON.stringify({
          role: 'assistant',
          content: response.reply,
          timestamp: Date.now()
        }));
        console.log('[PremiumWelcomeFlow] Plan stored in sessionStorage');
        
        // SECOND: Update onboarding status and WAIT for it
        console.log('[PremiumWelcomeFlow] Updating onboarding status...');
        try {
          await updateOnboardingStatus(true);
          console.log('[PremiumWelcomeFlow] Onboarding status updated successfully');
        } catch (err) {
          console.error('[PremiumWelcomeFlow] Failed to update onboarding status:', err);
          // Continue anyway - we have the plan
        }
        
        // THIRD: Clear saved progress and navigate after status is updated
        localStorage.removeItem('onboarding_progress'); // Clear saved progress after successful submission
        setIsSubmitting(false);
        toast.success('Your personalized plan is ready!');
        console.log('[PremiumWelcomeFlow] Navigating to chat...');
        navigate('/', { replace: true });
      } else {
        throw new Error('Failed to generate plan');
      }
    } catch (error) {
      console.error('[PremiumWelcomeFlow] Failed to submit onboarding data:', error);
      toast.error('Failed to complete onboarding. Please try again.');
      setIsSubmitting(false);
      // Don't navigate on error, let user retry
    }
  };

  const handleOptionSelect = (value: string) => {
    if (screen.fieldName) {
      // Convert string to number for goal_timeline_weeks
      let processedValue: string | number = value;
      if (screen.fieldName === 'goal_timeline_weeks') {
        processedValue = parseInt(value, 10);
      }
      
      setOnboardingData(prev => ({ ...prev, [screen.fieldName!]: processedValue }));
      setTimeout(() => handleNext(), 300); // Auto-advance after selection
    }
  };

  const handleSkip = () => {
    // Find the index of the first onboarding question
    const firstOnboardingIndex = screens.findIndex(s => s.isOnboarding);
    
    if (currentScreen < firstOnboardingIndex) {
      // Skip to onboarding questions
      setCurrentScreen(firstOnboardingIndex);
    } else {
      // Skip current question
      handleNext();
    }
  };

  const startDrag = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return;
    dragControls.start(e);
  };

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 50;
    if (info.offset.x < -threshold && currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else if (info.offset.x > threshold && currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  return (
    <div className="min-h-lvh bg-dark-bg relative flex flex-col">
      {/* Enhanced Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-sm border-b border-white/5">
        <div className="relative h-1 bg-white/10 overflow-hidden">
          <motion.div
            className="absolute h-full bg-gradient-to-r from-accent-lime via-accent-lime/80 to-accent-orange shadow-[0_0_20px_rgba(200,255,0,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${((currentScreen + 1) / screens.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </div>
        {/* Progress Text for accessibility */}
        <div className="sr-only" role="progressbar" aria-valuenow={currentScreen + 1} aria-valuemin={1} aria-valuemax={screens.length}>
          Step {currentScreen + 1} of {screens.length}
        </div>
      </div>

      {/* Dynamic Background */}
      <div ref={backgroundRef} className="absolute inset-0 mt-[5px]">
        {/* Animated Gradient Mesh */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="40" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <motion.circle
            cx="20%"
            cy="20%"
            r="300"
            fill="url(#gradient1)"
            filter="url(#glow)"
            animate={isBackgroundInView && !isMobile ? {
              cx: ["20%", "80%", "20%"],
              cy: ["20%", "80%", "20%"],
            } : {}}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.circle
            cx="80%"
            cy="80%"
            r="400"
            fill="url(#gradient2)"
            filter="url(#glow)"
            animate={isBackgroundInView && !isMobile ? {
              cx: ["80%", "20%", "80%"],
              cy: ["80%", "20%", "80%"],
            } : {}}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <defs>
            <radialGradient id="gradient1">
              <stop offset="0%" stopColor="#DFF250" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#DFF250" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="gradient2">
              <stop offset="0%" stopColor="#F2A03D" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#F2A03D" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>

        {/* Glass Overlay */}
        <div className="absolute inset-0 bg-dark-bg/30 backdrop-blur-[100px]" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3 pt-safe-top">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <Logo className="w-20 h-20 text-accent-lime" />
          </motion.div>
          
          <div className="flex items-center gap-3">
            {currentScreen > 0 && !isPreparingPlanScreen && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => { setCurrentScreen(prev => prev - 1); setInputValue(''); setSelectedChips([]); }}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
                aria-label="Go back to previous step"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">Back</span>
              </motion.button>
            )}
            {currentScreen === 0 && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => {
                  // Clear progress and go to login
                  localStorage.removeItem('onboarding_progress');
                  navigate('/login');
                }}
                className="flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors px-3 py-2"
                aria-label="Exit onboarding"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm hidden sm:inline">Exit</span>
              </motion.button>
            )}
            {!isPreparingPlanScreen && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={handleSkip}
                className="text-white/60 hover:text-white text-sm font-medium transition-colors px-3 py-1 rounded-lg hover:bg-white/5"
              >
                {currentScreen < 4 ? 'Skip intro' : isOnboardingScreen ? 'Skip question' : 'Skip'}
              </motion.button>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main ref={mainContentRef} className="flex-1 flex flex-col px-6">
          <div className="flex-1 flex justify-center">
            <div className="w-full lg:w-1/2 lg:max-w-2xl flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              drag="x"
              dragListener={false}
              dragControls={dragControls}
              onPointerDown={startDrag}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              style={{ x: dragX }}
              className="flex-1 flex flex-col"
            >
              {/* Badge */}
              {screen.badge && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                    <Sparkles className="w-3 h-3 text-accent-lime" />
                    <span className="text-xs text-white/80 font-medium">{screen.badge}</span>
                  </div>
                </motion.div>
              )}

              {/* Title Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
              >
                <h1 className="text-4xl font-bold text-white leading-tight">
                  {screen.title}
                </h1>
                <h2 className="text-4xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-accent-lime to-accent-orange bg-clip-text text-transparent">
                    {screen.subtitle}
                  </span>
                </h2>
                <p className="text-white/60 text-base mt-3 leading-relaxed">
                  {screen.description}
                </p>
              </motion.div>

              {/* Visual Section OR Input Section */}
              {isOnboardingScreen ? (
                <div ref={inputContainerRef} className="flex-1 min-h-0 flex flex-col justify-center space-y-4">
                  {/* Select Options */}
                  {screen.inputType === 'select' && screen.options && (
                    <div className="space-y-3">
                      {screen.options.map((option) => (
                        <motion.button
                          key={option.value}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleOptionSelect(option.value)}
                          className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent-lime/30 rounded-2xl transition-all flex items-center gap-3"
                        >
                          {option.icon && (
                            <span className="text-accent-lime">{option.icon}</span>
                          )}
                          <span className="text-white text-left flex-1">{option.label}</span>
                          <ChevronRight className="w-5 h-5 text-white/40" />
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Slider Input */}
                  {screen.inputType === 'slider' && (
                    <>
                      {(screen.fieldName === 'height_cm' || screen.fieldName === 'weight_kg') ? (
                        <BiometricInput
                          type={screen.fieldName === 'height_cm' ? 'height' : 'weight'}
                          value={onboardingData[screen.fieldName!] || screen.min || 0}
                          onChange={(value) => setOnboardingData(prev => ({ 
                            ...prev, 
                            [screen.fieldName!]: value 
                          }))}
                        />
                      ) : (
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-white/60">Select value</span>
                            <span className="text-3xl font-bold text-white">
                              {onboardingData[screen.fieldName!] || screen.min || 0}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={screen.min}
                            max={screen.max}
                            step={screen.step}
                            value={onboardingData[screen.fieldName!] || screen.min || 0}
                            onChange={(e) => setOnboardingData(prev => ({ 
                              ...prev, 
                              [screen.fieldName!]: Number(e.target.value) 
                            }))}
                            className="w-full accent-accent-lime"
                          />
                          <div className="flex justify-between mt-2">
                            <span className="text-xs text-white/40">{screen.min}</span>
                            <span className="text-xs text-white/40 font-medium">{screen.unit}</span>
                            <span className="text-xs text-white/40">{screen.max}</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Multiselect Options */}
                  {screen.inputType === 'multiselect' && screen.options && (
                    <div className="space-y-3">
                      {screen.options.map((option) => {
                        const selectedValues = (onboardingData[screen.fieldName!] as string[]) || [];
                        const isSelected = selectedValues.includes(option.value);
                        return (
                          <motion.button
                            key={option.value}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              const newValues = isSelected
                                ? selectedValues.filter(v => v !== option.value)
                                : [...selectedValues, option.value];
                              setOnboardingData(prev => ({ 
                                ...prev, 
                                [screen.fieldName!]: newValues 
                              }));
                            }}
                            className={cn(
                              "w-full p-4 border rounded-2xl transition-all flex items-center gap-3",
                              isSelected
                                ? "bg-accent-lime/20 border-accent-lime/50"
                                : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-accent-lime/30"
                            )}
                          >
                            {option.icon && (
                              <span className="text-accent-lime">{option.icon}</span>
                            )}
                            <span className="text-white text-left flex-1">{option.label}</span>
                            <div className={cn(
                              "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                              isSelected ? "bg-accent-lime border-accent-lime" : "border-white/40"
                            )}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-dark-bg" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  {/* Chips + Text Input */}
                  {screen.inputType === 'chips_text' && (
                    <div className="space-y-4">
                      {screen.chipOptions && (
                        <div className="flex flex-wrap gap-2">
                          {screen.chipOptions.map((chip, index) => {
                            const isSelected = selectedChips.includes(chip);
                            return (
                              <motion.button
                                key={chip}
                                type="button"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.03 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setSelectedChips(prev =>
                                    isSelected
                                      ? prev.filter(c => c !== chip)
                                      : [...prev, chip]
                                  );
                                }}
                                className={cn(
                                  "px-4 py-2.5 rounded-full text-sm font-medium",
                                  "border transition-all duration-200",
                                  isSelected
                                    ? "bg-accent-lime/20 border-accent-lime/50 text-white"
                                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20"
                                )}
                              >
                                {chip}
                              </motion.button>
                            );
                          })}
                        </div>
                      )}
                      <div>
                        <label className="text-xs text-white/40 mb-1.5 block">Or type your own</label>
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder={screen.placeholder}
                          className="w-full p-4 bg-white/5 border border-white/20 rounded-2xl text-white text-base placeholder-white/40 focus:outline-none focus:border-accent-lime/50 focus:bg-white/10 transition-all"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  )}

                  {/* Number/Text Input */}
                  {(screen.inputType === 'number' || screen.inputType === 'text') && (
                    <form onSubmit={async (e) => { 
                      e.preventDefault(); 
                      if (inputValue && screen.fieldName) {
                        const newValue = screen.inputType === 'number' ? Number(inputValue) : inputValue;
                        setOnboardingData(prev => ({ 
                          ...prev, 
                          [screen.fieldName!]: newValue 
                        }));
                        
                        // If this is the preferences field, submit to backend
                        if (screen.fieldName === 'preferences') {
                          // First advance to the generating screen
                          setCurrentScreen(currentScreen + 1);
                          setInputValue('');
                          // Then submit the data
                          submitOnboardingData({ ...onboardingData, [screen.fieldName]: newValue });
                        } else {
                          handleNext();
                        }
                      }
                    }}>
                      <input
                        type={screen.inputType}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={screen.placeholder}
                        min={screen.min}
                        max={screen.max}
                        className="w-full p-5 bg-white/5 border border-white/20 rounded-2xl text-white text-lg placeholder-white/40 focus:outline-none focus:border-accent-lime/50 focus:bg-white/10 transition-all"
                        autoFocus
                        autoComplete="off"
                        enterKeyHint="next"
                      />
                    </form>
                  )}

                  {/* Strength Input */}
                  {screen.inputType === 'strength' && screen.strengthExercises && (
                    <div className="space-y-6">
                      {screen.strengthExercises.map((exercise) => (
                        <motion.div
                          key={exercise.key}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white/5 rounded-2xl p-6 border border-white/10"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              {exercise.icon && (
                                <div className="w-10 h-10 rounded-lg bg-accent-lime/20 flex items-center justify-center">
                                  <span className="text-accent-lime">{exercise.icon}</span>
                                </div>
                              )}
                              <div>
                                <h4 className="text-white font-medium">{exercise.label}</h4>
                                <p className="text-white/40 text-sm">How many can you do?</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-3xl font-bold text-white">
                                {strengthValues[exercise.key]}
                              </span>
                              <span className="text-white/60 text-sm ml-2">{exercise.unit}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <input
                              type="range"
                              min={exercise.min}
                              max={exercise.max}
                              value={strengthValues[exercise.key]}
                              onChange={(e) => setStrengthValues(prev => ({ 
                                ...prev, 
                                [exercise.key]: Number(e.target.value) 
                              }))}
                              className="w-full accent-accent-lime"
                            />
                            <div className="flex justify-between">
                              <span className="text-xs text-white/40">{exercise.min}</span>
                              <div className="flex gap-6">
                                {[0, 25, 50, 75, 100].map(percent => {
                                  const value = Math.round(exercise.min + (exercise.max - exercise.min) * percent / 100);
                                  return (
                                    <button
                                      key={percent}
                                      type="button"
                                      onClick={() => setStrengthValues(prev => ({ 
                                        ...prev, 
                                        [exercise.key]: value 
                                      }))}
                                      className="text-xs text-white/40 hover:text-white/60 transition-colors"
                                    >
                                      {value}
                                    </button>
                                  );
                                })}
                              </div>
                              <span className="text-xs text-white/40">{exercise.max}+</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      
                      <div className="text-center text-white/40 text-sm">
                        <p>Can't do any yet? That's totally fine - we'll start where you are!</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 min-h-0 flex items-center justify-center my-4">
                  <div className="w-full">
                    {screen.id === 'complete' ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <div className="relative w-[307px] h-[307px]">
                          <Orb 
                            hue={180} 
                            hoverIntensity={0.5} 
                            rotateOnHover={true} 
                            forceHoverState={true} 
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="relative">
                              {/* Underlayer with 40% opacity */}
                              <h3 className="text-[1.4rem] font-bold bg-gradient-to-r from-accent-lime to-accent-orange bg-clip-text text-transparent opacity-40">
                                Generating...
                              </h3>
                              {/* ShinyText overlay */}
                              <h3 className="absolute inset-0 text-[1.4rem] font-bold">
                                <ShinyText 
                                  text="Generating..." 
                                  speed={3}
                                  className="bg-gradient-to-r from-accent-lime to-accent-orange bg-clip-text text-transparent"
                                />
                              </h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : screen.visual}
                  </div>
                </div>
              )}

              {/* Features List */}
              {screen.features && !isOnboardingScreen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3 mb-6"
                >
                  {screen.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0 text-accent-lime">
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium text-sm leading-tight">
                          {feature.title}
                        </h3>
                        <p className="text-white/50 text-xs mt-0.5 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
            </div>
          </div>
        </main>

        {/* Bottom Navigation */}
        <footer className="px-6" style={{ paddingBottom: 'calc(2rem + var(--safe-area-inset-bottom, 0px))' }}>
          <div className="flex justify-center">
            <div className="w-full lg:w-1/2 lg:max-w-2xl">
            {/* Progress Dots */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {screens.map((_, index) => (
                <motion.button
                  key={index}
                  initial={false}
                  animate={{
                    width: index === currentScreen ? 28 : 6,
                    backgroundColor: index === currentScreen ? '#DFF250' : 'rgba(255, 255, 255, 0.2)',
                  }}
                  transition={{ duration: 0.3 }}
                  className="h-2 rounded-full"
                  onClick={() => setCurrentScreen(index)}
                  aria-label={`Go to screen ${index + 1}`}
                />
              ))}
            </div>

            {/* CTA Button Container */}
            <div className="relative">
              {/* Button Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-accent-lime to-accent-orange rounded-2xl blur-xl opacity-50" />
              
              {/* CTA Button */}
              {(!isOnboardingScreen || (isOnboardingScreen && (screen.inputType === 'slider' || screen.inputType === 'multiselect' || screen.inputType === 'strength' || screen.inputType === 'chips_text'))) && screen.id !== 'complete' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  disabled={
                    isSubmitting ||
                    (isOnboardingScreen && screen.inputType === 'number' && !inputValue) ||
                    (isOnboardingScreen && screen.inputType === 'multiselect' && (!onboardingData[screen.fieldName!] || (onboardingData[screen.fieldName!] as string[]).length === 0)) ||
                    (isOnboardingScreen && screen.inputType === 'chips_text' && selectedChips.length === 0 && !inputValue.trim())
                  }
                  className={cn(
                    "relative w-full h-14 rounded-2xl font-semibold text-dark-bg",
                    "bg-gradient-to-r from-accent-lime to-accent-orange",
                    "shadow-2xl shadow-accent-lime/30",
                    "flex items-center justify-center gap-2",
                    "transition-all duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <span className="text-base font-bold">
                    {isSubmitting ? 'Creating your plan...' :
                      screen.cta || (currentScreen === screens.length - 1 ? 'Get Started' :
                      screen.inputType === 'multiselect' && onboardingData[screen.fieldName!] && (onboardingData[screen.fieldName!] as string[]).length > 0
                        ? `Continue (${(onboardingData[screen.fieldName!] as string[]).length} selected)`
                        : screen.inputType === 'chips_text' && (selectedChips.length > 0 || inputValue.trim())
                          ? `Continue (${selectedChips.length + (inputValue.trim() ? 1 : 0)} selected)`
                          : 'Continue'
                    )}
                  </span>
                  <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
                </motion.button>
              )}
            </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}