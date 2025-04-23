import React from 'react';
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
  BookOpen
} from 'lucide-react';

interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  isActive?: boolean;
  hasSubmenu?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  icon,
  label,
  to,
  isActive = false,
  hasSubmenu = false
}) => {
  const navigate = useNavigate();
  
  return (
    <button
      onClick={() => navigate(to)}
      className={`flex items-center w-full px-4 py-3 rounded-lg text-base transition-colors focus-visible:ring-2 focus-visible:ring-accent-violet focus-visible:outline-none ${
        isActive 
          ? 'bg-background-card text-accent-violet sidebar-active' 
          : 'text-text-secondary hover:text-text-primary hover:bg-background-card/50'
      }`}
      aria-current={isActive ? 'page' : undefined}
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
        <div className="bg-accent-violet bg-opacity-20 text-accent-violet p-2 rounded-lg mr-3">
          <BarChart2 size={18} />
        </div>
        <div className="font-bold text-lg">business space</div>
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
          icon={<BarChart2 size={18} />} 
          label="Reports" 
          to="/reports"
          isActive={location.pathname === '/reports'}
          hasSubmenu
        />
        
        <SidebarLink 
          icon={<FileText size={18} />} 
          label="Transactions" 
          to="/transactions"
          isActive={location.pathname === '/transactions'}
          hasSubmenu
        />
        
        <SidebarLink 
          icon={<ShoppingCart size={18} />} 
          label="Products" 
          to="/products"
          isActive={location.pathname === '/products'}
          hasSubmenu
        />
        
        <SidebarLink 
          icon={<BookOpen size={18} />} 
          label="Training Diary" 
          to="/diary"
          isActive={location.pathname === '/diary'}
        />
        
        <SidebarLink 
          icon={<Star size={18} />} 
          label="Features" 
          to="/features"
          isActive={location.pathname === '/features'}
          hasSubmenu
        />
        
        <SidebarLink 
          icon={<CheckSquare size={18} />} 
          label="Task board" 
          to="/tasks"
          isActive={location.pathname === '/tasks'}
          hasSubmenu
        />
        
        <SidebarLink 
          icon={<FolderKanban size={18} />} 
          label="Projects" 
          to="/projects"
          isActive={location.pathname === '/projects'}
          hasSubmenu
        />
        
        <SidebarLink 
          icon={<Settings size={18} />} 
          label="Integrations" 
          to="/integrations"
          isActive={location.pathname === '/integrations'}
          hasSubmenu
        />
      </nav>
      
      {/* Divider */}
      <div className="px-6 py-2">
        <div className="h-px bg-border-light"></div>
      </div>
      
      {/* Secondary Nav */}
      <nav className="px-3 py-4 space-y-1">
        <SidebarLink 
          icon={<Bell size={18} />} 
          label="Notifications" 
          to="/notifications"
          isActive={location.pathname === '/notifications'}
          hasSubmenu
        />
        
        <SidebarLink 
          icon={<Settings size={18} />} 
          label="Settings" 
          to="/settings"
          isActive={location.pathname === '/settings'}
          hasSubmenu
        />
        
        <SidebarLink 
          icon={<HelpCircle size={18} />} 
          label="FAQ" 
          to="/faq"
          isActive={location.pathname === '/faq'}
        />
      </nav>
      
      {/* User Account */}
      <div className="mt-auto p-4 border-t border-border-light">
        <div className="flex items-center">
          <div className="relative">
            <img 
              src="https://ui-avatars.com/api/?name=Max+Anderson&background=8B5CF6&color=fff&size=32" 
              alt="User avatar" 
              className="w-10 h-10 rounded-full border-2 border-accent-violet" 
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background-surface rounded-full"></span>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium">Max Anderson</div>
            <div className="text-xs text-text-secondary">anderson@gmail.com</div>
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
