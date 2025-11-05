
import React from 'react';
import useMediaQuery from '../hooks/useMediaQuery';
import EnhancedDashboard from './EnhancedDashboard';
import MobileDashboardLayout from '../components/layout/MobileDashboardLayout';
import AnalyticsDashboardLayout from '../components/layout/AnalyticsDashboardLayout';

const ResponsiveDashboard = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Use the same EnhancedDashboard component for both mobile and desktop
  // Just wrap it in different layouts based on screen size
  if (isMobile) {
    return (
      <MobileDashboardLayout>
        <EnhancedDashboard />
      </MobileDashboardLayout>
    );
  }

  // Desktop layout
  return (
    <AnalyticsDashboardLayout title="Fitness Dashboard">
      <EnhancedDashboard />
    </AnalyticsDashboardLayout>
  );
};

export default ResponsiveDashboard;
