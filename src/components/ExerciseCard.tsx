import React, { useState } from 'react';

import { useInView } from 'react-intersection-observer';
import { cfImg } from '@/lib/cf'; // Assuming cf.ts is in src/lib

export interface ExerciseCardProps {
  id: string; // This will be used as the image ID for Cloudflare
  name?: string; // Made optional as it might not be available or needed for display logic
  bodypart?: string; // Uncommented
  equipment?: string; // Uncommented
  tier?: 'A' | 'B' | 'C'; // Uncommented
  isCompound?: boolean; // Uncommented
  onSelect?: (id: string) => void;
  absoluteIndex?: number; // Added for preloading logic
}

const CARD_HEIGHT_PX = 540; // Define card height as a constant

const PRELOAD_COUNT = 4; // How many initial cards to eagerly load

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

  // Determine if this card is one of the initial cards to preload
  const isPreloadCandidate = absoluteIndex !== undefined && absoluteIndex < PRELOAD_COUNT;

  // useInView hook:
  // - skip: if it's a preload candidate (we'll load it regardless of view)
  // - triggerOnce: true (load once when it comes into view, if not preloaded)
  const { ref, inView } = useInView({
    skip: isPreloadCandidate,
    triggerOnce: true,
    threshold: 0.1, // Standard threshold
  });

  // An image should attempt to load if it's a preload candidate OR if it has come into view
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
      className="group relative bg-neutral-950/70 backdrop-blur-lg border border-lime-400/20 rounded-2xl overflow-hidden flex flex-col text-white transition-all duration-300 hover:border-lime-400/60 hover:shadow-xl hover:shadow-lime-500/10 cursor-pointer"
      style={{ height: `${CARD_HEIGHT_PX}px`, width: '100%' }}
      onClick={handleSelect}
    >
      {/* Image Area */}
      <div
        className="relative w-full overflow-hidden bg-neutral-900"
        style={{ height: '340px' }}
      >
        {/* Layer 0 Content: White Placeholder OR Image */}
        
        {/* White placeholder background: 
            Shown if shouldAttemptLoad AND (image is not yet loaded OR image has an error) */}
        {shouldAttemptLoad && (!isLoaded || imageError) && (
          <div className="absolute inset-0 bg-white z-0"></div>
        )}

        {/* Actual Image: 
            Attempted to render if shouldAttemptLoad. 
            Opacity handles fade-in. Sits at z-0. */}
        {shouldAttemptLoad && (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-0 ${
              isLoaded && !imageError ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        {/* Layer 1: Gradient Overlay (Always on top of Layer 0 content) */}
        <div className="absolute inset-0 gv-gradient mask z-10 pointer-events-none"></div>
      </div>

      {/* Content Area - for name and other details */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div> {/* Top part of content area */}
          <h3 className="text-lg font-semibold truncate mb-2" title={name}>
            {name}
          </h3>
          {/* Tags for bodypart, equipment, isCompound */}
          <div className="flex flex-wrap gap-2 mb-2">
            {bodypart && <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-md">{bodypart}</span>}
            {equipment && <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md">{equipment}</span>}
            {typeof isCompound === 'boolean' && (
              <span className={`text-xs px-2 py-1 rounded-md ${isCompound ? 'bg-purple-500/20 text-purple-300' : 'bg-sky-500/20 text-sky-300'}`}>
                {isCompound ? 'Compound' : 'Isolation'}
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-end items-center"> {/* Bottom part of content area, for Tier */}
          {tier && <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2.5 py-1 rounded-md font-medium">{`Tier ${tier}`}</span>}
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;
