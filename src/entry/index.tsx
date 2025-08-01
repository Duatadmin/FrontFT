// src/entry/index.tsx
import React, { useEffect } from "react";
import { Navigate, useNavigate } from 'react-router-dom';
// Navigate component is used for redirection in ProtectedRoute, useNavigate for LoginPage.
import { motion } from "framer-motion"; // For SplashScreen
// Session is no longer directly used here
import { supabase } from "../lib/supabase/browser"; // Import the new browser Supabase client



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
import { useUserStore, type UserState } from '@/lib/stores/useUserStore';
// Assuming auth-theme.ts is in 'src/' directory, so from 'src/entry/' it's '../auth-theme'
import { customAuthUITheme } from '../auth-theme';
// Assuming Logo.svg is in 'src/assets/', so from 'src/entry/' it's '@/assets/Logo.svg?react'
import Logo from '../../assets/Logo.svg?react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useUserStore((state: UserState) => state.isAuthenticated);
  const isLoading = useUserStore((state: UserState) => state.isLoading);

  useEffect(() => {
    // If loading is finished and user is authenticated, redirect from login page
    if (!isLoading && isAuthenticated) {
      console.log('[LoginPage Effect] User is authenticated, redirecting to /');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="grid h-screen place-items-center bg-dark-bg bg-gradient-radial-olive">
      {/* auth card container */}
      <div className="relative z-10 w-[384px] rounded-2xl border border-white/5 bg-neutral-900/60 p-8 shadow-[0_28px_68px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-center space-x-3">
          <Logo />
        </div>
        <Auth
          supabaseClient={supabase}
          providers={['google', 'apple']}
          appearance={{ theme: customAuthUITheme }}
          theme="dark"
          magicLink
          socialLayout="horizontal"
          localization={{
            variables: {
              sign_in: {
                button_label: 'SIGN IN',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

/** 3. ProtectedRoute ***************************************************/
export const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  console.log('[ProtectedRoute] Rendering...');
  const isLoading = useUserStore((state: UserState) => state.isLoading);
  const isAuthenticated = useUserStore((state: UserState) => state.isAuthenticated);
  console.log('[ProtectedRoute] State - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

  if (isLoading) {
    console.log('[ProtectedRoute] Auth state is loading. Rendering loading spinner.');
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg bg-gradient-radial-olive">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Logo */}
          <div className="mb-8 text-accent-lime">
            <Logo className="w-32 h-auto mx-auto" />
          </div>
          
          {/* Loading indicator */}
          <div className="flex items-center justify-center gap-1.5">
            <motion.div
              className="w-2 h-2 bg-accent-lime rounded-full"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-2 h-2 bg-accent-lime rounded-full"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-2 h-2 bg-accent-lime rounded-full"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] User not authenticated. Redirecting to /login via <Navigate />.');
    return <Navigate to="/login" replace />;
  }

  console.log('[ProtectedRoute] User authenticated. Rendering children.');
  return children;
};