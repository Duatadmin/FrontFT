import React, { useState, useEffect } from 'react';
import { GitBranch, Loader, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { startOfWeek, subWeeks, format, isWithinInterval } from 'date-fns';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import { supabase } from '@/lib/supabase';

// Helper to create a polygon path with rounded corners
const roundedPolygonPath = (points: { x: number; y: number }[], radius: number): string => {
  if (!points || points.length < 3) return '';

  // Filter out invalid points
  const validPoints = points.filter(p => 
    p && typeof p.x === 'number' && typeof p.y === 'number' && 
    !isNaN(p.x) && !isNaN(p.y) && isFinite(p.x) && isFinite(p.y)
  );

  if (validPoints.length < 3) return '';

  let path = '';
  let hasStartPoint = false;
  
  for (let i = 0; i < validPoints.length; i++) {
    const p1 = validPoints[i];
    const p2 = validPoints[(i + 1) % validPoints.length];
    const p3 = validPoints[(i + 2) % validPoints.length];

    const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

    const len1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const len2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

    if (len1 === 0 || len2 === 0) continue;

    const unitV1 = { x: v1.x / len1, y: v1.y / len1 };
    const unitV2 = { x: v2.x / len2, y: v2.y / len2 };

    const angle = Math.acos(Math.max(-1, Math.min(1, unitV1.x * unitV2.x + unitV1.y * unitV2.y)));
    const tan = Math.tan(angle / 2);
    const segment = Math.min(radius / Math.max(tan, 0.01), len1 / 2, len2 / 2);

    const p1c = { x: p2.x + segment * unitV1.x, y: p2.y + segment * unitV1.y };
    const p2c = { x: p2.x + segment * unitV2.x, y: p2.y + segment * unitV2.y };

    // Ensure we always start with M command for the first valid point
    if (!hasStartPoint) {
      path = `M ${p1c.x},${p1c.y}`;
      hasStartPoint = true;
    } else {
      path += ` L ${p1c.x},${p1c.y}`;
    }

    path += ` Q ${p2.x},${p2.y} ${p2c.x},${p2c.y}`;
  }
  
  // Only close the path if we have a valid start point
  if (hasStartPoint) {
    path += ' Z';
  }
  
  return path;
};

// Custom shape component for the Radar
interface CustomRadarShapeProps {
  fill?: string;
  stroke?: string;
  fillOpacity?: number;
  points?: { x: number; y: number }[];
}

const CustomRadarShape = (props: CustomRadarShapeProps) => {
  const { fill, stroke, fillOpacity, points } = props;
  
  if (!points || points.length === 0) return null;
  
  // Validate that all points have valid x and y values
  const validPoints = points.filter(p => 
    p && typeof p.x === 'number' && typeof p.y === 'number' && 
    !isNaN(p.x) && !isNaN(p.y) && isFinite(p.x) && isFinite(p.y)
  );
  
  if (validPoints.length < 3) {
    // Return a simple polygon if we can't create rounded corners
    return null;
  }
  
  const path = roundedPolygonPath(validPoints, 8); // 8px corner radius
  
  // Validate the path
  if (!path || path.includes('NaN') || path.length === 0) {
    return null;
  }
  
  // Ensure path starts with M command
  const trimmedPath = path.trim();
  if (!trimmedPath.startsWith('M')) {
    console.error('Invalid SVG path: does not start with M command', trimmedPath);
    return null;
  }

  return <path d={trimmedPath} fill={fill} stroke={stroke} fillOpacity={fillOpacity as number} strokeWidth={2} />;
};

interface BalanceData {
  category: string;
  volume: number;
  fullMark: number;
}

interface WorkoutData {
  exercise_name: string;
  muscle_group: string;
  weight_kg: number;
  reps_done: number;
  session_date: string;
}

const MuscleMovementBalanceCard: React.FC = () => {
  // Initialize with default data structure for major muscle groups
  const defaultBalanceData: BalanceData[] = [
    { category: 'Chest', volume: 0, fullMark: 100 },
    { category: 'Back', volume: 0, fullMark: 100 },
    { category: 'Shoulders', volume: 0, fullMark: 100 },
    { category: 'Arms', volume: 0, fullMark: 100 },
    { category: 'Legs', volume: 0, fullMark: 100 },
    { category: 'Core', volume: 0, fullMark: 100 },
  ];
  
  const [balanceData, setBalanceData] = useState<BalanceData[]>(defaultBalanceData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [periodOffset, setPeriodOffset] = useState(0); // 0 means current 4-week period
  const [allWorkoutData, setAllWorkoutData] = useState<WorkoutData[]>([]);

  // Fetch all data once on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          throw new Error('User not authenticated.');
        }

        // Fetch all workout data including muscle_group
        // Note: workout_full_view returns one row per set, which is what we want for volume calculation
        const { data, error: queryError } = await supabase
          .from('workout_full_view')
          .select('exercise_name, muscle_group, weight_kg, reps_done, session_date')
          .order('session_date', { ascending: false });

        if (queryError) throw queryError;

        console.log('Raw data from workout_full_view:', data?.length, 'records');
        
        if (!data || data.length === 0) {
          setHasData(false);
          setLoading(false);
          return;
        }

        // Log some sample data to understand structure
        if (data.length > 0) {
          console.log('Sample record:', data[0]);
        }

        // Filter out invalid data - be more lenient with filtering
        const validData = data.filter(
          item => item.exercise_name && item.session_date && 
                  (item.weight_kg !== null && item.weight_kg !== undefined) && 
                  (item.reps_done !== null && item.reps_done !== undefined)
        ) as WorkoutData[];
        
        console.log('Valid data after filtering:', validData.length, 'records');

        // Log data range for debugging
        if (validData.length > 0) {
          const dates = validData.map(d => new Date(d.session_date));
          const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
          const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
          console.log('Workout data range:', {
            from: minDate.toISOString(),
            to: maxDate.toISOString(),
            totalRecords: validData.length
          });
        }

        setAllWorkoutData(validData);
        setHasData(validData.length > 0);
        setLoading(false);
      } catch (e: any) {
        setError(e.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process data based on selected period
  useEffect(() => {
    if (allWorkoutData.length === 0) {
      setBalanceData(defaultBalanceData);
      return;
    }

    // Calculate the 4-week period based on offset
    const today = new Date();
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    
    // When periodOffset is 0, we want the current 4-week period ending this week
    // When periodOffset is 1, we want the previous 4-week period, etc.
    const periodEnd = subWeeks(currentWeekStart, periodOffset * 4);
    periodEnd.setDate(periodEnd.getDate() + 6); // End of week (Sunday)
    periodEnd.setHours(23, 59, 59, 999); // End of day
    
    const periodStart = subWeeks(periodEnd, 4);
    periodStart.setDate(periodStart.getDate() + 1); // Start from Monday
    periodStart.setHours(0, 0, 0, 0); // Start of day

    console.log('Period calculation:', {
      periodOffset,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      dataCount: allWorkoutData.length,
      firstDataDate: allWorkoutData.length > 0 ? allWorkoutData[allWorkoutData.length - 1].session_date : 'none',
      lastDataDate: allWorkoutData.length > 0 ? allWorkoutData[0].session_date : 'none'
    });

    // Filter data for the selected period
    const periodData = allWorkoutData.filter(item => {
      const itemDate = new Date(item.session_date);
      return itemDate >= periodStart && itemDate <= periodEnd;
    });

    console.log('Filtered data count:', periodData.length);

    if (periodData.length === 0) {
      setBalanceData(defaultBalanceData);
      setHasData(false);
      return;
    }

    setHasData(true);

    // Calculate volume by muscle group
    const volumeByMuscle: Record<string, number> = {};

    // Process each exercise in the period
    periodData.forEach(item => {
      // Skip if no weight or reps
      if (!item.weight_kg || !item.reps_done) return;
      
      const volume = item.weight_kg * item.reps_done;
      
      // Get muscle group, try to infer from exercise name if missing
      let muscleGroup = item.muscle_group;
      
      if (!muscleGroup && item.exercise_name) {
        // Try to infer muscle group from exercise name
        const exerciseLower = item.exercise_name.toLowerCase();
        if (exerciseLower.includes('bench') || exerciseLower.includes('chest') || exerciseLower.includes('fly')) {
          muscleGroup = 'chest';
        } else if (exerciseLower.includes('row') || exerciseLower.includes('pull') || exerciseLower.includes('lat')) {
          muscleGroup = 'back';
        } else if (exerciseLower.includes('press') && exerciseLower.includes('shoulder') || exerciseLower.includes('lateral') || exerciseLower.includes('delt')) {
          muscleGroup = 'shoulders';
        } else if (exerciseLower.includes('curl') || exerciseLower.includes('extension') || exerciseLower.includes('tricep') || exerciseLower.includes('bicep')) {
          muscleGroup = 'arms';
        } else if (exerciseLower.includes('squat') || exerciseLower.includes('leg') || exerciseLower.includes('lunge') || exerciseLower.includes('calf')) {
          muscleGroup = 'legs';
        } else if (exerciseLower.includes('plank') || exerciseLower.includes('crunch') || exerciseLower.includes('abs')) {
          muscleGroup = 'core';
        }
      }
      
      // Default to 'Other' if still no muscle group
      if (!muscleGroup) {
        muscleGroup = 'Other';
      }
      
      // Normalize muscle group names and combine similar groups
      let normalizedGroup = muscleGroup;
      const muscleGroupLower = muscleGroup.toLowerCase();
      
      // Map specific muscle groups to major categories
      if (muscleGroupLower.includes('chest') || muscleGroupLower.includes('pec')) {
        normalizedGroup = 'Chest';
      } else if (muscleGroupLower.includes('back') || muscleGroupLower.includes('lat') || muscleGroupLower.includes('trap')) {
        normalizedGroup = 'Back';
      } else if (muscleGroupLower.includes('shoulder') || muscleGroupLower.includes('delt')) {
        normalizedGroup = 'Shoulders';
      } else if (muscleGroupLower.includes('bicep') || muscleGroupLower.includes('tricep') || muscleGroupLower.includes('arm')) {
        normalizedGroup = 'Arms';
      } else if (muscleGroupLower.includes('leg') || muscleGroupLower.includes('quad') || muscleGroupLower.includes('hamstring') || muscleGroupLower.includes('glute') || muscleGroupLower.includes('calf')) {
        normalizedGroup = 'Legs';
      } else if (muscleGroupLower.includes('core') || muscleGroupLower.includes('abs') || muscleGroupLower.includes('oblique')) {
        normalizedGroup = 'Core';
      } else {
        // Try one more time with exercise name if muscle group didn't match
        const exerciseLower = item.exercise_name?.toLowerCase() || '';
        if (exerciseLower.includes('bench') || exerciseLower.includes('chest')) {
          normalizedGroup = 'Chest';
        } else if (exerciseLower.includes('row') || exerciseLower.includes('pull')) {
          normalizedGroup = 'Back';
        } else if (exerciseLower.includes('squat') || exerciseLower.includes('deadlift')) {
          normalizedGroup = 'Legs';
        } else {
          normalizedGroup = 'Other';
        }
      }
      
      if (!volumeByMuscle[normalizedGroup]) {
        volumeByMuscle[normalizedGroup] = 0;
      }
      volumeByMuscle[normalizedGroup] += volume;
    });
    
    console.log('Volume by muscle group:', volumeByMuscle);

    // Ensure all major muscle groups are represented
    const majorMuscleGroups = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'];
    majorMuscleGroups.forEach(group => {
      if (!volumeByMuscle[group]) {
        volumeByMuscle[group] = 0;
      }
    });

    // Find max volume for normalization
    const maxVolume = Math.max(...Object.values(volumeByMuscle), 1);

    // Convert to chart data format (normalized to 0-100 scale)
    const chartData: BalanceData[] = majorMuscleGroups.map(group => ({
      category: group,
      volume: Math.round((volumeByMuscle[group] / maxVolume) * 100),
      fullMark: 100,
    }));

    setBalanceData(chartData);
  }, [allWorkoutData, periodOffset]);

  // Generate insight based on data
  const generateInsight = (): string => {
    if (!hasData || balanceData.every(d => d.volume === 0)) {
      if (periodOffset === 0) {
        return 'No workouts logged in the current 4-week period.';
      } else {
        return 'No workouts logged in this 4-week period.';
      }
    }
    
    const sorted = [...balanceData].sort((a, b) => a.volume - b.volume);
    const weakest = sorted[0];
    const secondWeakest = sorted[1];
    
    const periodContext = periodOffset === 0 ? 'Currently' : 'In this period';
    
    if (weakest.volume < 50) {
      return `${periodContext}: Focus on ${weakest.category} and ${secondWeakest.category} to improve balance.`;
    } else if (weakest.volume < 70) {
      return `${periodContext}: Consider adding more ${weakest.category} volume for better balance.`;
    } else {
      return `${periodContext}: Well-balanced training across all movement patterns.`;
    }
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

  // Calculate date range for display (should match the actual filtering logic)
  const today = new Date();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const displayPeriodEnd = subWeeks(currentWeekStart, periodOffset * 4);
  displayPeriodEnd.setDate(displayPeriodEnd.getDate() + 6); // End of week (Sunday)
  const displayPeriodStart = subWeeks(displayPeriodEnd, 4);
  displayPeriodStart.setDate(displayPeriodStart.getDate() + 1); // Start from Monday
  const dateRangeText = `${format(displayPeriodStart, 'MMM d')} - ${format(displayPeriodEnd, 'MMM d, yyyy')}`;

  // Check if we can navigate forward/backward
  const canGoForward = periodOffset > 0;
  const canGoBack = allWorkoutData.length > 0 && allWorkoutData.some(item => {
    const itemDate = new Date(item.session_date);
    return itemDate < displayPeriodStart;
  });

  if (!hasData && !loading && allWorkoutData.length === 0) {
    return (
      <div className="bg-neutral-800/50 p-4 md:p-6 rounded-2xl shadow-lg flex flex-col justify-center items-center h-full min-h-[300px]">
        <GitBranch className="text-neutral-600 mb-4" size={48} />
        <h3 className="text-lg font-semibold text-white">Not Enough Data</h3>
        <p className="text-text-secondary text-sm">Log workouts to see your movement balance.</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-800/50 p-4 md:p-6 rounded-2xl shadow-lg flex flex-col h-full">
      {/* Card Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center">
            <GitBranch size={20} className="mr-2 text-accent-lime" />
            Muscle & Movement Balance
          </h2>
          <p className="text-xs text-text-secondary mt-1">{dateRangeText}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPeriodOffset(periodOffset + 1)}
            disabled={!canGoBack}
            className={`p-1.5 rounded-lg transition-colors ${
              canGoBack 
                ? 'hover:bg-neutral-700 text-white cursor-pointer' 
                : 'text-neutral-600 cursor-not-allowed'
            }`}
            aria-label="Previous 4 weeks"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setPeriodOffset(periodOffset - 1)}
            disabled={!canGoForward}
            className={`p-1.5 rounded-lg transition-colors ${
              canGoForward 
                ? 'hover:bg-neutral-700 text-white cursor-pointer' 
                : 'text-neutral-600 cursor-not-allowed'
            }`}
            aria-label="Next 4 weeks"
          >
            <ChevronRight size={18} />
          </button>
          {periodOffset !== 0 && (
            <button
              onClick={() => setPeriodOffset(0)}
              className="ml-1 px-2 py-1 text-xs bg-accent-lime/20 text-accent-lime rounded hover:bg-accent-lime/30 transition-colors"
            >
              Current
            </button>
          )}
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-grow h-64 md:h-auto">
        {!hasData ? (
          <div className="flex flex-col justify-center items-center h-full">
            <GitBranch className="text-neutral-600 mb-2" size={32} />
            <p className="text-sm text-text-secondary">No data for this period</p>
            <p className="text-xs text-text-secondary mt-1">Navigate to other periods with data</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={balanceData}>
              <PolarGrid stroke="rgba(255, 255, 255, 0.2)" gridType="polygon" />
              <PolarAngleAxis dataKey="category" tick={{ fill: '#a0a0a0', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Volume"
                dataKey="volume"
                stroke="#84cc16"
                fill="#84cc16"
                fillOpacity={0.6}
                shape={<CustomRadarShape />}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(30, 41, 59, 0.9)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                itemStyle={{ color: '#84cc16' }}
                formatter={(value: number) => [`${value}%`, 'Relative Volume']}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer with Dynamic Insight */}
      <div className="mt-2 pt-2 border-t border-white/10 text-center">
        <p className="text-xs text-text-secondary">
          Insight: {generateInsight()}
        </p>
      </div>
    </div>
  );
};

export default MuscleMovementBalanceCard;
