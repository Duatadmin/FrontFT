import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ExerciseCard from '@/components/ExerciseCard';
import { useExerciseLibrary } from '@/hooks/useExerciseLibrary';
import MuscleGroupSelector from '@/components/MuscleGroupSelector';
import EquipmentFilter, { EquipmentCategory } from '@/components/EquipmentFilter';
import { ArrowLeft } from 'lucide-react';

const ExerciseLibraryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null); // This might also come from URL in a more complex routing setup
  const [selectedEquipmentCategory, setSelectedEquipmentCategory] = useState<EquipmentCategory | null>(
    () => (searchParams.get('equipment') as EquipmentCategory) || null
  );
  const { exercises, loading, error } = useExerciseLibrary(selectedMuscleGroup, selectedEquipmentCategory);
  const [pageTitle, setPageTitle] = useState('Exercise Library');

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (selectedEquipmentCategory) {
      newSearchParams.set('equipment', selectedEquipmentCategory);
    } else {
      newSearchParams.delete('equipment');
    }
    // Only update if searchParams actually changed to avoid potential loops if object identity changes unnecessarily
    if (searchParams.toString() !== newSearchParams.toString()) {
        setSearchParams(newSearchParams, { replace: true });
    }
  }, [selectedEquipmentCategory, searchParams, setSearchParams]);

  useEffect(() => {
    // Initialize selectedEquipmentCategory from URL on initial load if muscle group is already selected (e.g. via direct nav)
    // This part is more relevant if selectedMuscleGroup itself could be from URL, for now, it's simpler.
    const equipmentFromURL = searchParams.get('equipment') as EquipmentCategory;
    if (equipmentFromURL && equipmentCategories.includes(equipmentFromURL)) {
        if (selectedEquipmentCategory !== equipmentFromURL) {
            setSelectedEquipmentCategory(equipmentFromURL);
        }
    } else if (!equipmentFromURL && selectedEquipmentCategory !== null) {
        // Clear selection if URL param is removed/invalid but state still holds a value
        setSelectedEquipmentCategory(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Rerun when searchParams change (e.g. browser back/forward)

  useEffect(() => {
    let title = 'Exercise Library';
    if (selectedMuscleGroup) {
      title = `${selectedMuscleGroup.charAt(0).toUpperCase() + selectedMuscleGroup.slice(1)} Exercises`;
      if (selectedEquipmentCategory) {
        title += ` – ${selectedEquipmentCategory}`;
      }
    } else {
      title = 'Select Muscle Group';
    }
    setPageTitle(title);
  }, [selectedMuscleGroup, selectedEquipmentCategory]);

  // Helper to import equipmentCategories for the effect above
  const equipmentCategories = [
    'Barbell',
    'Dumbbell',
    'Cable',
    'Machines',
    'Resistance Bands',
    'Bodyweight',
    'Functional Equipment',
    'Cardio Machines',
  ] as const;

  const handleSelectGroup = (group: string) => {
    setSelectedMuscleGroup(group);
  };

  const handleGoBack = () => {
    setSelectedMuscleGroup(null);
  };

  // This component is already wrapped in AnalyticsDashboardLayout by AppRouter.tsx
  // We need a way to update the title in the parent layout or manage title within this page.
  // For now, let's assume the title prop in AnalyticsDashboardLayout in AppRouter.tsx needs to be dynamic
  // or this page itself should render its own title if the layout doesn't support dynamic titles easily.
  // The current implementation updates a local pageTitle state. The actual update to the layout's title
  // would depend on how AnalyticsDashboardLayout is designed to receive title updates.
  // Let's assume for now we can pass the title to the layout, or manage it internally.

  // The parent AppRouter.tsx already wraps this page in AnalyticsDashboardLayout.
  // To update the title, we'd ideally lift state up or use a context/store.
  // For simplicity in this step, we'll render the title here and adjust AppRouter later if needed.

  return (
    <div className="p-4 sm:p-6 md:p-8 h-full overflow-y-auto text-white">
      <h1 className="text-3xl font-bold mb-6 text-lime-400">{pageTitle}</h1>

      {!selectedMuscleGroup ? (
        <MuscleGroupSelector onSelectGroup={handleSelectGroup} />
      ) : (
        <>
          <button
            onClick={handleGoBack}
            className="mb-6 inline-flex items-center text-lime-400 hover:text-lime-300 transition-all duration-300 ease-in-out bg-neutral-700/50 hover:bg-lime-500/10 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-lime-400/60 hover:border-lime-300/80 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-opacity-70"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Muscle Groups
          </button>

          <EquipmentFilter 
            selectedEquipment={selectedEquipmentCategory} 
            onSelectEquipment={setSelectedEquipmentCategory} 
          />

          {loading && (
            <div className="flex justify-center items-center h-64">
              <p className="text-neutral-400">Loading exercises...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-red-500 text-lg">Error: {error}</p>
              <p className="text-neutral-400 mt-2">
              Could not fetch exercises for {selectedMuscleGroup}
              {selectedEquipmentCategory ? ` with ${selectedEquipmentCategory}` : ''}. Please try again.
            </p>
            </div>
          )}

          {!loading && !error && exercises.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64">
                 <p className="text-neutral-400 text-lg">
                  No exercises found for {selectedMuscleGroup}
                  {selectedEquipmentCategory ? ` with ${selectedEquipmentCategory}` : ''}.
                </p>
                 <p className="text-neutral-500 mt-1">Try adjusting your filters or selecting a different muscle group.</p>
            </div>
          )}

          {!loading && !error && exercises.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id} // Use exercise.id as the key
                  {...exercise} // Spread all properties from the exercise object
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExerciseLibraryPage;
