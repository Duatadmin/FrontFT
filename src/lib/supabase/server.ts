import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { Database } from './schema.types'; // Ensure schema.types.ts is at src/lib/supabase/schema.types.ts

// For a Node.js server environment (e.g., Express, Fastify).
// Ensure these environment variables are loaded (e.g., via .env file and dotenv package).
// If using Vite's SSR for the callback route, import.meta.env.VITE_... might be available.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = 'Missing Supabase server client credentials. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your server environment.';
  console.error(errorMessage);
  throw new Error(errorMessage);
}

export const createSupabaseServerClient = (
  cookieMethods: {
    get: (key: string) => string | undefined | null;
    set: (key: string, value: string, options: CookieOptions) => void;
    remove: (key: string, options: CookieOptions) => void;
  }
) => {
  return createServerClient<Database>(
    supabaseUrl as string,
    supabaseAnonKey as string,
    { cookies: cookieMethods }
  );
};

// Example for Express.js:
/*
import { type Request as ExpressRequest, type Response as ExpressResponse } from 'express';

const getExpressCookieMethods = (req: ExpressRequest, res: ExpressResponse) => {
  return {
    get(key: string) { return req.cookies[key]; },
    set(key: string, value: string, options: CookieOptions) { res.cookie(key, value, options); },
    remove(key: string, options: CookieOptions) { res.clearCookie(key, options); },
  };
};

// In an Express route handler:
// import { createSupabaseServerClient } from './server'; // This file
// const supabase = createSupabaseServerClient(getExpressCookieMethods(req, res));
*/
