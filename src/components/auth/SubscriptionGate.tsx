import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/lib/stores/useUserStore';
import { SubscriptionService, type SubscriptionStatus } from '@/lib/services/subscriptionService';

interface SubscriptionGateProps {
  children: ReactNode;
}

export default function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { user, isAuthenticated } = useUserStore();
  const navigate = useNavigate();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!isAuthenticated || !user) {
        console.log('[SubscriptionGate] User not authenticated');
        setIsLoading(false);
        return;
      }

      console.log('[SubscriptionGate] Checking subscription status...');
      setIsLoading(true);
      
      try {
        const status = await SubscriptionService.checkSubscriptionStatus(user);
        console.log('[SubscriptionGate] Subscription status:', status);
        setSubscriptionStatus(status);
      } catch (error) {
        console.error('[SubscriptionGate] Error checking subscription:', error);
        setSubscriptionStatus({
          isActive: false,
          status: 'unknown',
          error: 'Failed to check subscription status'
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [isAuthenticated, user]);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('[SubscriptionGate] Redirecting to login - not authenticated');
    navigate('/login', { replace: true });
    return null;
  }

  // Show loading state while checking subscription
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking subscription status...</p>
        </div>
      </div>
    );
  }

  // If subscription check failed or user needs subscription, redirect to subscription page
  if (!subscriptionStatus?.isActive) {
    console.log('[SubscriptionGate] Redirecting to subscription required page');
    navigate('/subscription-required', { replace: true });
    return null;
  }

  // User has active subscription, render children
  console.log('[SubscriptionGate] User has active subscription, rendering app');
  return <>{children}</>;
}