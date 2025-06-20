import React from 'react';
import { ExerciseCardProps } from './ExerciseCard'; // Assuming similar base props
import { normalizeInstructions } from "@/utils/normalizers";
import { useCloudflareVideo } from '@/hooks/useCloudflareVideo';
import VideoPlayer from './VideoPlayer'; // Assuming VideoPlayer.tsx is in the same directory
import UseAnimations from 'react-useanimations';
import loadingAnimation from 'react-useanimations/lib/loading'; // Adjust path if necessary
import { cfImg } from '@/lib/cf'; // Import cfImg

// Extend or define new props specific to Full View based on docs/exercise_card.md
export interface ExerciseDetailViewProps extends Omit<ExerciseCardProps, 'gifUrl' | 'name' | 'bodypart' | 'equipment' | 'tier' | 'isCompound' | 'onSelect'> { // Omit props now handled by ExerciseCard or not directly used by DetailView, ensure id is still available if ExerciseCardProps had it as mandatory
  id: string; // Ensure id is explicitly part of DetailViewProps if needed for cfImg or other logic
  name?: string; // Keep name if DetailView displays it
  bodypart?: string;
  equipment?: string;
  tier?: 'A' | 'B' | 'C';
  isCompound?: boolean;
  maintarget?: string[];
  secondarymuscles?: string[];
  instructions?: string; // Could be markdown or structured content
  benefits?: string[];
  common_mistakes?: string[];
  safety_notes?: string[];
  alternatives?: Array<{ id: string; name: string; }>; // gifUrl removed
  onClose?: () => void; // Added onClose prop
  exerciseId: string; // Added exerciseId prop
  // user_notes?: string; // If implementing user notes
}

