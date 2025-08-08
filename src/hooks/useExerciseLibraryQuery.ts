import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ExerciseCardProps } from '@/components/ExerciseCard';
import { EquipmentCategory } from '@/components/EquipmentFilter';
import { supabaseQueryWithTimeout } from '@/utils/supabaseWithTimeout';

const fetchExercises = async (
  muscleGroup: string | null, 
  equipmentCategory: EquipmentCategory | null,
  isFirstFetch: boolean = false
): Promise<ExerciseCardProps[]> => {
  try {
    if (!muscleGroup) {
      console.log('[useExerciseLibraryQuery] No muscle group provided, returning empty array');
      return [];
    }

    console.log('[useExerciseLibraryQuery] Starting fetch for:', { 
      muscleGroup, 
      equipmentCategory,
      timestamp: new Date().toISOString(),
      isFirstFetch
    });

    // Try to refresh the session first if needed (BEFORE starting any timeout)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[useExerciseLibraryQuery] Error getting session:', sessionError);
      // Don't throw here, let's try to refresh
    }
    
    if (!session) {
      console.log('[useExerciseLibraryQuery] No session found, attempting to refresh...');
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error('[useExerciseLibraryQuery] Failed to refresh session:', refreshError);
        throw new Error('Authentication required');
      }
      if (refreshedSession) {
        console.log('[useExerciseLibraryQuery] Session refreshed successfully');
      } else {
        console.warn('[useExerciseLibraryQuery] No session after refresh attempt');
        throw new Error('Authentication required');
      }
    } else {
      console.log('[useExerciseLibraryQuery] Session valid, proceeding with query');
    }

    // Build the query function
    console.log('[useExerciseLibraryQuery] Building query...');
    const queryBuilder = () => {
      let query = supabase
        .from('exrcwiki')
        .select('*')
        .eq('muscle_group', muscleGroup);

      if (equipmentCategory) {
        query = query.eq('equipment_category', equipmentCategory);
      }

      console.log('[useExerciseLibraryQuery] Executing Supabase query...');
      return query;
    };

    // Use longer timeout for first fetch (might need session refresh) or after standby
    const timeoutMs = isFirstFetch ? 15000 : 10000;
    
    // Execute query with timeout using the utility
    const { data, error } = await supabaseQueryWithTimeout(
      queryBuilder,
      timeoutMs
    );

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
    const formattedExercises = data.map((item: any) => ({
      id: item.exercise_id,
      name: item.name,
      gifUrl: item.gif_url,
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
  // Track if this is the first fetch for this query key
  const isFirstFetchRef = useRef(true);
  
  // Use a unique query key for each combination
  const queryKey = ['exercises', muscleGroup, equipmentCategory] as const;
  
  const query = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      // Pass abort signal to handle query cancellation
      if (!muscleGroup) {
        return [];
      }
      
      // Check if query was cancelled
      if (signal?.aborted) {
        throw new Error('Query was cancelled');
      }
      
      // Determine if this is the first fetch
      const isFirstFetch = isFirstFetchRef.current;
      if (isFirstFetch) {
        isFirstFetchRef.current = false;
      }
      
      return fetchExercises(muscleGroup, equipmentCategory, isFirstFetch);
    },
    enabled: !!muscleGroup, // Only fetch if muscleGroup is selected
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if query was cancelled
      if (error?.message === 'Query was cancelled') {
        return false;
      }
      // Retry auth errors up to 3 times
      if (error?.message === 'Authentication required') {
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
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: true, // Refetch when reconnecting to network
  });

  // Reset isFirstFetchRef when query key changes
  useEffect(() => {
    isFirstFetchRef.current = true;
  }, [muscleGroup, equipmentCategory]);

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