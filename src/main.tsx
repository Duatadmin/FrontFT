import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Keep BrowserRouter
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Import QueryClient and Provider
import AppRouter from './routes/AppRouter'; // Import AppRouter
import DashboardBackground from './components/layout/DashboardBackground'; // Import DashboardBackground

// CSS imports remain
import './index.css';
import './styles/animations.css';

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
                if (message.includes('4') && !message.includes('401')) {
                  return false;
                }
              }
              return failureCount < 3;
            },
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch on window focus
            refetchOnWindowFocus: false,
            // Consider data stale after 5 minutes
            staleTime: 5 * 60 * 1000,
          },
        },
      });
      
      // Listen for auth state changes globally and invalidate queries
      supabase.auth.onAuthStateChange((event) => {
        console.log('[main.tsx] Global auth state change:', event);
        if (event === 'TOKEN_REFRESHED') {
          // Invalidate all queries to refetch with new token
          console.log('[main.tsx] Token refreshed, invalidating all queries');
          queryClient.invalidateQueries();
        } else if (event === 'SIGNED_OUT') {
          // Clear all queries on sign out
          console.log('[main.tsx] User signed out, clearing query cache');
          queryClient.clear();
        }
      });

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