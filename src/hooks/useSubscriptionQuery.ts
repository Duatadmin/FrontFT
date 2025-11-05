import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/lib/stores/useUserStore';

/**
 * SIMPLIFIED: Direct subscription check without React Query
 */
export function useSubscriptionQuery() {
  const { user } = useUserStore();
  const [data, setData] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setData(false);
      setIsLoading(false);
      return;
    }

    const checkSubscription = async () => {
      try {
        console.log('[useSubscriptionQuery] Checking subscription for user:', user.id);
        
        const { data: result, error: queryError } = await supabase
          .from('v_active_users')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (queryError) {
          console.error('[useSubscriptionQuery] Error:', queryError);
          throw queryError;
        }

        const isActive = !!result;
        console.log('[useSubscriptionQuery] Result:', { userId: user.id, isActive });
        
        setData(isActive);
        setError(null);
      } catch (err) {
        console.error('[useSubscriptionQuery] Error:', err);
        setError(err as Error);
        setData(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [user?.id]);

  return {
    data,
    isLoading,
    error,
    isFetching: isLoading,
    refetch: () => {
      // Simple refetch - just set loading to trigger re-render
      setIsLoading(true);
    }
  };
}

/**
 * Simple invalidation - just returns a no-op function
 */
export function useInvalidateSubscription() {
  return () => {
    console.log('[useInvalidateSubscription] Called (no-op in simplified version)');
  };
}