// src/hooks/useCloudflareVideo.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase'; // Assuming your consolidated client
import { PlayResponseSchema, PlayResponseType } from '@/types/video';

const fetchCloudflareVideoUrl = async (exerciseId: string | null | undefined): Promise<PlayResponseType | null> => {
  if (!exerciseId) {
    return null;
  }

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    console.error('Error fetching session or no active session:', sessionError);
    throw new Error('User not authenticated');
  }

  const response = await fetch(`/functions/v1/stream-video/${exerciseId}`, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
    console.error(`Error fetching video URL for ${exerciseId}:`, response.status, errorData);
    throw new Error(errorData.error || `Failed to fetch video URL: ${response.statusText}`);
  }

  const data = await response.json();
  
  try {
    const validatedData = PlayResponseSchema.parse(data);
    return validatedData;
  } catch (validationError) {
    console.error('Invalid response structure from /stream-video endpoint:', validationError);
    throw new Error('Invalid response structure from video server.');
  }
};

export const useCloudflareVideo = (exerciseId: string | null | undefined) => {
  return useQuery<PlayResponseType | null, Error>({
    queryKey: ['cloudflareVideo', exerciseId],
    queryFn: () => fetchCloudflareVideoUrl(exerciseId),
    enabled: !!exerciseId, // Only run the query if exerciseId is provided
    staleTime: 1000 * 60 * 55, // Cache data for 55 minutes (token TTL is likely 60 min)
    gcTime: 1000 * 60 * 60, // Keep data in cache for 60 minutes
    retry: (failureCount, error) => {
      // Do not retry on 401 or 404 errors from our function
      if (error.message.includes('User not authenticated') || error.message.includes('Exercise not found')) {
        return false;
      }
      // Default retry for other errors (e.g., network issues)
      return failureCount < 3;
    },
  });
};
