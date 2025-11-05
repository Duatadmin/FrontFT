export interface MetricData {
  label: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon?: 'heart' | 'package' | 'creditcard' | 'dollar' | 'dumbbell' | 'zap' | 'flame' | 'trophy';
}

export interface ChartData {
  date: string;
  value: number;
}

export interface DonutChartData {
  name: string;
  value: number;
  color: string;
}

export interface BarChartData {
  name: string;
  value: number;
}

export type TimeRange = 'weekly' | 'monthly' | 'all-time';

export interface DashboardData {
  metrics: {
    volume: MetricData;
    prs: MetricData;
    streak: MetricData;
    calories: MetricData;
  };
  volumeChart: ChartData[];
  prTimeline: BarChartData[];
  activityBreakdown: DonutChartData[];
}
