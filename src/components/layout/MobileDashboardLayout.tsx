import React from 'react';
import BottomNavBar from './BottomNavBar';

interface MobileDashboardLayoutProps {
  children: React.ReactNode;
}

const MobileDashboardLayout: React.FC<MobileDashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-lvh text-text overflow-hidden">
      {/* Main content area with proper safe area handling */}
      <main className="flex-1 overflow-y-auto safe-top safe-left safe-right pb-32">
        <div className="max-w-7xl mx-auto px-4">
          {children}
        </div>
      </main>
      {/* Bottom navigation is fixed positioned and handles its own safe areas */}
      <BottomNavBar />
    </div>
  );
};

export default MobileDashboardLayout;
