import React, { useState } from 'react';

import { useInView } from 'react-intersection-observer';
import { cfImg } from '@/lib/cf'; 
import { Dumbbell } from 'lucide-react'; 

export interface ExerciseCardProps {
  id: string; 
  name?: string; 
  bodypart?: string; 
  equipment?: string; 
  tier?: 'A' | 'B' | 'C'; 
  isCompound?: boolean; 
  onSelect?: (id: string) => void;
  absoluteIndex?: number; 
}

const PRELOAD_COUNT = 4; 

const getTierIconCount = (tier?: string): number => {
  if (!tier) return 1;
  switch (tier.toUpperCase()) {
    case 'S': return 5;
    case 'A': return 4;
    case 'B': return 3;
    case 'C': return 2;
    default: return 1;
  }
};

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  id,
  name = 'Exercise',
  bodypart,
  equipment,
  tier,
  isCompound,
  onSelect,
  absoluteIndex,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isPreloadCandidate = absoluteIndex !== undefined && absoluteIndex < PRELOAD_COUNT;

  const { ref, inView } = useInView({
    skip: isPreloadCandidate,
    triggerOnce: true,
    threshold: 0.1, 
  });

  const shouldAttemptLoad = isPreloadCandidate || inView;

  const imageUrl = cfImg(id);

  const handleImageLoad = () => setIsLoaded(true);
  const handleImageError = () => setImageError(true);

  const handleSelect = () => {
    if (onSelect) {
      onSelect(id);
    }
  };

  return (
    <div
      ref={ref}
      className="group relative bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col text-white transition-all duration-300 hover:bg-white/10 cursor-pointer"
      style={{ width: '100%' }} 
      onClick={handleSelect}
    >
      <div
        className="relative w-full overflow-hidden aspect-video"
      >
        {shouldAttemptLoad && (!isLoaded || imageError) && (
          <div className="absolute inset-0 bg-white z-0"></div>
        )}

        {shouldAttemptLoad && (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 z-0 ${
              isLoaded && !imageError ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        <div className="absolute inset-0 gv-gradient mask z-5 pointer-events-none"></div>
      </div>

      <div className="p-4 flex flex-col justify-between flex-grow"> 
        <h3 className="font-rubik text-base font-semibold truncate text-white mb-2" title={name}>
          {name}
        </h3>
        <div> 
          <div className="flex flex-wrap gap-2 mb-4">
            {bodypart && <span className="text-[0.7rem] bg-green-500/20 text-green-300 px-2 py-1 rounded-md border border-green-500/40 backdrop-blur-sm">{bodypart}</span>}
            {equipment && <span className="text-[0.7rem] bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md border border-blue-500/40 backdrop-blur-sm">{equipment}</span>}
            {typeof isCompound === 'boolean' && (
              <span className={`text-[0.7rem] px-2 py-1 rounded-md ${isCompound ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-sky-500/20 text-sky-300 border-sky-500/40'} border backdrop-blur-sm`}>
                {isCompound ? 'Compound' : 'Isolation'}
              </span>
            )}
          </div>
        </div>
        {/* Tier Icons - aligned to bottom of content area */}
        <div className="flex justify-end items-center mt-auto pt-2"> {/* mt-auto pushes to bottom, pt-2 for spacing */}
          {tier && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: getTierIconCount(tier) }).map((_, index) => (
                <Dumbbell key={index} className="w-4 h-4 text-lime-400" />
              ))}
            </div>
          )}
        </div>
      </div> {/* This closes the main content area div with p-4 etc. */}
    </div> /* This closes the main card wrapper div that starts with ref={ref} */
  );
};

export default ExerciseCard;
