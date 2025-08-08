import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ExerciseCardProps } from '@/components/ExerciseCard';
import { EquipmentCategory } from '@/components/EquipmentFilter';

const fetchExercises = async (
  muscleGroup: string | null, 
  equipmentCategory: EquipmentCategory | null
): Promise<ExerciseCardProps[]> => {
  try {
    if (!muscleGroup) {
      console.log('[useExerciseLibraryQuery] No muscle group provided, returning empty array');
      return [];
    }

    console.log('[useExerciseLibraryQuery] Starting fetch for:', { 
      muscleGroup, 
      equipmentCategory,
      timestamp: new Date().toISOString()
    });

    // Build and execute the query directly
    console.log('[useExerciseLibraryQuery] Building query...');
    let query = supabase
      .from('exrcwiki')
      .select('*')
      .eq('muscle_group', muscleGroup);

    if (equipmentCategory) {
      query = query.eq('equipment_category', equipmentCategory);
    }

    console.log('[useExerciseLibraryQuery] Executing Supabase query...');
    const { data, error } = await query;

    if (error) {
      console.error('[useExerciseLibraryQuery] Supabase error:', error);
      throw error;
    }

    if (!data) {
      console.log('[useExerciseLibraryQuery] No data returned from Supabase');
      return [];
    }

    console.log('[useExerciseLibraryQuery] Supabase returned:', data.length, 'exercises for', muscleGroup);

    // Map the data from supabase to ExerciseCardProps
    const formattedExercises = (data as any[]).map((item: any) => ({
      id: item.exercise_id,
      name: item.name,
      gifUrl: item.gif_url ?? item.gifurl,
      bodypart: item.muscle_group, // Map from muscle_group to bodypart for the component
      equipment: item.equipment,
      tier: item.tier,
      isCompound: item.is_compound,
    }));

    return formattedExercises;
  } catch (error) {
    console.error('[useExerciseLibraryQuery] Error in fetchExercises:', error);
    throw error;
  }
};

export const useExerciseLibraryQuery = (
  muscleGroup: string | null, 
  equipmentCategory: EquipmentCategory | null
) => {
  // Use a unique query key for each combination
  const queryKey = ['exercises', muscleGroup, equipmentCategory] as const;
  
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!muscleGroup) {
        return [];
      }
      
      return fetchExercises(muscleGroup, equipmentCategory);
    },
    enabled: !!muscleGroup, // Only fetch if muscleGroup is selected
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes (was 30 seconds - too short!)
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 1, // Only retry once to prevent cascading retries
    retryDelay: 1000, // Simple 1 second delay
    refetchOnMount: false, // Don't refetch on every mount if data exists
    refetchOnWindowFocus: false, // Don't refetch on window focus - causes too many requests
    refetchOnReconnect: 'always', // Only refetch on reconnect if needed
  });

  // Simplified debug logging - only log significant state changes
  useEffect(() => {
    if (query.isLoading) {
      console.log('[useExerciseLibraryQuery] Loading exercises for:', muscleGroup);
    } else if (query.isSuccess) {
      console.log('[useExerciseLibraryQuery] Loaded', query.data?.length, 'exercises');
    } else if (query.isError) {
      console.error('[useExerciseLibraryQuery] Query error:', query.error);
    }
  }, [query.isLoading, query.isSuccess, query.isError]);

  return {
    exercises: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    isError: query.isError,
    refetch: query.refetch,
  };
};