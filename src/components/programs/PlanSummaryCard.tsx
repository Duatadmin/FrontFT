import React from 'react';
import { PlanOverview } from '@/types/plan';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../ui/badge';
import { cleanSplitType } from '@/utils/TextOutputAdapter';

interface PlanSummaryCardProps {
  plan: PlanOverview;
}

const formatDate = (isoDateString: string | null): string => {
  if (!isoDateString) return '—';
  const date = new Date(isoDateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const ProgressRing: React.FC<{ percentage: number; size?: number; strokeWidth?: number }> = (
  { percentage, size = 60, strokeWidth = 6 }
) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-slate-200 dark:text-slate-700"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-sky-500"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute text-sm font-semibold text-slate-700 dark:text-slate-300">
        {`${Math.round(percentage)}%`}
      </span>
    </div>
  );
};

export const PlanSummaryCard: React.FC<PlanSummaryCardProps> = ({ plan }) => {
  const statusVariant = (): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (plan.status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="rounded-2xl p-4 hover:shadow-lg transition dark:bg-neutral-800 w-full sm:w-auto">
      <CardHeader className="p-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {`${cleanSplitType(plan.split_type)} — ${plan.goal_type}`}
          </CardTitle>
          <Badge variant={statusVariant()} className="capitalize">
            {plan.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-2 flex flex-col items-center space-y-3">
        <ProgressRing percentage={plan.completion_pct} />
        <div className="text-center w-full">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {`${plan.total_weeks} weeks · ${plan.total_sessions} sessions · ${plan.sessions_completed} done`}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            {`${formatDate(plan.week_start)} → ${formatDate(plan.next_session_date)}`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
