import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ExerciseCardProps } from '@/components/ExerciseCard';

import { EquipmentCategory } from '@/components/EquipmentFilter';

export const useExerciseLibrary = (muscleGroup: string | null, equipmentCategory: EquipmentCategory | null) => {
  const [exercises, setExercises] = useState<ExerciseCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!muscleGroup) {
      setExercises([]);
      setLoading(false);
      setError(null);
      return;
    }
    const fetchExercises = async () => {
      if (!muscleGroup) {
        setExercises([]);
        setLoading(false);
        setError(null);
        return;
      }

      let query = supabase
        .from('exrcwiki')
        .select('*')
        .eq('muscle_group', muscleGroup);

      if (equipmentCategory) {
        query = query.eq('equipment_category', equipmentCategory);
      }

      try {
        setLoading(true);
        const { data, error } = await query;

        if (error) {
          throw error;
        }

        // The data from supabase needs to be mapped to ExerciseCardProps
        const formattedExercises = data.map((item: any) => ({
          id: item.exercise_id, // Assuming the primary key is exercise_id
          name: item.name,
          gifUrl: item.gif_url,
          bodypart: item.muscle_group, // Map from muscle_group db column
          equipment: item.equipment,
          tier: item.tier,
          isCompound: item.is_compound,
        }));

        setExercises(formattedExercises);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch exercises');
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [muscleGroup, equipmentCategory]);

  return { exercises, loading, error };
};
