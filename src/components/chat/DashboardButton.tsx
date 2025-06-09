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
      className={`relative overflow-hidden group flex items-center bg-[linear-gradient(to_right,#F28E3F_0%,#F28E3F_28%,#D54444_56%,#D54444_77%,#5A3131_99%)] text-white rounded-full py-2 px-3 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${className}`}
    >
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#FFA500_0%,#FFA500_28%,#D54444_56%,#D54444_77%,#5A3131_99%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <span className="relative flex items-center">
        <LayoutDashboard size={18} className="mr-2" aria-hidden="true" />
        <span className="font-medium">Dashboard</span>
      </span>
    </Link>
  );
};
