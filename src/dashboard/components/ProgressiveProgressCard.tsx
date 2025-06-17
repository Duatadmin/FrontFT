import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/browser';
import { TrendingUp, Trophy, Loader, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
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

interface ProgressData {
  date: string;
  e1RM: number;
  isPR: boolean;
}

interface SetData {
  session_date: string;
  exercise_name: string;
  reps_done: number;
  weight_kg: number;
  e1RM?: number;
  isPR?: boolean;
}

interface PersonalRecord {
  value: number;
  unit: string;
  date: string;
}

const CustomDot: React.FC<any> = ({ cx, cy, payload }) => {
  if (payload.isPR) {
    // A bigger, highlighted dot for PRs
    return <circle cx={cx} cy={cy} r={5} fill="#facc15" stroke="#fff" strokeWidth={1} />;
  }
  // A standard dot for other points
  return <circle cx={cx} cy={cy} r={3} fill="#84cc16" />;
};

// Epley formula for e1RM
const calculateE1RM = (weight: number, reps: number): number => {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
};

// Helper function to find the most frequent exercise
const getMostFrequentExercise = (exerciseNames: (string | null)[]): string => {
  const validNames = exerciseNames.filter(name => name !== null) as string[];
  if (validNames.length === 0) return 'N/A';

  const counts = validNames.reduce<Record<string, number>>((acc, name) => {
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b), validNames[0]);
};

const ProgressiveProgressCard: React.FC = () => {
  const [allCleanedData, setAllCleanedData] = useState<SetData[]>([]); // Stores all fetched and cleaned data
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [personalRecord, setPersonalRecord] = useState<PersonalRecord | null>(null);
  const [uniqueExercises, setUniqueExercises] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to process data for a given exercise
  const processDataForExercise = (exerciseToProcess: string, dataToProcess: SetData[]) => {
    if (!exerciseToProcess || dataToProcess.length === 0) {
      setProgressData([]);
      setPersonalRecord(null);
      return;
    }

    const filteredData = dataToProcess.filter(item => item.exercise_name === exerciseToProcess);

    if (filteredData.length === 0) {
      setProgressData([]);
      setPersonalRecord(null);
      return;
    }

    const dailyMaxE1RM = filteredData.reduce<Record<string, SetData>>((acc, item) => {
      const date = item.session_date.split('T')[0];
      const e1RM = calculateE1RM(item.weight_kg, item.reps_done);
      if (!acc[date] || e1RM > (acc[date].e1RM ?? 0)) {
        acc[date] = {
          session_date: item.session_date,
          exercise_name: item.exercise_name,
          reps_done: item.reps_done,
          weight_kg: item.weight_kg,
          e1RM
        };
      }
      return acc;
    }, {});

    let currentPR = 0;
    const prData = Object.values(dailyMaxE1RM)
      .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime())
      .map(item => {
        const itemE1RM = item.e1RM ?? 0;
        if (itemE1RM > currentPR) {
          currentPR = itemE1RM;
          return { ...item, isPR: true };
        }
        return { ...item, isPR: false };
      });

    const fullProgressData: ProgressData[] = prData.map(item => ({
      date: new Date(item.session_date).toLocaleDateString('default', { month: 'short', day: 'numeric' }),
      e1RM: Math.round(item.e1RM ?? 0),
      isPR: item.isPR ?? false,
    }));

    const lastPR = prData.filter(item => item.isPR).pop();

    setPersonalRecord({
      value: Math.round(currentPR),
      unit: 'kg',
      date: lastPR ? new Date(lastPR.session_date).toLocaleDateString() : 'N/A',
    });
    setProgressData(fullProgressData);
  };

  // Effect for fetching initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('User not authenticated.');

        const { data, error: queryError } = await supabase
          .from('workout_full_view')
          .select('session_date, exercise_name, reps_done, weight_kg, user_id')
          .order('session_date', { ascending: true });

        if (queryError) throw queryError;

        console.log('--- RAW DATA FROM SUPABASE ---', data);

        if (!data || data.length === 0) {
          setLoading(false);
          return;
        }

        // Filter out rows with null essential data BEFORE any processing
        const cleanData = data.filter(
          item =>
            item.session_date !== null &&
            item.exercise_name !== null &&
            item.reps_done !== null &&
            item.weight_kg !== null
        ) as { session_date: string; exercise_name: string; reps_done: number; weight_kg: number; user_id: string | null }[];

        if (cleanData.length === 0) {
          setLoading(false);
          return;
        }

        const allExerciseNames = cleanData.map(item => item.exercise_name);
        const uniqueExerciseNames = Array.from(new Set(allExerciseNames.filter(name => name !== null))) as string[];
        setUniqueExercises(uniqueExerciseNames);
        setAllCleanedData(cleanData); // Store all cleaned data

        if (uniqueExerciseNames.length > 0) {
          const mostFrequent = getMostFrequentExercise(allExerciseNames);
          setSelectedExercise(mostFrequent);
          // Initial processing will be handled by the next useEffect
        } else {
          setLoading(false); // No exercises to process
        }

        // Data processing is now handled by the useEffect watching selectedExercise and allCleanedData
        // setLoading(false) will be called in that effect or if no data

      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Effect for processing data when selectedExercise or allCleanedData changes
  useEffect(() => {
    if (selectedExercise && allCleanedData.length > 0) {
      setLoading(true);
      processDataForExercise(selectedExercise, allCleanedData);
      setLoading(false);
    }
  }, [selectedExercise, allCleanedData]);

  const handleNextExercise = () => {
    if (uniqueExercises.length <= 1) return;
    const currentIndex = uniqueExercises.indexOf(selectedExercise);
    const nextIndex = (currentIndex + 1) % uniqueExercises.length;
    setSelectedExercise(uniqueExercises[nextIndex]);
  };

  const handlePreviousExercise = () => {
    if (uniqueExercises.length <= 1) return;
    const currentIndex = uniqueExercises.indexOf(selectedExercise);
    const prevIndex = (currentIndex - 1 + uniqueExercises.length) % uniqueExercises.length;
    setSelectedExercise(uniqueExercises[prevIndex]);
  };

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
      <div className="mb-4">
        {/* Main Card Title */}
        <h2 className="text-lg font-semibold text-white flex items-center mb-2">
          <TrendingUp size={36} className="mr-3 text-accent-lime flex-shrink-0" />
          <span>
            Progressive
            <br />
            Progress
          </span>
        </h2>
        {/* Exercise Navigation - on a new line */}
        {uniqueExercises.length > 0 && (
          <div className="flex items-center justify-between w-full">
            <button 
              onClick={handlePreviousExercise}
              disabled={uniqueExercises.length <= 1}
              className="p-1 rounded-md hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            <h3 
              className="text-md font-semibold text-white text-center flex-grow mx-2 truncate"
              title={selectedExercise || 'Select Exercise'}
            >
              {(selectedExercise || 'Select Exercise') + ' e1RM'}
            </h3>
            <button 
              onClick={handleNextExercise}
              disabled={uniqueExercises.length <= 1}
              className="p-1 rounded-md hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-grow">
        
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
                dot={<CustomDot />}
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
