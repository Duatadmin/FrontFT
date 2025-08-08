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
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if query was cancelled or aborted
      const name = error?.name || '';
      const msg = (error?.message || '').toLowerCase();
      if (error?.message === 'Query was cancelled' || name === 'AbortError' || msg.includes('aborted') || msg.includes('cancelled')) {
        return false;
      }
      // Retry auth/timeout/network errors up to 3 times
      if (msg.includes('authentication required') || msg.includes('timed out') || msg.includes('network')) {
        return failureCount < 3;
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff with longer delays for auth issues
      const baseDelay = 1000;
      const maxDelay = 10000;
      return Math.min(baseDelay * (2 ** attemptIndex), maxDelay);
    },
    refetchOnMount: true, // Refetch if data is stale
    refetchOnWindowFocus: true, // Refetch on focus to recover after standby
    refetchOnReconnect: true, // Refetch when reconnecting to network
  });

  // Log the query state for debugging
  useEffect(() => {
    console.log('[useExerciseLibraryQuery] Query state changed:', {
      muscleGroup,
      equipmentCategory,
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      isSuccess: query.isSuccess,
      isError: query.isError,
      dataLength: query.data?.length ?? 0,
      status: query.status,
      queryKey
    });
  }, [muscleGroup, equipmentCategory, query.isLoading, query.isFetching, query.isSuccess, query.isError, query.data?.length, query.status]);

  return {
    exercises: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    isError: query.isError,
    refetch: query.refetch,
  };
};