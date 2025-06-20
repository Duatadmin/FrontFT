import { LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardButtonProps {
  className?: string;
}

export const DashboardButton: React.FC<DashboardButtonProps> = ({ className: passedClassName }) => {
  return (
    <Link
      to="/dashboard"
      role="button"
      aria-label="Open Dashboard"
      className={`relative flex items-center justify-center text-white rounded-full transition-all duration-300 hover:scale-105 ${passedClassName || ''}`.trim()}

    >
      <span className="relative flex items-center">
        <LayoutDashboard size={18} className="mr-2 text-white/50 flex-shrink-0" aria-hidden="true" />
        <span className="font-medium text-xs whitespace-nowrap text-white/50">Dashboard</span>
      </span>
    </Link>
  );
};
