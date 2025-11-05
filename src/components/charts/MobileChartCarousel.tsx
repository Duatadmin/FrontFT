import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileChartCarouselProps {
  children: React.ReactNode[];
  titles: string[];
}

const MobileChartCarousel: React.FC<MobileChartCarouselProps> = ({ children, titles }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Handle swipe gestures
  const handleDragEnd = (info: PanInfo) => {
    const { offset, velocity } = info;
    
    // Detect swipe direction with minimum velocity and offset
    if (Math.abs(velocity.x) > 0.5 && Math.abs(offset.x) > 50) {
      if (velocity.x > 0) {
        // Swipe right - go to previous chart
        if (activeIndex > 0) {
          setDirection(-1);
          setActiveIndex(activeIndex - 1);
        }
      } else {
        // Swipe left - go to next chart
        if (activeIndex < children.length - 1) {
          setDirection(1);
          setActiveIndex(activeIndex + 1);
        }
      }
    }
  };
  
  // Navigate to previous chart
  const prevChart = () => {
    if (activeIndex > 0) {
      setDirection(-1);
      setActiveIndex(activeIndex - 1);
    }
  };
  
  // Navigate to next chart
  const nextChart = () => {
    if (activeIndex < children.length - 1) {
      setDirection(1);
      setActiveIndex(activeIndex + 1);
    }
  };

  // Animation variants
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  };
  
  return (
    <div className="w-full bg-background-card rounded-2xl shadow-card overflow-hidden">
      {/* Header with title and navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
        <h2 className="text-lg font-semibold">{titles[activeIndex]}</h2>
        
        <div className="flex space-x-2">
          <button 
            className={`w-9 h-9 flex items-center justify-center rounded-full 
              ${activeIndex > 0 ? 'bg-background-surface text-text-primary' : 'bg-background-surface/50 text-text-tertiary'}`}
            onClick={prevChart}
            disabled={activeIndex === 0}
            aria-label="Previous chart"
          >
            <ChevronLeft size={18} />
          </button>
          
          <button 
            className={`w-9 h-9 flex items-center justify-center rounded-full 
              ${activeIndex < children.length - 1 ? 'bg-background-surface text-text-primary' : 'bg-background-surface/50 text-text-tertiary'}`}
            onClick={nextChart}
            disabled={activeIndex === children.length - 1}
            aria-label="Next chart"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      
      {/* Chart indicator dots */}
      <div className="flex justify-center py-2 space-x-1">
        {children.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === activeIndex ? 'bg-accent-violet w-4' : 'bg-text-tertiary'
            }`}
            onClick={() => {
              setDirection(index > activeIndex ? 1 : -1);
              setActiveIndex(index);
            }}
            aria-label={`Go to chart ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Chart content with swipe gesture */}
      <div className="w-full h-[350px] relative overflow-hidden">
        <motion.div
          className="w-full h-full touch-pan-y"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => handleDragEnd(info)}
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute w-full h-full"
            >
              {children[activeIndex]}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default MobileChartCarousel;
