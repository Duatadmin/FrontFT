import React from 'react';
import BottomNavBar from './BottomNavBar';

interface MobileDashboardLayoutProps {
  children: React.ReactNode;
}

const MobileDashboardLayout: React.FC<MobileDashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen text-text overflow-hidden">
      <main className="flex-1 overflow-y-auto p-4 pb-28">
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
};

export default MobileDashboardLayout;
