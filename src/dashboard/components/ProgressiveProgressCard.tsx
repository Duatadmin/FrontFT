import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/browser';
import { Database } from '@/lib/supabase/schema.types';
import { TrendingUp, Trophy, Loader, AlertTriangle } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line as RechartsLine,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

// Type Definitions
type TrainingSet = Database['public']['Tables']['training_set']['Row'];
interface ProgressData {
  date: string;
  e1RM: number;
}
interface PersonalRecord {
  value: number;
  unit: string;
  date: string;
}

// Epley formula for e1RM
const calculateE1RM = (weight: number, reps: number): number => {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
};

const ProgressiveProgressCard: React.FC = () => {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [personalRecord, setPersonalRecord] = useState<PersonalRecord | null>(null);
  const [exerciseName, setExerciseName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('User not authenticated.');

        const { data, error: queryError } = await supabase
          .from('training_set')
          .select(`
            weight_kg, 
            reps_done, 
            recorded_at,
            modular_training_exercise ( exrc_id, exrcwiki ( name ) )
          `)
          .not('modular_training_exercise', 'is', null);

        if (queryError) throw queryError;
        if (!data || data.length === 0) {
          setLoading(false);
          return;
        }

        const setsWithNames = data.map(s => ({ ...s, exerciseName: s.modular_training_exercise?.exrcwiki?.name || 'Unknown' }));

        const exerciseCounts = setsWithNames.reduce((acc, set) => {
          acc[set.exerciseName] = (acc[set.exerciseName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const mostFrequentExercise = Object.keys(exerciseCounts).reduce((a, b) => exerciseCounts[a] > exerciseCounts[b] ? a : b);
        setExerciseName(mostFrequentExercise);

        const exerciseSets = setsWithNames.filter(s => s.exerciseName === mostFrequentExercise);

        let overallPR: PersonalRecord = { value: 0, unit: 'kg', date: '' };
        const monthlyMaxE1RM: Record<string, number> = {};

        for (const set of exerciseSets) {
          if (set.weight_kg && set.reps_done) {
            const e1RM = calculateE1RM(set.weight_kg, set.reps_done);
            if (e1RM > overallPR.value) {
              overallPR = { value: e1RM, unit: 'kg', date: new Date(set.recorded_at).toLocaleDateString() };
            }
            
            const month = new Date(set.recorded_at).toISOString().slice(0, 7); // YYYY-MM
            if (!monthlyMaxE1RM[month] || e1RM > monthlyMaxE1RM[month]) {
                monthlyMaxE1RM[month] = e1RM;
            }
          }
        }

        const chartData = Object.keys(monthlyMaxE1RM).sort().map(month => ({
          date: new Date(month + '-02').toLocaleString('default', { month: 'short' }), // Use day 2 to avoid timezone issues
          e1RM: Math.round(monthlyMaxE1RM[month]),
        }));

        setPersonalRecord(overallPR);
        setProgressData(chartData);

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

  if (progressData.length === 0 || !personalRecord) {
    return (
      <div className="bg-neutral-800/50 p-4 md:p-6 rounded-2xl shadow-lg flex flex-col justify-center items-center h-full min-h-[300px]">
        <TrendingUp className="text-neutral-600 mb-4" size={48} />
        <h3 className="text-lg font-semibold text-white">Not Enough Data</h3>
        <p className="text-text-secondary text-sm">Log workouts to see your progress.</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-800/50 p-4 md:p-6 rounded-2xl shadow-lg flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <TrendingUp size={20} className="mr-2 text-accent-lime" />
          Progressive Progress
        </h2>
      </div>

      <div className="flex-grow">
        <h3 className="text-md font-semibold text-white mb-2">{exerciseName} e1RM</h3>
        
        <div className="flex items-baseline space-x-2 mb-4">
          <p className="text-3xl font-bold text-white">{Math.round(personalRecord.value)}<span className="text-lg font-normal text-text-secondary ml-1">{personalRecord.unit}</span></p>
          <span className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2 py-1 rounded-full flex items-center">
              <Trophy size={12} className="mr-1" />
              PR on {personalRecord.date}
            </span>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={progressData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#a0a0a0' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#a0a0a0' }} axisLine={false} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']}/>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(30, 41, 59, 0.9)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                itemStyle={{ color: '#84cc16' }}
              />
              <RechartsLine
                type="monotone"
                dataKey="e1RM"
                name="e1RM"
                stroke="#84cc16"
                strokeWidth={2}
                dot={{ r: 4, fill: '#84cc16' }}
                activeDot={{ r: 6, stroke: '#fff' }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 text-xs text-text-secondary">
        <p>Displaying progress for your most frequent lift.</p>
      </div>
    </div>
  );
};

export default ProgressiveProgressCard;
