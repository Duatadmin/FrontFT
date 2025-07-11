import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  {
    id: 'available_days_per_week',
    question: "How many days can you train per week?",
    aiMessage: "Let's be realistic here - consistency beats perfection!",
    type: 'slider',
    icon: <Calendar className="w-5 h-5" />,
    category: 'schedule',
    min: 2,
    max: 7,
    step: 1,
    unit: 'days'
  },
  {
    id: 'session_duration_minutes',
    question: "How much time can you dedicate per workout?",
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
  {
    id: 'injuries',
    question: "Any injuries or limitations I should know about?",
    aiMessage: "Your safety is my priority. I'll adapt exercises accordingly.",
    type: 'text',
    icon: <Heart className="w-5 h-5" />,
    category: 'health',
    placeholder: 'E.g., bad knee, lower back pain, or none'
  },
  {
    id: 'sleep_hours_normalized',
    question: "How many hours do you typically sleep?",
    aiMessage: "Recovery is just as important as training!",
    type: 'slider',
    icon: <Moon className="w-5 h-5" />,
    category: 'health',
    min: 4,
    max: 10,
    step: 0.5,
    unit: 'hours'
  },
];

export function ConversationalOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingData>({});
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();
  const { user, updateOnboardingStatus } = useUserStore();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const step = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentStep]);

  const handleAnswer = async (value: any) => {
    setAnswers(prev => ({ ...prev, [step.id]: value }));
    
    if (currentStep < onboardingSteps.length - 1) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setCurrentStep(prev => prev + 1);
      }, 800);
    } else {
      // Complete onboarding
      await completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;
    
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
    <div className="min-h-screen bg-dark-bg flex flex-col">
      {/* Progress Bar */}
      <div className="sticky top-0 z-20 bg-dark-bg/80 backdrop-blur-xl border-b border-white/5">
        <div className="h-1 bg-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-accent-lime to-accent-orange"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6 space-y-6">
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
                      <div className="bg-white/5 backdrop-blur-sm rounded-2xl rounded-tl-sm p-4 border border-white/10 flex items-center gap-2">
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                          className="w-2 h-2 rounded-full bg-white/60"
                        />
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                          className="w-2 h-2 rounded-full bg-white/60"
                        />
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
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

      {/* Skip Button */}
      {currentStep < onboardingSteps.length - 1 && (
        <div className="sticky bottom-0 p-4 bg-dark-bg/80 backdrop-blur-xl border-t border-white/5">
          <div className="max-w-2xl mx-auto flex justify-end">
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