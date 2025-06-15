import { createClient } from '@supabase/supabase-js';

// --- Configuration - Adjust these as needed ---
const LOCAL_SUPABASE_URL = 'http://127.0.0.1:54321';
const LOCAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Replace with credentials for a user that EXISTS in your LOCAL Supabase database
const USER_EMAIL = 'maximilianrozenberg@gmail.com'; 
const USER_PASSWORD = 'Maxim!1990'; // Make sure this is the correct password for the local user
// -------

async function getLocalAccessToken() {
  console.log('Attempting to connect to local Supabase at:', LOCAL_SUPABASE_URL);
  const supabase = createClient(LOCAL_SUPABASE_URL, LOCAL_SUPABASE_ANON_KEY);

  console.log(`Attempting to sign in as: ${USER_EMAIL}`);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: USER_EMAIL,
    password: USER_PASSWORD,
  });

  if (error) {
    console.error('Error signing in to local Supabase:');
    console.error('Status:', error.status);
    console.error('Message:', error.message);
    if (error.status === 400 && error.message.toLowerCase().includes('invalid login credentials')) {
      console.error('\n>>> VERIFICATION NEEDED <<<');
      console.error(`>>> Please ensure the user '${USER_EMAIL}' exists in your LOCAL Supabase instance (Studio URL: http://127.0.0.1:54323) and the password is correct.`);
      console.error('>>> You might need to create this user or reset their password in the local Supabase Studio under Authentication -> Users.');
    }
    return null;
  }

  if (data && data.session && data.session.access_token) {
    console.log('\n--- LOCAL SUPABASE ACCESS TOKEN ---');
    console.log(data.session.access_token);
    console.log('-----------------------------------');
    console.log('\nCopy the token above and provide it for the curl command.');
    return data.session.access_token;
  } else {
    console.error('Could not retrieve access token. Response data:', data);
    return null;
  }
}

getLocalAccessToken();
