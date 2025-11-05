import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ExerciseCard from '@/components/ExerciseCard';
import { useExerciseLibraryQuery } from '@/hooks/useExerciseLibraryQuery';
import MuscleGroupSelector from '@/components/MuscleGroupSelector';
import EquipmentFilter, { EquipmentCategory } from '@/components/EquipmentFilter';
import { ArrowLeft } from 'lucide-react';
import ExerciseDetailPage from './ExerciseDetailPage'; // Import ExerciseDetailPage

const ExerciseLibraryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null); 
  const [selectedEquipmentCategory, setSelectedEquipmentCategory] = useState<EquipmentCategory | null>(
    () => (searchParams.get('equipment') as EquipmentCategory) || null
  );
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null); // State for selected exercise ID
  
  // Reset equipment category when muscle group changes
  useEffect(() => {
    setSelectedEquipmentCategory(null);
  }, [selectedMuscleGroup]);
  
  const { exercises, loading, error } = useExerciseLibraryQuery(selectedMuscleGroup, selectedEquipmentCategory);
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

  const handleSelectExercise = (id: string) => {
    setSelectedExerciseId(id);
  };

  const handleCloseExerciseDetail = () => {
    setSelectedExerciseId(null);
  };

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
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-20 sm:pb-8">
      {/* Render ExerciseDetailPage if an exercise is selected */}
      {selectedExerciseId ? (
        <div className="fixed inset-0 z-50 overflow-y-auto safe-top safe-bot safe-left safe-right">
          <ExerciseDetailPage exerciseId={selectedExerciseId} onClose={handleCloseExerciseDetail} />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 py-2 sm:py-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Exercise Library</h1>
              <p className="text-sm sm:text-base text-text-secondary mt-2">Browse exercises by muscle group and equipment.</p>
            </div>
          </div>
          {!selectedMuscleGroup ? (
        <MuscleGroupSelector onSelectGroup={handleSelectGroup} />
      ) : (
        <>
          <button
            onClick={handleGoBack}
            className="mb-4 sm:mb-6 inline-flex items-center text-lime-400 hover:text-lime-300 transition-all duration-300 ease-in-out bg-neutral-700/50 hover:bg-lime-500/10 backdrop-blur-md px-3 sm:px-4 py-2 rounded-xl shadow-lg border border-lime-400/60 hover:border-lime-300/80 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-opacity-70 text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
            Back to Muscle Groups
          </button>

          <EquipmentFilter 
            selectedEquipment={selectedEquipmentCategory} 
            onSelectEquipment={setSelectedEquipmentCategory} 
          />

          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-400"></div>
                <p className="text-neutral-400">Loading exercises...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-red-500 text-lg">
                {error.includes('timeout') ? 'Connection timeout' : `Error: ${error}`}
              </p>
              <p className="text-neutral-400 mt-2">
                {error.includes('timeout') 
                  ? 'The request took too long. Please refresh the page and try again.'
                  : `Could not fetch exercises for ${selectedMuscleGroup}${selectedEquipmentCategory ? ` with ${selectedEquipmentCategory}` : ''}. Please try again.`}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-lime-500 text-black rounded-lg hover:bg-lime-400 transition-colors"
              >
                Refresh Page
              </button>
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
                  key={exercise.id} 
                  {...exercise} 
                  onSelect={handleSelectExercise} // Pass onSelect handler
                />
              ))}
            </div>
          )}
        </>
      )}
      </> 
      // Closing tag for the fragment when selectedExerciseId is null
    )}
    </div>
  );
};

export default ExerciseLibraryPage;
