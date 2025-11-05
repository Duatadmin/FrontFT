import React from 'react';
import { Goal } from '../../../store/useProgramStore';
import { Award, Dumbbell, Battery, Heart } from 'lucide-react';
import createLogger from '../../../utils/logger';

const logger = createLogger('GoalProgressCard');

interface GoalProgressCardProps {
  goal: Goal;
}

/**
 * GoalProgressCard Component
 * Visual representation of progress toward a goal with radial progress ring
 */
const GoalProgressCard: React.FC<GoalProgressCardProps> = ({ goal }) => {
  // Calculate progress percentage
  const progressPercent = Math.min(100, Math.round((goal.progress || 0) * 100));
  
  // Calculate days until deadline
  const daysLeft = Math.ceil(
    (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Get icon and color based on goal type
  const getGoalTypeIcon = () => {
    switch (goal.type) {
      case 'strength':
        return { icon: <Dumbbell className="h-5 w-5" />, color: 'rgb(124, 58, 237)' }; // violet-600
      case 'endurance':
        return { icon: <Battery className="h-5 w-5" />, color: 'rgb(16, 185, 129)' }; // emerald-500
      case 'body_composition':
        return { icon: <Heart className="h-5 w-5" />, color: 'rgb(239, 68, 68)' }; // red-500
      case 'benchmark':
        return { icon: <Award className="h-5 w-5" />, color: 'rgb(245, 158, 11)' }; // amber-500
      default:
        return { icon: <Award className="h-5 w-5" />, color: 'rgb(124, 58, 237)' }; // violet-600
    }
  };
  
  const { icon, color } = getGoalTypeIcon();
  
  // SVG parameters for progress ring
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;
  
  return (
    <div 
      className="bg-background-surface rounded-xl p-6 flex flex-col items-center"
      data-testid={`goal-progress-card-${goal.id}`}
    >
      <div className="flex items-center gap-2 self-start mb-2">
        <div 
          className="p-1 rounded-md"
          style={{ backgroundColor: `${color}20` }} // 20% opacity version of the color
        >
          <div style={{ color }}>{icon}</div>
        </div>
        <h3 className="font-medium text-text-primary text-sm">
          {goal.type.replace('_', ' ')}
        </h3>
      </div>
      
      {/* Progress ring */}
      <div className="relative my-2">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-background-hover"
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>
            {progressPercent}%
          </span>
          <span className="text-xs text-text-tertiary">to target</span>
        </div>
      </div>
      
      {/* Goal details */}
      <h4 className="text-center font-medium text-text-primary mt-2">
        {goal.metric}
      </h4>
      <p className="text-text-secondary text-sm text-center mt-1">
        Target: {goal.target_value} {goal.unit}
      </p>
      <p 
        className={`text-xs mt-3 px-2 py-1 rounded-full ${
          daysLeft < 7
            ? 'bg-red-500/10 text-red-500'
            : daysLeft < 14
              ? 'bg-amber-500/10 text-amber-500'
              : 'bg-background-hover text-text-secondary'
        }`}
      >
        {daysLeft <= 0 
          ? 'Overdue!' 
          : daysLeft === 1 
            ? '1 day left' 
            : `${daysLeft} days left`}
      </p>
    </div>
  );
};

export default GoalProgressCard;
