// src/pages/ResponsiveEnhancedDiaryPage.tsx
import React from 'react';
import useMediaQuery from '../hooks/useMediaQuery';
import MobileDashboardLayout from '../components/layout/MobileDashboardLayout';
import EnhancedDiaryPage from './EnhancedDiaryPage'; // The actual page content
import AnalyticsDashboardLayout from '../components/layout/AnalyticsDashboardLayout'; // Import AnalyticsDashboardLayout

const ResponsiveEnhancedDiaryPage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <MobileDashboardLayout>
        <EnhancedDiaryPage />
      </MobileDashboardLayout>
    );
  }

  // For larger screens, render EnhancedDiaryPage within AnalyticsDashboardLayout
  return (
    <AnalyticsDashboardLayout title="Training Diary">
      <EnhancedDiaryPage />
    </AnalyticsDashboardLayout>
  );
};

export default ResponsiveEnhancedDiaryPage;
