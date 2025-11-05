import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/lib/stores/useUserStore'; // Adjust path if your store is elsewhere

export function useAuthGuard() {
  const navigate = useNavigate();
  const isLoading = useUserStore((state) => state.isLoading);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  useEffect(() => {
    console.log('[useAuthGuard Effect] State - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
    if (isLoading) {
      console.log('[useAuthGuard Effect] Auth state is loading. Waiting...');
      return; // Wait for the auth state to resolve (isLoading to become false)
    }

    // If auth state is resolved (not loading) and user is not authenticated, redirect to login
    if (!isAuthenticated) {
      console.log('[useAuthGuard Effect] User not authenticated. Redirecting to /login.');
      navigate('/login', { replace: true });
    }
    // If loading is false and user is authenticated, the hook does nothing, allowing the component to render.
  }, [isLoading, isAuthenticated, navigate]);
}
