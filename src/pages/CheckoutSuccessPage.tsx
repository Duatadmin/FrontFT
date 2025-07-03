import { useEffect } from 'react';
import { motion } from 'framer-motion';
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
            <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[480px] rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl"
      >
                <div className="flex flex-col items-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10 mb-5">
                        <CheckCircle2 className="h-10 w-10 text-green-400" />
          </div>
                    <h1 className="font-title text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-300">Payment Successful!</h1>
                    <p className="text-neutral-300 mt-3 text-lg">
            Your subscription is now active. You will be redirected shortly.
          </p>
                    <div className="mt-8 flex items-center justify-center text-neutral-400">
                        <LoaderCircle className="mr-3 h-5 w-5 animate-spin" />
            Redirecting...
          </div>
                </div>
      </motion.div>
    </div>
  );
}