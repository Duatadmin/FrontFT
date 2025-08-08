import { createClient } from '@supabase/supabase-js';
import { Database } from './schema.types'; // Ensure schema.types.ts is at src/lib/supabase/schema.types.ts

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = 'Missing Supabase browser client credentials. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.';
  console.error(errorMessage);
  throw new Error(errorMessage);
}

export const supabase = createClient<Database>(
  supabaseUrl as string,
  supabaseAnonKey as string
);
