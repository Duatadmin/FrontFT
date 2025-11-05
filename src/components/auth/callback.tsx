import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase'; // Updated to use the shared client

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');

      if (code) {
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error('Error exchanging code for session:', error.message);
            navigate('/login', { replace: true });
            return;
          }

          if (data && data.session) {
            // Session established. The onAuthStateChange listener in useUserStore should pick this up.
            console.log('AuthCallback: Session successfully established, navigating to /');
            navigate('/', { replace: true }); // Or '/dashboard' or other appropriate route
          } else {
            // No session found after exchange, possibly an old or invalid link.
            console.warn('AuthCallback: No session data found after exchange. Navigating to login.');
            navigate('/login', { replace: true });
          }
        } catch (e) {
          // Catch any unexpected errors during the process
          console.error('Unexpected error in auth callback handler:', e);
          navigate('/login', { replace: true });
        }
      } else {
        // No code found in URL parameters.
        console.warn('AuthCallback: No code found in URL. Navigating to login.');
        navigate('/login', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-text-secondary">Finalizing authentication... Please wait.</div>
    </div>
  );
}