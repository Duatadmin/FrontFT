import { ArrowDown, ArrowUp } from 'lucide-react';

const ActionButtons = () => {
  return (
    <div className="grid grid-cols-2 gap-4 mt-6">
      <button className="bg-accent-lime text-dark-bg font-bold py-4 rounded-2xl flex items-center justify-center text-lg shadow-lg shadow-accent-lime/20 hover:scale-105 transition-transform duration-300">
        <ArrowDown size={22} className="mr-2" />
        Buy
      </button>
      <button className="bg-white/5 border border-white/10 text-white font-bold py-4 rounded-2xl flex items-center justify-center text-lg hover:bg-white/10 transition-colors duration-300">
        <ArrowUp size={22} className="mr-2" />
        Sell
      </button>
    </div>
  );
};

export default ActionButtons;
