import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * PageTransition component
 * Wraps page content with smooth transitions to eliminate layout flicker
 * Uses Framer Motion for subtle fade effect while maintaining layout structure
 */
const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0.8 }}
      transition={{ 
        duration: 0.15,
        ease: 'easeInOut'
      }}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
