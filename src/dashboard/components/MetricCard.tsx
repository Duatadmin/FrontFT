import React from 'react';
import { 
  Dumbbell, 
  Trophy, 
  Flame, 
  Zap,
  MoreVertical,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { MetricData } from '../types';

interface MetricCardProps {
  data: MetricData;
}

const MetricCard: React.FC<MetricCardProps> = ({ data }) => {
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
    <div className="bg-[#0F1014] border border-[#1A1B20] rounded-3xl p-5 h-[100px] flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          {getIcon()}
          <span className="ml-2 text-textSecondary">{data.label}</span>
        </div>
        <button className="text-textSecondary hover:text-text">
          <MoreVertical size={16} />
        </button>
      </div>
      
      <div className="flex items-end justify-between mt-2">
        <div className="text-2xl font-bold">{formatValue(data.value)}</div>
        
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
    </div>
  );
};

export default MetricCard;
