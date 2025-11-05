// src/pages/ResponsiveAnalyticsDashboardPage.tsx
import React from 'react';
import useMediaQuery from '../hooks/useMediaQuery';
import MobileDashboardLayout from '../components/layout/MobileDashboardLayout';
import AnalyticsDashboardLayout from '../components/layout/AnalyticsDashboardLayout';
import AnalyticsDashboardPage from './AnalyticsDashboardPage'; // The actual page content

const ResponsiveAnalyticsDashboardPage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <MobileDashboardLayout>
        <AnalyticsDashboardPage />
      </MobileDashboardLayout>
    );
  }

  return (
    <AnalyticsDashboardLayout title="Analytics Dashboard">
      <AnalyticsDashboardPage />
    </AnalyticsDashboardLayout>
  );
};

export default ResponsiveAnalyticsDashboardPage;
