import { LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardButtonProps {
  className?: string;
}

export const DashboardButton: React.FC<DashboardButtonProps> = ({ className }) => {
  return (
    <Link
      to="/dashboard"
      role="button"
      aria-label="Open Dashboard"
      className={ "relative flex items-center justify-center bg-white/5 text-white px-4 py-2 rounded-full backdrop-blur-md border border-white/10 transition-all duration-300 hover:scale-105"}

    >
      <span className="relative flex items-center">
        <LayoutDashboard size={18} className="mr-2 text-white/50 flex-shrink-0" aria-hidden="true" />
        <span className="font-medium text-xs whitespace-nowrap text-white/50">Dashboard</span>
      </span>
    </Link>
  );
};
