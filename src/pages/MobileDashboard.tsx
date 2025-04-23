import React, { useState } from 'react';
import MobileDashboardLayout from '../components/layout/MobileDashboardLayout';
import MobileMetricCard from '../dashboard/components/MobileMetricCard';
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
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[48px] ${
                timeRange === range 
                  ? 'bg-[#10a37f] text-white' 
                  : 'bg-[#1A1B20] text-textSecondary hover:text-text'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>

        {/* Metrics - Stacked Vertically */}
        <div className="space-y-3">
          <MobileMetricCard data={data.metrics.volume} />
          <MobileMetricCard data={data.metrics.prs} />
          <MobileMetricCard data={data.metrics.streak} />
          <MobileMetricCard data={data.metrics.calories} />
        </div>

        {/* Charts - Tabbed Interface */}
        <div className="mt-6">
          <MobileChartTabs 
            volumeData={data.volumeChart}
            prData={data.prTimeline}
            activityData={data.activityBreakdown}
          />
        </div>
      </div>
    </MobileDashboardLayout>
  );
};

export default MobileDashboard;
