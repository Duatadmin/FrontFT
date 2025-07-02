import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const syncAndRedirect = async () => {
      try {
        // Refresh the session to get updated user metadata
        await supabase.auth.refreshSession();
        
        const { data: { session } } = await supabase.auth.getSession();
        const bannedUntil = (session?.user.user_metadata as any)?.banned_until;
        const banned = bannedUntil && new Date(bannedUntil) > new Date();

        if (!banned || new Date(bannedUntil) <= new Date()) {
          // User is unbanned, redirect to app
          navigate('/app', { replace: true });
        } else {
          // Rare latency case: subscribe for unban update
          const uid = session?.user.id;
          if (uid) {
            supabase
              .channel('unban')
              .on(
                'postgres_changes',
                { 
                  event: 'UPDATE', 
                  schema: 'auth', 
                  table: 'users', 
                  filter: `id=eq.${uid}` 
                },
                async () => {
                  await supabase.auth.refreshSession();
                  navigate('/app', { replace: true });
                }
              )
              .subscribe();
          }
        }
      } catch (error) {
        console.error('Error syncing subscription status:', error);
        // On error, still try to redirect after a delay
        setTimeout(() => navigate('/app', { replace: true }), 2000);
      }
    };

    syncAndRedirect();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Successful!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your subscription is now active. Redirecting you to the app...
          </p>
        </div>
      </div>
    </div>
  );
}