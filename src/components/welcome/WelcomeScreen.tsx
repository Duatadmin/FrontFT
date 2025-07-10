import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { cn } from '@/lib/utils';
import { welcomeSlides } from './welcomeData';

export function WelcomeScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const navigate = useNavigate();

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const goNext = () => {
    if (currentSlide < welcomeSlides.length - 1) {
      goToSlide(currentSlide + 1);
    }
  };

  const goPrev = () => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  };

  const handleComplete = () => {
    navigate('/login');
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  const slide = welcomeSlides[currentSlide];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Screen</h1>
          <div className="flex items-center justify-center gap-2">
            {welcomeSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  index === currentSlide
                    ? 'w-8 bg-accent-violet'
                    : 'bg-white/20 hover:bg-white/30'
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Slide Container */}
        <Card className="bg-background-card border-border-light overflow-hidden">
          <CardContent className="p-0">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentSlide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="relative"
              >
                <div className="p-6 min-h-[600px] flex flex-col">
                  {/* Top Section with Icon/Illustration */}
                  <div className="flex-1 flex items-center justify-center mb-6">
                    {slide.illustration ? (
                      <div className="relative w-full max-w-xs">
                        {slide.illustration}
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-accent-violet/20 flex items-center justify-center">
                        {slide.icon}
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-white">
                      {slide.title}
                    </h2>
                    <p className="text-text-secondary leading-relaxed">
                      {slide.description}
                    </p>
                    {slide.additionalContent && (
                      <div className="mt-6">{slide.additionalContent}</div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-light">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goPrev}
                      disabled={currentSlide === 0}
                      className="text-text-secondary hover:text-white"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>

                    {currentSlide === welcomeSlides.length - 1 ? (
                      <Button
                        onClick={handleComplete}
                        className="bg-accent-violet hover:bg-accent-violet/90 text-black font-semibold"
                      >
                        Get Started
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={goNext}
                        className="text-white hover:text-accent-violet"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Skip Button */}
        <div className="text-center mt-6">
          <Button
            variant="link"
            onClick={handleComplete}
            className="text-text-tertiary hover:text-text-secondary"
          >
            Skip Introduction
          </Button>
        </div>
      </div>
    </div>
  );
}