import { useSubscriptionQuery, useInvalidateSubscription } from './useSubscriptionQuery';
import { useUserStore } from '@/lib/stores/useUserStore';

/**
 * Simple hook for subscription status
 * Provides a clean API for components to check subscription state
 */
export function useSubscription() {
  const { data: isActive, isLoading, error, refetch, isFetching } = useSubscriptionQuery();
  const { user, isAuthenticated } = useUserStore();
  const invalidate = useInvalidateSubscription();

  return {
    // Subscription status
    isActive: isActive ?? false,
    isLoading: isLoading || isFetching,
    hasError: !!error,
    error: error instanceof Error ? error.message : null,
    
    // Authentication status
    isAuthenticated,
    user,
    
    // Actions
    refetch, // Force refresh subscription status
    invalidate, // Clear cache and refetch
  };
}

/**
 * Hook to check if user has premium access
 * Combines authentication and subscription checks
 */
export function usePremiumAccess() {
  const { isActive, isLoading, isAuthenticated } = useSubscription();
  
  return {
    hasPremium: isAuthenticated && isActive,
    isChecking: isLoading,
    needsAuth: !isAuthenticated,
    needsSubscription: isAuthenticated && !isActive && !isLoading,
  };
}