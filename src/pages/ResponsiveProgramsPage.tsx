// src/pages/ResponsiveProgramsPage.tsx
import React from 'react';
import useMediaQuery from '../hooks/useMediaQuery';
import MobileDashboardLayout from '../components/layout/MobileDashboardLayout';
import ProgramsPageSkeleton from '../components/skeletons/ProgramsPageSkeleton';
import AnalyticsDashboardLayout from '../components/layout/AnalyticsDashboardLayout';

// Lazy load ProgramsPage
const ProgramsPage = React.lazy(() => import('./programs'));

const ResponsiveProgramsPage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <MobileDashboardLayout>
        <React.Suspense fallback={<ProgramsPageSkeleton />}>
          <ProgramsPage />
        </React.Suspense>
      </MobileDashboardLayout>
    );
  }

  // For larger screens, render ProgramsPage within AnalyticsDashboardLayout
  return (
    <AnalyticsDashboardLayout title="Training Programs & Goals">
      <React.Suspense fallback={<ProgramsPageSkeleton />}>
        <ProgramsPage />
      </React.Suspense>
    </AnalyticsDashboardLayout>
  );
};

export default ResponsiveProgramsPage;
