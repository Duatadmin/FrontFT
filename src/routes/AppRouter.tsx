// src/routes/AppRouter.tsx
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage, AuthCallback, ProtectedRoute } from "../entry";
import App from "../App";
import Dashboard from '../pages/dashboard'; 
import EnhancedDashboard from "../pages/EnhancedDashboard";
import DiaryPage from '../pages/DiaryPage'; 
import EnhancedDiaryPage from '../pages/EnhancedDiaryPage'; 
import TestPage from '../pages/TestPage'; 
import ProgramsPageSkeleton from '../components/skeletons/ProgramsPageSkeleton'; 
import SupabaseTest from '../SupabaseTest'; 

// Import ProgramsPage with proper lazy-loading (copied from main.tsx)
const ProgramsPage = React.lazy(() => {
  return import('../pages/programs');
});

export default function AppRouter() {
  return (
    <Routes>
      {/* Entry-flow */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

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
            <EnhancedDashboard />
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