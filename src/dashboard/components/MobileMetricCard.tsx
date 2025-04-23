import React from 'react';
import { 
  Dumbbell, 
  Trophy, 
  Flame, 
  Zap,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { MetricData } from '../types';

interface MobileMetricCardProps {
  data: MetricData;
}

const MobileMetricCard: React.FC<MobileMetricCardProps> = ({ data }) => {
  const getIcon = () => {
    switch (data.icon) {
      case 'dumbbell':
        return <Dumbbell size={24} className="text-[#10a37f]" />;
      case 'trophy':
        return <Trophy size={24} className="text-[#5533ff]" />;
      case 'flame':
        return <Flame size={24} className="text-[#ff9933]" />;
      case 'zap':
        return <Zap size={24} className="text-[#3366ff]" />;
      default:
        return <Dumbbell size={24} className="text-[#10a37f]" />;
    }
  };

  const formatValue = (value: number): string => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  return (
    <div className="bg-[#0F1014] border border-[#1A1B20] rounded-2xl p-4 flex justify-between items-center min-h-[80px] touch-manipulation">
      <div className="flex items-center">
        <div className="bg-[#1A1B20] p-2 rounded-xl mr-3">
          {getIcon()}
        </div>
        <div>
          <div className="text-textSecondary text-sm">{data.label}</div>
          <div className="text-xl font-bold">{formatValue(data.value)}</div>
        </div>
      </div>
      
      <div className={`flex items-center text-sm px-2 py-1 rounded-full ${
        data.changeType === 'increase' ? 'text-[#10a37f] bg-[#10a37f]/10' : 
        data.changeType === 'decrease' ? 'text-[#ff4d4f] bg-[#ff4d4f]/10' : 
        'text-textSecondary bg-[#1A1B20]'
      }`}>
        {data.changeType === 'increase' ? (
          <TrendingUp size={14} className="mr-1" />
        ) : data.changeType === 'decrease' ? (
          <TrendingDown size={14} className="mr-1" />
        ) : null}
        {data.change}%
      </div>
    </div>
  );
};

export default MobileMetricCard;
