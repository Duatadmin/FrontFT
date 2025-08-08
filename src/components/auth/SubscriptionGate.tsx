import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '@/lib/stores/useUserStore';
import { supabase } from '@/lib/supabase';

interface SubscriptionGateProps {
  children: ReactNode;
}

// Global state to prevent multiple simultaneous checks across all instances
let globalCheckInProgress = false;
let lastCheckUserId: string | null = null;
let lastCheckTime = 0;

export default function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { user, isAuthenticated, subscriptionStatus, checkSubscription } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkAttempts, setCheckAttempts] = useState(0);

  // Reset global check state when user changes
  useEffect(() => {
    if (user?.id !== lastCheckUserId) {
      globalCheckInProgress = false;
      lastCheckUserId = user?.id || null;
      lastCheckTime = 0;
    }
  }, [user?.id]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const performSubscriptionCheck = async () => {
      // Don't redirect if already on subscription-required page
      if (location.pathname === '/subscription-required') {
        console.log('[SubscriptionGate] Already on subscription-required page, skipping');
        return;
      }
      
      // First, validate that we have a valid session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        console.error('[SubscriptionGate] No valid session, redirecting to login', sessionError);
        navigate('/login', { replace: true });
        return;
      }
      
      // Always check if we need to redirect based on current status
      const currentStatus = useUserStore.getState().subscriptionStatus;
      if (currentStatus && currentStatus.status !== 'unknown' && !currentStatus.isActive) {
        console.log('[SubscriptionGate] User has inactive subscription, redirecting...', {
          status: currentStatus.status,
          path: location.pathname
        });
        navigate('/subscription-required', { replace: true });
        return;
      }
      
      // Prevent multiple simultaneous checks globally
      if (globalCheckInProgress) {
        console.log('[SubscriptionGate] Check already in progress globally, skipping API call');
        return;
      }
      
      // Skip API call if we checked recently (within 10 seconds) for the same user
      const now = Date.now();
      if (user?.id === lastCheckUserId && (now - lastCheckTime) < 10000) {
        console.log('[SubscriptionGate] Recently checked for this user, skipping API call');
        return;
      }

      // The ProtectedRoute component will handle redirection for unauthenticated users,
      // so we just need to ensure we don't run the subscription check if there's no user.
      if (!isAuthenticated || !user) {
        return;
      }


      const startTime = Date.now();
      
      // Check if we already have a valid subscription status in the store
      // BUT also validate the session is still valid
      if (subscriptionStatus && subscriptionStatus.isActive) {
        // Double-check the session is still valid before trusting cached status
        const { data: sessionCheck } = await supabase.auth.getSession();
        if (!sessionCheck.session) {
          console.warn('[SubscriptionGate] Cached active status but session invalid, clearing cache');
          // Clear the cache and force recheck
          sessionStorage.removeItem('subscription_status');
          useUserStore.setState({ subscriptionStatus: null });
        } else {
          console.log('[SubscriptionGate] Using existing active subscription status from store', {
            status: subscriptionStatus,
            userId: user.id
          });
          return;
        }
      }
      
      // Mark that we've initiated a check globally
      globalCheckInProgress = true;
      lastCheckUserId = user.id;
      lastCheckTime = Date.now();
      
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

        if (!isMounted) {
          globalCheckInProgress = false; // Reset global flag even if unmounted
          return;
        }

        // Log the actual status for debugging
        console.log('[SubscriptionGate] Status check result:', {
          status,
          isActive: status?.isActive,
          statusType: status?.status,
          shouldRedirect: status && status.status !== 'unknown' && !status.isActive
        });
        
        // Only redirect if we have a definitive inactive status
        // Don't redirect on missing status (could be checking) or unknown status
        if (status && status.status !== 'unknown' && !status.isActive) {
          console.log('[SubscriptionGate] Subscription definitively inactive. Redirecting...', {
            status: status?.status,
            error: status?.error
          });
          navigate('/subscription-required', { replace: true });
        } else if (!status) {
          // No status yet, but don't redirect - the check might still be in progress
          console.log('[SubscriptionGate] No subscription status yet, waiting for check to complete');
        } else {
          console.log('[SubscriptionGate] Not redirecting - either active or unknown status');
        }
      } catch (error) {
        console.error('[SubscriptionGate] Error checking subscription:', {
          error,
          attempt: checkAttempts + 1,
          duration: `${Date.now() - startTime}ms`
        });
        
        if (!isMounted) {
          globalCheckInProgress = false; // Reset global flag even if unmounted  
          return;
        }

        // Retry logic for transient errors
        if (checkAttempts < 2) {
          console.log('[SubscriptionGate] Retrying subscription check...', {
            nextAttempt: checkAttempts + 2,
            delay: '1000ms'
          });
          setCheckAttempts(prev => prev + 1);
          globalCheckInProgress = false; // Allow retry
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
        // Reset the global check flag after completion
        globalCheckInProgress = false;
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