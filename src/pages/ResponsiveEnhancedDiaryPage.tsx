// src/pages/ResponsiveEnhancedDiaryPage.tsx
import React from 'react';
import useMediaQuery from '../hooks/useMediaQuery';
import MobileDashboardLayout from '../components/layout/MobileDashboardLayout';
import EnhancedDiaryPage from './EnhancedDiaryPage'; // The actual page content

const ResponsiveEnhancedDiaryPage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <MobileDashboardLayout>
        <EnhancedDiaryPage />
      </MobileDashboardLayout>
    );
  }

  // For larger screens, render EnhancedDiaryPage as is, or with its specific desktop layout if it had one.
  // Assuming EnhancedDiaryPage doesn't have its own full-screen layout component like AnalyticsDashboardLayout.
  return <EnhancedDiaryPage />;
};

export default ResponsiveEnhancedDiaryPage;
