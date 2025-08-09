import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '@/lib/stores/useUserStore';

/**
 * Hook that handles onboarding redirect logic without blocking navigation
 * Only redirects to /welcome if user is authenticated but hasn't completed onboarding
 */
export function useOnboardingRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasChecked = useRef(false);
  
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const onboardingComplete = useUserStore((state) => state.onboardingComplete);
  const onboardingChecked = useUserStore((state) => state.onboardingChecked);

  useEffect(() => {
    // Wait until we have auth and onboarding has been checked this session (per tab)
    if (hasChecked.current) return;
    if (!isAuthenticated) return;
    if (!onboardingChecked) return; // non-blocking: UI renders while we wait

    // Exempt paths that should not be gated by onboarding
    const exempt = new Set([
      '/welcome',
      '/onboarding',
      '/login',
      '/checkout-success',
      '/cancel',
      '/subscription-required',
    ]);
    const isExempt = exempt.has(location.pathname);

    if (!isExempt && !onboardingComplete) {
      hasChecked.current = true; // only once per login per tab
      console.log('[useOnboardingRedirect] User needs onboarding, redirecting to /welcome');
      navigate('/welcome', { replace: true });
    }
  }, [isAuthenticated, onboardingComplete, onboardingChecked, navigate, location.pathname]);

  // Reset check when auth state changes
  useEffect(() => {
    if (!isAuthenticated) {
      hasChecked.current = false;
    }
  }, [isAuthenticated]);

  return { needsOnboarding: isAuthenticated && onboardingChecked && !onboardingComplete };
}