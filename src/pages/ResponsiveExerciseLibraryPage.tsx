// src/pages/ResponsiveExerciseLibraryPage.tsx
import React from 'react';
import useMediaQuery from '../hooks/useMediaQuery';
import MobileDashboardLayout from '../components/layout/MobileDashboardLayout';
import AnalyticsDashboardLayout from '../components/layout/AnalyticsDashboardLayout';
import ExerciseLibraryPage from './ExerciseLibraryPage'; // The actual page content

const ResponsiveExerciseLibraryPage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <MobileDashboardLayout>
        <ExerciseLibraryPage />
      </MobileDashboardLayout>
    );
  }

  return (
    <AnalyticsDashboardLayout title="Exercise Library">
      <ExerciseLibraryPage />
    </AnalyticsDashboardLayout>
  );
};

export default ResponsiveExerciseLibraryPage;
