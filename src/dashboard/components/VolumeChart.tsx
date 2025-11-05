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
import { ChartData } from '../types';
import { Download } from 'lucide-react';

interface VolumeChartProps {
  data: ChartData[];
  title: string;
}

const VolumeChart: React.FC<VolumeChartProps> = ({ data, title }) => {
  return (
    <div className="bg-[#0F1014] border border-[#1A1B20] rounded-3xl p-5 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button className="flex items-center text-sm text-textSecondary hover:text-text bg-[#1A1B20] px-3 py-1.5 rounded-lg">
          <Download size={16} className="mr-2" />
          Export
        </button>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10a37f" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10a37f" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A1B20" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#A9A9B3', fontSize: 12 }}
              axisLine={{ stroke: '#1A1B20' }}
              tickLine={{ stroke: '#1A1B20' }}
            />
            <YAxis 
              tick={{ fill: '#A9A9B3', fontSize: 12 }}
              axisLine={{ stroke: '#1A1B20' }}
              tickLine={{ stroke: '#1A1B20' }}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#1A1B20', 
                border: '1px solid #2A2B30',
                borderRadius: '8px',
                color: '#ECECF1'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#10a37f" 
              fillOpacity={1} 
              fill="url(#colorVolume)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VolumeChart;
