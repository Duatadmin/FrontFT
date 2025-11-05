import React from 'react';

export const equipmentCategories = [
  'Barbell',
  'Dumbbell',
  'Cable',
  'Machines',
  'Resistance Bands',
  'Bodyweight',
  'Functional Equipment',
  'Cardio Machines',
] as const;

export type EquipmentCategory = typeof equipmentCategories[number];

interface EquipmentFilterProps {
  selectedEquipment: EquipmentCategory | null;
  onSelectEquipment: (equipment: EquipmentCategory | null) => void;
}

const EquipmentFilter: React.FC<EquipmentFilterProps> = ({ selectedEquipment, onSelectEquipment }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-neutral-300 mb-3">Filter by Equipment:</h3>
      <div className="flex flex-wrap gap-2">
        {equipmentCategories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectEquipment(category === selectedEquipment ? null : category)} // Click again to deselect
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ease-in-out border backdrop-blur-md shadow-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-opacity-75 
              ${selectedEquipment === category 
                ? 'bg-lime-500/30 border-lime-400/80 text-lime-100 shadow-lime-500/20'
                : 'bg-neutral-700/40 border-neutral-600/80 text-neutral-300 hover:bg-neutral-600/60 hover:border-neutral-500/90 hover:shadow-xl'
              }`}
          >
            {category}
          </button>
        ))}
        {selectedEquipment && (
            <button
                onClick={() => onSelectEquipment(null)}
                className='px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ease-in-out border backdrop-blur-md shadow-lg bg-red-500/20 border-red-500/60 text-red-300 hover:bg-red-500/30 hover:border-red-400/70 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75'
            >
                Clear Filter
            </button>
        )}
      </div>
    </div>
  );
};

export default EquipmentFilter;
