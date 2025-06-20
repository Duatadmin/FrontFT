// src/routes/AppRouter.tsx
import { useEffect } from 'react';
import { useUserStore } from '@/lib/stores/useUserStore';
import { Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import { LoginPage, ProtectedRoute } from "@/entry";
import App from "../App";
import Dashboard from '../pages/dashboard'; 
import ResponsiveDashboard from '../pages/ResponsiveDashboard';
import DiaryPage from '../pages/DiaryPage'; 
import ResponsiveEnhancedDiaryPage from '../pages/ResponsiveEnhancedDiaryPage'; 
import ResponsiveTestPage from '@/pages/ResponsiveTestPage';
import ExerciseDetailPage from '@/pages/ExerciseDetailPage';
import ResponsiveExerciseLibraryPage from '../pages/ResponsiveExerciseLibraryPage';
import AnalyticsDashboardLayout from '../components/layout/AnalyticsDashboardLayout'; 
 
import ResponsiveSupabaseTest from '@/pages/ResponsiveSupabaseTest'; 
import ResponsiveAnalyticsDashboardPage from '@/pages/ResponsiveAnalyticsDashboardPage';

import ResponsiveProgramsPage from '../pages/ResponsiveProgramsPage'; // New responsive wrapper

// Wrapper component to handle props for ExerciseDetailPage
import useMediaQuery from '../hooks/useMediaQuery'; // Added for responsiveness
import MobileDashboardLayout from '../components/layout/MobileDashboardLayout'; // Added for responsiveness

const ExerciseDetailWrapper = () => {
  const isMobile = useMediaQuery('(max-width: 768px)'); // Added for responsiveness
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/library'); // Or to the previous page, if more appropriate
  };

  if (!id) {
    // Handle case where ID is not present, perhaps redirect or show an error
    // If ID is not present, redirect. This part is outside the mobile/desktop layout logic.
    return <Navigate to="/library" replace />;
  }

  if (isMobile) {
    return (
      <MobileDashboardLayout>
        <ExerciseDetailPage exerciseId={id} onClose={handleClose} />
      </MobileDashboardLayout>
    );
  }

  // Desktop layout
  // The parent route <ProtectedRoute><AnalyticsDashboardLayout> already provides the layout.
  return <ExerciseDetailPage exerciseId={id} onClose={handleClose} />;
};

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
            <ResponsiveEnhancedDiaryPage />
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
            <ResponsiveTestPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supabase-test"
        element={
          <ProtectedRoute>
            <ResponsiveSupabaseTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/library"
        element={          <ProtectedRoute>
            <ResponsiveExerciseLibraryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exercise-details/:id"
        element={
          <ProtectedRoute>
            <AnalyticsDashboardLayout title="Exercise Details"> {/* Or a dynamic title if preferred */}
              <ExerciseDetailWrapper />
            </AnalyticsDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/programs"
        element={
          <ProtectedRoute>
            <ResponsiveProgramsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <ResponsiveAnalyticsDashboardPage />
          </ProtectedRoute>
        }
      />
      
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}