/**
 * Test file to verify Supabase connection
 */
import { supabase } from './lib/supabase';

// Log Supabase configuration
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase key length:', import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0);

// Test user ID
import { useUserStore } from '@/lib/stores/useUserStore';
const userId = useUserStore.getState().user?.id;
if (!userId) throw new Error('Missing userId in test context');

// Function to test Supabase connection
async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test connection by fetching user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId);
    
    if (userError) {
      console.error('Error fetching user data:', userError);
      return;
    }
    
    console.log('User data:', userData);
    
    // Test fetching workout sessions
    const { data: workouts, error: workoutsError } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId);
    
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
      .eq('user_id', userId);
    
    if (plansError) {
      console.error('Error fetching training plans:', plansError);
      return;
    }
    
    console.log('Found', plans?.length || 0, 'training plans');
    
    // Test fetching goals
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId);
    
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
