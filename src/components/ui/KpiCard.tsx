import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Package,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export interface KpiCardProps {
  title: string;
  value: string | number;
  change: number;
  icon?: 'heart' | 'package' | 'creditcard' | 'dollar';
  color?: 'green' | 'red' | 'purple' | 'blue';
  formatValue?: (value: string | number) => string;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  change,
  icon = 'dollar',
  color = 'purple',
  formatValue = (val) => val.toString()
}) => {
  const [displayValue, setDisplayValue] = useState('0');
  // const [isHovered, setIsHovered] = useState(false); // Removed as isHovered is not used
  
  // Animate value on mount
  useEffect(() => {
    setDisplayValue(formatValue(value));
  }, [value, formatValue]);
  
  // Get icon based on prop
  const renderIcon = () => {
    const iconSize = 14;
    const iconClasses = `text-${getColorClasses().text} bg-${getColorClasses().bg} rounded-md p-1`;
    
    switch (icon) {
      case 'heart':
        return <Heart size={iconSize} className={iconClasses} />;
      case 'package':
        return <Package size={iconSize} className={iconClasses} />;
      case 'creditcard':
        return <CreditCard size={iconSize} className={iconClasses} />;
      case 'dollar':
      default:
        return <DollarSign size={iconSize} className={iconClasses} />;
    }
  };
  
  // Get color classes based on color prop
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return { 
          text: 'accent-mint', 
          bg: 'accent-mint/10',
          trend: 'bg-accent-mint/10 text-accent-mint' 
        };
      case 'red':
        return { 
          text: 'red-500', 
          bg: 'red-500/10',
          trend: 'bg-red-500/10 text-red-500' 
        };
      case 'blue':
        return { 
          text: 'blue-500', 
          bg: 'blue-500/10',
          trend: 'bg-blue-500/10 text-blue-500' 
        };
      case 'purple':
      default:
        return { 
          text: 'accent-violet', 
          bg: 'accent-violet/10',
          trend: 'bg-accent-violet/10 text-accent-violet' 
        };
    }
  };
  
  const isPositive = change > 0;
  
  return (
    <motion.div
      className="card p-5 transition-all duration-150"
      // onMouseEnter={() => setIsHovered(true)} // Removed as isHovered is not used
      // onMouseLeave={() => setIsHovered(false)} // Removed as isHovered is not used
      whileHover={{ 
        y: -4
      }}
      aria-live="polite"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center text-text-secondary text-sm">
          {renderIcon()}
          <span className="ml-2">{title}</span>
        </div>
        
        <div className={`flex items-center text-xs px-2 py-1 rounded-full ${getColorClasses().trend}`}>
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
      
      <div className="flex items-end">
        <motion.div 
          key={displayValue}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold"
        >
          {displayValue}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default KpiCard;
