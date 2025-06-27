import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VolumeChart from './VolumeChart';
import PRBarChart from './PRBarChart';
import DonutChart from './DonutChart';
import { ChartData, BarChartData, DonutChartData } from '../types';

interface MobileChartTabsProps {
  volumeData: ChartData[];
  prData: BarChartData[];
  activityData: DonutChartData[];
}

const MobileChartTabs: React.FC<MobileChartTabsProps> = ({ 
  volumeData, 
  prData, 
  activityData 
}) => {
  const [activeTab, setActiveTab] = useState<'volume' | 'pr' | 'activity'>('volume');
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null);

  const handleSwipeStart = (e: React.TouchEvent) => {
    setSwipeStartX(e.touches[0].clientX);
  };

  const handleSwipeEnd = (e: React.TouchEvent) => {
    if (swipeStartX === null) return;
    
    const swipeEndX = e.changedTouches[0].clientX;
    const diff = swipeEndX - swipeStartX;
    
    // Minimum swipe distance (px)
    if (Math.abs(diff) < 50) return;
    
    if (diff > 0) {
      // Swipe right - go to previous tab
      if (activeTab === 'pr') setActiveTab('volume');
      else if (activeTab === 'activity') setActiveTab('pr');
    } else {
      // Swipe left - go to next tab
      if (activeTab === 'volume') setActiveTab('pr');
      else if (activeTab === 'pr') setActiveTab('activity');
    }
    
    setSwipeStartX(null);
  };

  return (
    <div className="overflow-hidden">

      
      {/* Chart Content with Swipe Gesture */}
      <div 
        className="h-[300px]"
        onTouchStart={handleSwipeStart}
        onTouchEnd={handleSwipeEnd}
      >
        <AnimatePresence mode="wait">
          {activeTab === 'volume' && (
            <motion.div
              key="volume"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <VolumeChart data={volumeData} title="Weekly Volume" />
            </motion.div>
          )}
          
          {activeTab === 'pr' && (
            <motion.div
              key="pr"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <PRBarChart data={prData} title="PR Timeline" />
            </motion.div>
          )}
          
          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <DonutChart data={activityData} title="Activity Breakdown" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Pagination Dots */}
      <div className="flex justify-center p-2 gap-2">
        {['volume', 'pr', 'activity'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`w-2 h-2 rounded-full ${
              activeTab === tab ? 'bg-[#10a37f]' : 'bg-[#1A1B20]'
            }`}
            aria-label={`Switch to ${tab} tab`}
          />
        ))}
      </div>
    </div>
  );
};

export default MobileChartTabs;
