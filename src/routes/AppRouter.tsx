// src/routes/AppRouter.tsx
import React, { useEffect } from 'react';
import { useUserStore } from '@/lib/stores/useUserStore';
import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage, ProtectedRoute } from "@/entry";
import App from "../App";
import Dashboard from '../pages/dashboard'; 
import ResponsiveDashboard from '../pages/ResponsiveDashboard';
import DiaryPage from '../pages/DiaryPage'; 
import EnhancedDiaryPage from '../pages/EnhancedDiaryPage'; 
import TestPage from '@/pages/TestPage';
import ExerciseDetailPage from '@/pages/ExerciseDetailPage';
import ExerciseLibraryPage from '../pages/ExerciseLibraryPage';
import AnalyticsDashboardLayout from '../components/layout/AnalyticsDashboardLayout'; 
import ProgramsPageSkeleton from '../components/skeletons/ProgramsPageSkeleton'; 
import SupabaseTest from '../SupabaseTest'; 

// Import ProgramsPage with proper lazy-loading (copied from main.tsx)
const ProgramsPage = React.lazy(() => {
  return import('../pages/programs');
});

export default function AppRouter() {
  const { boot } = useUserStore.getState(); // Get boot function directly

  useEffect(() => {
    // Ensure boot() is called only on the client side
    if (typeof window !== 'undefined') {
      console.log('[AppRouter] useEffect: Calling boot()');
      boot().catch(error => {
        console.error('[AppRouter] boot() call failed in useEffect:', error);
      });
    }
  }, [boot]); // Include boot in dependency array if it could change, though typically it's stable

  return (
    <Routes>
      {/* Entry-flow */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected heavy pages - Main landing page */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {/* Assuming App is the main layout which might include navigation to other pages like EnhancedDashboard */}
            {/* If EnhancedDashboard is the primary landing page after login, this could be <EnhancedDashboard /> directly */}
            <App /> 
          </ProtectedRoute>
        }
      />

      {/* Additional Protected heavy pages (ported from main.tsx) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ResponsiveDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard-old"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/diary"
        element={
          <ProtectedRoute>
            <EnhancedDiaryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/diary-old"
        element={
          <ProtectedRoute>
            <DiaryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/test"
        element={
          <ProtectedRoute>
            <TestPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supabase-test"
        element={
          <ProtectedRoute>
            <SupabaseTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/library"
        element={          <ProtectedRoute>
            <AnalyticsDashboardLayout title="Exercise Library">
              <ExerciseLibraryPage />
            </AnalyticsDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/exercise-details/:id"
        element={
          <ProtectedRoute>
            <ExerciseDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/programs"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<ProgramsPageSkeleton />}>
              <ProgramsPage />
            </React.Suspense>
          </ProtectedRoute>
        }
      />
      
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}