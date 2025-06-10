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
      className={`relative overflow-hidden group flex items-center bg-gradient-to-r from-[#F2A03D]/35 to-[#F24949]/35 backdrop-blur-md border border-white/20 text-[#EBCFD1] rounded-full py-1.5 px-3 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 hover:from-[#F2A03D]/80 hover:to-[#F24949]/80 ${className}`}

    >
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#FFA500_0%,#FFA500_28%,#D54444_56%,#D54444_77%,#5A3131_99%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <span className="relative flex items-center">
        <LayoutDashboard size={18} className="mr-2" aria-hidden="true" />
        <span className="font-medium text-opacity-50">Dashboard</span>
      </span>
    </Link>
  );
};
