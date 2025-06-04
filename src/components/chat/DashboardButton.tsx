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
      className={`flex items-center justify-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-100 px-3 py-2 rounded-lg hover:bg-slate-800 active:bg-slate-700 transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${className}`}
    >
      <LayoutDashboard size={18} aria-hidden="true" />
      <span>Dashboard</span>
    </Link>
  );
};
