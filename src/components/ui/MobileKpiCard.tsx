import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface MobileKpiCardProps {
  title: string;
  value: string | number;
  change: number;
  color?: 'green' | 'red' | 'purple' | 'blue';
}

const MobileKpiCard: React.FC<MobileKpiCardProps> = ({
  title,
  value,
  change,
  color = 'purple'
}) => {
  const isPositive = change > 0;
  
  // Get color classes based on color prop
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return { 
          text: 'text-accent-green', 
          bg: 'bg-accent-green/10'
        };
      case 'red':
        return { 
          text: 'text-red-500', 
          bg: 'bg-red-500/10'
        };
      case 'blue':
        return { 
          text: 'text-blue-500', 
          bg: 'bg-blue-500/10'
        };
      case 'purple':
      default:
        return { 
          text: 'text-accent-violet', 
          bg: 'bg-accent-violet/10'
        };
    }
  };
  
  return (
    <motion.div
      className="bg-background-card rounded-xl p-4 shadow-md min-h-[96px] flex flex-col justify-between"
      whileTap={{ scale: 0.98 }}
      layout
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm text-text-secondary font-medium">{title}</h3>
        <div className={`flex items-center text-xs px-2 py-1 rounded-full ${getColorClasses().bg} ${getColorClasses().text}`}>
          {isPositive ? (
            <>
              <TrendingUp size={12} className="mr-1" />
              {change}%
            </>
          ) : (
            <>
              <TrendingDown size={12} className="mr-1" />
              {Math.abs(change)}%
            </>
          )}
        </div>
      </div>
      
      <div className="text-xl font-bold">{value}</div>
    </motion.div>
  );
};

export default MobileKpiCard;
