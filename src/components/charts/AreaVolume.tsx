import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { Download, ChevronLeft } from 'lucide-react';

export interface AreaVolumeProps {
  title: string;
  data: Array<{
    date: string;
    value: number;
  }>;
  dateRange?: string;
  onExport?: () => void;
  onDateRangeChange?: () => void;
}

const AreaVolume: React.FC<AreaVolumeProps> = ({
  title,
  data,
  dateRange = 'Jan 2024 - Dec 2024',
  onExport,
  onDateRangeChange
}) => {
  return (
    <div className="card p-5 h-full transition-all duration-150 hover-lift">
      <div className="card-header mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        
        <div className="flex items-center space-x-3">
          <button 
            className="flex items-center text-text-secondary hover:text-text-primary text-sm bg-background-surface px-2 py-1 rounded-lg"
            onClick={onDateRangeChange}
          >
            <span className="mr-2">{dateRange}</span>
            <ChevronLeft size={16} className="transform rotate-180" />
          </button>
          
          <button 
            className="flex items-center text-text-secondary hover:text-text-primary"
            onClick={onExport}
            aria-label="Export data"
          >
            <Download size={16} />
          </button>
        </div>
      </div>
      
      {/* Value display */}
      <div className="mb-4">
        <div className="text-2xl font-bold">$240.8K</div>
        <div className="flex items-center text-sm">
          <span className="text-accent-violet bg-accent-violet/10 px-2 py-0.5 rounded-full flex items-center">
            14.8% <ChevronLeft size={14} className="transform rotate-180 ml-1" />
          </span>
        </div>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                <stop offset="50%" stopColor="#10a37f" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="#1A1B20" 
            />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#A0A0B0', fontSize: 12 }}
              axisLine={{ stroke: '#1A1B20' }}
              tickLine={{ stroke: '#1A1B20' }}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              tick={{ fill: '#A0A0B0', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}K`}
              padding={{ top: 20 }}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#1C1D24', 
                border: '1px solid #8B5CF6',
                borderRadius: '12px',
                color: '#FFFFFF',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
              }}
              itemStyle={{ color: '#FFFFFF' }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorVolume)"
              dot={false}
              activeDot={{ 
                r: 6, 
                stroke: '#8B5CF6', 
                strokeWidth: 2, 
                fill: '#1C1D24' 
              }}
            />
          </AreaChart>
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

export default AreaVolume;
