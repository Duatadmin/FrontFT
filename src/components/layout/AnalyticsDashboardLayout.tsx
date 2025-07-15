import React from 'react';
import Sidebar from './Sidebar';

interface AnalyticsDashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AnalyticsDashboardLayout: React.FC<AnalyticsDashboardLayoutProps> = ({ 
  children
}) => {
  return (
    <div className="flex h-lvh overflow-hidden text-text-primary">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Dashboard Content with proper safe area handling */}
        <main className="flex-1 overflow-y-auto p-6 safe-top safe-left safe-right">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsDashboardLayout;
