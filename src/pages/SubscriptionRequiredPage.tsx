import { useState } from 'react';
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
      <div className="relative z-10 w-full max-w-[440px] rounded-[12px] bg-[#1d1d1d] p-8 shadow-xl shadow-orange-700/15">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-white/10 mb-4">
            <Lock className="h-6 w-6 text-[#ff6700]" />
          </div>
          <h1 className="text-3xl font-bold text-white">Subscription Required</h1>
          <p className="text-neutral-400">
            Unlock all features by subscribing to our premium plan.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Premium Access Includes:</h3>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-3" />
                Full access to all workout programs
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-3" />
                Advanced analytics and progress tracking
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-3" />
                Priority email and chat support
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-3" />
                Exclusive access to new features
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
            className="w-full font-semibold bg-[#ff6700] hover:bg-[#e65c00] text-white transition-colors duration-200"
            style={{ borderRadius: '8px' }}
            size="lg"
          >
            {isLoading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Upgrade to Premium
              </>
            )}
          </Button>

          <p className="text-xs text-center text-neutral-500">
            Secure payment processing by Stripe
          </p>
        </div>
      </div>
    </div>
  );
}