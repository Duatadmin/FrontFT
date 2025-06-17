import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/browser';
import { BarChart as BarChartIcon, AlertTriangle, Loader } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

// Type Definitions
interface ChartData {
  week: string;
  weeklyLoad: number;
  chronicLoad: number;
  acwr: number;
}

const getACWRStatus = (acwr: number): { text: string; colorClass: string; bgColorClass: string } => {
  if (acwr >= 0.8 && acwr <= 1.3) {
    return { text: 'Optimal', colorClass: 'text-green-400', bgColorClass: 'bg-green-500/20' };
  }
  if (acwr > 1.3 && acwr <= 1.5) {
    return { text: 'Caution', colorClass: 'text-yellow-400', bgColorClass: 'bg-yellow-500/20' };
  }
  if (acwr > 1.5) {
    return { text: 'High Risk', colorClass: 'text-red-400', bgColorClass: 'bg-red-500/20' };
  }
  return { text: 'Low Load', colorClass: 'text-gray-400', bgColorClass: 'bg-gray-500/20' };
};

const TrainingLoadCard: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
            throw new Error('User not authenticated.');
        }

        const { data, error: queryError } = await supabase
          .from('workout_full_view') // Changed from modular_training_set
          // Assuming workout_full_view provides these fields directly or they can be derived.
          // If workout_full_view is session-level, this select might need to access a JSONB field (e.g., session_state.sets)
          // For now, proceeding with the assumption that these fields are available per 'row' that contributes to load.
          .select('session_date, weight_kg, reps_done') // Changed recorded_at to session_date
          .order('session_date', { ascending: true });

        if (queryError) throw queryError;

        const rawData = data || [];
        if (rawData.length === 0) {
          setChartData([]);
          setLoading(false);
          return;
        }

        // --- Client-side data transformation ---
        // Filter out rows with null essential data BEFORE any processing
        const cleanData = rawData.filter(
          item =>
            item.session_date !== null &&
            item.weight_kg !== null &&
            item.reps_done !== null
        ) as { session_date: string; weight_kg: number; reps_done: number }[];

        if (cleanData.length === 0) {
          setChartData([]);
          setLoading(false);
          return;
        }

        const weeklyLoads = cleanData.reduce((acc: Record<string, number>, item) => {
            const itemDate = new Date(item.session_date); // Changed from set.recorded_at
            const dayOfWeek = itemDate.getUTCDay(); // Sunday=0, Monday=1, etc.
            const offsetToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Calculate offset to get to Monday
            
            const weekStartDate = new Date(itemDate);
            weekStartDate.setUTCDate(itemDate.getUTCDate() - offsetToMonday);
            weekStartDate.setUTCHours(0, 0, 0, 0); // Normalize to the start of the day

            const weekStartString = weekStartDate.toISOString().split('T')[0];

            if (!acc[weekStartString]) {
                acc[weekStartString] = 0;
            }
            // item.weight_kg and item.reps_done are guaranteed non-null here due to prior filtering
            acc[weekStartString] += item.weight_kg * item.reps_done;
            return acc;
        }, {});


        const sortedWeeks = Object.keys(weeklyLoads).sort();
        const processedData: ChartData[] = [];

        for (let i = 0; i < sortedWeeks.length; i++) {
            const week = sortedWeeks[i];
            const weeklyLoad = weeklyLoads[week];

            // Calculate chronic load (4-week rolling average)
            const chronicLoadWindow = sortedWeeks.slice(Math.max(0, i - 3), i + 1);
            const chronicLoadSum = chronicLoadWindow.reduce((sum, w) => sum + weeklyLoads[w], 0);
            const chronicLoad = chronicLoadSum / chronicLoadWindow.length;

            processedData.push({
                week: `W${i + 1}`,
                weeklyLoad: Math.round(weeklyLoad),
                chronicLoad: Math.round(chronicLoad),
                acwr: chronicLoad > 0 ? weeklyLoad / chronicLoad : 0,
            });
        }

        setChartData(processedData.slice(-12)); // Show last 12 weeks

      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-neutral-800/50 p-4 md:p-6 rounded-2xl shadow-lg flex justify-center items-center h-full min-h-[300px]">
        <Loader className="animate-spin text-accent-lime" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-neutral-800/50 p-4 md:p-6 rounded-2xl shadow-lg flex flex-col justify-center items-center h-full min-h-[300px]">
        <AlertTriangle className="text-red-500 mb-4" size={48} />
        <h3 className="text-lg font-semibold text-white">Error Loading Data</h3>
        <p className="text-text-secondary text-sm">{error}</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-neutral-800/50 p-4 md:p-6 rounded-2xl shadow-lg flex flex-col justify-center items-center h-full min-h-[300px]">
        <BarChartIcon className="text-neutral-600 mb-4" size={48} />
        <h3 className="text-lg font-semibold text-white">Not Enough Data</h3>
        <p className="text-text-secondary text-sm">Log your workouts to see your training load.</p>
      </div>
    );
  }

  const latestWeek = chartData[chartData.length - 1];
  const acwrStatus = getACWRStatus(latestWeek.acwr);

  return (
    <div className="bg-neutral-800/50 p-4 md:p-6 rounded-2xl shadow-lg flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <BarChartIcon size={20} className="mr-2 text-accent-lime" />
          Training Load & Readiness
        </h2>
      </div>

      <div className="mb-6 flex items-center space-x-4">
        <div>
          <p className="text-xs text-text-secondary mb-0.5">ACWR</p>
          <p className="text-3xl font-bold text-white tracking-tight">{latestWeek.acwr.toFixed(2)}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${acwrStatus.bgColorClass} ${acwrStatus.colorClass}`}>
          {acwrStatus.text}
        </div>
      </div>

      <div className="flex-grow min-h-[250px] md:min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#a0a0a0' }} axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }} tickLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }} />
            <YAxis tick={{ fontSize: 12, fill: '#a0a0a0' }} axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }} tickLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem'
              }}
              labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
              itemStyle={{ color: '#cbd5e1' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} formatter={(value) => <span style={{color: '#a0a0a0'}}>{value}</span>} />
            <Bar dataKey="weeklyLoad" name="Weekly Load" fill="#84cc16" barSize={20} radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="chronicLoad" name="Chronic Load (4wk Avg)" stroke="#71717a" strokeWidth={2} dot={{ r: 4, fill: '#71717a' }} activeDot={{ r: 6, stroke: '#a1a1aa' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4 text-xs">
        <div>
          <p className="text-text-secondary">Last Week Load</p>
          <p className="text-white font-medium">{latestWeek.weeklyLoad.toLocaleString()} units</p>
        </div>
        <div>
          <p className="text-text-secondary">Chronic Avg Load</p>
          <p className="text-white font-medium">{latestWeek.chronicLoad.toLocaleString()} units</p>
        </div>
      </div>
    </div>
  );
};

export default TrainingLoadCard;
