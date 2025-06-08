import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'; // Pinned version
import { createServerClient, parse, serialize } from 'npm:@supabase/ssr';

serve(async (req) => {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');
  // Determine the redirect URL after login, default to '/' or a path from 'next'
  const nextParam = requestUrl.searchParams.get('next');
  let redirectTo = '/'; // Default redirect
  if (nextParam) {
    // Ensure 'next' is a relative path starting with '/' or a full URL for safety
    if (nextParam.startsWith('/')) {
      redirectTo = nextParam;
    } else {
      try {
        const nextUrl = new URL(nextParam);
        // Allow redirection only to the same origin as the request or a configured app URL
        // For simplicity here, we'll assume relative paths are intended for the main app.
        // More robust validation might be needed depending on security requirements.
        if (nextUrl.origin === requestUrl.origin || nextParam.startsWith('/')) {
            redirectTo = nextParam;
        }
      } catch (_) {
        // Invalid URL in 'next', ignore and use default
      }
    }
  }

  // Prepare a response object. We'll modify its headers for cookies and location.
  const response = new Response(null, {
    status: 302, // Temporary redirect
    headers: {
      Location: redirectTo, // Initial location, might be updated on error
    },
  });

  if (code) {
    const supabase = createServerClient(
      Deno.env.get('SUPABASE_URL')!,       // Use standard env var names
      Deno.env.get('SUPABASE_ANON_KEY')!,  // Use standard env var names
      {
        cookies: {
          get(key) {
            const cookies = parse(req.headers.get('Cookie') ?? '');
            return cookies[key];
          },
          set(key, value, options) {
            const cookie = serialize(key, value, options);
            response.headers.append('Set-Cookie', cookie);
          },
          remove(key, options) {
            const cookie = serialize(key, '', options);
            response.headers.append('Set-Cookie', cookie);
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error.message);
      // Redirect to login page with error
      // Construct a safe error redirect URL, assuming login is at '/login' on the same host
      const errorRedirectUrl = new URL(requestUrl.origin);
      errorRedirectUrl.pathname = '/login'; // Or your specific login/error page
      errorRedirectUrl.searchParams.set('error', 'Authentication failed: ' + error.message);
      response.headers.set('Location', errorRedirectUrl.toString());
      return response;
    }
    // If successful, cookies are set by supabase.auth.exchangeCodeForSession via the helpers
    // and the response will redirect to 'redirectTo' (e.g., '/' or 'next' parameter)
    return response;
  }

  // If no code is present, redirect to login with an error
  console.error('No authentication code provided.');
  const noCodeRedirectUrl = new URL(requestUrl.origin);
  noCodeRedirectUrl.pathname = '/login';
  noCodeRedirectUrl.searchParams.set('error', 'Authentication failed: No code provided.');
  response.headers.set('Location', noCodeRedirectUrl.toString());
  return response;
});