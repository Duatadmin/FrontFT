import React from 'react';
import MobileDashboardLayout from '../components/layout/MobileDashboardLayout';
import MobileKpiCard from '../components/ui/MobileKpiCard';
import MobileChartCarousel from '../components/charts/MobileChartCarousel';
import { useDashboardData } from '../dashboard/useDashboardData';
import { Loader2 } from 'lucide-react';

// Mock data for charts - can be moved to a separate file if needed
const revenueMockData = Array.from({ length: 12 }, (_, i) => {
  const month = new Date(0, i).toLocaleString('default', { month: 'short' });
  return {
    name: month,
    current: 10 + Math.random() * 40,
    subscribers: 5 + Math.random() * 30,
    new: 2 + Math.random() * 20
  };
});

const donutActivityData = [
  { name: 'Organic', value: 30, color: '#8B5CF6' },
  { name: 'Social', value: 50, color: '#10a37f' },
  { name: 'Direct', value: 20, color: '#E879F9' }
];

const EnhancedMobileDashboard: React.FC = () => {
  const { data, loading, error } = useDashboardData();

  return (
    <MobileDashboardLayout>
      <>
        <header className="pt-6">
          <div className="flex justify-between items-center">
            <h1 className="font-display text-3xl font-bold text-white">
              Dashboard
            </h1>
          </div>
          <p className="text-text-secondary mt-2">An overview of your training analytics.</p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-10 h-10 text-accent-lime animate-spin" />
          </div>
        ) : error || !data ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <h3 className="font-semibold text-white mb-2">Failed to load data</h3>
              <p className="text-gray-300 text-sm">{error?.message || 'No dashboard data could be found.'}</p>
            </div>
          </div>
        ) : (
          <>
            {/* KPI Cards Row */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Key Metrics</h2>
              <div className="grid grid-cols-2 gap-3">
                <MobileKpiCard 
                  title="Total Volume" 
                  value={data.monthlyStats.totalVolume.toLocaleString()} 
                  change={0} // Placeholder
                  color="purple"
                />
                <MobileKpiCard 
                  title="Workouts" 
                  value={data.monthlyStats.workoutCount.toString()} 
                  change={0} // Placeholder
                  color="green"
                />
                <MobileKpiCard 
                  title="Streak" 
                  value={`${data.monthlyStats.streakDays} days`}
                  change={0} // Placeholder
                  color="blue"
                />
                <MobileKpiCard 
                  title="Completion" 
                  value={`${(data.monthlyStats.completionRate * 100).toFixed(0)}%`}
                  change={0} // Placeholder
                  color="red"
                />
              </div>
            </div>
            
            {/* Chart Tabs for Mobile */}
            <div className="mb-6">
              <MobileChartCarousel
                titles={[
                  "Revenue by Customer Type",
                  "New Customer Type",
                  "Completed Tasks"
                ]}
              >
                {/* Placeholder Charts */}
                <div className="h-full flex flex-col justify-center items-center p-4">
                  <div className="text-xl font-bold">Chart 1</div>
                </div>
                <div className="h-full flex flex-col justify-center items-center p-4">
                  <div className="text-xl font-bold">Chart 2</div>
                </div>
                <div className="h-full flex flex-col justify-center items-center p-4">
                  <div className="text-xl font-bold">Chart 3</div>
                </div>
              </MobileChartCarousel>
            </div>
            
            {/* Activity Feed */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
              <div className="bg-background-card rounded-2xl p-4">
                <ul className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <li key={i} className="flex items-start">
                      <div className="w-8 h-8 bg-accent-violet/10 rounded-full flex items-center justify-center text-accent-violet flex-shrink-0 mr-3">
                        {i}
                      </div>
                      <div>
                        <p className="text-sm font-medium">New sale processed</p>
                        <p className="text-xs text-text-secondary">Product #{i}000 - $1,{i}99.00</p>
                        <p className="text-xs text-text-tertiary mt-1">2 hours ago</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </>
    </MobileDashboardLayout>
  );
};

export default EnhancedMobileDashboard;
