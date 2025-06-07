import React, { useState, useEffect } from 'react';
import { supabase, getCurrentUserId, checkRequiredTables } from './lib/supabase';
import MainLayout from './components/layout/MainLayout';
import SimpleWorkoutDisplay from './SimpleWorkoutDisplay';

interface TableStatus {
  checked: boolean;
  missing: string[];
  available: string[];
}

interface WorkoutData {
  count: number;
  recentWorkouts: any[];
}

export default function SupabaseTest() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [tablesStatus, setTablesStatus] = useState<TableStatus>({
    checked: false,
    missing: [],
    available: []
  });
  const [workoutData, setWorkoutData] = useState<WorkoutData>({
    count: 0,
    recentWorkouts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setLoading(true);
        
        // Check basic connectivity by directly querying workout_sessions
        const { data, error } = await supabase.from('workout_sessions').select('id').limit(1);
        
        if (error) {
          console.error('Supabase connection error:', error);
          setIsConnected(false);
          setError(`Connection error: ${error.message}`);
        } else {
          setIsConnected(true);
          
          // Get current user ID
          const uid = await getCurrentUserId();
          setUserId(uid);

          if (!uid) {
            console.warn('SupabaseTest: No authenticated user ID found. Some tests requiring a user ID may not run or may show limited data.');
            // Potentially set an error or a specific state to indicate no user is available for testing
          }
          
          // Check required tables
          const tablesExist = await checkRequiredTables();
          
          // Get list of all tables in the database
          let tableData: any[] = [];
          
          try {
            // Try direct query first
            const { data, error } = await supabase
              .from('workout_sessions')
              .select('id')
              .limit(1);
              
            if (error) {
              console.error('Error checking workout_sessions table:', error);
            } else {
              // If we can query workout_sessions, we know it exists
              tableData = [
                { tablename: 'workout_sessions', schemaname: 'public' }
              ];
            }
          } catch (err) {
            console.error('Error checking tables:', err);
          }
          
          const availableTables = tableData?.map(t => `${t.schemaname}.${t.tablename}`) || [];
          console.log('All available tables:', availableTables);
          
          // Get public tables only
          const publicTables = availableTables.filter(t => t.startsWith('public.')).map(t => t.replace('public.', ''));
          
          // Define required tables
          const requiredTables = ['users', 'workout_sessions', 'training_plans', 'goals', 'progress_photos', 'weekly_reflections'];
          const missingTables = requiredTables.filter(table => !publicTables.includes(table));
          
          setTablesStatus({
            checked: true,
            missing: missingTables,
            available: publicTables
          });
          
          console.log('Available tables:', publicTables);
          console.log('Missing tables:', missingTables);
          
          // If we have a user ID and workout_sessions table exists, fetch some workout data
          if (uid && publicTables.includes('workout_sessions')) {
            // Count total workouts
            const { count, error: countError } = await supabase
              .from('workout_sessions')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', uid);
            
            if (countError) {
              console.error('Error counting workouts:', countError);
            } else {
              // Don't try to get column information for now to avoid errors
              setWorkoutData({
                count: count || 0,
                recentWorkouts: []
              });
            }
          }
        }
      } catch (err) {
        console.error('Health check exception:', err);
        setError(err instanceof Error ? err.message : String(err));
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkConnection();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="p-4 bg-blue-100 border border-blue-400 rounded animate-pulse">
          <h2 className="text-xl font-bold text-blue-800">Testing Supabase connection...</h2>
          <p className="mt-2">Please wait while we test the connection to Supabase...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-4 bg-red-100 border border-red-400 rounded">
          <h2 className="text-xl font-bold text-red-800">Error connecting to Supabase</h2>
          <p className="mt-2">{error}</p>
          
          <div className="mt-6 space-y-4">
            <div className="p-3 bg-gray-100 rounded">
              <h3 className="font-semibold text-lg">Troubleshooting Steps:</h3>
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                <li>Check your <code>.env</code> file has the correct values:</li>
                <pre className="mt-1 text-sm bg-gray-200 p-2 rounded">
                  VITE_SUPABASE_URL=https://usmbvieiwmnzbqbhhbob.supabase.co
                  VITE_SUPABASE_ANON_KEY=your-anon-key
                </pre>
                <li>Ensure you are logged in, as this page now uses the authenticated user's ID.</li>
                <li>Check if there are Row Level Security (RLS) policies blocking access</li>
                <li>Restart the Vite server after making changes to environment variables</li>
              </ol>
            </div>
            
            <div className="p-3 bg-yellow-100 rounded border border-yellow-400">
              <h3 className="font-semibold">Current Environment:</h3>
              <ul className="mt-2 space-y-1">
                <li><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'Not defined'}</li>
                <li><strong>Supabase Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Defined' : '✗ Missing'}</li>
                <li><strong>Authenticated User ID Used:</strong> Yes (if logged in)</li>
                <li><strong>Development Mode:</strong> {import.meta.env.DEV ? 'Yes' : 'No'}</li>
              </ul>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 max-w-4xl mx-auto bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-4 text-blue-900">Supabase Connection Test</h1>
        
        <div className="mb-6 p-5 bg-white border-l-4 border-green-500 rounded-lg shadow-sm">
          <p className="font-semibold text-green-700 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Connected to Supabase successfully!
          </p>
          <p className="mt-2 text-gray-600">Using user ID: <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">{userId}</code></p>
        </div>
        
        {/* Database Tables Section */}
        <div className={`mb-6 p-5 bg-white border-l-4 rounded-lg shadow-sm ${tablesStatus.missing.length === 0 ? 'border-green-500' : 'border-red-500'}`}>
          <h2 className={`text-lg font-semibold flex items-center ${tablesStatus.missing.length === 0 ? 'text-green-700' : 'text-red-700'}`}>
            {tablesStatus.missing.length === 0 ? (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Database Tables: All Required Tables Exist
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Database Tables: Missing Required Tables
              </>
            )}
          </h2>
          
          <div className="mt-4">
            <h3 className="font-medium text-gray-700">Available Tables:</h3>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {tablesStatus.available.map(table => (
                <div key={table} className="flex items-center p-2 bg-gray-50 rounded-md">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                  <code className="font-mono text-sm">{table}</code>
                </div>
              ))}
            </div>
          </div>
          
          {tablesStatus.missing.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium text-red-700">Missing Tables:</h3>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {tablesStatus.missing.map(table => (
                  <div key={table} className="flex items-center p-2 bg-red-50 rounded-md">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                    <code className="font-mono text-sm">{table}</code>
                  </div>
                ))}
              </div>
              
              <div className="mt-5 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-md">
                <p className="font-semibold text-amber-800">Solution:</p>
                <p className="mt-2 text-gray-700">The required database tables are missing from your Supabase project. You need to:</p>
                <ol className="list-decimal pl-5 mt-3 space-y-2 text-gray-700">
                  <li>Run the database setup scripts to create the required tables</li>
                  <li>Or set <code className="bg-white px-2 py-0.5 rounded font-mono text-sm">VITE_USE_MOCK_DATA=true</code> in your <code className="bg-white px-2 py-0.5 rounded font-mono text-sm">.env</code> file to use mock data</li>
                </ol>
              </div>
            </div>
          )}
        </div>
        
        {/* Workout Data Section */}
        <div className="mb-6 p-5 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">Workout Data Integration</h2>
          <p className="mt-1 text-gray-600 mb-4">Displaying workout data for user ID: <code className="bg-blue-50 px-2 py-1 rounded text-blue-800 font-mono text-sm">{userId}</code></p>
          
          <div className="mt-6 border-t border-gray-100 pt-6">
            <SimpleWorkoutDisplay />
          </div>
        </div>
        
        {/* Environment Info Section */}
        <div className="mb-6 p-5 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Environment Information</h2>
          <div className="mt-3 space-y-3 text-gray-700">
            <div className="flex items-start">
              <div className="w-32 font-medium">Supabase URL:</div>
              <div className="flex-1 font-mono text-sm bg-gray-50 p-2 rounded">{import.meta.env.VITE_SUPABASE_URL}</div>
            </div>
            <div className="flex items-center">
              <div className="w-32 font-medium">Mock Data:</div>
              <div className="flex-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${import.meta.env.VITE_USE_MOCK_DATA === 'true' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                  {import.meta.env.VITE_USE_MOCK_DATA === 'true' ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  );
}