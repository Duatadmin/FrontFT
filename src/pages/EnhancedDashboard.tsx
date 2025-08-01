import React from 'react';
import { useDashboardData } from '../dashboard/useDashboardDataQuery'; // Use React Query version
import type { MetricData } from '../dashboard/types'; // Added
import { Loader2 } from 'lucide-react'; // Added
import { useAuthGuard } from '../hooks/useAuthGuard';
import KpiCard from '../components/ui/KpiCard';


import { motion } from 'framer-motion';

// Mock data for the charts




const EnhancedDashboard: React.FC = () => {
  useAuthGuard();
  const { data, loading, error } = useDashboardData();

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
    <>
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
            <h3 className="text-2xl font-semibold text-white mb-3">No workout data yet</h3>
            <p className="text-gray-300">Start logging your workouts to see your dashboard metrics.</p>
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


          </div>
        </div>
      )}
    </>
  );
};

export default EnhancedDashboard;
