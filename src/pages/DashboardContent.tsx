import React, { useState, useEffect } from 'react';
import { useDashboardData } from '../dashboard/useDashboardData';
import type { MetricData } from '../dashboard/types';
import { Loader2, BarChart2 } from 'lucide-react';
import { useAuthGuard } from '../hooks/useAuthGuard';
import KpiCard from '../components/ui/KpiCard';
import DonutActivity from '../components/charts/DonutActivity';
import BarRevenue from '../components/charts/BarRevenue';
import { motion } from 'framer-motion';

// Mock data for the charts (identical to the desktop page)
const generateMockRevenueData = () => {
  return Array.from({ length: 12 }, (_, i) => {
    const month = new Date(0, i).toLocaleString('default', { month: 'short' });
    return {
      name: month,
      current: 10 + Math.random() * 40,
      subscribers: 5 + Math.random() * 30,
      new: 2 + Math.random() * 20,
    };
  });
};

const donutActivityData = [
  { name: 'Organic', value: 30, color: '#8B5CF6' },
  { name: 'Social', value: 50, color: '#10a37f' },
  { name: 'Direct', value: 20, color: '#E879F9' },
];

const topProductsData = [
  { name: 'Website', value: 40, color: '#AFFF00' }, // lime accent
  { name: 'Dashboard', value: 35, color: '#84CC16' }, // lime-600
  { name: 'MobiApp', value: 25, color: '#A3E635' }, // lime-400
];

const DashboardContent: React.FC = () => {
  useAuthGuard();
  const { data, loading, error } = useDashboardData();
  const [revenueData, setRevenueData] = useState(generateMockRevenueData());

  useEffect(() => {
    const interval = setInterval(() => {
      setRevenueData(generateMockRevenueData());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const volumeMetric: MetricData | null = data?.monthlyStats
    ? {
        label: 'Total Volume (This Month)',
        value: data.monthlyStats.totalVolume,
        icon: 'dumbbell',
        changeType: 'neutral',
        change: 0,
      }
    : null;

  const workoutsMetric: MetricData | null = data?.monthlyStats
    ? {
        label: 'Workouts (This Month)',
        value: data.monthlyStats.workoutCount,
        icon: 'zap',
        changeType: 'neutral',
        change: 0,
      }
    : null;

  const streakMetric: MetricData | null = data?.monthlyStats
    ? {
        label: 'Current Streak',
        value: data.monthlyStats.streakDays,
        icon: 'flame',
        changeType: 'neutral',
        change: 0,
      }
    : null;

  const completionMetric: MetricData | null = data?.monthlyStats
    ? {
        label: 'Completion Rate',
        value: parseFloat((data.monthlyStats.completionRate * 100).toFixed(1)),
        icon: 'trophy',
        changeType: 'neutral',
        change: 0,
      }
    : null;

  return (
    <div className="pt-6 space-y-6">
      <header className="px-4">
        <h1 className="font-display text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-text-secondary text-sm">
          An overview of your training analytics.
        </p>
      </header>
      {loading ? (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="w-12 h-12 text-accent-lime animate-spin" />
        </div>
      ) : error && !data ? (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center p-8 bg-white/5 backdrop-blur-md rounded-lg shadow-xl">
            <h3 className="text-2xl font-semibold text-white mb-3">Failed to load dashboard data</h3>
            <p className="text-gray-300">
              {error?.message || 'An unknown error occurred.'}
            </p>
            {error?.affectedModule && (
              <p className="text-xs text-gray-400 mt-2">
                Affected: {error.affectedModule}
              </p>
            )}
            {error?.missingData && (
              <p className="text-xs text-gray-400">Missing: {error.missingData}</p>
            )}
          </div>
        </div>
      ) : !data || !volumeMetric || !workoutsMetric || !streakMetric || !completionMetric ? (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center p-8 bg-white/5 backdrop-blur-md rounded-lg shadow-xl">
            <h3 className="text-2xl font-semibold text-white mb-3">No data available</h3>
            <p className="text-gray-300">
              Dashboard data could not be loaded, and no mock data is available.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 px-4 pb-6">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
          >
            {[volumeMetric, workoutsMetric, streakMetric, completionMetric].map(
              (metric, idx) => (
                metric && (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                  >
                    <KpiCard
                      title={metric.label}
                      value={
                        metric.label === 'Completion Rate'
                          ? metric.value.toString() + '%'
                          : metric.label === 'Current Streak'
                          ? metric.value.toString() + ' days'
                          : metric.value.toLocaleString()
                      }
                      change={metric.change}
                      icon={metric.icon}
                    />
                  </motion.div>
                )
              )
            )}
          </motion.div>

          <div className="space-y-6">
            {/* Donut & Revenue charts */}
            <div className="space-y-6">
              <DonutActivity
                title="New customer type"
                data={donutActivityData}
                centerText="150k"
                onExport={() => console.log('Exporting donut data')}
              />
              <BarRevenue
                title="Revenue by all customer type"
                data={revenueData}
                onDateRangeChange={() => console.log('Changing date range')}
              />
            </div>

            {/* Top products chart */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-5 transition-all duration-150">
              <div className="card-header mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Top 3 products by spend
                </h3>
                <button className="flex items-center text-gray-300 hover:text-white text-sm bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg">
                  <span className="mr-2">Jan 2024 - Dec 2024</span>
                  <BarChart2 size={16} />
                </button>
              </div>
              <div className="relative h-[235px] flex items-center justify-center">
                {/* Replace with a simple donut */}
                <svg
                  width="170"
                  height="170"
                  viewBox="0 0 170 170"
                  className="transform -rotate-90"
                >
                  <circle
                    cx="85"
                    cy="85"
                    r="70"
                    fill="transparent"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="12"
                  />
                  <circle
                    cx="85"
                    cy="85"
                    r="70"
                    fill="transparent"
                    stroke="#AFFF00"
                    strokeWidth="12"
                    strokeDasharray="440"
                    strokeDashoffset="264"
                  />
                  <circle
                    cx="85"
                    cy="85"
                    r="70"
                    fill="transparent"
                    stroke="#84CC16"
                    strokeWidth="12"
                    strokeDasharray="440"
                    strokeDashoffset="154"
                  />
                  <circle
                    cx="85"
                    cy="85"
                    r="70"
                    fill="transparent"
                    stroke="#A3E635"
                    strokeWidth="12"
                    strokeDasharray="440"
                    strokeDashoffset="44"
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-white">260.7K</div>
                  <div className="text-xs text-gray-400">Total score</div>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                {topProductsData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-sm mr-2"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-300">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-white">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardContent;
