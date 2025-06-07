// src/entry/index.tsx
import React from "react";
// Navigate component is no longer directly used here, useRequireAuth handles redirection.
import { motion } from "framer-motion"; // For SplashScreen
// Session is no longer directly used here
import { supabase } from "../lib/supabase"; // Import the shared Supabase client
import { useRequireAuth } from '../lib/stores/useUserStore';

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
// Assuming auth-theme.ts is in 'src/' directory, so from 'src/entry/' it's '../auth-theme'
import { customAuthUITheme } from '../auth-theme';
// Assuming Logo.svg is in 'src/assets/', so from 'src/entry/' it's '../../assets/Logo.svg?react'
import Logo from '../../assets/Logo.svg?react';

export const LoginPage = () => {
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
  const { isLoading, isAuthenticated } = useRequireAuth();
  console.log('[ProtectedRoute] Values from useRequireAuth: isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

  if (isLoading) {
    console.log('[ProtectedRoute] Condition: isLoading is true. Rendering SplashScreen.');
    return <SplashScreen />; // Show splash screen while auth state is loading
  }

  // If not loading and authenticated, render children.
  // If not loading and not authenticated, useRequireAuth hook handles the redirect.
  // Rendering null here is a fallback for the brief moment before redirect completes.
  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Condition: NOT isLoading AND NOT isAuthenticated. Rendering null (expecting redirect from useRequireAuth).');
    return null; // useRequireAuth handles redirect
  }
  console.log('[ProtectedRoute] Condition: NOT isLoading AND isAuthenticated. Rendering children.');
  return children;
};

// Export the imported AuthCallback component under the name 'AuthCallback'
// This makes `import { AuthCallback } from '@/entry'` (or similar aliased path) work as intended.
export { AuthCallbackFromFile as AuthCallback };