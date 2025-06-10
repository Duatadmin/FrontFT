import React from 'react';

interface MuscleGroupSelectorProps {
  onSelectGroup: (group: string) => void;
}

const muscleGroups = [
  'abs',
  'back',
  'biceps',
  'calves',
  'cardio',
  'chest',
  'forearms',
  'glutes',
  'hamstrings',
  'quads',
  'shoulders',
  'traps',
  'triceps',
];

const MuscleGroupSelector: React.FC<MuscleGroupSelectorProps> = ({ onSelectGroup }) => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Select a Muscle Group</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {muscleGroups.map((group) => (
          <button
            key={group}
            onClick={() => onSelectGroup(group)}
            className="bg-neutral-800/70 backdrop-blur-md border border-lime-400/30 rounded-lg p-6 text-white font-semibold capitalize text-center transition-all duration-200 hover:bg-lime-500/20 hover:border-lime-500 hover:shadow-lg hover:shadow-lime-500/10 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-opacity-50"
          >
            {group}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MuscleGroupSelector;
