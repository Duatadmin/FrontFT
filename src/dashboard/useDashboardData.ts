import { useState, useEffect } from 'react';
import { DashboardData, TimeRange } from './types';

// Mock data generator for development purposes
const generateMockData = (range: TimeRange): DashboardData => {
  // Adjust values based on time range
  const multiplier = range === 'weekly' ? 1 : range === 'monthly' ? 4 : 12;
  
  return {
    metrics: {
      volume: {
        label: 'Volume',
        value: 8450 * multiplier,
        change: 12.5,
        changeType: 'increase',
        icon: 'dumbbell'
      },
      prs: {
        label: 'PRs',
        value: 2 * multiplier,
        change: 100,
        changeType: 'increase',
        icon: 'trophy'
      },
      streak: {
        label: 'Streak',
        value: 4,
        change: 33.3,
        changeType: 'increase',
        icon: 'flame'
      },
      calories: {
        label: 'Calories',
        value: 2800 * multiplier,
        change: 5.2,
        changeType: 'increase',
        icon: 'zap'
      }
    },
    volumeChart: Array.from({ length: range === 'weekly' ? 7 : range === 'monthly' ? 30 : 52 }, (_, i) => ({
      date: `Day ${i + 1}`,
      value: 1000 + Math.random() * 2000
    })),
    prTimeline: Array.from({ length: 5 }, (_, i) => ({
      name: `Exercise ${i + 1}`,
      value: 5 + Math.random() * 20
    })),
    activityBreakdown: [
      { name: 'Strength', value: 45, color: '#10a37f' },
      { name: 'Cardio', value: 30, color: '#5533ff' },
      { name: 'Flexibility', value: 15, color: '#ff9933' },
      { name: 'Recovery', value: 10, color: '#3366ff' }
    ]
  };
};

export const useDashboardData = (range: TimeRange = 'weekly') => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        // const response = await fetch(`/api/progress?range=${range}`);
        // const data = await response.json();
        
        // Using mock data for development
        const mockData = generateMockData(range);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setData(mockData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [range]);

  return { data, loading, error };
};

export default useDashboardData;
