import React from 'react';
import WorkoutDataDisplay from '../components/WorkoutDataDisplay';
import { useDashboardData } from '../dashboard/useDashboardData';

const WorkoutDataPage: React.FC = () => {
  const { data, loading, error, dataSource } = useDashboardData();


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Workout Data Integration</h1>
      <p className="text-gray-500 mb-6">
        Displaying real workout data from Supabase with robust error handling
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
        
        <div className="border border-gray-200 rounded-md bg-white shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold">Dashboard Integration</h2>
            <p className="text-sm text-gray-500">
              Using dashboard data hook with Supabase data
            </p>
          </div>
          <div className="p-4">
            {loading ? (
              <p>Loading dashboard data...</p>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <div>
                  <strong className="font-bold">{error.code}</strong>
                  <p>
                    {error.message}
                    {error.missingData && (
                      <span className="block mt-2 font-bold">
                        Missing data: {error.missingData}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p className="mb-4 font-bold">
                  Data Source: {dataSource === 'real' ? 'Supabase (Real Data)' : 'Mock Data (Fallback)'}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Workouts</p>
                    <p className="text-2xl font-bold">{data?.monthlyStats.workoutCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Volume</p>
                    <p className="text-2xl font-bold">{data?.monthlyStats.totalVolume || 0}</p>
                  </div>
                </div>
                
                <hr className="my-4" />
                
                <h3 className="text-md font-bold mb-3">Recent Workouts</h3>
                {data?.recentWorkouts.length === 0 ? (
                  <p>No recent workouts found</p>
                ) : (
                  <div>
                    {data?.recentWorkouts.map(workout => (
                      <div 
                        key={workout.id} 
                        className="p-3 mb-2 border border-gray-200 rounded-md"
                      >
                        <p className="font-bold">{workout.focus_area || 'Workout'}</p>
                        <p className="text-sm">
                          {new Date(workout.session_date || workout.created_at || '').toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4 border border-gray-200 rounded-md bg-white shadow-sm">
        <h2 className="text-lg font-bold mb-4">Data Verification and Error Handling</h2>
        <p className="mb-3">
          This page demonstrates how the application handles real Supabase data with robust error handling:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-bold mb-2">Error Handling Strategy:</p>
            <ul className="list-disc pl-5">
              <li>Explicit error messages showing exactly what data is missing</li>
              <li>Graceful fallback to mock data when needed</li>
              <li>Detailed console logs for debugging</li>
              <li>User-friendly error displays</li>
            </ul>
          </div>
          <div>
            <p className="font-bold mb-2">Data Verification:</p>
            <ul className="list-disc pl-5">
              <li>Each workout is verified for required fields</li>
              <li>Missing timestamps, IDs, or other critical data is logged</li>
              <li>JSON fields are safely parsed with fallbacks</li>
              <li>All UI components handle missing data gracefully</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutDataPage;
