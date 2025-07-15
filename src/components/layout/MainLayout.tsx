import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import DashboardBackground from './DashboardBackground';

type MainLayoutProps = {
  children: ReactNode;
};

/**
 * MainLayout Component
 * Provides consistent layout structure for primary routes:
 * - Sidebar navigation
 * - Dashboard background
 * - Content container with proper spacing
 */
function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-lvh overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardBackground>
          <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </DashboardBackground>
      </div>
    </div>
  );
}

export default MainLayout;
