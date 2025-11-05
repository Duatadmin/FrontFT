// src/pages/ResponsiveTestPage.tsx
import React from 'react';
import useMediaQuery from '../hooks/useMediaQuery';
import MobileDashboardLayout from '../components/layout/MobileDashboardLayout';
import TestPage from './TestPage'; // The actual page content

const ResponsiveTestPage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <MobileDashboardLayout>
        <TestPage />
      </MobileDashboardLayout>
    );
  }

  // For larger screens, render TestPage as is
  return <TestPage />;
};

export default ResponsiveTestPage;
