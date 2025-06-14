// src/pages/ResponsiveProgramsPage.tsx
import React from 'react';
import useMediaQuery from '../hooks/useMediaQuery';
import MobileDashboardLayout from '../components/layout/MobileDashboardLayout';
import ProgramsPageSkeleton from '../components/skeletons/ProgramsPageSkeleton';

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

  // For larger screens, render ProgramsPage as is, wrapped in Suspense
  return (
    <React.Suspense fallback={<ProgramsPageSkeleton />}>
      <ProgramsPage />
    </React.Suspense>
  );
};

export default ResponsiveProgramsPage;
