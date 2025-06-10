import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { ChevronLeft } from 'lucide-react';

export interface BarRevenueProps {
  title: string;
  data: Array<{
    name: string;
    current: number;
    subscribers: number;
    new: number;
  }>;
  dateRange?: string;
  onDateRangeChange?: () => void;
}

const BarRevenue: React.FC<BarRevenueProps> = ({
  title,
  data,
  dateRange = 'Jan 2024 - Dec 2024',
  onDateRangeChange
}) => {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-5 h-full transition-all duration-150">
      <div className="card-header mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        
        <button 
          className="flex items-center text-gray-300 hover:text-white text-sm bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg"
          onClick={onDateRangeChange}
        >
          <span className="mr-2">{dateRange}</span>
          <ChevronLeft size={16} className="transform rotate-180" />
        </button>
      </div>
      
      {/* Value display */}
      <div className="mb-6">
        <div className="text-2xl font-bold text-white">$240.8K</div>
        <div className="flex items-center text-sm">
          <span className="text-accent-lime bg-accent-lime/10 px-2 py-0.5 rounded-full flex items-center">
            14.8% <ChevronLeft size={14} className="transform rotate-180 ml-1" />
          </span>
        </div>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
            barGap={8}
            barSize={16}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false}
              stroke="rgba(255, 255, 255, 0.1)" 
            />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
            />
            <YAxis 
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}K`}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: '#FFFFFF',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
            />
            <Bar 
              dataKey="current" 
              name="Current clients"
              stackId="a" 
              fill="#AFFF00" 
              radius={[8, 8, 0, 0] as [number, number, number, number]}
            />
            <Bar 
              dataKey="subscribers" 
              name="Subscribers"
              stackId="a" 
              fill="#84CC16" 
              // Simple radius without mapping
              radius={0}
            />
            <Bar 
              dataKey="new" 
              name="New customers"
              stackId="a" 
              fill="#A3E635" 
              // Only apply radius to the last segment
              radius={[0, 0, 8, 8] as [number, number, number, number]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="flex items-center space-x-4 mt-2">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-[#AFFF00] mr-2"></div>
          <span className="text-xs text-gray-400">Current clients</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-lime-600 mr-2"></div>
          <span className="text-xs text-gray-400">Subscribers</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-lime-400 mr-2"></div>
          <span className="text-xs text-gray-400">New customers</span>
        </div>
      </div>
    </div>
  );
};

export default BarRevenue;
