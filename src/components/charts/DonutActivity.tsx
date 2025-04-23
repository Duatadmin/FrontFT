import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Download } from 'lucide-react';

export interface DonutActivityProps {
  title: string;
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  centerText: string;
  onExport?: () => void;
}

const DonutActivity: React.FC<DonutActivityProps> = ({
  title,
  data,
  centerText,
  onExport
}) => {
  // Calculate total for the center display
  const total = data.reduce((acc, item) => acc + item.value, 0);
  
  return (
    <div className="card p-5 h-full transition-all duration-150 hover-lift">
      <div className="card-header mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        
        <button 
          className="flex items-center text-text-secondary hover:text-text-primary press-effect"
          onClick={onExport}
          aria-label="Export data"
        >
          <span className="mr-2 text-sm">Export</span>
          <Download size={16} />
        </button>
      </div>
      
      <div className="relative h-[300px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#1C1D24', 
                border: '1px solid #8B5CF6',
                borderRadius: '12px',
                color: '#FFFFFF',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
              }}
              formatter={(value: number) => [`${value}%`, 'Percentage']}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center text */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold">{centerText}</div>
          <div className="text-xs text-text-secondary">Total clients</div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="space-y-2 mt-4">
        {data.map((item, index) => (
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
  );
};

export default DonutActivity;
