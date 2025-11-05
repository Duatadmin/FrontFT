import { Wallet, Calendar, ChevronUp } from 'lucide-react';

const WalletBalanceCard = () => {
  return (
    <div className="p-6 rounded-3xl relative overflow-hidden">
      {/* Top Section */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-text-secondary font-medium">Your Crypto Wallet</p>
        </div>
        <div className="flex items-center text-xs text-text-secondary bg-white/5 px-2 py-1 rounded-md">
          <Calendar size={14} className="mr-1.5" />
          <span>23/04-22/06</span>
        </div>
      </div>

      {/* Main Balance */}
      <div className="mb-6">
        <p className="text-sm text-accent-lime font-medium flex items-center">
          <Wallet size={14} className="mr-2" />
          ETHEREUM
        </p>
        <h2 className="text-4xl font-bold text-white tracking-tight">19,227,06</h2>
        <div className="flex items-center text-xs text-text-secondary mt-1">
          <span>Your spendings</span>
          <span className="ml-2 text-accent-lime flex items-center">
            <ChevronUp size={14} />
            +3,26
          </span>
        </div>
      </div>

      {/* Decorative Elements - Placeholder for now */}
      <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-accent-lime/10 rounded-full blur-2xl"></div>
      <div className="absolute right-0 bottom-12 w-24 h-24">
        {/* Placeholder for coin image */}
        <svg viewBox="0 0 100 100" className="opacity-10">
          <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="4" fill="none" />
          <text x="50" y="60" textAnchor="middle" fontSize="40" fill="currentColor">E</text>
        </svg>
      </div>
    </div>
  );
};

export default WalletBalanceCard;
