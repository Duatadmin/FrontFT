import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
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
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '../../../assets/Logo.svg?react';

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
  visual: React.ReactNode;
  features?: Feature[];
  cta?: string;
}

const screens: WelcomeScreen[] = [
  {
    id: 'hero',
    title: 'Transform Your',
    subtitle: 'Fitness Journey',
    description: 'AI-powered coaching meets personalized training for unprecedented results.',
    visual: (
      <div className="relative w-full h-full flex items-center justify-center">
        {/* 3D Floating Phone Mockup */}
        <motion.div
          className="relative"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-40 h-80 bg-gradient-to-br from-white/10 to-white/5 rounded-[2.5rem] border border-white/20 backdrop-blur-xl p-2">
            <div className="w-full h-full bg-dark-bg rounded-[2rem] overflow-hidden">
              {/* Mini Dashboard Preview */}
              <div className="p-3 space-y-2">
                <div className="h-12 bg-gradient-to-r from-accent-lime/20 to-accent-orange/20 rounded-lg animate-pulse" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-10 bg-white/5 rounded animate-pulse" />
                  <div className="h-10 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-2 bg-white/10 rounded-full w-3/4 animate-pulse" />
                  <div className="h-2 bg-white/10 rounded-full w-1/2 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating Elements */}
          <motion.div
            className="absolute -top-8 -right-8 w-16 h-16 bg-accent-lime/20 rounded-full blur-xl"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-8 -left-8 w-20 h-20 bg-accent-orange/20 rounded-full blur-xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
        </motion.div>
      </div>
    ),
  },
  {
    id: 'ai-coach',
    title: 'Your Personal',
    subtitle: 'AI Coach',
    description: 'Get real-time form corrections, personalized workouts, and intelligent progress tracking.',
    visual: (
      <div className="relative w-full h-[280px] flex items-center justify-center">
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Central AI Brain - No rotation, just pulse */}
          <motion.div
            className="absolute z-10 w-[102px] h-[102px] rounded-full bg-gradient-to-br from-accent-lime/30 to-accent-orange/30 flex items-center justify-center"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-[70px] h-[70px] rounded-full bg-dark-bg/80 backdrop-blur-xl border border-white/20 flex items-center justify-center">
              <Brain className="w-9 h-9 text-accent-lime" />
            </div>
          </motion.div>
          
          {/* First Orbit - Clockwise with 2 elements */}
          <motion.div
            className="absolute inset-0"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[
              { icon: <Activity className="w-5 h-5" />, angle: 0 },
              { icon: <BarChart3 className="w-5 h-5" />, angle: 180 },
            ].map((item, index) => {
              const angleRad = (item.angle * Math.PI) / 180;
              const radius = 80;
              const x = Math.cos(angleRad) * radius;
              const y = Math.sin(angleRad) * radius;
              
              return (
                <div
                  key={`orbit1-${index}`}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg">
                    <motion.div
                      animate={{
                        rotate: -360,
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      {item.icon}
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </motion.div>
          
          {/* Second Orbit - Counter-clockwise with 2 elements */}
          <motion.div
            className="absolute inset-0"
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[
              { icon: <Shield className="w-5 h-5" />, angle: 90 },
              { icon: <Zap className="w-5 h-5" />, angle: 270 },
            ].map((item, index) => {
              const angleRad = (item.angle * Math.PI) / 180;
              const radius = 130;
              const x = Math.cos(angleRad) * radius;
              const y = Math.sin(angleRad) * radius;
              
              return (
                <div
                  key={`orbit2-${index}`}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg">
                    <motion.div
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      {item.icon}
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </motion.div>
          
          {/* Orbit Path Indicators */}
          <div className="absolute top-1/2 left-1/2 w-[160px] h-[160px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 w-[260px] h-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 pointer-events-none" />
        </div>
      </div>
    ),
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
    badge: 'Premium Features',
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
        title: 'Works Offline',
        description: 'Train anywhere, anytime'
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
];

export function PremiumWelcomeFlow() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const navigate = useNavigate();
  const dragX = useMotionValue(0);
  
  const screen = screens[currentScreen];

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      navigate('/login');
    }
  };

  const handleSkip = () => {
    navigate('/login');
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
      <div className="absolute inset-0">
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
            animate={{
              cx: ["20%", "80%", "20%"],
              cy: ["20%", "80%", "20%"],
            }}
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
            animate={{
              cx: ["80%", "20%", "80%"],
              cy: ["80%", "20%", "80%"],
            }}
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
          
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleSkip}
            className="text-white/60 hover:text-white text-sm font-medium transition-colors px-3 py-1"
          >
            Skip
          </motion.button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col px-6 overflow-hidden">
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

              {/* Visual Section - Centered between text and features */}
              <div className="flex-1 min-h-0 flex items-center justify-center my-4">
                <div className="w-full">
                  {screen.visual}
                </div>
              </div>

              {/* Features List */}
              {screen.features && (
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
        </main>

        {/* Bottom Navigation */}
        <footer className="px-6 pb-8">
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
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className={cn(
                  "relative w-full h-14 rounded-2xl font-semibold text-dark-bg",
                  "bg-gradient-to-r from-accent-lime to-accent-orange",
                  "shadow-2xl shadow-accent-lime/30",
                  "flex items-center justify-center gap-2",
                  "transition-all duration-200"
                )}
              >
                <span className="text-base font-bold">{screen.cta || (currentScreen === screens.length - 1 ? 'Get Started' : 'Continue')}</span>
                <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
              </motion.button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}