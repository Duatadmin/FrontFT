import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Dumbbell, BookOpen, MessageCircle, BarChart3, Library, LucideIcon } from 'lucide-react'; // Updated icons

interface NavItemType {
  href: string;
  icon: LucideIcon;
  label: string;
}

const navItems: NavItemType[] = [
  { href: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { href: '/programs', icon: Dumbbell, label: 'Programs' },
  { href: '/diary', icon: BookOpen, label: 'Diary' },
  { href: '/library', icon: Library, label: 'Library' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/', icon: MessageCircle, label: 'Coach' }, // Matches desktop Coach link
];

interface NavItemProps {
  item: NavItemType;
  isActive: boolean;
}

const NavItem = ({ item, isActive }: NavItemProps) => {
  return (
    <Link 
      to={item.href} 
      className="flex flex-col items-center justify-center flex-1 h-full text-text-secondary hover:text-white transition-colors duration-300 group"
    >
      <div className={`relative p-3 rounded-full transition-all duration-300 ${isActive ? 'bg-primary/20 backdrop-blur-sm shadow-lg shadow-primary/30 border border-primary/30' : 'group-hover:bg-white/10'}`}>
        <item.icon size={28} className={`${isActive ? 'text-primary' : ''}`} />
      </div>
      <span className={`text-xs mt-1.5 ${isActive ? 'text-primary font-semibold' : 'text-text-secondary'}`}>
        {item.label}
      </span>
    </Link>
  );
};

const BottomNavBar = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-md h-24 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl z-50 shadow-2xl">
      <div className="flex justify-around items-center h-full mx-auto">
        {navItems.map((item) => (
          <NavItem 
            key={item.label} 
            item={item} 
            isActive={item.href === '/' ? location.pathname === item.href : location.pathname.startsWith(item.href)} 
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNavBar;
