import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Keep BrowserRouter
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Import QueryClient and Provider
import AppRouter from './routes/AppRouter'; // Import AppRouter
import DashboardBackground from './components/layout/DashboardBackground'; // Import DashboardBackground
// Removed authStateSync - duplicate auth listener

// CSS imports remain
import './index.css';
import './styles/animations.css';

// Import debug tools in development
if (import.meta.env.MODE !== 'production') {
  import('./utils/debugSubscription').catch(console.error);
}

// Attempt to import supabase client and render app
// This is to catch critical errors during Supabase client initialization
const rootElement = document.getElementById('root');

if (rootElement) {
  (async () => {
    try {
      // Dynamically import supabase to catch initialization errors here
      const { supabase } = await import('./lib/supabase');
      
      // Ensure supabase object is valid (it might not be if import itself failed silently or threw an error caught by dynamic import)
      if (!supabase || !supabase.auth) {
          throw new Error('Supabase client failed to initialize correctly.');
      }

      // Create a client with better default configuration
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            // Retry failed queries with exponential backoff
            retry: (failureCount, error) => {
              // Don't retry on 4xx errors except 401 (unauthorized)
              if (error instanceof Error) {
                const message = error.message.toLowerCase();
                // Don't retry "no rows" errors (user doesn't have subscription)
                if (message.includes('no rows') || message.includes('not found')) {
                  return false;
                }
                if (message.includes('4') && !message.includes('401')) {
                  return false;
                }
              }
              return failureCount < 3;
            },
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch on window focus (helps recover after standby)
            refetchOnWindowFocus: true,
            // Consider data stale after 5 minutes
            staleTime: 5 * 60 * 1000,
            // Keep cache for 10 minutes
            gcTime: 10 * 60 * 1000,
          },
        },
      });
      
      // Single global auth listener - minimal and selective
      supabase.auth.onAuthStateChange((event) => {
        console.log('[main.tsx] Auth event:', event);
        
        // Only handle critical auth events
        if (event === 'SIGNED_OUT') {
          // Clear all queries on sign out
          queryClient.clear();
        } else if (event === 'SIGNED_IN') {
          // Only invalidate auth-sensitive queries on sign in
          queryClient.invalidateQueries({ queryKey: ['subscription'] });
          queryClient.invalidateQueries({ queryKey: ['user'] });
        }
        // REMOVED: TOKEN_REFRESHED handling
        // Supabase automatically uses the new token for subsequent requests
        // No need to invalidate all queries on token refresh
      });
      
      // Import and boot the user store first
      const { useUserStore } = await import('./lib/stores/useUserStore');
      await useUserStore.getState().boot();
      
      // DISABLED: authStateSync creates duplicate auth listener
      // The global listener above already handles TOKEN_REFRESHED
      // authStateSync.start();

      // SW kill switch: set VITE_DISABLE_SW=1 to forcibly unregister SW and clear caches
      if (import.meta.env.VITE_DISABLE_SW === '1' && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((r) => r.unregister());
          console.log('[SW] Unregistered all service workers via VITE_DISABLE_SW=1');
        });
        if ('caches' in window) {
          caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
          console.log('[SW] Cleared all CacheStorage entries');
        }
      }

      ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              {/* DashboardBackground wraps entire app for consistent styling */}
              <DashboardBackground>
                <AppRouter />
              </DashboardBackground>
            </BrowserRouter>
          </QueryClientProvider>
        </React.StrictMode>
      );
    } catch (error) {
      console.error('Failed to initialize the application:', error);
      rootElement.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; background-color: #121212; color: #f0f0f0;">
          <h1>Application Error</h1>
          <p>Could not initialize the application. Please check the console for more details.</p>
          <p style="color: #ff6b6b; margin-top: 10px;">${error instanceof Error ? error.message : 'An unknown error occurred.'}</p>
        </div>
      `;
    }
  })();
} else {
  console.error('Failed to find the root element. The application cannot start.');
}