import React, { useState, useEffect } from 'react';
import AnalyticsDashboardLayout from '../components/layout/AnalyticsDashboardLayout';
import KpiCard from '../components/ui/KpiCard';
import AreaVolume from '../components/charts/AreaVolume';
import DonutActivity from '../components/charts/DonutActivity';
import BarRevenue from '../components/charts/BarRevenue';
import { LineChart, BarChart2, Target, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data for the charts
const generateMockRevenueData = () => {
  return Array.from({ length: 12 }, (_, i) => {
    const month = new Date(0, i).toLocaleString('default', { month: 'short' });
    return {
      name: month,
      current: 10 + Math.random() * 40,
      subscribers: 5 + Math.random() * 30,
      new: 2 + Math.random() * 20
    };
  });
};

const generateMockVolumeData = () => {
  return Array.from({ length: 12 }, (_, i) => {
    const month = new Date(0, i).toLocaleString('default', { month: 'short' });
    return {
      date: month,
      value: 10 + Math.random() * 80
    };
  });
};

const taskTimelineData = Array.from({ length: 30 }, (_, i) => ({
  date: `Jan ${i + 1}`,
  value: 100 + Math.random() * 500
}));

const donutActivityData = [
  { name: 'Organic', value: 30, color: '#8B5CF6' },
  { name: 'Social', value: 50, color: '#10a37f' },
  { name: 'Direct', value: 20, color: '#E879F9' }
];

const topProductsData = [
  { name: 'Website', value: 40, color: '#8B5CF6' },
  { name: 'Dashboard', value: 35, color: '#10a37f' },
  { name: 'MobiApp', value: 25, color: '#E879F9' }
];

const EnhancedDashboard: React.FC = () => {
  const [revenueData, setRevenueData] = useState(generateMockRevenueData());
  const [volumeData, setVolumeData] = useState(generateMockVolumeData());
  
  // Simulate loading data
  useEffect(() => {
    // Refresh data every minute to simulate real-time updates
    const interval = setInterval(() => {
      setRevenueData(generateMockRevenueData());
      setVolumeData(generateMockVolumeData());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <AnalyticsDashboardLayout>
      <div className="space-y-6">
        {/* KPI Cards */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5,
            staggerChildren: 0.1
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <KpiCard 
              title="Save Products" 
              value="100.8K" 
              change={25.7} 
              icon="heart" 
              color="purple"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <KpiCard 
              title="Stock Products" 
              value="23.6K" 
              change={-2.5} 
              icon="package" 
              color="red"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <KpiCard 
              title="Sale Products" 
              value="180.9K" 
              change={34.8} 
              icon="creditcard" 
              color="green"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <KpiCard 
              title="Average Revenue" 
              value="8.2K" 
              change={16.8} 
              icon="dollar" 
              color="blue"
            />
          </motion.div>
        </motion.div>
        
        {/* Middle Row Charts */}
        <div className="grid grid-cols-12 gap-6">
          {/* Donut Chart */}
          <div className="col-span-12 md:col-span-4">
            <DonutActivity 
              title="New customer type" 
              data={donutActivityData} 
              centerText="150k"
              onExport={() => console.log("Exporting donut data")}
            />
          </div>
          
          {/* Bar Chart */}
          <div className="col-span-12 md:col-span-8">
            <BarRevenue 
              title="Revenue by all customer type" 
              data={revenueData}
              onDateRangeChange={() => console.log("Changing date range")}
            />
          </div>
        </div>
        
        {/* Bottom Row Charts */}
        <div className="grid grid-cols-12 gap-6">
          {/* Task Timeline */}
          <div className="col-span-12 md:col-span-7">
            <div className="card p-5 h-full transition-all duration-150 hover-lift">
              <div className="card-header mb-4">
                <h3 className="text-lg font-semibold">Completed tasks over time</h3>
                
                <button 
                  className="flex items-center text-text-secondary hover:text-text-primary text-sm bg-background-surface px-2 py-1 rounded-lg"
                >
                  <span className="mr-2">Jan 2024 - Dec 2024</span>
                  <LineChart size={16} />
                </button>
              </div>
              
              {/* Value display */}
              <div className="mb-4">
                <div className="text-2xl font-bold">388</div>
                <div className="flex items-center text-sm">
                  <span className="text-accent-green bg-accent-green/10 px-2 py-0.5 rounded-full flex items-center">
                    16.9% <LineChart size={14} className="ml-1" />
                  </span>
                </div>
              </div>
              
              <div className="h-[200px] relative">
                {/* Simplified line chart for tasks */}
                <svg width="100%" height="100%" className="overflow-visible">
                  <defs>
                    <linearGradient id="taskGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10a37f" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#10a37f" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Chart grid */}
                  <g className="grid">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line 
                        key={i} 
                        x1="0" 
                        y1={40 + i * 40} 
                        x2="100%" 
                        y2={40 + i * 40} 
                        stroke="#1A1B20" 
                        strokeDasharray="3,3" 
                      />
                    ))}
                    
                    {/* X-axis labels */}
                    {["Jan 1", "Jan 8", "Jan 15", "Jan 24", "Jan 31", "Feb 1"].map((label, i, arr) => (
                      <text 
                        key={i} 
                        x={`${i * (100 / (arr.length - 1))}%`} 
                        y="195" 
                        textAnchor="middle" 
                        fill="#A0A0B0" 
                        fontSize="12"
                      >
                        {label}
                      </text>
                    ))}
                  </g>
                  
                  {/* Line path */}
                  <path 
                    d="M0,180 C50,150 100,80 150,100 C200,120 250,60 300,40 C350,20 400,60 450,40 C500,20 550,80 600,100 C650,120 700,60 750,80" 
                    fill="none" 
                    stroke="#10a37f" 
                    strokeWidth="2"
                  />
                  
                  {/* Area under the line */}
                  <path 
                    d="M0,180 C50,150 100,80 150,100 C200,120 250,60 300,40 C350,20 400,60 450,40 C500,20 550,80 600,100 C650,120 700,60 750,80 L750,180 L0,180 Z" 
                    fill="url(#taskGradient)" 
                    opacity="0.5"
                  />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Top Products Chart */}
          <div className="col-span-12 md:col-span-5">
            <div className="card p-5 h-full transition-all duration-150 hover-lift">
              <div className="card-header mb-4">
                <h3 className="text-lg font-semibold">Top 3 products by spend</h3>
                
                <button 
                  className="flex items-center text-text-secondary hover:text-text-primary text-sm bg-background-surface px-2 py-1 rounded-lg"
                >
                  <span className="mr-2">Jan 2024 - Dec 2024</span>
                  <BarChart2 size={16} />
                </button>
              </div>
              
              <div className="relative h-[235px] flex items-center justify-center">
                {/* Simplified semi-circle chart */}
                <svg width="170" height="170" viewBox="0 0 170 170" className="transform -rotate-90">
                  <circle
                    cx="85"
                    cy="85"
                    r="70"
                    fill="transparent"
                    stroke="#1A1B20"
                    strokeWidth="12"
                  />
                  
                  {/* Website Segment */}
                  <circle
                    cx="85"
                    cy="85"
                    r="70"
                    fill="transparent"
                    stroke="#8B5CF6"
                    strokeWidth="12"
                    strokeDasharray="440"
                    strokeDashoffset="264" // 440 - (440 * 0.4)
                  />
                  
                  {/* Dashboard Segment */}
                  <circle
                    cx="85"
                    cy="85"
                    r="70"
                    fill="transparent"
                    stroke="#10a37f"
                    strokeWidth="12"
                    strokeDasharray="440"
                    strokeDashoffset="154" // 264 - (440 * 0.25)
                  />
                  
                  {/* MobiApp Segment */}
                  <circle
                    cx="85"
                    cy="85"
                    r="70"
                    fill="transparent"
                    stroke="#E879F9"
                    strokeWidth="12"
                    strokeDasharray="440"
                    strokeDashoffset="44" // 154 - (440 * 0.25)
                  />
                </svg>
                
                {/* Center text */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold">260.7K</div>
                  <div className="text-xs text-text-secondary">Total score</div>
                </div>
              </div>
              
              {/* Legend */}
              <div className="space-y-2 mt-4">
                {topProductsData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-sm mr-2" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnalyticsDashboardLayout>
  );
};

export default EnhancedDashboard;
