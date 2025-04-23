import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart2,
  Home, 
  Settings, 
  Bell,
  Search,
  Menu,
  X,
  ArrowLeft,
  ChevronDown,
  User,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardBackground from './DashboardBackground';

interface MobileDashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const MobileDashboardLayout: React.FC<MobileDashboardLayoutProps> = ({ 
  children, 
  title = 'Analytics' 
}) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-background text-text-primary overflow-hidden">
      {/* Background */}
      <DashboardBackground />
      
      {/* Mobile Header */}
      <header className="h-14 bg-background-surface border-b border-border-light flex items-center px-4 sticky top-0 z-30">
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="mr-3 p-2 -ml-2 rounded-full hover:bg-background-card/30 focus:outline-none focus:ring-2 focus:ring-accent-violet"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex items-center">
          <div className="bg-accent-violet bg-opacity-20 text-accent-violet p-1.5 rounded-md mr-2">
            <BarChart2 size={14} />
          </div>
          <h1 className="text-base font-bold">{title}</h1>
        </div>
        
        <div className="ml-auto flex items-center space-x-2">
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-full hover:bg-background-card/30 focus:outline-none focus:ring-2 focus:ring-accent-violet"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-background-card/30 focus:outline-none focus:ring-2 focus:ring-accent-violet"
            aria-label="Go to chat"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </header>
      
      {/* Search Input (Expandable) */}
      <AnimatePresence>
        {showSearch && (
          <motion.div 
            className="bg-background-surface px-4 py-2 border-b border-border-light z-20"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search analytics..."
                className="w-full bg-background-card border-none rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-accent-violet"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Filter Bar */}
      <div className="bg-background-surface flex items-center px-4 py-2 border-b border-border-light overflow-x-auto hide-scrollbar">
        <button className="flex items-center space-x-1 bg-background-card px-3 py-1.5 rounded-lg text-sm whitespace-nowrap mr-2">
          <span>This Month</span>
          <ChevronDown size={14} />
        </button>
        
        <button className="px-3 py-1.5 rounded-lg text-sm text-text-secondary whitespace-nowrap mr-2">
          Last 7 days
        </button>
        
        <button className="px-3 py-1.5 rounded-lg text-sm text-text-secondary whitespace-nowrap mr-2">
          This Quarter
        </button>
        
        <button className="px-3 py-1.5 rounded-lg text-sm text-text-secondary whitespace-nowrap">
          Year to Date
        </button>
      </div>
      
      {/* Mobile Content */}
      <main className="flex-1 overflow-auto px-4 py-4 bg-background">
        {children}
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-background-surface z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border-light">
                <div className="flex items-center">
                  <div className="bg-accent-violet bg-opacity-20 text-accent-violet p-1.5 rounded-md mr-2">
                    <BarChart2 size={16} />
                  </div>
                  <h2 className="text-base font-bold">Business Space</h2>
                </div>
                
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 -mr-2 rounded-full hover:bg-background-card/30 focus:outline-none focus:ring-2 focus:ring-accent-violet"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <nav className="flex-1 py-2 overflow-y-auto">
                <div className="px-3 py-2">
                  <button 
                    className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-background-card/50 sidebar-active text-accent-violet font-medium"
                  >
                    <BarChart2 className="w-5 h-5 mr-3" />
                    <span>Dashboard</span>
                  </button>
                  
                  <button 
                    className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-background-card/50 text-text-secondary"
                  >
                    <Home className="w-5 h-5 mr-3" />
                    <span>Reports</span>
                  </button>
                  
                  <button 
                    className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-background-card/50 text-text-secondary"
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    <span>Settings</span>
                  </button>
                </div>
                
                <div className="mt-2 pt-2 border-t border-border-light px-4">
                  <button 
                    className="flex items-center w-full px-3 py-3 hover:bg-background-card/50 rounded-lg text-text-secondary"
                  >
                    <Bell className="w-5 h-5 mr-3" />
                    <span>Notifications</span>
                  </button>
                </div>
              </nav>
              
              {/* User Profile */}
              <div className="p-4 border-t border-border-light">
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-accent-violet text-white flex items-center justify-center">
                      <User size={20} />
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background-surface rounded-full"></span>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium">Max Anderson</div>
                    <div className="text-xs text-text-secondary">anderson@gmail.com</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileDashboardLayout;
