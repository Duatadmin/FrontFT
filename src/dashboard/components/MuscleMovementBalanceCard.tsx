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

// Helper to create a polygon path with rounded corners
const roundedPolygonPath = (points: { x: number; y: number }[], radius: number): string => {
  if (points.length < 3) return '';

  let path = '';
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const p3 = points[(i + 2) % points.length];

    const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

    const len1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const len2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

    const unitV1 = { x: v1.x / len1, y: v1.y / len1 };
    const unitV2 = { x: v2.x / len2, y: v2.y / len2 };

    const angle = Math.acos(unitV1.x * unitV2.x + unitV1.y * unitV2.y);
    const tan = Math.tan(angle / 2);
    const segment = Math.min(radius / tan, len1 / 2, len2 / 2);

    const p1c = { x: p2.x + segment * unitV1.x, y: p2.y + segment * unitV1.y };
    const p2c = { x: p2.x + segment * unitV2.x, y: p2.y + segment * unitV2.y };

    if (i === 0) path += `M ${p1c.x},${p1c.y}`;
    else path += ` L ${p1c.x},${p1c.y}`;

    path += ` Q ${p2.x},${p2.y} ${p2c.x},${p2c.y}`;
  }
  path += ' Z';
  return path;
};

// Custom shape component for the Radar
interface CustomRadarShapeProps {
  fill?: string;
  stroke?: string;
  fillOpacity?: number;
  points?: { x: number; y: number }[];
}

const CustomRadarShape = (props: CustomRadarShapeProps) => {
  const { fill, stroke, fillOpacity, points } = props;
  if (!points) return null;

  const path = roundedPolygonPath(points, 8); // 8px corner radius

  return <path d={path} fill={fill} stroke={stroke} fillOpacity={fillOpacity as number} strokeWidth={2} />;
};

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
            <PolarGrid stroke="rgba(255, 255, 255, 0.2)" gridType="polygon" />
            <PolarAngleAxis dataKey="category" tick={{ fill: '#a0a0a0', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Volume"
              dataKey="volume"
              stroke="#84cc16"
              fill="#84cc16"
              fillOpacity={0.6}
              shape={<CustomRadarShape />}
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
