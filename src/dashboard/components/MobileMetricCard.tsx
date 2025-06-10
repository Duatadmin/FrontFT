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
    const iconProps = { size: 22, className: "text-dark-bg" };
    switch (data.icon) {
      case 'dumbbell':
        return <Dumbbell {...iconProps} />;
      case 'trophy':
        return <Trophy {...iconProps} />;
      case 'flame':
        return <Flame {...iconProps} />;
      case 'zap':
        return <Zap {...iconProps} />;
      default:
        return <Dumbbell {...iconProps} />;
    }
  };

  const formatValue = (value: number): string => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  return (
    <div className="p-4 flex justify-between items-center min-h-[80px]">
      <div className="flex items-center">
        <div className="bg-primary w-12 h-12 flex items-center justify-center rounded-full mr-4">
          {getIcon()}
        </div>
        <div>
          <div className="text-text-secondary text-sm">{data.label}</div>
          <div className="text-xl font-bold text-text">{formatValue(data.value)}</div>
        </div>
      </div>
      
      <div className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${
        data.changeType === 'increase' ? 'bg-primary/20 text-primary' : 'bg-accent-red/20 text-accent-red'
      }`}>
        {data.changeType === 'increase' ? (
          <TrendingUp size={14} className="mr-1 stroke-current" />
        ) : (
          <TrendingDown size={14} className="mr-1 stroke-current" />
        )}
        {data.change}
      </div>
    </div>
  );
};

export default MobileMetricCard;
