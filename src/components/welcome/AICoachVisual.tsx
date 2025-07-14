import { motion } from 'framer-motion';
import { Brain, Activity, BarChart3, Shield, Zap } from 'lucide-react';
import { useInViewport } from '@/hooks/useInViewport';

export function AICoachVisual() {
  const [containerRef, isInView] = useInViewport<HTMLDivElement>();

  return (
    <div ref={containerRef} className="relative w-full h-[280px] flex items-center justify-center">
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Central AI Brain - No rotation, just pulse */}
        <motion.div
          className="absolute z-10 w-[102px] h-[102px] rounded-full bg-gradient-to-br from-accent-lime/30 to-accent-orange/30 flex items-center justify-center"
          animate={isInView ? {
            scale: [1, 1.05, 1],
          } : {}}
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
          animate={isInView ? {
            rotate: 360,
          } : {}}
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
                    animate={isInView ? {
                      rotate: -360,
                    } : {}}
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
          animate={isInView ? {
            rotate: -360,
          } : {}}
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
                    animate={isInView ? {
                      rotate: 360,
                    } : {}}
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
  );
}