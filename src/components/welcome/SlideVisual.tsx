import { motion } from 'framer-motion';
import { useInViewport } from '@/hooks/useInViewport';
import { cn } from '@/lib/utils';

interface SlideVisualProps {
  gradient: string;
  icon: React.ReactNode;
}

export function SlideVisual({ gradient, icon }: SlideVisualProps) {
  const [ref, isInView] = useInViewport<HTMLDivElement>();

  return (
    <div ref={ref} className="relative mb-8">
      <div className={cn(
        "w-full h-64 rounded-3xl overflow-hidden relative",
        "bg-gradient-to-br", gradient
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
              {icon}
            </div>
          </div>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          className="absolute top-8 right-8 w-20 h-20 rounded-full bg-white/5"
          animate={isInView ? {
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.3, 0.5],
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-8 left-8 w-16 h-16 rounded-full bg-white/5"
          animate={isInView ? {
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          } : {}}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}