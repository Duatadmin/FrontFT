import React, { useState } from 'react';
import { Search, Calendar, ChevronDown } from 'lucide-react';
import Sidebar from './Sidebar';

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
    <div className="flex h-screen overflow-hidden text-text-primary">
      {/* Global DashboardBackground from main.tsx will now be visible */}
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center px-6 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-white">{title}</h1>
          
          <div className="ml-auto flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 py-1.5 pl-10 pr-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-sm text-white placeholder-gray-400 focus:ring-1 focus:ring-accent-lime focus:border-accent-lime"
              />
            </div>
            
            {/* Month Selector */}
            <button className="flex items-center py-1.5 px-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-sm text-white hover:bg-white/20 transition-colors">
              <Calendar size={16} className="mr-2 text-gray-400" />
              {currentMonth}
              <ChevronDown size={16} className="ml-2 text-gray-400" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AnalyticsDashboardLayout;
