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
import { BarChartData } from '../types';
import { Download } from 'lucide-react';

interface PRBarChartProps {
  data: BarChartData[];
  title: string;
}

const PRBarChart: React.FC<PRBarChartProps> = ({ data, title }) => {
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
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1A1B20" />
            <XAxis 
              dataKey="name" 
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
            <Bar 
              dataKey="value" 
              fill="#5533ff" 
              radius={[4, 4, 0, 0]}
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PRBarChart;
