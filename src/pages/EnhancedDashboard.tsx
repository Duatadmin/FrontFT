import React, { useState, useEffect } from 'react';
import { useDashboardData } from '../dashboard/useDashboardData'; // Added
import type { MetricData } from '../dashboard/types'; // Added
import { Loader2 } from 'lucide-react'; // Added
import { useAuthGuard } from '../hooks/useAuthGuard';
import AnalyticsDashboardLayout from '../components/layout/AnalyticsDashboardLayout';
import KpiCard from '../components/ui/KpiCard';
import DonutActivity from '../components/charts/DonutActivity';
import BarRevenue from '../components/charts/BarRevenue';
import { BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data for the charts
const generateMockRevenueData = () => {
  return Array.from({ length: 12 }, (_, i) => {
    const month = new Date(0, i).toLocaleString('default', { month: 'short' });
    return {
      name: month,
      current: 10 + Math.random() * 40,
      subscribers: 5 + Math.random() * 30,
      new: 2 + Math.random() * 20
    };
  });
};

const donutActivityData = [
  { name: 'Organic', value: 30, color: '#8B5CF6' },
  { name: 'Social', value: 50, color: '#10a37f' },
  { name: 'Direct', value: 20, color: '#E879F9' }
];

const topProductsData = [
  { name: 'Website', value: 40, color: '#AFFF00' }, // lime accent
  { name: 'Dashboard', value: 35, color: '#84CC16' }, // lime-600
  { name: 'MobiApp', value: 25, color: '#A3E635' } // lime-400
];

const EnhancedDashboard: React.FC = () => {
  useAuthGuard();
  const { data, loading, error } = useDashboardData();
  const [revenueData, setRevenueData] = useState(generateMockRevenueData());

  useEffect(() => {
    const interval = setInterval(() => {
      setRevenueData(generateMockRevenueData());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const volumeMetric: MetricData | null = data?.monthlyStats ? {
    label: 'Total Volume (This Month)',
    value: data.monthlyStats.totalVolume,
    icon: 'dumbbell',
    changeType: 'neutral',
    change: 0,
  } : null;

  const workoutsMetric: MetricData | null = data?.monthlyStats ? {
    label: 'Workouts (This Month)',
    value: data.monthlyStats.workoutCount,
    icon: 'zap',
    changeType: 'neutral',
    change: 0,
  } : null;

  const streakMetric: MetricData | null = data?.monthlyStats ? {
    label: 'Current Streak',
    value: data.monthlyStats.streakDays,
    icon: 'flame',
    changeType: 'neutral',
    change: 0,
  } : null;

  const completionMetric: MetricData | null = data?.monthlyStats ? {
    label: 'Completion Rate',
    value: parseFloat((data.monthlyStats.completionRate * 100).toFixed(1)),
    icon: 'trophy',
    changeType: 'neutral',
    change: 0,
  } : null;

  return (
    <AnalyticsDashboardLayout>
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="font-display text-3xl font-bold text-white mb-6">
            Dashboard
          </h1>
        </div>
        <p className="text-text-secondary">An overview of your training analytics.</p>
      </header>
      {loading ? (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="w-12 h-12 text-accent-lime animate-spin" />
        </div>
      ) : error && !data ? (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center p-8 bg-white/5 backdrop-blur-md rounded-lg shadow-xl">
            <h3 className="text-2xl font-semibold text-white mb-3">Failed to load dashboard data</h3>
            <p className="text-gray-300">{error?.message || 'An unknown error occurred.'}</p>
            {error?.affectedModule && <p className="text-xs text-gray-400 mt-2">Affected: {error.affectedModule}</p>}
            {error?.missingData && <p className="text-xs text-gray-400">Missing: {error.missingData}</p>}
          </div>
        </div>
      ) : !data || !volumeMetric || !workoutsMetric || !streakMetric || !completionMetric ? (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center p-8 bg-white/5 backdrop-blur-md rounded-lg shadow-xl">
            <h3 className="text-2xl font-semibold text-white mb-3">No data available</h3>
            <p className="text-gray-300">Dashboard data could not be loaded, and no mock data is available.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              staggerChildren: 0.1
            }}
          >
            <motion.div
              className="h-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <KpiCard
                title={volumeMetric.label}
                value={volumeMetric.value.toLocaleString()}
                change={volumeMetric.change}
                icon={volumeMetric.icon}
              />
            </motion.div>
            <motion.div
              className="h-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <KpiCard
                title={workoutsMetric.label}
                value={workoutsMetric.value.toString()}
                change={workoutsMetric.change}
                icon={workoutsMetric.icon}
              />
            </motion.div>
            <motion.div
              className="h-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <KpiCard
                title={streakMetric.label}
                value={streakMetric.value.toString() + ' days'}
                change={streakMetric.change}
                icon={streakMetric.icon}
              />
            </motion.div>
            <motion.div
              className="h-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <KpiCard
                title={completionMetric.label}
                value={completionMetric.value.toString() + '%'}
                change={completionMetric.change}
                icon={completionMetric.icon}
              />
            </motion.div>
          </motion.div>
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-4">
              <DonutActivity
                title="New customer type"
                data={donutActivityData}
                centerText="150k"
                onExport={() => console.log("Exporting donut data")}
              />
            </div>
            <div className="col-span-12 md:col-span-8">
              <BarRevenue
                title="Revenue by all customer type"
                data={revenueData}
                onDateRangeChange={() => console.log("Changing date range")}
              />
            </div>
          </div>
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-7">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-5 h-full transition-all duration-150">
                <div className="card-header mb-4">
                  <h3 className="text-lg font-semibold text-white">Completed tasks over time</h3>
                  <button
                    className="flex items-center text-gray-300 hover:text-white text-sm bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg"
                  >
                    <span className="mr-2">Jan 2024 - Dec 2024</span>
                  </button>
                </div>
                <div className="mb-4">
                  <div className="text-2xl font-bold text-white">388</div>
                  <div className="flex items-center text-sm">
                    <span className="text-accent-lime bg-accent-lime/10 px-2 py-0.5 rounded-full flex items-center">
                      16.9%
                    </span>
                  </div>
                </div>
                <div className="h-[200px] relative">
                  <svg width="100%" height="100%" className="overflow-visible">
                    <defs>
                      <linearGradient id="taskGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#AFFF00" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#AFFF00" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <g className="grid">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <line
                          key={i}
                          x1="0"
                          y1={40 + i * 40}
                          x2="100%"
                          y2={40 + i * 40}
                          stroke="rgba(255, 255, 255, 0.1)"
                          strokeDasharray="3,3"
                        />
                      ))}
                      {["Jan 1", "Jan 8", "Jan 15", "Jan 24", "Jan 31", "Feb 1"].map((label, i, arr) => (
                        <text
                          key={i}
                          x={`${i * (100 / (arr.length - 1))}%`}
                          y="195"
                          textAnchor="middle"
                          fill="rgba(255, 255, 255, 0.5)"
                          fontSize="12"
                        >
                          {label}
                        </text>
                      ))}
                    </g>
                    <path
                      d="M0,180 C50,150 100,80 150,100 C200,120 250,60 300,40 C350,20 400,60 450,40 C500,20 550,80 600,100 C650,120 700,60 750,80"
                      fill="none"
                      stroke="#AFFF00"
                      strokeWidth="2"
                    />
                    <path
                      d="M0,180 C50,150 100,80 150,100 C200,120 250,60 300,40 C350,20 400,60 450,40 C500,20 550,80 600,100 C650,120 700,60 750,80 L750,180 L0,180 Z"
                      fill="url(#taskGradient)"
                      opacity="0.5"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-5">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-5 h-full transition-all duration-150">
                <div className="card-header mb-4">
                  <h3 className="text-lg font-semibold text-white">Top 3 products by spend</h3>
                  <button
                    className="flex items-center text-gray-300 hover:text-white text-sm bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg"
                  >
                    <span className="mr-2">Jan 2024 - Dec 2024</span>
                    <BarChart2 size={16} />
                  </button>
                </div>
                <div className="relative h-[235px] flex items-center justify-center">
                  <svg width="170" height="170" viewBox="0 0 170 170" className="transform -rotate-90">
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
        </div>
      )}
    </AnalyticsDashboardLayout>
  );
};

export default EnhancedDashboard;
