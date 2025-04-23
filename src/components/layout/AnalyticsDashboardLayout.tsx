import React, { useState } from 'react';
import { Search, Calendar, ChevronDown } from 'lucide-react';
import Sidebar from './Sidebar';
import DashboardBackground from './DashboardBackground';

interface AnalyticsDashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AnalyticsDashboardLayout: React.FC<AnalyticsDashboardLayoutProps> = ({ 
  children,
  title = 'Analytics'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMonth, setCurrentMonth] = useState('May 2024');
  
  return (
    <div className="flex h-screen bg-background overflow-hidden text-text-primary">
      {/* Lavender Radial Background */}
      <DashboardBackground />
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-background-surface border-b border-border-light flex items-center px-6">
          <h1 className="text-xl font-bold">{title}</h1>
          
          <div className="ml-auto flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-text-secondary" />
              </div>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 py-1.5 pl-10 pr-4 bg-background-card border border-border-light rounded-lg text-sm focus:ring-1 focus:ring-accent-violet focus:border-accent-violet"
              />
            </div>
            
            {/* Month Selector */}
            <button className="flex items-center py-1.5 px-4 bg-background-card border border-border-light rounded-lg text-sm">
              <Calendar size={16} className="mr-2 text-text-secondary" />
              {currentMonth}
              <ChevronDown size={16} className="ml-2 text-text-secondary" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AnalyticsDashboardLayout;
