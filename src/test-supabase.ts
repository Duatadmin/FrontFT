/**
 * Test file to verify Supabase connection
 */
import { supabase } from './lib/supabase/client';

// Log Supabase configuration
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase key length:', import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0);

// Test user ID
const TEST_USER_ID = '792ee0b8-5ba2-40a5-8f35-ab1bff798908';

// Function to test Supabase connection
async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test connection by fetching user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', TEST_USER_ID);
    
    if (userError) {
      console.error('Error fetching user data:', userError);
      return;
    }
    
    console.log('User data:', userData);
    
    // Test fetching workout sessions
    const { data: workouts, error: workoutsError } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', TEST_USER_ID);
    
    if (workoutsError) {
      console.error('Error fetching workout data:', workoutsError);
      return;
    }
    
    console.log('Found', workouts?.length || 0, 'workout sessions');
    if (workouts && workouts.length > 0) {
      console.log('First workout:', workouts[0]);
    }
    
    // Test fetching training plans
    const { data: plans, error: plansError } = await supabase
      .from('training_plans')
      .select('*')
      .eq('user_id', TEST_USER_ID);
    
    if (plansError) {
      console.error('Error fetching training plans:', plansError);
      return;
    }
    
    console.log('Found', plans?.length || 0, 'training plans');
    
    // Test fetching goals
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', TEST_USER_ID);
    
    if (goalsError) {
      console.error('Error fetching goals:', goalsError);
      return;
    }
    
    console.log('Found', goals?.length || 0, 'goals');
  } catch (error) {
    console.error('Unexpected error during Supabase tests:', error);
  }
}

// Execute the test
testSupabaseConnection();

export {}; // Required for TypeScript modules
