import React from 'react';
import BottomNavBar from './BottomNavBar';

interface MobileDashboardLayoutProps {
  children: React.ReactNode;
}

const MobileDashboardLayout: React.FC<MobileDashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen text-text overflow-hidden safe-top"> {/* Added safe-top */}
      <main className="flex-1 overflow-y-auto px-4 pb-28 safe-left safe-right"> {/* Changed p-4 to px-4, added safe-left, safe-right */}
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
};

export default MobileDashboardLayout;
