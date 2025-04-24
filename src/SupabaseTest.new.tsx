import React, { useState, useEffect } from 'react';
import { supabase, getCurrentUserId, checkRequiredTables } from './lib/supabase/client';
import MainLayout from './components/layout/MainLayout';

// Test user ID
const TEST_USER_ID = '792ee0b8-5ba2-40a5-8f35-ab1bff798908';

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
        
        // Check basic connectivity
        const { data, error } = await supabase.from('pg_catalog.pg_tables').select('tablename').limit(1);
        
        if (error) {
          console.error('Supabase connection error:', error);
          setIsConnected(false);
          setError(`Connection error: ${error.message}`);
        } else {
          setIsConnected(true);
          
          // Get current user ID
          const uid = await getCurrentUserId();
          setUserId(uid || TEST_USER_ID);
          
          // Check required tables
          const tablesExist = await checkRequiredTables();
          
          // Get list of all tables in the database
          const { data: tableData } = await supabase
            .from('pg_catalog.pg_tables')
            .select('tablename, schemaname')
            .or('schemaname.eq.public,schemaname.eq.auth');
          
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
              console.log(`Found ${count} workouts for user ${uid}`);
              
              // Get 5 most recent workouts
              const { data: workouts, error: workoutsError } = await supabase
                .from('workout_sessions')
                .select('*')
                .eq('user_id', uid)
                .order('completed_at', { ascending: false })
                .limit(5);
              
              if (workoutsError) {
                console.error('Error fetching workouts:', workoutsError);
              } else {
                console.log('Recent workouts:', workouts);
                setWorkoutData({
                  count: count || 0,
                  recentWorkouts: workouts || []
                });
              }
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
                <li>Verify the test user ID exists in your Supabase database: <code>{TEST_USER_ID}</code></li>
                <li>Check if there are Row Level Security (RLS) policies blocking access</li>
                <li>Restart the Vite server after making changes to environment variables</li>
              </ol>
            </div>
            
            <div className="p-3 bg-yellow-100 rounded border border-yellow-400">
              <h3 className="font-semibold">Current Environment:</h3>
              <ul className="mt-2 space-y-1">
                <li><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'Not defined'}</li>
                <li><strong>Supabase Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Defined' : '✗ Missing'}</li>
                <li><strong>Test User ID:</strong> {TEST_USER_ID}</li>
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
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
        
        <div className="mb-6 p-3 bg-green-100 border border-green-400 rounded">
          <p className="font-semibold text-green-800">✅ Connected to Supabase successfully!</p>
          <p className="mt-1 text-green-700">Using user ID: <code className="bg-green-50 px-1 rounded">{userId}</code></p>
        </div>
        
        {/* Database Tables Section */}
        <div className="mb-6 p-3 border rounded" style={{ 
          backgroundColor: tablesStatus.missing.length === 0 ? '#f0fff4' : '#fff5f5', 
          borderColor: tablesStatus.missing.length === 0 ? '#68d391' : '#fc8181' 
        }}>
          <h2 className="text-lg font-semibold" style={{ 
            color: tablesStatus.missing.length === 0 ? '#2f855a' : '#c53030' 
          }}>
            {tablesStatus.missing.length === 0 
              ? '✅ Database Tables: All Required Tables Exist' 
              : '❌ Database Tables: Missing Required Tables'}
          </h2>
          
          <div className="mt-3">
            <h3 className="font-medium">Available Tables:</h3>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {tablesStatus.available.map(table => (
                <div key={table} className="flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  <code className="bg-gray-100 px-1 rounded text-sm">{table}</code>
                </div>
              ))}
            </div>
          </div>
          
          {tablesStatus.missing.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium text-red-700">Missing Tables:</h3>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {tablesStatus.missing.map(table => (
                  <div key={table} className="flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                    <code className="bg-gray-100 px-1 rounded text-sm">{table}</code>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
                <p className="font-semibold">Solution:</p>
                <p className="mt-1">The required database tables are missing from your Supabase project. You need to:</p>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                  <li>Run the database setup scripts to create the required tables</li>
                  <li>Or set <code>VITE_USE_MOCK_DATA=true</code> in your <code>.env</code> file to use mock data</li>
                </ol>
              </div>
            </div>
          )}
        </div>
        
        {/* Workout Data Section */}
        {workoutData.count > 0 && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-300 rounded">
            <h2 className="text-lg font-semibold text-blue-800">Workout Data</h2>
            <p className="mt-1">Found {workoutData.count} workouts for user ID: <code className="bg-blue-100 px-1 rounded">{userId}</code></p>
            
            <h3 className="font-medium mt-3 mb-2">Recent Workouts:</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Focus Area</th>
                    <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {workoutData.recentWorkouts.map((workout: any) => (
                    <tr key={workout.id} className="hover:bg-gray-50">
                      <td className="py-2 px-3 border-b text-sm">
                        {new Date(workout.completed_at || workout.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-3 border-b text-sm">{workout.focus_area}</td>
                      <td className="py-2 px-3 border-b text-sm">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          workout.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {workout.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 border-b text-sm">
                        {workout.metrics && typeof workout.metrics === 'object' 
                          ? (workout.metrics.total_volume || 'N/A')
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Environment Info Section */}
        <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded">
          <h2 className="text-lg font-semibold">Environment Information</h2>
          <div className="mt-2 space-y-1">
            <p><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL}</p>
            <p><strong>Mock Data:</strong> {import.meta.env.VITE_USE_MOCK_DATA === 'true' ? 'Enabled' : 'Disabled'}</p>
            <p><strong>Test User ID:</strong> {TEST_USER_ID}</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
