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
      className={`relative overflow-hidden group flex items-center bg-gradient-to-r from-[#10a37f] to-[#5533ff] text-white rounded-full py-2 px-3 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${className}`}
    >
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#5533ff] to-[#10a37f] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <span className="relative flex items-center">
        <LayoutDashboard size={18} className="mr-2" aria-hidden="true" />
        <span className="font-medium">Dashboard</span>
      </span>
    </Link>
  );
};
