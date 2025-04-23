import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
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
    <div className="card p-5 h-full transition-all duration-150 hover-lift">
      <div className="card-header mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        
        <button 
          className="flex items-center text-text-secondary hover:text-text-primary text-sm bg-background-surface px-2 py-1 rounded-lg"
          onClick={onDateRangeChange}
        >
          <span className="mr-2">{dateRange}</span>
          <ChevronLeft size={16} className="transform rotate-180" />
        </button>
      </div>
      
      {/* Value display */}
      <div className="mb-6">
        <div className="text-2xl font-bold">$240.8K</div>
        <div className="flex items-center text-sm">
          <span className="text-accent-violet bg-accent-violet/10 px-2 py-0.5 rounded-full flex items-center">
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
              stroke="#1A1B20" 
            />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#A0A0B0', fontSize: 12 }}
              axisLine={{ stroke: '#1A1B20' }}
              tickLine={{ stroke: '#1A1B20' }}
            />
            <YAxis 
              tick={{ fill: '#A0A0B0', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}K`}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#1C1D24', 
                border: '1px solid #8B5CF6',
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
              fill="#8B5CF6" 
              radius={[8, 8, 0, 0] as [number, number, number, number]}
            />
            <Bar 
              dataKey="subscribers" 
              name="Subscribers"
              stackId="a" 
              fill="#10a37f" 
              // Simple radius without mapping
              radius={0}
            />
            <Bar 
              dataKey="new" 
              name="New customers"
              stackId="a" 
              fill="#E879F9" 
              // Only apply radius to the last segment
              radius={[0, 0, 8, 8] as [number, number, number, number]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="flex items-center space-x-4 mt-2">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-accent-violet mr-2"></div>
          <span className="text-xs text-text-secondary">Current clients</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-accent-green mr-2"></div>
          <span className="text-xs text-text-secondary">Subscribers</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-accent-pink mr-2"></div>
          <span className="text-xs text-text-secondary">New customers</span>
        </div>
      </div>
    </div>
  );
};

export default BarRevenue;
