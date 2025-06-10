import { User } from 'lucide-react';

const DashboardHeader = () => {
  return (
    <header className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      <div className="w-10 h-10 rounded-full bg-accent-lime/20 flex items-center justify-center">
        <User className="text-accent-lime" />
      </div>
    </header>
  );
};

export default DashboardHeader;
