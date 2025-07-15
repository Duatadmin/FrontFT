import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
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
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '../../../assets/Logo.svg?react';
import { useUserStore } from '@/lib/stores/useUserStore';
import { supabase } from '@/lib/supabase';
import Orb from '@/components/Orb/Orb';
import ShinyText from '@/components/ShinyText/ShinyText';

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
  inputType?: 'select' | 'slider' | 'text' | 'number';
  options?: { value: string; label: string; icon?: React.ReactNode }[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  placeholder?: string;
  fieldName?: string;
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
  // Onboarding Questions
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
  {
    id: 'age',
    badge: "Almost done",
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
  {
    id: 'complete',
    badge: "All set! 🎉",
    title: "Preparing your",
    subtitle: "personalized plan",
    description: "Let's start your transformation journey together!",
    visual: (
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
    ),
    cta: "Let's Go!"
  }
];

export function PremiumWelcomeFlow() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [onboardingData, setOnboardingData] = useState<Record<string, any>>({});
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();
  const dragX = useMotionValue(0);
  const { user, updateOnboardingStatus } = useUserStore();
  const [backgroundRef, isBackgroundInView] = useInViewport<HTMLDivElement>();
  const isMobile = useIsMobile();
  
  const screen = screens[currentScreen];
  const isOnboardingScreen = screen.isOnboarding;

  const handleNext = async () => {
    if (isOnboardingScreen && screen.fieldName) {
      // For slider inputs, use the current value from onboardingData
      if (screen.inputType === 'slider') {
        const value = onboardingData[screen.fieldName] || screen.min || 0;
        setOnboardingData(prev => ({ ...prev, [screen.fieldName!]: value }));
      }
    }

    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
      setInputValue(''); // Reset input for next screen
    } else {
      // Complete onboarding
      await completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      // Save onboarding data to user profile
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          ...onboardingData,
          onboarding_completed_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update onboarding status
      await updateOnboardingStatus(true);
      
      // Navigate to main app
      navigate('/');
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
      navigate('/');
    }
  };

  const handleOptionSelect = (value: string) => {
    if (screen.fieldName) {
      setOnboardingData(prev => ({ ...prev, [screen.fieldName!]: value }));
      setTimeout(() => handleNext(), 300); // Auto-advance after selection
    }
  };

  const handleSkip = () => {
    if (currentScreen < 4) {
      // Skip to onboarding questions
      setCurrentScreen(4);
    } else {
      // Skip current question
      handleNext();
    }
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
    <div className="min-h-screen bg-dark-bg relative overflow-hidden flex flex-col">
      {/* Dynamic Background */}
      <div ref={backgroundRef} className="absolute inset-0">
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
            {currentScreen > 0 && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setCurrentScreen(prev => prev - 1)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            )}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleSkip}
              className="text-white/60 hover:text-white text-sm font-medium transition-colors px-3 py-1"
            >
              {currentScreen < 4 ? 'Skip' : isOnboardingScreen ? 'Skip question' : 'Skip'}
            </motion.button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col px-6 overflow-hidden">
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
                <div className="flex-1 min-h-0 flex flex-col justify-center space-y-4">
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

                  {/* Number/Text Input */}
                  {(screen.inputType === 'number' || screen.inputType === 'text') && (
                    <form onSubmit={(e) => { 
                      e.preventDefault(); 
                      if (inputValue && screen.fieldName) {
                        setOnboardingData(prev => ({ 
                          ...prev, 
                          [screen.fieldName!]: screen.inputType === 'number' ? Number(inputValue) : inputValue 
                        }));
                        handleNext();
                      }
                    }}>
                      <input
                        type={screen.inputType}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={screen.placeholder}
                        min={screen.min}
                        max={screen.max}
                        className="w-full p-5 bg-white/5 border border-white/20 rounded-2xl text-white text-lg placeholder-white/40 focus:outline-none focus:border-accent-lime/50 transition-colors"
                        autoFocus
                      />
                    </form>
                  )}
                </div>
              ) : (
                <div className="flex-1 min-h-0 flex items-center justify-center my-4">
                  <div className="w-full">
                    {screen.visual}
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
        <footer className="px-6 pb-8">
          <div className="flex justify-center">
            <div className="w-full lg:w-1/2 lg:max-w-2xl">
          <div className="pb-safe-bottom">
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
              {(!isOnboardingScreen || (isOnboardingScreen && screen.inputType === 'slider') || screen.id === 'complete') && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  disabled={isOnboardingScreen && screen.inputType === 'number' && !inputValue}
                  className={cn(
                    "relative w-full h-14 rounded-2xl font-semibold text-dark-bg",
                    "bg-gradient-to-r from-accent-lime to-accent-orange",
                    "shadow-2xl shadow-accent-lime/30",
                    "flex items-center justify-center gap-2",
                    "transition-all duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <span className="text-base font-bold">{screen.cta || (currentScreen === screens.length - 1 ? 'Get Started' : 'Continue')}</span>
                  <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
                </motion.button>
              )}
            </div>
          </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}