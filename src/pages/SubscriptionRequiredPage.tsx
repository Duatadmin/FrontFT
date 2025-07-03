import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '@/lib/stores/useUserStore';
import { SubscriptionService } from '@/lib/services/subscriptionService';
import { Button } from '@/components/ui/Button';
import { Check, CircleAlert, LoaderCircle, Lock, CreditCard } from 'lucide-react';

export default function SubscriptionRequiredPage() {
  const { user } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    if (!user) {
      setError('Please log in to subscribe');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[SubscriptionRequiredPage] Creating checkout session...');
      const { url, error: checkoutError } = await SubscriptionService.createCheckoutSession(user);
      
      if (checkoutError) {
        console.error('[SubscriptionRequiredPage] Checkout error:', checkoutError);
        setError(checkoutError);
        return;
      }

      if (!url) {
        setError('Failed to create checkout session');
        return;
      }

      console.log('[SubscriptionRequiredPage] Redirecting to checkout...');
      const { error: redirectError } = await SubscriptionService.redirectToCheckout(url);
      
      if (redirectError) {
        console.error('[SubscriptionRequiredPage] Redirect error:', redirectError);
        setError(redirectError);
      }
    } catch (err) {
      console.error('[SubscriptionRequiredPage] Unexpected error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
            <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[480px] rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl"
      >
                <div className="mb-8 flex flex-col items-center gap-3 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/10">
                        <Lock className="h-7 w-7 text-orange-400" />
          </div>
                    <h1 className="font-title text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-300">Subscription Required</h1>
          <p className="text-neutral-400">
                        Unlock all features by subscribing to the premium plan.
          </p>
        </div>

        <div className="space-y-6">
                    <div className="rounded-lg border border-white/10 bg-black/20 p-5">
                        <h3 className="font-title text-xl font-semibold text-white mb-4">Premium Access Includes:</h3>
                        <ul className="space-y-3 text-base text-neutral-300">
              <li className="flex items-start">
                <Check className="h-5 w-5 shrink-0 text-orange-400 mr-3 mt-1" />
                <span>Full access to all workout programs</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 shrink-0 text-orange-400 mr-3 mt-1" />
                <span>Advanced analytics and progress tracking</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 shrink-0 text-orange-400 mr-3 mt-1" />
                <span>Priority email and chat support</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 shrink-0 text-orange-400 mr-3 mt-1" />
                <span>Exclusive access to new features</span>
              </li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm flex items-center">
              <CircleAlert className="h-4 w-4 mr-3" />
              <p>{error}</p>
            </div>
          )}

          <Button 
            onClick={handleSubscribe} 
            disabled={isLoading} 
            className="w-full font-title font-semibold bg-orange-600 hover:bg-orange-500 text-white transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-600/20"
            style={{ borderRadius: '10px' }}
            size="lg"
          >
            {isLoading ? (
              <>
                <LoaderCircle className="h-5 w-5 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Upgrade to Premium
              </>
            )}
          </Button>

          <p className="text-center text-xs text-neutral-500 mt-6">
            Secure payment processing by Stripe
          </p>
        </div>
      </motion.div>
    </div>
);
}