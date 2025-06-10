import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

export interface ExerciseCardProps {
  id: string;
  name: string;
  gifUrl?: string;
  bodypart?: string;
  equipment: string;
  tier?: 'A' | 'B' | 'C';
  isCompound: boolean;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ name, bodypart, equipment, tier, isCompound, gifUrl }) => {
  return (
    <div className="group relative bg-neutral-950/70 backdrop-blur-lg border border-lime-400/20 rounded-2xl overflow-hidden flex flex-col text-white transition-all duration-300 hover:border-lime-400/60 hover:shadow-xl hover:shadow-lime-500/10">
      <div className="aspect-video w-full flex items-center justify-center overflow-hidden">
        {gifUrl ? (
          <img src={gifUrl} alt={name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-black/20 flex flex-col items-center justify-center text-neutral-600">
            <ImageIcon size={40} />
            <span className="text-xs mt-2">Image not available</span>
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="text-lg font-bold mb-3 truncate" title={name}>{name}</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-lime-900/50 text-lime-300 text-xs font-semibold px-2.5 py-1 rounded-full">{bodypart}</span>
            <span className="bg-neutral-700 text-neutral-300 text-xs font-semibold px-2.5 py-1 rounded-full">{equipment}</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isCompound ? 'bg-purple-900/60 text-purple-300' : 'bg-sky-900/60 text-sky-300'}`}>
              {isCompound ? 'Compound' : 'Isolation'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-sm font-bold ${tier === 'A' ? 'text-yellow-400' : tier === 'B' ? 'text-cyan-400' : 'text-gray-400'}`}>
            Tier {tier}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;
