import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Droplets, 
  Plus, 
  Minus, 
  TrendingUp, 
  Award,
  Sparkles,
  Target,
  Clock,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WaterTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  currentIntake: number;
  goal: number;
  onUpdateIntake: (glasses: number) => void;
}

interface WaterDrop {
  id: number;
  x: number;
  delay: number;
}

export function WaterTracker({ 
  isOpen, 
  onClose, 
  currentIntake, 
  goal, 
  onUpdateIntake 
}: WaterTrackerProps) {
  const [localIntake, setLocalIntake] = useState(currentIntake);
  const [showCelebration, setShowCelebration] = useState(false);
  const [waterDrops, setWaterDrops] = useState<WaterDrop[]>([]);
  const [streak, setStreak] = useState(7); // Mock streak data
  
  const percentage = Math.min((localIntake / goal) * 100, 100);
  const remaining = Math.max(goal - localIntake, 0);
  
  // Create water drop animation
  useEffect(() => {
    if (localIntake > currentIntake) {
      const drops = Array.from({ length: 5 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 60 - 30,
        delay: i * 0.1
      }));
      setWaterDrops(drops);
      setTimeout(() => setWaterDrops([]), 2000);
    }
  }, [localIntake]);

  // Check for goal celebration
  useEffect(() => {
    if (localIntake >= goal && !showCelebration) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [localIntake, goal]);

  const handleAddGlass = () => {
    const newIntake = localIntake + 1;
    setLocalIntake(newIntake);
    onUpdateIntake(newIntake);
  };

  const handleRemoveGlass = () => {
    if (localIntake > 0) {
      const newIntake = localIntake - 1;
      setLocalIntake(newIntake);
      onUpdateIntake(newIntake);
    }
  };

  const handleQuickAdd = (glasses: number) => {
    const newIntake = localIntake + glasses;
    setLocalIntake(newIntake);
    onUpdateIntake(newIntake);
  };

  const getMotivationalText = () => {
    if (percentage === 0) return "Let's start hydrating! 💧";
    if (percentage < 25) return "Great start! Keep going! 💪";
    if (percentage < 50) return "You're doing amazing! 🌊";
    if (percentage < 75) return "Almost there! Don't stop! 🚀";
    if (percentage < 100) return "So close to your goal! 🎯";
    return "Goal achieved! You're a hydration hero! 🏆";
  };

  const getWaveHeight = () => {
    return `${100 - percentage}%`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: '100%', opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-dark-bg/95 backdrop-blur-2xl rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Hydration Tracker</h3>
                    <p className="text-sm text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-white rotate-90" />
                </button>
              </div>

              {/* Streak Badge */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30"
              >
                <Award className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-orange-300">{streak} day streak! 🔥</span>
              </motion.div>
            </div>

            {/* Main Water Visual */}
            <div className="relative px-6">
              <div className="relative h-[280px] rounded-3xl bg-gradient-to-b from-blue-950/30 to-blue-900/30 overflow-hidden border border-blue-500/20">
                {/* Water Waves */}
                <motion.div
                  className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-blue-500 via-blue-400 to-cyan-400"
                  initial={{ height: getWaveHeight() }}
                  animate={{ height: getWaveHeight() }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                >
                  {/* Wave Animation */}
                  <svg className="absolute inset-x-0 top-0 w-full h-12" preserveAspectRatio="none">
                    <motion.path
                      d="M0,6 C150,12 350,0 500,6 L500,50 L0,50 Z"
                      fill="rgba(255,255,255,0.1)"
                      animate={{
                        d: [
                          "M0,6 C150,12 350,0 500,6 L500,50 L0,50 Z",
                          "M0,6 C150,0 350,12 500,6 L500,50 L0,50 Z",
                          "M0,6 C150,12 350,0 500,6 L500,50 L0,50 Z"
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </svg>
                </motion.div>

                {/* Glass Counter */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    key={localIntake}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                  >
                    <p className="text-6xl font-bold text-white mb-2">{localIntake}</p>
                    <p className="text-lg text-white/80">of {goal} glasses</p>
                  </motion.div>

                  {/* Percentage */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm"
                  >
                    <p className="text-sm font-medium text-white">{percentage.toFixed(0)}% Complete</p>
                  </motion.div>
                </div>

                {/* Water Drop Animations */}
                <AnimatePresence>
                  {waterDrops.map((drop) => (
                    <motion.div
                      key={drop.id}
                      initial={{ y: -20, x: drop.x, opacity: 0 }}
                      animate={{ y: 100, x: drop.x, opacity: [0, 1, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.5, delay: drop.delay }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2"
                    >
                      <Droplets className="w-6 h-6 text-blue-300" />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Celebration - moved to top */}
                <AnimatePresence>
                  {showCelebration && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0, opacity: 0, y: -20 }}
                      className="absolute top-4 left-0 right-0 flex justify-center z-20"
                    >
                      <div className="bg-gradient-to-r from-yellow-500/90 to-orange-500/90 backdrop-blur-md px-6 py-3 rounded-full border border-yellow-400/50 shadow-lg shadow-yellow-500/25">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-white animate-pulse" />
                          <p className="text-sm font-bold text-white">Goal Reached! 🎉</p>
                          <Sparkles className="w-5 h-5 text-white animate-pulse" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Motivational Text */}
              <motion.p
                key={getMotivationalText()}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-sm text-gray-400 mt-4"
              >
                {getMotivationalText()}
              </motion.p>
            </div>

            {/* Quick Add Buttons */}
            <div className="px-6 py-4">
              <p className="text-xs text-gray-500 mb-3 text-center">Quick add</p>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((amount) => (
                  <motion.button
                    key={amount}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickAdd(amount)}
                    className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-white transition-all"
                  >
                    +{amount}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Main Controls */}
            <div className="p-6 pt-2">
              <div className="flex items-center justify-between gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRemoveGlass}
                  disabled={localIntake === 0}
                  className={cn(
                    "flex-1 h-14 rounded-2xl font-medium transition-all flex items-center justify-center gap-2",
                    localIntake === 0
                      ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                      : "bg-white/10 hover:bg-white/15 text-white border border-white/20"
                  )}
                >
                  <Minus className="w-5 h-5" />
                  Remove Glass
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddGlass}
                  className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Glass
                </motion.button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <Target className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Remaining</p>
                  <p className="text-lg font-semibold text-white">{remaining}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <Clock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Last drink</p>
                  <p className="text-lg font-semibold text-white">1h ago</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <TrendingUp className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Avg/day</p>
                  <p className="text-lg font-semibold text-white">7.2</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}