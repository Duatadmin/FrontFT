import { ChevronRight } from 'lucide-react';

// Mock data for assets
const assets = [
  { symbol: 'ADA', name: 'Cardano', iconColor: 'bg-blue-500' },
  { symbol: 'BNB', name: 'Binance', iconColor: 'bg-yellow-500' },
  { symbol: 'ETH', name: 'Ethereum', iconColor: 'bg-gray-400' },
  { symbol: 'BTC', name: 'Bitcoin', iconColor: 'bg-orange-500' },
  { symbol: 'XRP', name: 'Ripple', iconColor: 'bg-blue-300' },
];

const AssetCarousel = () => {
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Assets</h3>
        <button className="text-accent-lime text-sm font-medium flex items-center">
          See All <ChevronRight size={16} />
        </button>
      </div>
      <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 hide-scrollbar">
        {assets.map((asset, index) => (
          <div key={index} className="flex-shrink-0 w-32">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 transition-colors duration-300">
              <div className={`w-12 h-12 ${asset.iconColor} rounded-full mx-auto mb-3 flex items-center justify-center font-bold text-xl`}>
                {asset.symbol.charAt(0)}
              </div>
              <p className="font-bold text-white">{asset.symbol}</p>
              <p className="text-xs text-text-secondary">{asset.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetCarousel;
