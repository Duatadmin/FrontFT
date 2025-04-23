import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MobileDashboardLayout from '../components/layout/MobileDashboardLayout';
import MobileKpiCard from '../components/ui/MobileKpiCard';
import MobileChartCarousel from '../components/charts/MobileChartCarousel';

// Mock data for our mobile dashboard
const volumeChartMockData = Array.from({ length: 12 }, (_, i) => {
  const month = new Date(0, i).toLocaleString('default', { month: 'short' });
  return {
    date: month,
    value: 10 + Math.random() * 80
  };
});

const revenueMockData = Array.from({ length: 12 }, (_, i) => {
  const month = new Date(0, i).toLocaleString('default', { month: 'short' });
  return {
    name: month,
    current: 10 + Math.random() * 40,
    subscribers: 5 + Math.random() * 30,
    new: 2 + Math.random() * 20
  };
});

const donutActivityData = [
  { name: 'Organic', value: 30, color: '#8B5CF6' },
  { name: 'Social', value: 50, color: '#10a37f' },
  { name: 'Direct', value: 20, color: '#E879F9' }
];

const EnhancedMobileDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <MobileDashboardLayout title="Analytics Dashboard">
      {/* KPI Cards Row - Scrollable on smaller screens */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Key Metrics</h2>
        <div className="grid grid-cols-2 gap-3">
          <MobileKpiCard 
            title="Save Products" 
            value="100.8K" 
            change={25.7} 
            color="purple"
          />
          
          <MobileKpiCard 
            title="Stock Products" 
            value="23.6K" 
            change={-2.5} 
            color="red"
          />
          
          <MobileKpiCard 
            title="Sale Products" 
            value="180.9K" 
            change={34.8} 
            color="green"
          />
          
          <MobileKpiCard 
            title="Average Revenue" 
            value="8.2K" 
            change={16.8} 
            color="blue"
          />
        </div>
      </div>
      
      {/* Chart Tabs for Mobile */}
      <div className="mb-6">
        <MobileChartCarousel
          titles={[
            "Revenue by Customer Type",
            "New Customer Type",
            "Completed Tasks"
          ]}
        >
          {/* Chart 1: Revenue */}
          <div className="h-full flex flex-col justify-center items-center p-4">
            <div className="w-full mb-4">
              <div className="text-xl font-bold">$240.8K</div>
              <div className="text-sm text-accent-violet bg-accent-violet/10 px-2 py-0.5 rounded-full inline-flex items-center">
                14.8% ↑
              </div>
            </div>
            
            {/* Simplified Bar Chart for Mobile */}
            <div className="w-full h-[200px] mt-4">
              <div className="relative h-full flex items-end">
                {revenueMockData.slice(0, 6).map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-5 mx-auto relative">
                      {/* Stacked bar segments */}
                      <div 
                        className="absolute bottom-0 w-full bg-accent-violet rounded-t-md"
                        style={{ height: `${item.current}px` }}
                      ></div>
                      <div 
                        className="absolute bottom-0 w-full bg-accent-green rounded-none"
                        style={{ height: `${item.subscribers}px`, transform: `translateY(-${item.current}px)` }}
                      ></div>
                      <div 
                        className="absolute bottom-0 w-full bg-accent-pink rounded-none"
                        style={{ 
                          height: `${item.new}px`, 
                          transform: `translateY(-${item.current + item.subscribers}px)` 
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-text-secondary mt-2">{item.name.substring(0, 3)}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap justify-center mt-4 space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-accent-violet mr-1"></div>
                <span className="text-xs">Current</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-accent-green mr-1"></div>
                <span className="text-xs">Subscribers</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-accent-pink mr-1"></div>
                <span className="text-xs">New</span>
              </div>
            </div>
          </div>
          
          {/* Chart 2: Donut */}
          <div className="h-full flex flex-col justify-center items-center p-4">
            <div className="relative h-[200px] w-[200px] mx-auto">
              {/* Simplified donut chart */}
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#1A1B20"
                  strokeWidth="10"
                />
                
                {/* Donut segments */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={donutActivityData[0].color}
                  strokeWidth="10"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 * (1 - donutActivityData[0].value / 100)}
                />
                
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={donutActivityData[1].color}
                  strokeWidth="10"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 * (1 - (donutActivityData[0].value + donutActivityData[1].value) / 100)}
                />
                
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={donutActivityData[2].color}
                  strokeWidth="10"
                  strokeDasharray="251.2"
                  strokeDashoffset="0"
                />
              </svg>
              
              {/* Center text */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-2xl font-bold">150k</div>
                <div className="text-xs text-text-secondary">Customers</div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-3 gap-4 w-full mt-6">
              {donutActivityData.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-sm mr-1"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-xs">{item.name}</span>
                  </div>
                  <div className="text-sm font-medium mt-1">{item.value}%</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Chart 3: Tasks */}
          <div className="h-full flex flex-col justify-center items-center p-4">
            <div className="w-full mb-4">
              <div className="text-xl font-bold">388</div>
              <div className="text-sm text-accent-green bg-accent-green/10 px-2 py-0.5 rounded-full inline-flex items-center">
                16.9% ↑
              </div>
            </div>
            
            {/* Simplified task chart for mobile */}
            <div className="w-full h-[200px] mt-4 relative">
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
                </g>
                
                {/* Line path */}
                <path 
                  d="M0,180 C30,150 60,120 90,140 C120,160 150,60 180,40 C210,20 240,60 270,40 C300,20" 
                  fill="none" 
                  stroke="#10a37f" 
                  strokeWidth="2"
                />
                
                {/* Area under the line */}
                <path 
                  d="M0,180 C30,150 60,120 90,140 C120,160 150,60 180,40 C210,20 240,60 270,40 C300,20 L300,180 L0,180 Z" 
                  fill="url(#taskGradient)" 
                  opacity="0.5"
                />
              </svg>
              
              {/* X-axis labels */}
              <div className="flex justify-between text-xs text-text-secondary mt-2">
                <span>Jan 1</span>
                <span>Jan 8</span>
                <span>Jan 15</span>
                <span>Jan 24</span>
                <span>Jan 31</span>
              </div>
            </div>
          </div>
        </MobileChartCarousel>
      </div>
      
      {/* Activity Feed - Mobile Optimized */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
        <div className="bg-background-card rounded-2xl p-4">
          <ul className="space-y-4">
            {[1, 2, 3].map((i) => (
              <li key={i} className="flex items-start">
                <div className="w-8 h-8 bg-accent-violet/10 rounded-full flex items-center justify-center text-accent-violet flex-shrink-0 mr-3">
                  {i}
                </div>
                <div>
                  <p className="text-sm font-medium">New sale processed</p>
                  <p className="text-xs text-text-secondary">Product #{i}000 - $1,{i}99.00</p>
                  <p className="text-xs text-text-tertiary mt-1">2 hours ago</p>
                </div>
              </li>
            ))}
          </ul>
          
          <button className="w-full mt-4 py-2 border border-border-light rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors">
            View All Activity
          </button>
        </div>
      </div>
    </MobileDashboardLayout>
  );
};

export default EnhancedMobileDashboard;
