import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/lib/stores/useUserStore';
import { SubscriptionService } from '@/lib/services/subscriptionService';

interface SubscriptionGateProps {
  children: ReactNode;
}

export default function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { user, isAuthenticated } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSubscription = async () => {
      // The ProtectedRoute component will handle redirection for unauthenticated users,
      // so we just need to ensure we don't run the subscription check if there's no user.
      if (!isAuthenticated || !user) {
        return;
      }

      console.log('[SubscriptionGate] Checking subscription status in the background...');

      try {
        const status = await SubscriptionService.checkSubscriptionStatus(user);
        console.log('[SubscriptionGate] Background subscription check status:', status);

        // If the subscription is not active, then we redirect.
        if (!status.isActive) {
          console.log('[SubscriptionGate] Subscription inactive. Redirecting...');
          navigate('/subscription-required', { replace: true });
        }
      } catch (error) {
        console.error('[SubscriptionGate] Error checking subscription:', error);
        // On error, we'll redirect to the subscription page as a fallback.
        console.log('[SubscriptionGate] Error during background check. Redirecting...');
        navigate('/subscription-required', { replace: true });
      }
    };

    checkSubscription();
  }, [isAuthenticated, user, navigate]);

  // The gate now renders its children immediately, while the subscription
  // check runs in the background. If the check fails, the useEffect
  // hook above will handle the redirection.
  console.log('[SubscriptionGate] Rendering children while subscription check runs in background.');
  return <>{children}</>;
}