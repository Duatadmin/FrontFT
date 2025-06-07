// src/entry/index.tsx
import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
// Navigate component is used for redirection in ProtectedRoute.
import { motion } from "framer-motion"; // For SplashScreen
// Session is no longer directly used here
import { supabase } from "../lib/supabase"; // Import the shared Supabase client
import { useAuthLoading, useAuthenticated } from '../lib/stores/useUserStore';

// Import the actual AuthCallback component. It's a default export from its file.
import AuthCallbackFromFile from "../components/auth/callback"; // Path relative to src/entry/index.tsx

/** 0. SplashScreen ******************************************************/
export const SplashScreen = () => (
  <motion.div
    className="grid h-screen place-items-center bg-brand-500 text-white"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }} // exit animation requires AnimatePresence in the consuming router
    transition={{ duration: 0.4 }}
  >
    <p className="text-3xl font-semibold tracking-wider">Isinka</p>
  </motion.div>
);

// Imports for LoginPage
import { Auth } from '@supabase/auth-ui-react';
import { useUserStore } from '../lib/stores/useUserStore';
// Assuming auth-theme.ts is in 'src/' directory, so from 'src/entry/' it's '../auth-theme'
import { customAuthUITheme } from '../auth-theme';
// Assuming Logo.svg is in 'src/assets/', so from 'src/entry/' it's '../../assets/Logo.svg?react'
import Logo from '../../assets/Logo.svg?react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const isLoading = useUserStore((state) => state.isLoading);

  useEffect(() => {
    // If loading is finished and user is authenticated, redirect from login page
    if (!isLoading && isAuthenticated) {
      console.log('[LoginPage Effect] User is authenticated, redirecting to /');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="relative grid h-screen place-items-center overflow-hidden bg-[#121212]">
      {/* radial glow */}
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#722e0b] opacity-60 blur-[220px]" />
      {/* auth card container */}
      <div className="relative z-10 w-[384px] rounded-[14px] border border-white/5 bg-[#1e1e1e]/90 p-8 shadow-[0_28px_68px_-10px_rgba(0,0,0,0.6)] backdrop-blur">
        <div className="mb-4 flex items-center justify-center space-x-3">
          <Logo />
        </div>
        <Auth
          supabaseClient={supabase} // This will use the shared Supabase client later
          providers={['google', 'facebook', 'twitter']}
          appearance={{ theme: customAuthUITheme }}
          theme="dark"
          magicLink
          socialLayout="horizontal"
        />
      </div>
    </div>
  );
};

/** 3. ProtectedRoute ***************************************************/
export const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  console.log('[ProtectedRoute] Rendering...');
  const isLoading = useAuthLoading();
  const isAuthenticated = useAuthenticated();
  const navigate = useNavigate(); // Added for redirection
  console.log('[ProtectedRoute] State - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

  useEffect(() => {
    if (isLoading) {
      console.log('[ProtectedRoute Effect] Auth state is loading. Waiting...');
      return; // Wait for the auth state to resolve
    }

    if (!isAuthenticated) {
      console.log('[ProtectedRoute Effect] User not authenticated. Redirecting to /login.');
      navigate('/login', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || !isAuthenticated) {
    // If loading, or if not authenticated (and effect will redirect),
    // render null or a loading spinner to prevent child component flash.
    console.log('[ProtectedRoute] Auth loading or user not authenticated (redirect pending). Rendering null.');
    return null; 
  }

  console.log('[ProtectedRoute] User authenticated. Rendering children.');
  return children;
};

// Export the imported AuthCallback component under the name 'AuthCallback'
// This makes `import { AuthCallback } from '@/entry'` (or similar aliased path) work as intended.
export { AuthCallbackFromFile as AuthCallback };