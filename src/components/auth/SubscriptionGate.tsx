import { ReactNode, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '@/lib/stores/useUserStore';

interface SubscriptionGateProps {
  children: ReactNode;
}

export default function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { user, isAuthenticated, subscriptionStatus, checkSubscription } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkAttempts, setCheckAttempts] = useState(0);
  const hasInitiatedCheck = useRef(false);

  // Reset the check flag when user changes
  useEffect(() => {
    hasInitiatedCheck.current = false;
  }, [user?.id]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const performSubscriptionCheck = async () => {
      // Prevent multiple simultaneous checks
      if (hasInitiatedCheck.current) {
        console.log('[SubscriptionGate] Check already in progress, skipping...');
        return;
      }

      // The ProtectedRoute component will handle redirection for unauthenticated users,
      // so we just need to ensure we don't run the subscription check if there's no user.
      if (!isAuthenticated || !user) {
        return;
      }

      // Prevent redirect loops - don't check on subscription-required page
      if (location.pathname === '/subscription-required') {
        console.log('[SubscriptionGate] On subscription-required page, skipping check');
        return;
      }

      const startTime = Date.now();
      
      // Check if we already have a valid subscription status in the store
      if (subscriptionStatus && subscriptionStatus.isActive) {
        console.log('[SubscriptionGate] Using existing active subscription status from store', {
          status: subscriptionStatus,
          userId: user.id
        });
        return;
      }
      
      // Mark that we've initiated a check
      hasInitiatedCheck.current = true;
      
      console.log('[SubscriptionGate] Starting subscription check...', { 
        userId: user.id, 
        attempt: checkAttempts + 1,
        timestamp: new Date().toISOString(),
        existingStatus: subscriptionStatus,
        pathname: location.pathname
      });

      try {
        // Try to use the store method first (which includes caching)
        await checkSubscription();
        
        // Get the status from the store after the check
        const storeState = useUserStore.getState();
        const status = storeState.subscriptionStatus;
        
        const checkDuration = Date.now() - startTime;
        
        console.log('[SubscriptionGate] Subscription check completed', { 
          status, 
          duration: `${checkDuration}ms`,
          attempt: checkAttempts + 1,
          fromCache: checkDuration < 100 // Likely from cache if very fast
        });

        if (!isMounted) return;

        // If we don't have a status or subscription is not active, redirect
        if (!status || !status.isActive) {
          console.log('[SubscriptionGate] Subscription inactive. Redirecting...', {
            status: status?.status,
            error: status?.error
          });
          navigate('/subscription-required', { replace: true });
        }
      } catch (error) {
        console.error('[SubscriptionGate] Error checking subscription:', {
          error,
          attempt: checkAttempts + 1,
          duration: `${Date.now() - startTime}ms`
        });
        
        if (!isMounted) return;

        // Retry logic for transient errors
        if (checkAttempts < 2) {
          console.log('[SubscriptionGate] Retrying subscription check...', {
            nextAttempt: checkAttempts + 2,
            delay: '1000ms'
          });
          setCheckAttempts(prev => prev + 1);
          hasInitiatedCheck.current = false; // Allow retry
          timeoutId = setTimeout(performSubscriptionCheck, 1000); // Retry after 1 second
        } else {
          // After retries, assume no subscription
          console.log('[SubscriptionGate] Max retries reached. Assuming no subscription.');
          // Set a failed status in the store to prevent further checks
          useUserStore.setState({ 
            subscriptionStatus: { 
              isActive: false, 
              status: 'inactive',
              error: 'Failed to verify subscription after retries'
            }
          });
          navigate('/subscription-required', { replace: true });
        }
      } finally {
        // Reset the check flag after completion
        hasInitiatedCheck.current = false;
      }
    };

    performSubscriptionCheck();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [isAuthenticated, user, navigate, checkAttempts, checkSubscription, subscriptionStatus, location.pathname]);

  // Always render children immediately - subscription check happens in background
  return <>{children}</>;
}