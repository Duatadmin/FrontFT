import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInViewport } from '@/hooks/useInViewport';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight,
  Sparkles,
  Target,
  Activity,
  Calendar,
  Dumbbell,
  Home,
  MapPin,
  Heart,
  Moon,
  BarChart3,
  User,
  Ruler,
  Weight,
  Clock,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/lib/stores/useUserStore';
import { supabase } from '@/lib/supabase';
import { BiometricInput } from '@/components/ui/BiometricInput';

interface OnboardingStep {
  id: keyof OnboardingData;
  question: string;
  aiMessage?: string;
  type: 'select' | 'multiselect' | 'number' | 'text' | 'slider';
  options?: { value: string; label: string; icon?: React.ReactNode }[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  placeholder?: string;
  icon: React.ReactNode;
  category: 'goals' | 'profile' | 'schedule' | 'experience' | 'health';
}

interface OnboardingData {
  goal?: string;
  goal_detail?: string;
  goal_timeline_weeks?: number;
  level?: string;
  age?: number;
  sex?: string;
  height_cm?: number;
  weight_kg?: number;
  available_days_per_week?: number;
  preferred_days?: string[];
  session_duration_minutes?: number;
  split_preference?: string;
  location?: string;
  equipment?: string[];
  injuries?: string;
  sleep_hours_normalized?: number;
  baseline_capacity?: string;
  preferences?: string;
}

const onboardingSteps: OnboardingStep[] = [
  // 1. goal
  {
    id: 'goal',
    question: "What brings you here today?",
    aiMessage: "Hey! I'm your AI fitness coach. Let's create a personalized plan just for you. 💪",
    type: 'select',
    icon: <Target className="w-5 h-5" />,
    category: 'goals',
    options: [
      { value: 'muscle', label: 'Build Muscle', icon: <Dumbbell className="w-4 h-4" /> },
      { value: 'strength', label: 'Get Stronger', icon: <Zap className="w-4 h-4" /> },
      { value: 'weight_loss', label: 'Lose Weight', icon: <Activity className="w-4 h-4" /> },
      { value: 'endurance', label: 'Improve Endurance', icon: <Heart className="w-4 h-4" /> },
      { value: 'general', label: 'Stay Healthy', icon: <Sparkles className="w-4 h-4" /> },
    ]
  },
  // 2. goal_detail
  {
    id: 'goal_detail',
    question: "Any specific areas you'd like to focus on?",
    aiMessage: "Let's make your plan even more targeted!",
    type: 'text',
    icon: <Target className="w-5 h-5" />,
    category: 'goals',
    placeholder: 'E.g., bigger arms, stronger core, better stamina'
  },
  // 3. goal_timeline_weeks
  {
    id: 'goal_timeline_weeks',
    question: "When would you like to see results?",
    type: 'select',
    icon: <Calendar className="w-5 h-5" />,
    category: 'goals',
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
    question: "How would you describe your fitness journey so far?",
    type: 'select',
    icon: <BarChart3 className="w-5 h-5" />,
    category: 'experience',
    options: [
      { value: 'beginner', label: "I'm just starting out" },
      { value: 'intermediate', label: "I've been training for a while" },
      { value: 'advanced', label: "I'm very experienced" },
    ]
  },
  // 5. age
  {
    id: 'age',
    question: "What's your age?",
    aiMessage: "This helps me tailor the intensity and recovery recommendations.",
    type: 'number',
    icon: <User className="w-5 h-5" />,
    category: 'profile',
    placeholder: 'Enter your age',
    min: 16,
    max: 100
  },
  // 6. sex
  {
    id: 'sex',
    question: "What's your biological sex?",
    type: 'select',
    icon: <User className="w-5 h-5" />,
    category: 'profile',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ]
  },
  // 7. height_cm
  {
    id: 'height_cm',
    question: "What's your height?",
    aiMessage: "Let's get your measurements for better personalization.",
    type: 'slider',
    icon: <Ruler className="w-5 h-5" />,
    category: 'profile',
    min: 140,
    max: 220,
    step: 1,
    unit: 'cm'
  },
  // 8. weight_kg
  {
    id: 'weight_kg',
    question: "What's your current weight?",
    type: 'slider',
    icon: <Weight className="w-5 h-5" />,
    category: 'profile',
    min: 40,
    max: 150,
    step: 1,
    unit: 'kg'
  },
  // 9. available_days_per_week
  {
    id: 'available_days_per_week',
    question: "How many days can you realistically train per week?",
    aiMessage: "Let's be realistic here - consistency beats perfection!",
    type: 'slider',
    icon: <Calendar className="w-5 h-5" />,
    category: 'schedule',
    min: 2,
    max: 7,
    step: 1,
    unit: 'days'
  },
  // 10. preferred_days
  {
    id: 'preferred_days',
    question: "Which days work best for your workouts?",
    aiMessage: "I'll build your schedule around your life, not the other way around.",
    type: 'multiselect',
    icon: <Calendar className="w-5 h-5" />,
    category: 'schedule',
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
    id: 'session_duration_minutes',
    question: "How long can your typical workouts be?",
    type: 'select',
    icon: <Clock className="w-5 h-5" />,
    category: 'schedule',
    options: [
      { value: '30', label: '30 minutes' },
      { value: '45', label: '45 minutes' },
      { value: '60', label: '60 minutes' },
      { value: '90', label: '90+ minutes' },
    ]
  },
  // 12. split_preference
  {
    id: 'split_preference',
    question: "What training style appeals to you?",
    aiMessage: "Different splits work better for different goals and schedules.",
    type: 'select',
    icon: <Dumbbell className="w-5 h-5" />,
    category: 'experience',
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
    question: "Where will you be training?",
    type: 'select',
    icon: <MapPin className="w-5 h-5" />,
    category: 'experience',
    options: [
      { value: 'gym', label: 'Gym', icon: <Dumbbell className="w-4 h-4" /> },
      { value: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
      { value: 'both', label: 'Both' },
    ]
  },
  // 14. equipment
  {
    id: 'equipment',
    question: "What equipment do you have access to?",
    aiMessage: "I'll design your workouts based on what's available to you.",
    type: 'multiselect',
    icon: <Dumbbell className="w-5 h-5" />,
    category: 'experience',
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
    question: "Any injuries or physical limitations I should know about?",
    aiMessage: "Your safety is my priority. I'll adapt exercises accordingly.",
    type: 'text',
    icon: <Heart className="w-5 h-5" />,
    category: 'health',
    placeholder: 'E.g., bad knee, lower back pain, or none'
  },
  // 16. sleep_hours_normalized
  {
    id: 'sleep_hours_normalized',
    question: "How many hours do you typically sleep per night?",
    aiMessage: "Recovery is just as important as training!",
    type: 'slider',
    icon: <Moon className="w-5 h-5" />,
    category: 'health',
    min: 4,
    max: 10,
    step: 0.5,
    unit: 'hours'
  },
  // 17. baseline_capacity
  {
    id: 'baseline_capacity',
    question: "Let's check your current strength levels",
    aiMessage: "This helps me gauge where to start. Just give me rough numbers!",
    type: 'text',
    icon: <Activity className="w-5 h-5" />,
    category: 'experience',
    placeholder: 'E.g., 20 pushups, 30 squats, 60 sec plank'
  },
  // 18. preferences
  {
    id: 'preferences',
    question: "Any exercises you particularly love or hate?",
    aiMessage: "I'll try to include what you enjoy and work around what you don't!",
    type: 'text',
    icon: <Heart className="w-5 h-5" />,
    category: 'experience',
    placeholder: 'E.g., Love deadlifts, hate burpees'
  },
];

export function ConversationalOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingData>({});
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isProcessingPlan, setIsProcessingPlan] = useState(false);
  const navigate = useNavigate();
  const { user, updateOnboardingStatus } = useUserStore();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [typingRef, isTypingInView] = useInViewport<HTMLDivElement>();

  const step = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const isLastStep = currentStep === onboardingSteps.length - 1;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentStep]);

  const handleAnswer = async (value: any) => {
    // Convert string to number for goal_timeline_weeks
    let processedValue = value;
    if (step.id === 'goal_timeline_weeks' && typeof value === 'string') {
      processedValue = parseInt(value, 10);
    }
    
    setAnswers(prev => ({ ...prev, [step.id]: processedValue }));
    
    if (currentStep < onboardingSteps.length - 1) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setCurrentStep(prev => prev + 1);
        setInputValue(''); // Reset input value for next step
      }, 800);
    } else {
      // Complete onboarding
      await completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;
    
    setIsProcessingPlan(true);
    
    try {
      // Save onboarding data to user profile
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          ...answers,
          onboarding_completed_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update onboarding status (backend will handle this)
      await updateOnboardingStatus(true);
      
      // Navigate to main app
      navigate('/');
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
      setIsProcessingPlan(false);
    }
  };

  const handleSkip = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const renderInput = () => {
    switch (step.type) {
      case 'select':
        return (
          <div className="space-y-2">
            {step.options?.map((option) => (
              <motion.button
                key={option.value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswer(option.value)}
                className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent-lime/30 rounded-2xl transition-all flex items-center gap-3"
              >
                {option.icon && <span className="text-accent-lime">{option.icon}</span>}
                <span className="text-white text-left flex-1">{option.label}</span>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </motion.button>
            ))}
          </div>
        );

      case 'slider':
        const sliderValue = answers[step.id] as number || step.min || 0;
        return (
          <div className="space-y-4">
            {(step.id === 'height_cm' || step.id === 'weight_kg') ? (
              <BiometricInput
                type={step.id === 'height_cm' ? 'height' : 'weight'}
                value={sliderValue}
                onChange={(value) => setAnswers(prev => ({ ...prev, [step.id]: value }))}
              />
            ) : (
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/60">Select value</span>
                  <span className="text-2xl font-bold text-white">
                    {sliderValue} {step.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={step.min}
                  max={step.max}
                  step={step.step}
                  value={sliderValue}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [step.id]: Number(e.target.value) }))}
                  className="w-full accent-accent-lime"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-white/40">{step.min} {step.unit}</span>
                  <span className="text-xs text-white/40">{step.max} {step.unit}</span>
                </div>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAnswer(sliderValue)}
              className="w-full h-14 rounded-2xl font-semibold text-dark-bg bg-gradient-to-r from-accent-lime to-accent-orange flex items-center justify-center gap-2"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        );

      case 'multiselect':
        const selectedValues = (answers[step.id] as string[]) || [];
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              {step.options?.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const newValues = isSelected
                        ? selectedValues.filter(v => v !== option.value)
                        : [...selectedValues, option.value];
                      setAnswers(prev => ({ ...prev, [step.id]: newValues }));
                    }}
                    className={cn(
                      "w-full p-4 border rounded-2xl transition-all flex items-center gap-3",
                      isSelected
                        ? "bg-accent-lime/20 border-accent-lime/50 text-white"
                        : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-accent-lime/30 text-white"
                    )}
                  >
                    {option.icon && <span className={isSelected ? "text-accent-lime" : "text-accent-lime"}>{option.icon}</span>}
                    <span className="text-left flex-1">{option.label}</span>
                    <div className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                      isSelected ? "bg-accent-lime border-accent-lime" : "border-white/40"
                    )}>
                      {isSelected && <svg className="w-3 h-3 text-dark-bg" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>}
                    </div>
                  </motion.button>
                );
              })}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAnswer(selectedValues)}
              disabled={selectedValues.length === 0}
              className="w-full h-14 rounded-2xl font-semibold text-dark-bg bg-gradient-to-r from-accent-lime to-accent-orange flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Continue {selectedValues.length > 0 && `(${selectedValues.length} selected)`}
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        );

      case 'number':
      case 'text':
        return (
          <form onSubmit={(e) => { e.preventDefault(); handleAnswer(inputValue); }} className="space-y-4">
            <input
              type={step.type}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={step.placeholder}
              min={step.min}
              max={step.max}
              className="w-full p-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-accent-lime/50 transition-colors"
              autoFocus
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!inputValue}
              className="w-full h-14 rounded-2xl font-semibold text-dark-bg bg-gradient-to-r from-accent-lime to-accent-orange flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-lvh bg-dark-bg flex flex-col">
      {/* Enhanced Progress Bar */}
      <div className="sticky top-0 z-20 bg-dark-bg/80 backdrop-blur-xl border-b border-white/5">
        <div className="h-1 bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-accent-lime via-accent-lime/80 to-accent-orange shadow-[0_0_20px_rgba(200,255,0,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        {/* Progress indicator text */}
        <div className="px-4 py-2 flex items-center justify-between text-xs">
          <span className="text-white/60">Step {currentStep + 1} of {onboardingSteps.length}</span>
          <span className="text-accent-lime font-medium">{Math.round(progress)}% Complete</span>
        </div>
      </div>

      {/* Chat Container - Centered and half width on desktop */}
      <div className="flex-1 overflow-y-auto flex justify-center">
        <div className="w-full lg:w-1/2 lg:max-w-2xl p-6 space-y-6">
          {/* Previous Messages */}
          <AnimatePresence mode="sync">
            {onboardingSteps.slice(0, currentStep + 1).map((prevStep, index) => {
              const answer = answers[prevStep.id];
              const isCurrentStep = index === currentStep;
              
              return (
                <div key={prevStep.id} className="space-y-4">
                  {/* AI Message */}
                  <motion.div
                    initial={isCurrentStep ? { opacity: 0, x: -20 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: isCurrentStep ? 0.2 : 0 }}
                    className="flex gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-accent-lime/20 flex-shrink-0 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-accent-lime" />
                    </div>
                    <div className="flex-1 space-y-2">
                      {prevStep.aiMessage && (
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl rounded-tl-sm p-4 border border-white/10">
                          <p className="text-white/90 text-sm leading-relaxed">
                            {prevStep.aiMessage}
                          </p>
                        </div>
                      )}
                      <div className="bg-white/5 backdrop-blur-sm rounded-2xl rounded-tl-sm p-4 border border-white/10">
                        <p className="text-white/90 leading-relaxed">
                          {prevStep.question}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* User Answer (if not current step) */}
                  {!isCurrentStep && answer && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-end"
                    >
                      <div className="max-w-[80%] bg-gradient-to-r from-accent-lime/80 to-accent-orange/80 rounded-2xl rounded-tr-sm p-4">
                        <p className="text-dark-bg font-medium">
                          {typeof answer === 'string' 
                            ? prevStep.options?.find(o => o.value === answer)?.label || answer
                            : Array.isArray(answer) 
                              ? answer.join(', ')
                              : `${answer} ${prevStep.unit || ''}`
                          }
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Current Step Input */}
                  {isCurrentStep && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mt-6"
                    >
                      {renderInput()}
                    </motion.div>
                  )}

                  {/* Typing Indicator */}
                  {isCurrentStep && isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-accent-lime/20 flex-shrink-0 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-accent-lime" />
                      </div>
                      <div ref={typingRef} className="bg-white/5 backdrop-blur-sm rounded-2xl rounded-tl-sm p-4 border border-white/10 flex items-center gap-2">
                        <motion.div
                          animate={isTypingInView ? { opacity: [0.3, 1, 0.3] } : {}}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                          className="w-2 h-2 rounded-full bg-white/60"
                        />
                        <motion.div
                          animate={isTypingInView ? { opacity: [0.3, 1, 0.3] } : {}}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                          className="w-2 h-2 rounded-full bg-white/60"
                        />
                        <motion.div
                          animate={isTypingInView ? { opacity: [0.3, 1, 0.3] } : {}}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                          className="w-2 h-2 rounded-full bg-white/60"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </AnimatePresence>

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Skip Button - Hide on last step and when processing plan */}
      {!isLastStep && !isProcessingPlan && (
        <div className="sticky bottom-0 p-4 bg-dark-bg/80 backdrop-blur-xl border-t border-white/5 flex justify-center">
          <div className="w-full lg:w-1/2 lg:max-w-2xl flex justify-end">
            <button
              onClick={handleSkip}
              className="text-white/40 hover:text-white/60 text-sm transition-colors"
            >
              Skip this question
            </button>
          </div>
        </div>
      )}
    </div>
  );
}