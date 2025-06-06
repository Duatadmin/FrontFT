// src/entry/index.tsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom"; // For ProtectedRoute
import { motion } from "framer-motion"; // For SplashScreen
import { Session } from "@supabase/supabase-js"; 
import { supabase } from "../lib/supabase"; // Import the shared Supabase client

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
  const [session, setSession] = useState<Session | null | undefined>(undefined); // undefined: loading, null: no session, Session: active session

  useEffect(() => {
    // onAuthStateChange fires an event with the initial session state as well.
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, sessionState) => {
      setSession(sessionState);
    });
    
    // Ensure the initial session state is set if onAuthStateChange hasn't fired yet or for immediate check
    // This helps avoid a flicker if onAuthStateChange is slightly delayed.
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      // Only update if the session state is still in its initial 'undefined' state
      // to prevent overriding a state already set by onAuthStateChange.
      if (session === undefined) {
        setSession(currentSession);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  if (session === undefined) {
    return <SplashScreen />; // Show splash screen while session is being determined
  }

  if (!session) {
    return <Navigate to="/login" replace />; // No session, redirect to login
  }

  return children; // Session exists, render the protected content
};

// Export the imported AuthCallback component under the name 'AuthCallback'
// This makes `import { AuthCallback } from '@/entry'` (or similar aliased path) work as intended.
export { AuthCallbackFromFile as AuthCallback };