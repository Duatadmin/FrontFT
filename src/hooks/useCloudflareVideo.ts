// src/hooks/useCloudflareVideo.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase'; // Assuming your consolidated client
import { PlayResponseSchema, PlayResponseType } from '@/types/video';

const fetchCloudflareVideoUrl = async (exerciseId: string | null | undefined): Promise<PlayResponseType | null> => {
  console.log('[useCloudflareVideo] Attempting to fetch video URL for exerciseId:', exerciseId);
  console.log('[useCloudflareVideo] Attempting to fetch video URL for exerciseId:', exerciseId);
  if (!exerciseId) {
    console.log('[useCloudflareVideo] exerciseId is null or undefined, returning null.');
    return null;
  }

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    console.error('[useCloudflareVideo] Error fetching session or no active session:', sessionError);
    throw new Error('User not authenticated');
  }
  console.log('[useCloudflareVideo] Session successfully retrieved.');

  let response: Response;
  try {
    console.log(`[useCloudflareVideo] Fetching from /functions/v1/stream-video/${exerciseId}`);
    response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stream-video/${exerciseId}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });
    console.log(`[useCloudflareVideo] Fetch call completed. Status: ${response.status}`);
  } catch (fetchError: any) {
    console.error(`[useCloudflareVideo] Network error during fetch for ${exerciseId}:`, fetchError);
    throw new Error(`Network error fetching video URL: ${fetchError.message}`);
  }

  if (!response.ok) {
    const rawErrorText = await response.text().catch(() => 'Failed to get raw error text from response.');
    console.error(`[useCloudflareVideo] Fetch not OK. Status: ${response.status}. Raw Error Response for ${exerciseId}:`, rawErrorText);
    let errorJson = { error: `Server error: ${response.statusText}. Response: ${rawErrorText.substring(0, 200)}...` };
    try {
      if (rawErrorText.trim().startsWith('{') || rawErrorText.trim().startsWith('[')) {
        errorJson = JSON.parse(rawErrorText);
      } else {
        console.warn('[useCloudflareVideo] Error response was not valid JSON (HTML or plain text?), using constructed message.');
      }
    } catch (e) {
      console.warn('[useCloudflareVideo] Failed to parse error response as JSON, using constructed message.');
    }
    throw new Error(errorJson.error || `Failed to fetch video URL. Status: ${response.status}`);
  }

  const rawSuccessfulResponseText = await response.text();
  console.log(`[useCloudflareVideo] Fetch OK. Raw Success Response for ${exerciseId}:`, rawSuccessfulResponseText);

  let parsedData;
  try {
    parsedData = JSON.parse(rawSuccessfulResponseText);
    console.log(`[useCloudflareVideo] Successfully parsed JSON response for ${exerciseId}:`, parsedData);
  } catch (parseError: any) {
    console.error(`[useCloudflareVideo] Failed to parse successful response as JSON for ${exerciseId}. Error:`, parseError);
    console.error(`[useCloudflareVideo] Raw text that failed parsing:`, rawSuccessfulResponseText);
    throw new Error(`Invalid JSON response from server: ${parseError.message}`);
  }
  
  try {
    const validatedData = PlayResponseSchema.parse(parsedData);
    console.log(`[useCloudflareVideo] Successfully validated response data for ${exerciseId}:`, validatedData);
    return validatedData;
  } catch (validationError) {
    console.error(`[useCloudflareVideo] Zod validation failed for ${exerciseId}. Error:`, validationError);
    console.error(`[useCloudflareVideo] Data that failed validation:`, parsedData);
    throw new Error('Invalid response structure from video server after successful fetch.');
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
