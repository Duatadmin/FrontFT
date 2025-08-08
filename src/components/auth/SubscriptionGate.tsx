import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionGateProps {
  children: ReactNode;
}

/**
 * Simple subscription gate that redirects to subscription-required page
 * if user doesn't have an active subscription
 */
export default function SubscriptionGate({ children }: SubscriptionGateProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isActive, isLoading, isAuthenticated } = useSubscription();

  useEffect(() => {
    // Don't redirect if already on subscription-required page
    if (location.pathname === '/subscription-required') {
      return;
    }

    // Don't redirect if coming from checkout success
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('from') === 'checkout') {
      console.log('[SubscriptionGate] Coming from checkout, skipping check');
      return;
    }
    
    // If not authenticated, let ProtectedRoute handle it
    if (!isAuthenticated) {
      return;
    }
    
    // If still loading, don't redirect yet
    if (isLoading) {
      return;
    }
    
    // If subscription is not active, redirect to subscription required page
    if (!isActive) {
      console.log('[SubscriptionGate] No active subscription, redirecting to subscription-required');
      navigate('/subscription-required', { replace: true });
    }
  }, [isActive, isLoading, isAuthenticated, navigate, location.pathname, location.search]);

  // Always render children - the redirect will happen if needed
  return <>{children}</>;
}