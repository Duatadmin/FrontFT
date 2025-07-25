import { ReactNode } from 'react';

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
    return <div className="absolute inset-0 bg-dark-bg bg-noise-olive" aria-hidden="true" />;
  }
  
  // If used with children, wrap them with the background
  // Using h-full to inherit parent's height rather than forcing min-h-screen
  return (
    <div className="w-full h-full bg-dark-bg bg-gradient-radial-olive">
      {children}
    </div>
  );
}

export default DashboardBackground;
