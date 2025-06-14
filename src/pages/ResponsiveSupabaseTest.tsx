// src/pages/ResponsiveSupabaseTest.tsx
import React from 'react';
import useMediaQuery from '../hooks/useMediaQuery';
import MobileDashboardLayout from '../components/layout/MobileDashboardLayout';
import SupabaseTest from '../SupabaseTest'; // The actual page content

const ResponsiveSupabaseTest: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <MobileDashboardLayout>
        <SupabaseTest />
      </MobileDashboardLayout>
    );
  }

  // For larger screens, render SupabaseTest as is
  return <SupabaseTest />;
};

export default ResponsiveSupabaseTest;
