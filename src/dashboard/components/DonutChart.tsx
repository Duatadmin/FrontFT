import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { DonutChartData } from '../types';
import { Download } from 'lucide-react';

interface DonutChartProps {
  data: DonutChartData[];
  title: string;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, title }) => {
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
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#1A1B20', 
                border: '1px solid #2A2B30',
                borderRadius: '8px',
                color: '#ECECF1'
              }}
              formatter={(value: number) => [`${value}%`, 'Percentage']}
            />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right" 
              wrapperStyle={{ fontSize: '12px', color: '#A9A9B3' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DonutChart;
