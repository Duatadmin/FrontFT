import React from 'react';
import WorkoutDataDisplay from './components/WorkoutDataDisplay';
import { useDashboardData } from './dashboard/useDashboardData';

const WorkoutDataDemo: React.FC = () => {
  const { data, loading, error, dataSource } = useDashboardData();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Workout Data Integration Demo</h1>
      <p className="text-gray-500 mb-6">
        Displaying real workout data from Supabase with robust error handling
      </p>
      
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <h2 className="text-lg font-bold mb-2">Data Source Information</h2>
        <p>
          Current data source: <strong>{dataSource === 'real' ? 'Supabase (Real Data)' : 'Mock Data (Fallback)'}</strong>
        </p>
        {error && (
          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded">
            <p className="font-bold text-red-700">{error.code}</p>
            <p className="text-red-700">{error.message}</p>
            {error.missingData && (
              <p className="mt-1 font-bold text-red-700">
                Missing data: {error.missingData}
              </p>
            )}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="border border-gray-200 rounded-md bg-white shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold">Raw Workout Data</h2>
            <p className="text-sm text-gray-500">
              Direct integration with workout_sessions table
            </p>
          </div>
          <div className="p-4">
            <WorkoutDataDisplay />
          </div>
        </div>
        
        {data && (
          <div className="border border-gray-200 rounded-md bg-white shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold">Dashboard Statistics</h2>
              <p className="text-sm text-gray-500">
                Aggregated workout statistics
              </p>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Total Workouts</p>
                  <p className="text-2xl font-bold">{data.monthlyStats.workoutCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Volume</p>
                  <p className="text-2xl font-bold">{data.monthlyStats.totalVolume || 0}</p>
                </div>
              </div>
              
              <hr className="my-4" />
              
              <h3 className="text-md font-bold mb-3">Recent Workouts</h3>
              {data.recentWorkouts.length === 0 ? (
                <p>No recent workouts found</p>
              ) : (
                <div>
                  {data.recentWorkouts.map(workout => (
                    <div 
                      key={workout.id} 
                      className="p-3 mb-2 border border-gray-200 rounded-md"
                    >
                      <p className="font-bold">{workout.focus_area || 'Workout'}</p>
                      <p className="text-sm">
                        {new Date(workout.completed_at || workout.created_at || '').toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutDataDemo;