const ExerciseDetailView: React.FC<ExerciseDetailViewProps> = ({
  name,
  // gifUrl, // Removed
  bodypart,
  equipment,
  tier,
  isCompound,
  maintarget,
  secondarymuscles,
  instructions,
  benefits,
  common_mistakes,
  safety_notes,
  alternatives,
  onClose, // Destructure onClose
  exerciseId, // Destructure exerciseId
}) => {
  const mainImagePosterUrl = cfImg(exerciseId); // Image for poster and fallback
  const steps = normalizeInstructions(instructions);
  const { data: videoData, isLoading: isVideoLoading, error: videoError } = useCloudflareVideo(exerciseId);
  const [hasVideoStartedPlaying, setHasVideoStartedPlaying] = React.useState(false);

  return (
    <div 
      className="relative text-white w-full bg-transparent flex flex-col h-dvh md:h-auto md:max-w-4xl md:mx-auto md:my-8 overflow-hidden"
    >
      {/* Close Button */} 


      {/* Gradient Video Container */}
      <div className="gv-wrapper relative w-full aspect-video md:rounded-t-2xl overflow-hidden z-20 md:sticky-none"> {/* Applied w-full and rounded-t-2xl as requested */}
        {/* gradient below the video */}
        <div className="gv-gradient base" />

        {/* Shimmer Placeholder - visible when loading or before video has started playing */}
        {/* Static Placeholder: White background, will be tinted by the .gv-gradient.mask */}
        {/* Visible when loading or before video has started playing */}
        {(isVideoLoading || (videoData?.url && !hasVideoStartedPlaying)) && (
          <div 
            id="gv-video-placeholder" 
            className="gv-video bg-white absolute inset-0 z-[1] flex items-center justify-center" 
          >
            <UseAnimations 
              animation={loadingAnimation} 
              size={50} // Slightly smaller than programs page, adjust as needed
              strokeColor="#DFF250"
              className="z-[3]" // Ensure it's above the placeholder's bg (z-1) and mask (z-2)
            />
          </div>
        )}

        {/* Video Player - rendered when URL is available, opacity controlled by hasVideoStartedPlaying */}
        {videoData?.url && (
          <VideoPlayer
            id="gv-video" // ID is crucial for the CSS mask to work
            className={`gv-video w-full h-full ${hasVideoStartedPlaying ? 'opacity-100' : 'opacity-0'}`}
            hlsSrc={videoData.url}
            autoPlay
            muted
            loop={videoData.loop} // Use loop property from API response
            playsInline
            preload="metadata"
            poster={mainImagePosterUrl} // Use cfImg for poster
            onPlaying={() => setHasVideoStartedPlaying(true)}
            // onError or onStalled could be used to revert to shimmer if needed
          />
        )}

        {/* Fallback to GIF if no videoData.url but gifUrl exists, and not loading */}
        {!isVideoLoading && !videoData?.url && mainImagePosterUrl && (
          <img 
            id="gv-video" // ID is crucial for the CSS mask to work
            src={mainImagePosterUrl} 
            alt={name} 
            className="gv-video object-cover w-full h-full" 
          />
        )}

        {/* Error display */}
        {videoError && (
          <div 
            id="gv-video-error"
            className="gv-video bg-neutral-800 flex flex-col items-center justify-center text-red-400 p-4 absolute inset-0 z-[1]"
          >
            <p>Error loading video.</p>
            <p className='text-xs text-neutral-500'>{videoError.message}</p>
          </div>
        )}

        {/* Media not available display */}
        {!isVideoLoading && !videoData?.url && !videoError && !mainImagePosterUrl && (
          <div 
            id="gv-video-unavailable"
            className="gv-video bg-neutral-800 flex items-center justify-center text-neutral-500 absolute inset-0 z-[1]"
          >
            Media not available
          </div>
        )}

        {/* gradient tint that masks over white areas - always visible when placeholder or video is shown */}
        <div 
          className="gv-gradient mask opacity-90" // Assuming opacity-90 is configured in Tailwind for 0.9
          style={{ opacity: 0.9 }} // Fallback inline style
        />

        {/* Close Button */}
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute bottom-4 right-4 z-30 bg-black/40 hover:bg-black/60 text-white/80 hover:text-white font-semibold py-2 px-5 rounded-lg transition-colors text-sm"
            aria-label="Go back to exercise list"
          >
            Back
          </button>
        )}
      </div>

      {/* Scrollable Content Wrapper */}
      <div className="flex-1 overflow-y-auto pb-28 min-h-0">
        {/* Content Body */}
        <div className="w-full p-4 sm:p-6 md:p-8 bg-transparent md:bg-black/20 md:backdrop-blur-xl md:border-t md:border-white/10 md:rounded-b-2xl">
        {/* New Exercise Title Location */}
        <h2 className="text-3xl md:text-4xl font-bold text-lime-300 mb-6 tracking-tight drop-shadow-md">
          {name}
        </h2>
        <div className="flex flex-wrap gap-3 text-sm mb-6">
          {bodypart && <span className="bg-lime-600/20 backdrop-blur-sm border border-lime-500/40 text-lime-300 px-3 py-1.5 rounded-lg text-xs font-medium">{bodypart}</span>}
          {equipment && <span className="bg-neutral-700/30 backdrop-blur-sm border border-neutral-600/40 text-neutral-300 px-3 py-1.5 rounded-lg text-xs font-medium">{equipment}</span>}
          <span className={`px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-sm ${isCompound ? 'bg-purple-600/20 border border-purple-500/40 text-purple-300' : 'bg-sky-600/20 border border-sky-500/40 text-sky-300'}`}>
            {isCompound ? 'Compound' : 'Isolation'}
          </span>
          {tier && <span className={`px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-sm ${tier === 'A' ? 'text-yellow-300 bg-yellow-600/20 border border-yellow-500/40' : tier === 'B' ? 'text-cyan-300 bg-cyan-600/20 border border-cyan-500/40' : 'text-gray-400 bg-gray-700/30 border border-gray-600/40'}`}>Tier {tier}</span>}
        </div>

        {/* Details Section */}
        <div className="space-y-8">
          {maintarget && maintarget.length > 0 && (
            <div className="pt-6 border-t border-neutral-700/50 first:border-t-0 first:pt-0">
              <h3 className="text-xl font-semibold mb-3 text-lime-300">Main Target Muscles</h3>
              <ul className="list-disc list-inside pl-3 space-y-1.5 text-neutral-200">
                {maintarget.map((muscle, index) => <li key={index}>{muscle}</li>)}
              </ul>
            </div>
          )}

          {secondarymuscles && secondarymuscles.length > 0 && (
            <div className="pt-6 border-t border-neutral-700/50 first:border-t-0 first:pt-0">
              <h3 className="text-xl font-semibold mb-3 text-lime-300">Secondary Muscles</h3>
              <ul className="list-disc list-inside pl-3 space-y-1.5 text-neutral-200">
                {secondarymuscles.map((muscle, index) => <li key={index}>{muscle}</li>)}
              </ul>
            </div>
          )}

          {steps.length > 0 && (
            <section className="pt-6 border-t border-neutral-700/50 first:border-t-0 first:pt-0">
              <h3 className="text-brandGreen-200 text-lg font-semibold mb-2">
                Instructions
              </h3>
              <ol className="list-decimal list-outside ml-6 space-y-2 text-sm leading-6">
                {steps.map((step, i) => (
                  <li key={i} className="text-gray-100">{step}</li>
                ))}
              </ol>
            </section>
          )}

          {benefits && benefits.length > 0 && (
             <div className="pt-6 border-t border-neutral-700/50 first:border-t-0 first:pt-0">
              <h3 className="text-xl font-semibold mb-3 text-lime-300">Benefits</h3>
              <ul className="list-disc list-inside pl-3 space-y-1.5 text-neutral-200">
                {benefits.map((benefit, index) => <li key={index}>{benefit}</li>)}
              </ul>
            </div>
          )}

          {common_mistakes && common_mistakes.length > 0 && (
            <div className="pt-6 border-t border-neutral-700/50 first:border-t-0 first:pt-0">
              <h3 className="text-xl font-semibold mb-3 text-lime-300">Common Mistakes</h3>
              <ul className="list-disc list-inside pl-3 space-y-1.5 text-neutral-200">
                {common_mistakes.map((mistake, index) => <li key={index}>{mistake}</li>)}
              </ul>
            </div>
          )}

          {safety_notes && safety_notes.length > 0 && (
            <div className="pt-6 border-t border-neutral-700/50 first:border-t-0 first:pt-0">
              <h3 className="text-xl font-semibold mb-3 text-lime-300">Safety Notes</h3>
              <ul className="list-disc list-inside pl-3 space-y-1.5 text-neutral-200">
                {safety_notes.map((note, index) => <li key={index}>{note}</li>)}
              </ul>
            </div>
          )}

          {alternatives && alternatives.length > 0 && (
            <div className="pt-6 border-t border-neutral-700/50 first:border-t-0 first:pt-0">
              <h3 className="text-xl font-semibold mb-3 text-lime-300">Alternatives</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {alternatives.map(alt => { // Use curly braces for a block
                  const altImageUrl = cfImg(alt.id); // Define before returning JSX
                  return (
                    <div key={alt.id} className="bg-neutral-700/30 backdrop-blur-md border border-neutral-600/40 p-4 rounded-xl hover:bg-neutral-600/50 transition-colors shadow-lg hover:shadow-lime-500/20">
                      {altImageUrl && <img src={altImageUrl} alt={alt.name} className="w-full h-28 object-cover rounded-md mb-3 shadow-md"/>}
                      <p className="text-base font-semibold text-lime-300 truncate">{alt.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetailView;
