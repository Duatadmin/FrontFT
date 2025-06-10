import React, { useState } from 'react';
import MobileDashboardLayout from '../components/layout/MobileDashboardLayout';
import MobileMetricCard from '../dashboard/components/MobileMetricCard';
import GlassFrame from '../components/GlassFrame';
import MobileChartTabs from '../dashboard/components/MobileChartTabs';
import useDashboardData from '../dashboard/useDashboardData';
import { TimeRange } from '../dashboard/types';
import { Loader2 } from 'lucide-react';

const MobileDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');
  const { data, loading, error } = useDashboardData(timeRange);

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
            <p className="text-textSecondary">{error?.message || 'Unknown error occurred'}</p>
          </div>
        </div>
      </MobileDashboardLayout>
    );
  }

  return (
    <MobileDashboardLayout>
      <div className="space-y-4">
        {/* Time Range Selector */}
        <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
          {(['weekly', 'monthly', 'all-time'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-3 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap min-h-[48px] transform hover:scale-105 ${
                timeRange === range
                  ? 'bg-primary text-dark-bg shadow-lg'
                  : 'bg-white/5 backdrop-blur-sm border border-white/10 text-text-secondary hover:bg-white/10 hover:text-text'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>

        {/* Metrics - Stacked Vertically */}
        <div className="space-y-3">
          <GlassFrame><MobileMetricCard data={data.metrics.volume} /></GlassFrame>
          <GlassFrame><MobileMetricCard data={data.metrics.prs} /></GlassFrame>
          <GlassFrame><MobileMetricCard data={data.metrics.streak} /></GlassFrame>
          <GlassFrame><MobileMetricCard data={data.metrics.calories} /></GlassFrame>
        </div>

        {/* Charts - Tabbed Interface */}
        <GlassFrame>
          <div className="mt-2">
            <MobileChartTabs 
              volumeData={data.volumeChart}
              prData={data.prTimeline}
              activityData={data.activityBreakdown}
            />
          </div>
        </GlassFrame>
      </div>
    </MobileDashboardLayout>
  );
};

export default MobileDashboard;
