import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

import { CheckCircle2, LoaderCircle } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const syncAndRedirect = async () => {
      try {
        console.log('[CheckoutSuccessPage] Payment completed, refreshing session...');
        
        // Refresh the session to get any updated information
        await supabase.auth.refreshSession();
        
        // Wait a moment for the webhook to process and update the subscription
        await new Promise(resolve => setTimeout(resolve, 3000));
        
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
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-[440px] rounded-[12px] bg-[#1d1d1d] p-8 shadow-xl shadow-orange-700/15">
        <div className="flex flex-col items-center text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-900/50 mb-4 border border-green-700">
            <CheckCircle2 className="h-10 w-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Payment Successful!</h1>
          <p className="text-neutral-400 mt-2">
            Your subscription is now active. You will be redirected shortly.
          </p>
          <div className="mt-6 flex items-center justify-center text-neutral-500">
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            Redirecting...
          </div>
        </div>
      </div>
    </div>
  );
}