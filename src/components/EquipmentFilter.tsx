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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border 
              ${selectedEquipment === category 
                ? 'bg-lime-500/90 border-lime-500 text-neutral-900 shadow-md shadow-lime-500/30'
                : 'bg-neutral-700/50 border-neutral-600 text-neutral-300 hover:bg-neutral-600/70 hover:border-neutral-500'
              }
              focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-opacity-75`}
          >
            {category}
          </button>
        ))}
        {selectedEquipment && (
            <button
                onClick={() => onSelectEquipment(null)}
                className='px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/40 hover:border-red-500/70 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75'
            >
                Clear Filter
            </button>
        )}
      </div>
    </div>
  );
};

export default EquipmentFilter;
