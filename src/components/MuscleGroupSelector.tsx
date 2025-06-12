import React from 'react';
import MuscleGroupCard from './MuscleGroupCard';

interface MuscleGroupSelectorProps {
  onSelectGroup: (group: string) => void;
}

const muscleGroupsWithIcons = [
  { name: 'abs', iconSrc: '/muscle_group_icons/abs.svg' },
  { name: 'back', iconSrc: '/muscle_group_icons/back.svg' },
  { name: 'biceps', iconSrc: '/muscle_group_icons/biceps.svg' },
  { name: 'calves', iconSrc: '/muscle_group_icons/calves.svg' },
  { name: 'chest', iconSrc: '/muscle_group_icons/chest.svg' },
  { name: 'forearms', iconSrc: '/muscle_group_icons/forearms.svg' },
  { name: 'glutes', iconSrc: '/muscle_group_icons/glutes.svg' },
  { name: 'hamstrings', iconSrc: '/muscle_group_icons/hamstrings.svg' },
  { name: 'obliques', iconSrc: '/muscle_group_icons/obliques.svg' },
  { name: 'quads', iconSrc: '/muscle_group_icons/quads.svg' },
  { name: 'shoulders', iconSrc: '/muscle_group_icons/shoulders.svg' },
  { name: 'traps', iconSrc: '/muscle_group_icons/traps.svg' },
  { name: 'triceps', iconSrc: '/muscle_group_icons/triceps.svg' },
  // Note: 'cardio' is omitted as no custom cardio.svg was found.
  // Add it here if a custom icon becomes available.
];

const MuscleGroupSelector: React.FC<MuscleGroupSelectorProps> = ({ onSelectGroup }) => {
  return (
    <div className="p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {muscleGroupsWithIcons.map(({ name, iconSrc }) => (
          <MuscleGroupCard
            key={name}
            groupName={name}
            iconSrc={iconSrc}
            onSelectGroup={onSelectGroup}
          />
        ))}
      </div>
    </div>
  );
};

export default MuscleGroupSelector;
