import React, { ReactNode } from 'react';

type DashboardBackgroundProps = {
  children?: ReactNode;
};

/**
 * DashboardBackground Component
 * Provides a styled background with subtle gradients
 * Can be used as a wrapper or standalone element
 */
function DashboardBackground({ children }: DashboardBackgroundProps) {
  // If used without children, render just the background element
  if (!children) {
    return <div className="dashboard-radial-bg" aria-hidden="true" />;
  }
  
  // If used with children, wrap them with the background
  return (
    <div className="relative w-full h-full">
      <div className="dashboard-radial-bg" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default DashboardBackground;
