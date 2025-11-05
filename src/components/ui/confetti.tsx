import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiProps {
  active: boolean;
  duration?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  size: number;
}

export const Confetti: React.FC<ConfettiProps> = ({ active, duration = 3000 }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (active) {
      // Generate confetti particles
      const newParticles: Particle[] = [];
      const colors = ['#DFF250', '#FFA500', '#00D4FF', '#FF6B6B', '#4ECDC4'];
      
      for (let i = 0; i < 30; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100 - 50, // -50 to 50
          y: Math.random() * -100 - 50, // -150 to -50
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          size: Math.random() * 8 + 4, // 4 to 12
        });
      }
      
      setParticles(newParticles);

      // Clear particles after duration
      const timer = setTimeout(() => {
        setParticles([]);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[150]">
      <div className="relative w-full h-full">
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                x: '50%',
                y: '50%',
                scale: 0,
                rotate: 0,
              }}
              animate={{
                x: `calc(50% + ${particle.x}vw)`,
                y: `calc(50% + ${particle.y}vh)`,
                scale: 1,
                rotate: particle.rotation,
              }}
              exit={{
                y: '100vh',
                opacity: 0,
              }}
              transition={{
                duration: duration / 1000,
                ease: 'easeOut',
              }}
              className="absolute"
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '0%',
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};