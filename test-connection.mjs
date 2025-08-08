// Simple test to verify Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://lcoxyqzpwrcagfkfurwf.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxjb3h5cXpwd3JjYWdma2Z1cndmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA1MjA3NzUsImV4cCI6MjA0NjA5Njc3NX0.-L2qWu9ku5xJvFT1J7OVzrNoAckQ_oZKGrcHQWCQPPk';

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test 1: Simple query
console.log('\nTest 1: Fetching first 5 exercises...');
const { data: exercises, error: exerciseError } = await supabase
  .from('exrcwiki')
  .select('exercise_id, name, muscle_group')
  .limit(5);

if (exerciseError) {
  console.error('Error fetching exercises:', exerciseError);
} else {
  console.log('Successfully fetched exercises:', exercises?.length);
  exercises?.forEach(e => console.log(`  - ${e.name} (${e.muscle_group})`));
}

// Test 2: Auth session
console.log('\nTest 2: Checking auth session...');
const { data: session, error: sessionError } = await supabase.auth.getSession();

if (sessionError) {
  console.error('Error getting session:', sessionError);
} else {
  console.log('Session status:', session.session ? 'Authenticated' : 'Not authenticated');
  if (session.session) {
    console.log('User ID:', session.session.user.id);
  }
}

console.log('\nAll tests completed!');
process.exit(0);