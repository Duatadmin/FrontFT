import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Home, 
  Settings, 
  User, 
  ChevronRight, 
  Search,
  Calendar,
  Menu,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AnalyticsLayoutProps {
  children: React.ReactNode;
}

const AnalyticsLayout: React.FC<AnalyticsLayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('April 2025');

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex h-screen bg-[#050608] text-text overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={{ width: 250 }}
        animate={{ width: isCollapsed ? 72 : 250 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="h-full bg-[#0F1014] border-r border-[#1A1B20] flex flex-col"
      >
        {/* Sidebar Header with Logo */}
        <div className="p-4 flex items-center justify-between">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center"
              >
                <img src="/Logo.svg" alt="Jarvis" className="w-8 h-8 mr-2" />
                <span className="font-bold text-lg">Jarvis</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button 
            onClick={toggleSidebar}
            className="text-textSecondary hover:text-text transition-colors"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-2 py-4">
          <ul className="space-y-2">
            <li>
              <Link 
                to="/"
                className="flex items-center px-3 py-2 rounded-lg text-textSecondary hover:text-text hover:bg-[#1A1B20] transition-colors"
              >
                <Home size={20} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="ml-3"
                    >
                      Chat
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </li>
            <li>
              <Link 
                to="/dashboard"
                className="flex items-center px-3 py-2 rounded-lg bg-[#1A1B20] text-[#10a37f]"
              >
                <BarChart3 size={20} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="ml-3"
                    >
                      Analytics
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </li>
            <li>
              <Link 
                to="/settings"
                className="flex items-center px-3 py-2 rounded-lg text-textSecondary hover:text-text hover:bg-[#1A1B20] transition-colors"
              >
                <Settings size={20} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="ml-3"
                    >
                      Settings
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Upgrade CTA Card */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mx-4 mb-4 p-4 bg-[#1A1B20] rounded-2xl"
            >
              <h4 className="font-medium mb-1">Upgrade to Pro</h4>
              <p className="text-sm text-textSecondary mb-3">Get advanced analytics and more</p>
              <button className="w-full py-2 px-3 bg-[#10a37f] hover:bg-[#0d8c6d] text-white rounded-lg text-sm font-medium transition-colors">
                Upgrade Now
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Account */}
        <div className={`p-4 border-t border-[#1A1B20] flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-[#1A1B20] flex items-center justify-center text-[#10a37f]">
            <User size={16} />
          </div>
          
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-3"
              >
                <div className="text-sm font-medium">John Doe</div>
                <div className="text-xs text-textSecondary">john@example.com</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-[#0F1014] border-b border-[#1A1B20] flex items-center px-6">
          <h1 className="text-xl font-semibold mr-6">Analytics</h1>
          
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-textSecondary" />
            </div>
            <input
              type="text"
              placeholder="Search metrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-10 pr-4 bg-[#1A1B20] border border-[#2A2B30] rounded-lg text-sm focus:ring-1 focus:ring-[#10a37f] focus:border-[#10a37f]"
            />
          </div>
          
          <div className="ml-4 relative">
            <button className="flex items-center py-2 px-4 bg-[#1A1B20] border border-[#2A2B30] rounded-lg text-sm">
              <Calendar size={16} className="mr-2" />
              {selectedMonth}
              <ChevronRight size={16} className="ml-2" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto bg-[#0F1014] p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AnalyticsLayout;
