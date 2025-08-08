import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '@/lib/stores/useUserStore';
import { createCheckoutSession, redirectToCheckout } from '@/lib/utils/subscription';
import { Button } from '@/components/ui/Button';
import { Check, CircleAlert, LoaderCircle, Lock, CreditCard, Sparkles, Shield, TrendingUp } from 'lucide-react';
import ShinyText from '@/components/ShinyText/ShinyText';

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
      const { url, error: checkoutError } = await createCheckoutSession(user);
      
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
      const { error: redirectError } = await redirectToCheckout(url);
      
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
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Subtle background orbs matching onboarding */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-accent-lime/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-accent-orange/20 blur-[90px]" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.03] blur-2xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full"
        >
          {/* Premium card with gradient stroke */}
          <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-accent-lime/30 via-white/10 to-accent-orange/30 shadow-2xl shadow-black/40">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10 backdrop-blur-xl">
              {/* Header */}
              <div className="mb-6 flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-accent-lime/25 blur-lg" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5">
                    <Lock className="h-6 w-6 text-accent-lime" />
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-full border border-accent-lime/30 bg-accent-lime/15 px-3 py-1 text-xs font-medium text-accent-lime">
                  <Sparkles className="h-3.5 w-3.5" />
                  Premium
                </div>
              </div>

              <div className="mb-3">
                <ShinyText text="Subscription Required" className="text-[28px] md:text-5xl font-extrabold tracking-tight text-white" />
              </div>
              <p className="text-base text-neutral-300">
                Unlock AI-powered coaching, personalized training plans, and advanced analytics.
              </p>

              {/* Divider */}
              <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Benefits */}
              <div className="rounded-2xl border border-white/10 bg-black/25 p-5 md:p-6">
                <h3 className="font-title mb-4 text-lg font-semibold text-white">What you get</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[ 
                    'Personalized workout programs', 
                    'Adaptive plans that evolve with you', 
                    'Advanced analytics & insights', 
                    'Priority support & early features' 
                  ].map((label, i) => (
                    <motion.div 
                      key={label} 
                      initial={{ opacity: 0, y: 6 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: 0.05 * i }}
                      className="flex items-start"
                    >
                      <Check className="mr-3 mt-1 h-5 w-5 shrink-0 text-accent-lime" />
                      <span className="text-neutral-300">{label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-6 flex items-center rounded-lg border border-red-500/40 bg-red-900/50 px-4 py-3 text-sm text-red-200">
                  <CircleAlert className="mr-3 h-4 w-4" />
                  <p>{error}</p>
                </div>
              )}

              {/* CTA with glow */}
              <div className="group relative mt-6">
                <div className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-accent-lime/40 to-accent-orange/40 opacity-50 blur transition-opacity group-hover:opacity-70" />
                <Button
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  className="relative w-full rounded-2xl bg-gradient-to-r from-accent-lime to-accent-orange text-dark-bg font-title font-semibold ring-1 ring-white/10 transition-all hover:shadow-[0_20px_40px_-16px_rgba(163,230,53,0.35)]"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Upgrade to Premium
                    </>
                  )}
                </Button>
                <p className="mt-3 text-center text-xs text-neutral-500">Secure payments powered by Stripe</p>
              </div>

              {/* Highlights row */}
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
                  <TrendingUp className="h-4 w-4 text-accent-lime" />
                  <div>
                    <p className="text-xs font-semibold text-white">Faster Progress</p>
                    <p className="text-xs text-neutral-300">Plans that adapt weekly.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
                  <Shield className="h-4 w-4 text-accent-orange" />
                  <div>
                    <p className="text-xs font-semibold text-white">Safe & Supported</p>
                    <p className="text-xs text-neutral-300">Guidance when you need it.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
                  <Sparkles className="h-4 w-4 text-accent-lime" />
                  <div>
                    <p className="text-xs font-semibold text-white">Early Access</p>
                    <p className="text-xs text-neutral-300">Try new AI features first.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}