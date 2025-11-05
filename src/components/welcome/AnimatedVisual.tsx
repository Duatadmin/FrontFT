import { motion } from 'framer-motion';
import { useInViewport } from '@/hooks/useInViewport';

interface AnimatedVisualProps {
  children: React.ReactNode;
  animate?: any;
  transition?: any;
  className?: string;
  style?: React.CSSProperties;
}

export function AnimatedVisual({ 
  children, 
  animate, 
  transition, 
  className, 
  style 
}: AnimatedVisualProps) {
  const [ref, isInView] = useInViewport<HTMLDivElement>();

  return (
    <motion.div
      ref={ref}
      animate={isInView ? animate : {}}
      transition={transition}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}