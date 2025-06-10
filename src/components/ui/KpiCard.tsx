import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Package,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Dumbbell, // Added
  Zap,      // Added
  Flame,    // Added
  Trophy    // Added
} from 'lucide-react';

export interface KpiCardProps {
  title: string;
  value: string | number;
  change: number;
  icon?: 'heart' | 'package' | 'creditcard' | 'dollar' | 'dumbbell' | 'zap' | 'flame' | 'trophy'; // Added new icons

  formatValue?: (value: string | number) => string;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  change,
  icon = 'dollar',
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
    const iconWrapperClasses = "bg-white/10 rounded-md p-1";
    const iconItselfClasses = "text-accent-lime";
    
    switch (icon) {
      case 'heart':
        return <div className={iconWrapperClasses}><Heart size={iconSize} className={iconItselfClasses} /></div>;
      case 'package':
        return <div className={iconWrapperClasses}><Package size={iconSize} className={iconItselfClasses} /></div>;
      case 'creditcard':
        return <div className={iconWrapperClasses}><CreditCard size={iconSize} className={iconItselfClasses} /></div>;
      case 'dollar':
        return <div className={iconWrapperClasses}><DollarSign size={iconSize} className={iconItselfClasses} /></div>;
      case 'dumbbell': // Added
        return <div className={iconWrapperClasses}><Dumbbell size={iconSize} className={iconItselfClasses} /></div>;
      case 'zap':      // Added
        return <div className={iconWrapperClasses}><Zap size={iconSize} className={iconItselfClasses} /></div>;
      case 'flame':    // Added
        return <div className={iconWrapperClasses}><Flame size={iconSize} className={iconItselfClasses} /></div>;
      case 'trophy':   // Added
        return <div className={iconWrapperClasses}><Trophy size={iconSize} className={iconItselfClasses} /></div>;
      default: // Default to dollar sign if icon is somehow undefined or not matched
        return <div className={iconWrapperClasses}><DollarSign size={iconSize} className={iconItselfClasses} /></div>;
    }
  };
  
  
  
  const isPositive = change > 0;
  
  return (
    <motion.div
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-5 transition-all duration-150"
      // onMouseEnter={() => setIsHovered(true)} // Removed as isHovered is not used
      // onMouseLeave={() => setIsHovered(false)} // Removed as isHovered is not used
      whileHover={{ 
        y: -4
      }}
      aria-live="polite"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center text-gray-300 text-sm">
          {renderIcon()}
          <span className="ml-2">{title}</span>
        </div>
        
        <div className={`flex items-center text-xs px-2 py-0.5 rounded-full ${isPositive ? 'bg-accent-lime/10 text-accent-lime' : 'bg-red-400/10 text-red-400'}`}>
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
          className="text-2xl font-bold text-white mb-1"
        >
          {displayValue}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default KpiCard;
