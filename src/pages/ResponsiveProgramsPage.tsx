// src/pages/ResponsiveProgramsPage.tsx
import React from 'react';
import useMediaQuery from '../hooks/useMediaQuery';
import MobileDashboardLayout from '../components/layout/MobileDashboardLayout';
import AnalyticsDashboardLayout from '../components/layout/AnalyticsDashboardLayout';
import ProgramsPage from './programs'; // Direct import


const ResponsiveProgramsPage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <MobileDashboardLayout>
        <ProgramsPage />
      </MobileDashboardLayout>
    );
  }

  // For larger screens, render ProgramsPage within AnalyticsDashboardLayout
  return (
    <AnalyticsDashboardLayout title="Training Programs & Goals">
      <ProgramsPage />
    </AnalyticsDashboardLayout>
  );
};

export default ResponsiveProgramsPage;
