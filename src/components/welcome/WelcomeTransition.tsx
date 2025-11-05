import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface WelcomeTransitionProps {
  children: ReactNode;
}

export function WelcomeTransition({ children }: WelcomeTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.05, y: -20 }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.8, 0.25, 1], // Smooth cubic-bezier easing
      }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}