import React from 'react';
import { useOnboardingRedirect } from '@/hooks/useOnboardingRedirect';

/**
 * Wrapper component that checks onboarding status for specific routes
 * This is non-blocking and allows the UI to render while checking
 */
export const OnboardingCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // This hook handles the redirect logic internally
  useOnboardingRedirect();
  
  // Always render children - the hook handles redirects asynchronously
  return <>{children}</>;
};