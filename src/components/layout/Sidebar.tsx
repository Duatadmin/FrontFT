import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart2,
  // FileText, // Unused
  ShoppingCart,
  // Star, // Unused
  // CheckSquare, // Unused
  // FolderKanban, // Unused
  Settings,
  MessageCircle,
  HelpCircle,
  ChevronRight,
  Bell,
  BookOpen,
  Dumbbell,
  LogOut,
  LogIn
} from 'lucide-react';
import { supabase } from '../../lib/supabase'; // Corrected path
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

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
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUserSession = async () => {
      setLoadingUser(true);
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoadingUser(false);
    };

    fetchUserSession();

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
      setLoadingUser(false);
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
      // TODO: Show toast notification for error
    } else {
      setUser(null); // Clear user state immediately
      navigate('/login'); // Navigate to login page
    }
  };

  const getAvatarUrl = () => {
    if (user?.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url;
    }
    const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10a37f&color=fff&size=32`;
  };
  
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
        {loadingUser ? (
          <div className="flex items-center justify-center h-[56px]">
            <p className="text-sm text-text-secondary animate-pulse">Loading user...</p>
          </div>
        ) : user ? (
          <div className="flex items-center">
            <div className="relative">
              <img 
                src={getAvatarUrl()} 
                alt="User avatar" 
                className="w-10 h-10 rounded-full border-2 border-accent-mint" 
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background-surface rounded-full"></span>
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
              <div className="text-sm font-medium text-text-primary truncate" title={user.user_metadata?.full_name || user.email}>
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </div>
              <div className="text-xs text-text-secondary truncate" title={user.email}>{user.email}</div>
            </div>
            <button 
              onClick={handleLogout}
              className="ml-2 p-2 text-text-secondary hover:text-accent-red rounded-md focus-visible:ring-2 focus-visible:ring-accent-red focus-visible:outline-none transition-colors"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <SidebarLink 
            icon={<LogIn size={18} />} 
            label="Login / Sign Up" 
            to="/login"
            isActive={location.pathname === '/login'}
          />
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
