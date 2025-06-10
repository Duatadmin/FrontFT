import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Wallet, ArrowRightLeft, Settings, LucideIcon } from 'lucide-react';

interface NavItemType {
  href: string;
  icon: LucideIcon;
  label: string;
}

const navItems: NavItemType[] = [
  { href: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { href: '/wallet', icon: Wallet, label: 'Wallet' },
  { href: '/trade', icon: ArrowRightLeft, label: 'Trade' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

interface NavItemProps {
  item: NavItemType;
  isActive: boolean;
}

const NavItem = ({ item, isActive }: NavItemProps) => {
  return (
    <Link 
      to={item.href} 
      className="flex flex-col items-center justify-center w-1/4 h-full text-text-secondary hover:text-white transition-colors duration-300 group"
    >
      <div className={`relative p-2 rounded-full transition-all duration-300 ${isActive ? 'bg-primary/10' : 'group-hover:bg-white/10'}`}>
        <item.icon size={24} className={`${isActive ? 'text-primary' : ''}`} />
        {isActive && (
          <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-dark-bg"></span>
        )}
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
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm h-20 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl z-50 shadow-2xl">
      <div className="flex justify-around items-center h-full mx-auto">
        {navItems.map((item) => (
          <NavItem 
            key={item.label} 
            item={item} 
            isActive={location.pathname.startsWith(item.href)} 
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNavBar;
