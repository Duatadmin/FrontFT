// src/pages/ResponsiveNutritionPage.tsx
import React from 'react';
import useMediaQuery from '../hooks/useMediaQuery';
import MobileDashboardLayout from '../components/layout/MobileDashboardLayout';
import AnalyticsDashboardLayout from '../components/layout/AnalyticsDashboardLayout';
import Nutrition from './Nutrition';

const ResponsiveNutritionPage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <MobileDashboardLayout>
        <Nutrition />
      </MobileDashboardLayout>
    );
  }

  // For larger screens, render Nutrition within AnalyticsDashboardLayout
  return (
    <AnalyticsDashboardLayout title="Nutrition Tracker">
      <Nutrition />
    </AnalyticsDashboardLayout>
  );
};

export default ResponsiveNutritionPage;