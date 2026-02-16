import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '@/lib/stores/useUserStore';
import { SubscriptionService } from '@/lib/services/subscriptionService';
import { Button } from '@/components/ui/button';
import {
  CircleAlert,
  LoaderCircle,
  ShieldCheck,
  Dumbbell,
  TrendingUp,
  BarChart3,
  Mic,
  Heart,
  Lock,
  XCircle,
  Zap,
} from 'lucide-react';
import ShinyText from '@/components/ShinyText/ShinyText';
import Logo from '../../assets/Logo.svg?react';

const benefits = [
  { icon: Dumbbell, label: 'Programs built for your body and goals', color: 'text-accent-lime' },
  { icon: TrendingUp, label: 'Break plateaus with plans that adapt weekly', color: 'text-accent-orange' },
  { icon: BarChart3, label: 'See exactly what works with deep analytics', color: 'text-accent-lime' },
  { icon: Mic, label: 'Voice-controlled, hands-free workouts', color: 'text-accent-orange' },
  { icon: Heart, label: 'Recovery insights to train smarter', color: 'text-accent-lime' },
];

const trustSignals = [
  { icon: XCircle, label: 'Cancel anytime' },
  { icon: ShieldCheck, label: '30-day money-back' },
  { icon: Lock, label: 'Secure via Stripe' },
];

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
    <div className="relative min-h-screen w-full overflow-hidden bg-dark-bg">
      {/* Animated gradient background — matches onboarding */}
      <div className="pointer-events-none absolute inset-0">
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          <defs>
            <filter id="sub-glow">
              <feGaussianBlur stdDeviation="40" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="sub-grad1">
              <stop offset="0%" stopColor="#DFF250" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#DFF250" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="sub-grad2">
              <stop offset="0%" stopColor="#F2A03D" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#F2A03D" stopOpacity="0" />
            </radialGradient>
          </defs>
          <motion.circle
            cx="25%"
            cy="20%"
            r="300"
            fill="url(#sub-grad1)"
            filter="url(#sub-glow)"
            animate={{ cx: ['25%', '75%', '25%'], cy: ['20%', '70%', '20%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="75%"
            cy="80%"
            r="400"
            fill="url(#sub-grad2)"
            filter="url(#sub-glow)"
            animate={{ cx: ['75%', '25%', '75%'], cy: ['80%', '30%', '80%'] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
        <div className="absolute inset-0 bg-dark-bg/30 backdrop-blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-lg items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="w-full"
        >
          {/* Premium card with gradient stroke */}
          <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-accent-lime/30 via-white/10 to-accent-orange/30 shadow-2xl shadow-black/40">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-xl">
              {/* Logo */}
              <div className="mb-5">
                <Logo className="h-20 w-20 text-accent-lime" />
              </div>

              {/* Heading */}
              <div className="mb-2">
                <ShinyText
                  text="Unlock Your Full Potential"
                  className="text-[26px] sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white"
                />
              </div>
              <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                AI-powered coaching that adapts to you — every rep, every week, every goal.
              </p>

              {/* Divider */}
              <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Benefits */}
              <div className="space-y-3">
                {benefits.map(({ icon: Icon, label, color }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 * i, type: 'spring', stiffness: 200, damping: 20 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <span className="text-sm text-neutral-300">{label}</span>
                  </motion.div>
                ))}
              </div>

              {/* Error */}
              {error && (
                <div className="mt-5 flex items-center rounded-lg border border-red-500/40 bg-red-900/50 px-4 py-3 text-sm text-red-200">
                  <CircleAlert className="mr-3 h-4 w-4 shrink-0" />
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
                      <Zap className="mr-2 h-5 w-5" />
                      Start Your Transformation
                    </>
                  )}
                </Button>
              </div>

              {/* Trust signals */}
              <div className="mt-5 flex items-center justify-center gap-4 text-[11px] text-neutral-500">
                {trustSignals.map(({ icon: Icon, label }) => (
                  <span key={label} className="flex items-center gap-1">
                    <Icon className="h-3 w-3" />
                    {label}
                  </span>
                ))}
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
