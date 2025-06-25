// src/routes/AppRouter.tsx
import React, { useState, useEffect } from 'react';
import { useUserStore } from '@/lib/stores/useUserStore';
import { Routes, Route } from "react-router-dom";
import { LoginPage, ProtectedRoute } from "@/entry";

// Define a type for our dynamically imported component
type ProtectedRoutesType = React.ComponentType;

export default function AppRouter() {
  const [ProtectedRoutes, setProtectedRoutes] = useState<ProtectedRoutesType | null>(null);
  const { boot } = useUserStore.getState();

  useEffect(() => {
    // Preload the protected routes component as soon as the app loads
    console.log('[AppRouter] Preloading protected routes...');
    import('./ProtectedRoutes')
      .then(module => {
        setProtectedRoutes(() => module.default);
        console.log('[AppRouter] Protected routes preloaded.');
      })
      .catch(error => {
        console.error('[AppRouter] Failed to preload protected routes:', error);
      });

    // Also initialize the user session
    if (typeof window !== 'undefined') {
      console.log('[AppRouter] useEffect: Calling boot()');
      boot().catch(error => {
        console.error('[AppRouter] boot() call failed in useEffect:', error);
      });
    }
  }, [boot]);

  return (
    <Routes>
      {/* The login page is always available */}
      <Route path="/login" element={<LoginPage />} />

      {/* All other routes are wrapped in ProtectedRoute */}
      {/* They will render the preloaded ProtectedRoutes component once it's available */}
      <Route 
        path="/*" 
        element={
          <ProtectedRoute>
            {ProtectedRoutes ? <ProtectedRoutes /> : <div>Loading application...</div>}
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}