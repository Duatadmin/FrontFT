import React from 'react';
import MobileDashboardLayout from '../components/layout/MobileDashboardLayout';
import MobileMetricCard from '../dashboard/components/MobileMetricCard';
import GlassFrame from '../components/GlassFrame';
import MobileChartTabs from '../dashboard/components/MobileChartTabs';
import { useDashboardData } from '../dashboard/useDashboardData';
// TimeRange is not used by the current useDashboardData hook
// import { TimeRange } from '../dashboard/types'; 
import { Loader2 } from 'lucide-react';
import { MetricData } from '../dashboard/types'; // Assuming MetricData is in dashboard/types

const MobileDashboard: React.FC = () => {
  // The current useDashboardData hook does not take timeRange as an argument
  const { data, loading, error } = useDashboardData();

  if (loading) {
    return (
      <MobileDashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </MobileDashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <MobileDashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Failed to load dashboard data</h3>
            <p className="text-text-secondary">{error?.message || 'Unknown error occurred'}</p>
            {error?.affectedModule && <p className="text-xs text-text-tertiary mt-1">Affected: {error.affectedModule}</p>}
            {error?.missingData && <p className="text-xs text-text-tertiary">Missing: {error.missingData}</p>}
          </div>
        </div>
      </MobileDashboardLayout>
    );
  }

  // Prepare MetricData for MobileMetricCard components
  const volumeMetric: MetricData = {
    label: 'Total Volume (This Month)',
    value: data.monthlyStats.totalVolume,
    icon: 'dumbbell',
    changeType: 'increase', // Placeholder
    change: 0, // Placeholder
  };

  const workoutsMetric: MetricData = {
    label: 'Workouts (This Month)',
    value: data.monthlyStats.workoutCount,
    icon: 'zap', // Or a calendar/checklist icon
    changeType: 'increase', // Placeholder
    change: 0, // Placeholder
  };

  const streakMetric: MetricData = {
    label: 'Current Streak',
    value: data.monthlyStats.streakDays,
    icon: 'flame',
    changeType: 'increase', // Placeholder
    change: 0, // Placeholder
  };

  const completionMetric: MetricData = {
    label: 'Completion Rate',
    value: data.monthlyStats.completionRate * 100, // Assuming it's a 0-1 value
    icon: 'trophy',
    changeType: 'increase', // Placeholder
    change: 0, // Placeholder
  };

  return (
    <MobileDashboardLayout>
      <header className="mb-6 pt-6">
        <div className="flex justify-between items-center">
          <h1 className="font-display text-3xl font-bold text-white mb-6">
            Dashboard
          </h1>
        </div>
        <p className="text-text-secondary">An overview of your training analytics.</p>
      </header>
      <div className="space-y-4">
        {/* Metrics - Stacked Vertically */}
        <div className="space-y-3">
          <GlassFrame><MobileMetricCard data={volumeMetric} /></GlassFrame>
          <GlassFrame><MobileMetricCard data={workoutsMetric} /></GlassFrame>
          <GlassFrame><MobileMetricCard data={streakMetric} /></GlassFrame>
          <GlassFrame><MobileMetricCard data={completionMetric} /></GlassFrame>
        </div>

        {/* Charts - Tabbed Interface */}
        {/* Passing empty arrays as placeholders for chart data for now */}
        <GlassFrame>
          <div className="mt-2">
            <MobileChartTabs 
              volumeData={[]}
              prData={[]}
              activityData={[]}
            />
          </div>
        </GlassFrame>
      </div>
    </MobileDashboardLayout>
  );
};

export default MobileDashboard;
