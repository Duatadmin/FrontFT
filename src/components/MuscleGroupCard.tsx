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
      className="group flex flex-col items-center justify-center p-4 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl text-text-secondary capitalize text-center aspect-square transition-colors duration-300 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
    >
      <img src={iconSrc} alt={`${groupName} icon`} className="mb-1 h-1/2 w-1/2 object-contain" />
      <span className="text-sm mt-1 group-hover:text-white">{groupName}</span>
    </button>
  );
};

export default MuscleGroupCard;
