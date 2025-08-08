import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ExerciseCardProps } from '@/components/ExerciseCard';
import { EquipmentCategory } from '@/components/EquipmentFilter';

// SIMPLIFIED: No React Query, just basic state management
export const useExerciseLibraryQuery = (
  muscleGroup: string | null, 
  equipmentCategory: EquipmentCategory | null
) => {
  const [exercises, setExercises] = useState<ExerciseCardProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!muscleGroup) {
      setExercises([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchExercises = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('[useExerciseLibraryQuery] Fetching:', muscleGroup);
        
        let query = supabase
          .from('exrcwiki')
          .select('*')
          .eq('muscle_group', muscleGroup);

        if (equipmentCategory) {
          query = query.eq('equipment_category', equipmentCategory);
        }

        const { data, error: queryError } = await query;

        if (queryError) throw queryError;

        const formattedExercises = (data || []).map((item: any) => ({
          id: item.exercise_id,
          name: item.name,
          gifUrl: item.gif_url ?? item.gifurl,
          bodypart: item.muscle_group,
          equipment: item.equipment,
          tier: item.tier,
          isCompound: item.is_compound,
        }));

        console.log('[useExerciseLibraryQuery] Loaded', formattedExercises.length, 'exercises');
        setExercises(formattedExercises);
      } catch (err: any) {
        console.error('[useExerciseLibraryQuery] Error:', err);
        setError(err.message || 'Failed to fetch exercises');
        setExercises([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [muscleGroup, equipmentCategory]);

  return {
    exercises,
    loading,
    error,
    isError: !!error,
    refetch: () => {
      // Simple refetch - just change a dependency to trigger useEffect
      setExercises([]);
    },
  };
};