import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Sparkles, 
  Activity, 
  TrendingUp, 
  Target,
  Users,
  Award,
  Zap,
  Heart,
  BarChart3,
  Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomeSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  features?: string[];
}

const welcomeSlides: WelcomeSlide[] = [
  {
    id: 'intro',
    title: 'Welcome to',
    subtitle: 'Your AI Fitness Coach',
    description: 'Transform your fitness journey with intelligent guidance, personalized plans, and real-time insights.',
    icon: <Sparkles className="w-8 h-8" />,
    gradient: 'from-accent-lime/20 via-accent-lime/5 to-transparent',
    features: ['AI-Powered', 'Personalized', 'Real-time Insights']
  },
  {
    id: 'tracking',
    title: 'Smart Tracking',
    subtitle: 'Every Rep Counts',
    description: 'Advanced analytics that understand your progress and adapt to your performance in real-time.',
    icon: <Activity className="w-8 h-8" />,
    gradient: 'from-accent-orange/20 via-accent-orange/5 to-transparent',
    features: ['Volume Tracking', 'Form Analysis', 'Progress Metrics']
  },
  {
    id: 'ai-coach',
    title: 'AI Coach',
    subtitle: 'Your Personal Trainer',
    description: 'Get instant feedback, form corrections, and motivation from your intelligent fitness companion.',
    icon: <Zap className="w-8 h-8" />,
    gradient: 'from-accent-red/20 via-accent-red/5 to-transparent',
    features: ['Voice Guidance', 'Form Checks', 'Live Feedback']
  },
  {
    id: 'community',
    title: 'Join the Elite',
    subtitle: 'Train Together',
    description: 'Connect with motivated athletes, share achievements, and push each other to new heights.',
    icon: <Users className="w-8 h-8" />,
    gradient: 'from-purple-500/20 via-purple-500/5 to-transparent',
    features: ['Challenges', 'Leaderboards', 'Social Features']
  },
  {
    id: 'goals',
    title: 'Achieve More',
    subtitle: 'Set. Track. Conquer.',
    description: 'Science-backed goal setting with intelligent milestones that keep you motivated and progressing.',
    icon: <Target className="w-8 h-8" />,
    gradient: 'from-blue-500/20 via-blue-500/5 to-transparent',
    features: ['Smart Goals', 'Milestones', 'Achievements']
  }
];

export function ModernWelcomeFlow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const navigate = useNavigate();

  // Auto-progress timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (currentSlide < welcomeSlides.length - 1) {
        handleNext();
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [currentSlide]);

  const handleNext = () => {
    if (currentSlide < welcomeSlides.length - 1) {
      setDirection(1);
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = () => {
    navigate('/login');
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
      scale: 0.9,
    }),
  };

  const slide = welcomeSlides[currentSlide];

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-accent-lime/20 blur-[120px]"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent-orange/20 blur-[120px]"
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-[0.015]" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <motion.div 
          className="px-6 pt-safe-top pb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-white/80">Get Started</h1>
            <button
              onClick={handleComplete}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Skip
            </button>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="px-6 pb-6">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-accent-lime to-accent-orange rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentSlide + 1) / welcomeSlides.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Slide Content */}
        <div className="flex-1 px-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={slide.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 },
              }}
              className="h-full flex flex-col"
            >
              {/* Icon & Visual */}
              <div className="relative mb-8">
                <div className={cn(
                  "w-full h-64 rounded-3xl overflow-hidden relative",
                  "bg-gradient-to-br", slide.gradient
                )}>
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
                  <div className="absolute inset-0 border border-white/10 rounded-3xl" />
                  
                  {/* Animated Icon */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  >
                    <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                      <div className="text-accent-lime">
                        {slide.icon}
                      </div>
                    </div>
                  </motion.div>

                  {/* Decorative Elements */}
                  <motion.div
                    className="absolute top-8 right-8 w-20 h-20 rounded-full bg-white/5"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.3, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="absolute bottom-8 left-8 w-16 h-16 rounded-full bg-white/5"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1 flex flex-col">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-4xl font-bold text-white mb-2">
                    {slide.title}
                  </h2>
                  <h3 className="text-2xl font-semibold text-accent-lime mb-4">
                    {slide.subtitle}
                  </h3>
                  <p className="text-lg text-white/70 leading-relaxed mb-6">
                    {slide.description}
                  </p>
                </motion.div>

                {/* Feature Pills */}
                {slide.features && (
                  <motion.div
                    className="flex flex-wrap gap-2 mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {slide.features.map((feature, index) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
                      >
                        <span className="text-sm text-white/80">{feature}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="px-6 pb-safe-bottom">
          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {welcomeSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === currentSlide
                    ? "w-8 bg-accent-lime"
                    : "w-2 bg-white/20 hover:bg-white/30"
                )}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {currentSlide > 0 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handlePrev}
                className="flex-1 h-14 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-white font-medium hover:bg-white/10 transition-all"
              >
                Back
              </motion.button>
            )}
            
            <button
              onClick={handleNext}
              className={cn(
                "flex-1 h-14 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2",
                "bg-gradient-to-r from-accent-lime to-accent-orange text-dark-surface",
                "hover:shadow-lg hover:shadow-accent-lime/25 active:scale-95"
              )}
            >
              {currentSlide === welcomeSlides.length - 1 ? 'Get Started' : 'Continue'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}