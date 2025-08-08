import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/lib/stores/useUserStore';
import { useSubscriptionStore } from '@/lib/stores/useSubscriptionStore';

/**
 * React Query hook for checking subscription status
 * Uses the v_active_users view to determine if user has active subscription
 */
export function useSubscriptionQuery() {
  const { user } = useUserStore();
  const { setStatus, setLastChecked } = useSubscriptionStore();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['subscription', user?.id],
    
    queryFn: async () => {
      if (!user) {
        throw new Error('No authenticated user');
      }

      console.log('[useSubscriptionQuery] Checking subscription for user:', user.id);
      
      try {
        // Check if user exists in v_active_users view
        const { data, error } = await supabase
          .from('v_active_users')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('[useSubscriptionQuery] Error checking subscription:', error);
          throw error;
        }

        const isActive = !!data;
        
        // Update store with result
        setStatus(isActive ? 'active' : 'inactive');
        setLastChecked(Date.now());
        
        console.log('[useSubscriptionQuery] Subscription check result:', { 
          userId: user.id, 
          isActive 
        });
        
        return isActive;
      } catch (error) {
        setStatus('error');
        throw error;
      }
    },
    
    // Only run query if we have a user
    enabled: !!user,
    
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    
    // Keep in cache for 10 minutes
    gcTime: 10 * 60 * 1000,
    
    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (user doesn't have subscription)
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes('not found') || message.includes('no rows')) {
          return false;
        }
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    
    // Retry delay with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    
    // Refetch on window focus for fresh data
    refetchOnWindowFocus: true,
    
    // Don't refetch on mount if data is fresh
    refetchOnMount: 'always',
  });
}

/**
 * Manually invalidate subscription cache
 * Useful after checkout success or subscription changes
 */
export function useInvalidateSubscription() {
  const queryClient = useQueryClient();
  const { user } = useUserStore();
  
  return () => {
    if (user) {
      console.log('[useInvalidateSubscription] Invalidating subscription cache');
      queryClient.invalidateQueries({ queryKey: ['subscription', user.id] });
    }
  };
}