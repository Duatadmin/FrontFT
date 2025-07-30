import { useQuery, UseQueryOptions, UseQueryResult, QueryKey } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useUserStore } from '@/lib/stores/useUserStore';
import { supabase } from '@/lib/supabase';

/**
 * A wrapper around useQuery that handles authentication state and token refresh events.
 * This hook ensures that queries:
 * 1. Only run when authentication is loaded and user exists
 * 2. Automatically refetch when tokens are refreshed
 * 3. Have proper retry logic for auth-related errors
 */
export function useAuthenticatedQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
    requireAuth?: boolean; // Default true, set to false for queries that don't need auth
  }
): UseQueryResult<TData, TError> {
  const { isLoading: authLoading, user } = useUserStore();
  const requireAuth = options.requireAuth ?? true;

  // Modify the enabled condition based on auth requirements
  const isEnabled = requireAuth
    ? !authLoading && !!user && (options.enabled ?? true)
    : options.enabled ?? true;

  // Create the query with enhanced options
  const query = useQuery({
    ...options,
    enabled: isEnabled,
    retry: options.retry ?? 3,
    retryDelay: options.retryDelay ?? ((attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)),
    staleTime: options.staleTime ?? 1000 * 60 * 5, // 5 minutes default
  });

  // Listen for auth state changes and refetch when needed
  useEffect(() => {
    if (!requireAuth) return;

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        console.log(`[useAuthenticatedQuery] Auth event detected for ${String(options.queryKey)}, refetching:`, event);
        query.refetch();
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [query, requireAuth, options.queryKey]);

  return query;
}

/**
 * Helper to create query options that work with useAuthenticatedQuery
 */
export function createAuthenticatedQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> {
  return options;
}