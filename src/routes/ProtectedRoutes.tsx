// src/routes/ProtectedRoutes.tsx
import { Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
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
import ResponsiveProgramsPage from '../pages/ResponsiveProgramsPage';
import useMediaQuery from '../hooks/useMediaQuery';
import MobileDashboardLayout from '../components/layout/MobileDashboardLayout';
import UserProfile from '../components/UserProfile';
import ResponsiveNutritionPage from '../pages/ResponsiveNutritionPage';
import { OnboardingCheck } from '@/components/auth/OnboardingCheck';
import ProfileSettingsPage from '@/pages/ProfileSettingsPage';
import TestSubscriptionV2 from '@/pages/TestSubscriptionV2';

// Wrapper component to handle props for ExerciseDetailPage
const ExerciseDetailWrapper = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/library'); // Or to the previous page, if more appropriate
  };

  if (!id) {
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
  return <ExerciseDetailPage exerciseId={id} onClose={handleClose} />;
};

export default function ProtectedRoutes() {
  return (
    <OnboardingCheck>
      <Routes>
        {/* All routes that require authentication are defined here */}
        <Route path="/" element={<App />} />
      <Route path="/dashboard" element={<ResponsiveDashboard />} />
      <Route path="/dashboard-old" element={<Dashboard />} />
      <Route path="/diary" element={<ResponsiveEnhancedDiaryPage />} />
      <Route path="/diary-old" element={<DiaryPage />} />
      <Route path="/test" element={<ResponsiveTestPage />} />
      <Route path="/supabase-test" element={<ResponsiveSupabaseTest />} />
      <Route path="/library" element={<ResponsiveExerciseLibraryPage />} />
      <Route 
        path="/exercise-details/:id" 
        element={
          <AnalyticsDashboardLayout title="Exercise Details">
            <ExerciseDetailWrapper />
          </AnalyticsDashboardLayout>
        }
      />
      <Route path="/programs" element={<ResponsiveProgramsPage />} />
      <Route path="/analytics" element={<ResponsiveAnalyticsDashboardPage />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/settings/profile" element={<ProfileSettingsPage />} />
      <Route path="/nutrition" element={<ResponsiveNutritionPage />} />
      <Route path="/test-subscription-v2" element={<TestSubscriptionV2 />} />
      
      {/* This catch-all is important for when this component is rendered under a parent route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </OnboardingCheck>
  );
}
