import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart2,
  FileText,
  ShoppingCart,
  Star,
  CheckSquare,
  FolderKanban,
  Settings,
  MessageCircle,
  HelpCircle,
  ChevronRight,
  Bell,
  BookOpen,
  Dumbbell
} from 'lucide-react';

// Track which modules have been prefetched to prevent redundant fetches
const prefetchedModules = new Set<string>();

// Helper function to dynamically prefetch a module
const prefetchModule = (path: string) => {
  if (prefetchedModules.has(path)) return; // Skip if already prefetched
  
  try {
    // Add paths we know exist to avoid dynamic path construction issues
    if (path === '/programs') {
      // Using @vite-ignore to suppress dynamic import warnings
      // @ts-ignore
      /* @vite-ignore */
      import('../../pages/programs').catch(() => {
        // Silent catch - prefetch failures shouldn't disrupt the UI
      });
    } else if (path === '/dashboard') {
      // @ts-ignore
      /* @vite-ignore */
      import('../../pages/EnhancedDashboard').catch(() => {});
    } else if (path === '/diary') {
      // @ts-ignore
      /* @vite-ignore */
      import('../../pages/EnhancedDiaryPage').catch(() => {});
    }
    
    prefetchedModules.add(path);
  } catch (error) {
    // Silent catch for any prefetch errors
  }
};

interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  isActive?: boolean;
  hasSubmenu?: boolean;
  prefetchOnHover?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  icon,
  label,
  to,
  isActive = false,
  hasSubmenu = false,
  prefetchOnHover = false,
}) => {
  const navigate = useNavigate();
  
  // Handle hover to prefetch module
  const handleMouseEnter = useCallback(() => {
    if (prefetchOnHover) {
      // For root paths like "/programs", we prefetch the module directly
      const modulePath = to === '/' ? '' : to;
      prefetchModule(modulePath);
    }
  }, [prefetchOnHover, to]);
  
  return (
    <button
      onClick={() => navigate(to)}
      onMouseEnter={handleMouseEnter}
      className={`flex items-center w-full px-4 py-3 rounded-lg text-base transition-colors focus-visible:ring-2 focus-visible:ring-accent-violet focus-visible:outline-none ${
        isActive ? 'bg-accent-mint/10 text-accent-mint' : 'text-text-secondary hover:text-text-primary hover:bg-background-card/50'
      }`}
    >
      <span className="w-5 h-5 mr-3">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {hasSubmenu && (
        <ChevronRight size={16} className="text-text-tertiary" />
      )}
    </button>
  );
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  return (
    <aside className="w-[250px] h-full bg-background-surface border-r border-border-light flex flex-col overflow-hidden">
      {/* Logo Header */}
      <div className="px-6 py-4 flex items-center">
        <div className="h-14">
          <img src="/Logo.svg" alt="Jarvis Fitness" className="h-full invert" />
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <SidebarLink 
          icon={<LayoutDashboard size={18} />} 
          label="Dashboard" 
          to="/dashboard"
          isActive={location.pathname === '/dashboard'} 
        />
        
        <SidebarLink 
          icon={<Dumbbell size={18} />} 
          label="Programs" 
          to="/programs"
          isActive={location.pathname === '/programs'}
          prefetchOnHover={true} // Enable prefetching on hover for Programs
        />
        
        <SidebarLink 
          icon={<BookOpen size={18} />} 
          label="Training Diary" 
          to="/diary"
          isActive={location.pathname === '/diary'}
        />
        
        <SidebarLink 
          icon={<BarChart2 size={18} />} 
          label="Progress" 
          to="/progress"
          isActive={location.pathname === '/progress'}
        />
        
        <SidebarLink 
          icon={<MessageCircle size={18} />} 
          label="Coach" 
          to="/"
          isActive={location.pathname === '/'}
        />
        
        <SidebarLink 
          icon={<Bell size={18} />} 
          label="Supabase Test" 
          to="/supabase-test"
          isActive={location.pathname === '/supabase-test'}
        />
      </nav>
      
      {/* Divider */}
      <div className="px-6 py-2">
        <div className="h-px bg-border-light"></div>
      </div>
      
      {/* Secondary Nav */}
      <nav className="px-3 py-4 space-y-1">
        <SidebarLink 
          icon={<ShoppingCart size={18} />} 
          label="Nutrition" 
          to="/nutrition"
          isActive={location.pathname === '/nutrition'}
        />
        
        <SidebarLink 
          icon={<Settings size={18} />} 
          label="Settings" 
          to="/settings"
          isActive={location.pathname === '/settings'}
        />
        
        <SidebarLink 
          icon={<HelpCircle size={18} />} 
          label="Help" 
          to="/help"
          isActive={location.pathname === '/help'}
        />
      </nav>
      
      {/* User Account */}
      <div className="mt-auto p-4 border-t border-border-light">
        <div className="flex items-center">
          <div className="relative">
            <img 
              src="https://ui-avatars.com/api/?name=Fitness+User&background=10a37f&color=fff&size=32" 
              alt="User avatar" 
              className="w-10 h-10 rounded-full border-2 border-accent-mint" 
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background-surface rounded-full"></span>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium">Fitness User</div>
            <div className="text-xs text-text-secondary">fitness@example.com</div>
          </div>
          <button className="ml-auto text-text-secondary hover:text-text-primary">
            <motion.div 
              whileHover={{ x: 2 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight size={16} />
            </motion.div>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
