import React from 'react';
import { ExerciseCardProps } from './ExerciseCard'; // Assuming similar base props

// Extend or define new props specific to Full View based on docs/exercise_card.md
export interface ExerciseDetailViewProps extends ExerciseCardProps {
  maintarget?: string[];
  secondarymuscles?: string[];
  instructions?: string; // Could be markdown or structured content
  benefits?: string[];
  common_mistakes?: string[];
  safety_notes?: string[];
  alternatives?: Array<{ id: string; name: string; gifUrl?: string }>; // Example structure
  // user_notes?: string; // If implementing user notes
}

const ExerciseDetailView: React.FC<ExerciseDetailViewProps> = ({
  name,
  gifUrl,
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
}) => {
  return (
    <div className="p-4 md:p-8 bg-neutral-900 text-white rounded-lg shadow-xl max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-2 text-lime-400">{name}</h2>
        <div className="flex flex-wrap gap-2 text-sm mb-4">
          {bodypart && <span className="bg-lime-900/70 text-lime-300 px-3 py-1 rounded-full">{bodypart}</span>}
          {equipment && <span className="bg-neutral-700 text-neutral-300 px-3 py-1 rounded-full">{equipment}</span>}
          <span className={`px-3 py-1 rounded-full ${isCompound ? 'bg-purple-900/70 text-purple-300' : 'bg-sky-900/70 text-sky-300'}`}>
            {isCompound ? 'Compound' : 'Isolation'}
          </span>
          {tier && <span className={`px-3 py-1 rounded-full font-semibold ${tier === 'A' ? 'text-yellow-400 bg-yellow-900/50' : tier === 'B' ? 'text-cyan-400 bg-cyan-900/50' : 'text-gray-400 bg-gray-700/50'}`}>Tier {tier}</span>}
        </div>
      </div>

      {/* Main Content: Media and Details */}
      <div className="md:grid md:grid-cols-2 md:gap-8 items-start">
        {/* Media Column (GIF/Video) */}
        <div className="mb-6 md:mb-0">
          {gifUrl ? (
            <video src={gifUrl} controls autoPlay loop muted className="w-full rounded-lg shadow-lg aspect-video bg-black">
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="w-full aspect-video bg-neutral-800 flex items-center justify-center rounded-lg text-neutral-500">
              Media not available
            </div>
          )}
        </div>

        {/* Details Column */}
        <div className="space-y-6">
          {maintarget && maintarget.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-2 text-lime-300">Main Target Muscles</h3>
              <ul className="list-disc list-inside pl-2 space-y-1 text-neutral-300">
                {maintarget.map((muscle, index) => <li key={index}>{muscle}</li>)}
              </ul>
            </div>
          )}

          {secondarymuscles && secondarymuscles.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-2 text-lime-300">Secondary Muscles</h3>
              <ul className="list-disc list-inside pl-2 space-y-1 text-neutral-300">
                {secondarymuscles.map((muscle, index) => <li key={index}>{muscle}</li>)}
              </ul>
            </div>
          )}

          {instructions && (
            <div>
              <h3 className="text-xl font-semibold mb-2 text-lime-300">Instructions</h3>
              {/* Assuming instructions is a simple string for now. For markdown, a parser would be needed. */}
              <p className="text-neutral-300 whitespace-pre-line">{instructions}</p>
            </div>
          )}

          {/* Placeholder for other sections like Benefits, Common Mistakes, etc. */}
          {benefits && benefits.length > 0 && (
             <div>
              <h3 className="text-xl font-semibold mb-2 text-lime-300">Benefits</h3>
              <ul className="list-disc list-inside pl-2 space-y-1 text-neutral-300">
                {benefits.map((benefit, index) => <li key={index}>{benefit}</li>)}
              </ul>
            </div>
          )}

          {common_mistakes && common_mistakes.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-2 text-lime-300">Common Mistakes</h3>
              <ul className="list-disc list-inside pl-2 space-y-1 text-neutral-300">
                {common_mistakes.map((mistake, index) => <li key={index}>{mistake}</li>)}
              </ul>
            </div>
          )}

          {safety_notes && safety_notes.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-2 text-lime-300">Safety Notes</h3>
              <ul className="list-disc list-inside pl-2 space-y-1 text-neutral-300">
                {safety_notes.map((note, index) => <li key={index}>{note}</li>)}
              </ul>
            </div>
          )}

          {alternatives && alternatives.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-2 text-lime-300">Alternatives</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {alternatives.map(alt => (
                  <div key={alt.id} className="bg-neutral-800/70 p-3 rounded-lg hover:bg-neutral-700/70 transition-colors">
                    {alt.gifUrl && <img src={alt.gifUrl} alt={alt.name} className="w-full h-24 object-cover rounded mb-2"/>}
                    <p className="text-sm font-semibold text-lime-400 truncate">{alt.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Log Set Button - Placeholder */}
          <div className="mt-8 text-center">
            <button className="bg-lime-500 hover:bg-lime-600 text-neutral-900 font-bold py-3 px-6 rounded-lg transition-colors duration-150">
              Log Set
            </button>
          </div>

        </div> {/* End Details Column */}
      </div> {/* End Main Content Grid */}
    </div> /* End Component Root */
  );
};

export default ExerciseDetailView;

