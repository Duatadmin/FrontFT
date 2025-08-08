import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface SubscriptionGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * Simplified Subscription Gate Component
 * Uses React Query for intelligent caching and state management
 * No complex retry logic or global state tracking
 */
export function SubscriptionGateV2({ 
  children, 
  fallback,
  redirectTo = '/subscription-required' 
}: SubscriptionGateProps) {
  const { isActive, isLoading, isAuthenticated, hasError } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Skip redirect if already on the subscription required page
    if (location.pathname === redirectTo) {
      return;
    }

    // Check authentication first
    if (!isAuthenticated) {
      console.log('[SubscriptionGateV2] User not authenticated, redirecting to login');
      navigate('/login', { 
        state: { from: location.pathname },
        replace: true 
      });
      return;
    }

    // Only redirect if we've finished loading and user doesn't have active subscription
    if (!isLoading && !isActive && !hasError) {
      console.log('[SubscriptionGateV2] No active subscription, redirecting to:', redirectTo);
      navigate(redirectTo, { replace: true });
    }
  }, [isActive, isLoading, isAuthenticated, hasError, location.pathname, navigate, redirectTo]);

  // Show loading state
  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Don't render children if no subscription (will redirect)
  if (!isActive) {
    return null;
  }

  // User has active subscription, render children
  return <>{children}</>;
}

/**
 * Optional wrapper for routes that require subscription
 * Can be used in route definitions
 */
export function withSubscriptionGate(Component: React.ComponentType, props?: Omit<SubscriptionGateProps, 'children'>) {
  return () => (
    <SubscriptionGateV2 {...props}>
      <Component />
    </SubscriptionGateV2>
  );
}