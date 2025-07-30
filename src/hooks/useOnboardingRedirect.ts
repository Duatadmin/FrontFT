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
  const isLoading = useUserStore((state) => state.isLoading);

  useEffect(() => {
    // Skip if already checked, still loading, or not authenticated
    if (hasChecked.current || isLoading || !isAuthenticated) {
      return;
    }

    // Mark as checked to prevent multiple redirects
    hasChecked.current = true;

    // Don't redirect if already on onboarding routes
    const onboardingRoutes = ['/welcome', '/onboarding'];
    if (onboardingRoutes.includes(location.pathname)) {
      return;
    }

    // Redirect to welcome if authenticated but not onboarded
    if (isAuthenticated && !onboardingComplete) {
      console.log('[useOnboardingRedirect] User needs onboarding, redirecting to /welcome');
      navigate('/welcome', { replace: true });
    }
  }, [isAuthenticated, onboardingComplete, isLoading, navigate, location.pathname]);

  // Reset check when auth state changes
  useEffect(() => {
    if (!isAuthenticated) {
      hasChecked.current = false;
    }
  }, [isAuthenticated]);

  return { needsOnboarding: isAuthenticated && !onboardingComplete };
}