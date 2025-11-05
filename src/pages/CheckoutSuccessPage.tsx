import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useInvalidateSubscription } from '@/hooks/useSubscriptionQuery';

import { CheckCircle2, LoaderCircle } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const invalidateSubscription = useInvalidateSubscription();

  useEffect(() => {
    // Simple redirect after checkout - no complex dependencies
    console.log('[CheckoutSuccessPage] Payment completed, waiting for webhook...');
    
    // Invalidate the subscription cache so it will refetch fresh data
    invalidateSubscription();
    
    // Set a simple timer to redirect
    const timer = setTimeout(() => {
      console.log('[CheckoutSuccessPage] Redirecting to app with checkout flag...');
      // Navigate with a query parameter to bypass initial subscription check
      navigate('/?from=checkout', { replace: true });
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []); // Empty dependency array - only run once on mount

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