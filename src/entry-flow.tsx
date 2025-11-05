// entry-flow.tsx  — splash → login → chat
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AuthCallback from "./components/auth/callback"; // Added import for AuthCallback
import { createClient, Session } from "@supabase/supabase-js";

import "./index.css";                               // Tailwind base

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON!
);

/** 0. SplashScreen ******************************************************/
const SplashScreen = () => (
  <motion.div
    className="grid h-screen place-items-center bg-brand-500 text-white"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4 }}
  >
    <p className="text-3xl font-semibold tracking-wider">Isinka</p>
  </motion.div>
);

import { Auth } from '@supabase/auth-ui-react';
import { customAuthUITheme } from './auth-theme';
import Logo from '../assets/Logo.svg?react';


const LoginPage = () => {
  // console.log('Logo URL:', logoUrl); // No longer needed
  return (
  <div className="relative grid h-screen place-items-center overflow-hidden bg-[#121212]">
    {/* radial glow */}
    <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#722e0b] opacity-60 blur-[220px]" />
    {/* auth card container - apply width and other container styles here */}
    <div className="relative z-10 w-[384px] rounded-[14px] border border-white/5 bg-[#1e1e1e]/90 p-8 shadow-[0_28px_68px_-10px_rgba(0,0,0,0.6)] backdrop-blur">
      <div className="mb-4 flex items-center justify-center space-x-3">
        <Logo />
      </div>
      <Auth
        supabaseClient={supabase}
        providers={['google', 'facebook', 'twitter']} // Matched providers from AuthCard example
        appearance={{ theme: customAuthUITheme }}
          theme="dark" // Apply the custom theme
        // The 'theme' prop for Auth component is different from AuthCard. ThemeSupa is usually used as a base for 'appearance.theme'.
        // We are using darkGlassTheme which is based on ThemeSupa.
        magicLink
        socialLayout="horizontal" // To match the likely desired layout of social buttons
        // Styling for specific inner elements like label, input, button, anchor
        // needs to be done via appearance.variables or appearance.style for the Auth component.
        // The direct className prop with sub-keys is not supported in the same way.
        // Some of this will be handled by darkGlassTheme, other might need appearance.style overrides.
        // For example, to style the main button (brand button):
        // appearance={{
        //   theme: darkGlassTheme,
        //   style: {
        //     button: { background: 'linear-gradient(to right, #ff8a1f, #f45d09)', color: 'white', fontWeight: '600', height: '44px' },
        //     label: { fontSize: '11px', fontWeight: '500', color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px' },
        //     input: { height: '44px', backgroundColor: '#131313', borderColor: '#2e2e2e' },
        //     anchor: { fontSize: '12px', color: '#868686', textDecoration: 'underline', textUnderlineOffset: '2px' }
        //   }
        // }}
      />
    </div>
  </div>
);
}



/** 3. Protected route ***************************************************/
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => listener?.subscription.unsubscribe();
  }, []);

  if (session === undefined) return <SplashScreen />;
  if (!session) return <Navigate to="/login" replace />;
  return children;
};

/** 4. Router entry ******************************************************/
const AppEntry = () => (
  <BrowserRouter>
    <AnimatePresence mode="wait">
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} /> {/* Added route for AuthCallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  </BrowserRouter>
);

export default AppEntry;
