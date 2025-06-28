import React from 'react';
import { useDashboardData } from '../dashboard/useDashboardData';
import type { MetricData } from '../dashboard/types';
import { Loader2 } from 'lucide-react';
import { useAuthGuard } from '../hooks/useAuthGuard';
import KpiCard from '../components/ui/KpiCard';

import { motion } from 'framer-motion';



const DashboardContent: React.FC = () => {
  useAuthGuard();
  const { data, loading, error } = useDashboardData();

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



          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardContent;
