import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPortalFunction() {
  try {
    console.log('🔐 Checking authentication...');
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Not authenticated. Please log in first.');
      console.log('You can log in via the app at http://localhost:5173');
      return;
    }
    
    console.log('✅ Authenticated as:', user.email);
    console.log('\n📋 Testing portal session creation...');
    
    // Test the edge function
    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: { 
        returnUrl: 'http://localhost:5173/profile' 
      },
    });
    
    if (error) {
      console.error('❌ Edge function error:', error);
      return;
    }
    
    if (data?.needsSubscription) {
      console.log('⚠️ No subscription found for this user');
      console.log('   The user needs to subscribe first');
      return;
    }
    
    if (data?.url) {
      console.log('✅ Portal session created successfully!');
      console.log('   Portal URL:', data.url);
      console.log('\nYou can now use this URL to manage your subscription.');
    } else {
      console.error('❌ Unexpected response:', data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPortalFunction();