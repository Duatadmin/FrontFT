import React from 'react';

interface MuscleGroupCardProps {
  groupName: string;
  iconSrc: string; // Path to the SVG icon
  onSelectGroup: (group: string) => void;
}

const MuscleGroupCard: React.FC<MuscleGroupCardProps> = ({ groupName, iconSrc, onSelectGroup }) => {
  return (
    <button
      onClick={() => onSelectGroup(groupName)}
      className="flex flex-col items-center justify-center p-6 bg-neutral-800/60 backdrop-blur-lg border border-neutral-700/80 rounded-2xl text-white font-semibold capitalize text-center transition-all duration-300 ease-in-out hover:bg-lime-500/10 hover:border-lime-400/70 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-opacity-70 shadow-lg hover:shadow-lime-500/20 aspect-square"
    >
      <img src={iconSrc} alt={`${groupName} icon`} className="mb-3 h-12 w-12 object-contain group-hover:opacity-80 transition-opacity" />
      <span className="text-sm sm:text-base group-hover:text-white transition-colors">{groupName}</span>
    </button>
  );
};

export default MuscleGroupCard;
