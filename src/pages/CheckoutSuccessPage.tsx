import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const syncAndRedirect = async () => {
      try {
        console.log('[CheckoutSuccessPage] Payment completed, refreshing session...');
        
        // Refresh the session to get any updated information
        await supabase.auth.refreshSession();
        
        // Wait a moment for the webhook to process (webhook should have updated subscription)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('[CheckoutSuccessPage] Redirecting to app...');
        navigate('/', { replace: true });
        
      } catch (error) {
        console.error('[CheckoutSuccessPage] Error during redirect:', error);
        // On error, still try to redirect after a delay
        setTimeout(() => navigate('/', { replace: true }), 3000);
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