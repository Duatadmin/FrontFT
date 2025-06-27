import React from 'react';
import Sidebar from './Sidebar';

interface AnalyticsDashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AnalyticsDashboardLayout: React.FC<AnalyticsDashboardLayoutProps> = ({ 
  children
  // title prop is no longer used after header removal
}) => {
  // searchQuery, setSearchQuery, currentMonth, setCurrentMonth were used in the removed header
  
  return (
    <div className="flex h-screen overflow-hidden text-text-primary safe-top md:mt-0 md:pt-0"> {/* Added safe-top */}
      {/* Global DashboardBackground from main.tsx will now be visible */}
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-6 safe-left safe-right"> {/* Added safe-left, safe-right */}
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsDashboardLayout;
