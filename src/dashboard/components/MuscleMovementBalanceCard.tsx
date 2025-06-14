import React from 'react';
import { GitBranch } from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';

// Placeholder data for muscle/movement balance
// Represents relative volume for each category
const balanceData = [
  { category: 'H-Push', volume: 85, fullMark: 100 },
  { category: 'H-Pull', volume: 90, fullMark: 100 },
  { category: 'V-Push', volume: 70, fullMark: 100 },
  { category: 'V-Pull', volume: 75, fullMark: 100 },
  { category: 'Legs', volume: 95, fullMark: 100 },
  { category: 'Core', volume: 60, fullMark: 100 },
];

const MuscleMovementBalanceCard: React.FC = () => {
  return (
    <div className="bg-neutral-800/50 p-4 md:p-6 rounded-2xl shadow-lg flex flex-col h-full">
      {/* Card Header */}
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <GitBranch size={20} className="mr-2 text-accent-lime" />
          Muscle & Movement Balance
        </h2>
      </div>

      {/* Chart Area */}
      <div className="flex-grow h-64 md:h-auto">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={balanceData}>
            <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
            <PolarAngleAxis dataKey="category" tick={{ fill: '#a0a0a0', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Volume"
              dataKey="volume"
              stroke="#84cc16"
              fill="#84cc16"
              fillOpacity={0.6}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
              }}
              labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
              itemStyle={{ color: '#84cc16' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer with Insight */}
      <div className="mt-2 pt-2 border-t border-white/10 text-center">
        <p className="text-xs text-text-secondary">
          Insight: Your training is well-balanced, with a slight opportunity to increase Core and Vertical Push volume.
        </p>
      </div>
    </div>
  );
};

export default MuscleMovementBalanceCard;
