import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useInvalidateSubscription } from '@/hooks/useSubscriptionQuery';
import { CheckCircle2, LoaderCircle } from 'lucide-react';
import ShinyText from '@/components/ShinyText/ShinyText';
import Logo from '../../assets/Logo.svg?react';

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const invalidateSubscription = useInvalidateSubscription();

  useEffect(() => {
    console.log('[CheckoutSuccessPage] Payment completed, waiting for webhook...');
    invalidateSubscription();

    const timer = setTimeout(() => {
      console.log('[CheckoutSuccessPage] Redirecting to app with checkout flag...');
      navigate('/?from=checkout', { replace: true });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-dark-bg">
      {/* Animated gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          <defs>
            <filter id="success-glow">
              <feGaussianBlur stdDeviation="40" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="success-grad1">
              <stop offset="0%" stopColor="#DFF250" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#DFF250" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="success-grad2">
              <stop offset="0%" stopColor="#F2A03D" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#F2A03D" stopOpacity="0" />
            </radialGradient>
          </defs>
          <motion.circle
            cx="25%"
            cy="20%"
            r="300"
            fill="url(#success-grad1)"
            filter="url(#success-glow)"
            animate={{ cx: ['25%', '75%', '25%'], cy: ['20%', '70%', '20%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="75%"
            cy="80%"
            r="400"
            fill="url(#success-grad2)"
            filter="url(#success-glow)"
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
          <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-accent-lime/30 via-white/10 to-accent-orange/30 shadow-2xl shadow-black/40">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-xl">
              {/* Logo */}
              <div className="mb-5">
                <Logo className="h-20 w-20 text-accent-lime" />
              </div>

              <div className="flex flex-col items-center text-center">
                {/* Success icon */}
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-accent-lime/30 bg-accent-lime/10 mb-5">
                  <CheckCircle2 className="h-10 w-10 text-accent-lime" />
                </div>

                <div className="mb-2">
                  <ShinyText
                    text="Payment Successful!"
                    className="text-[26px] sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white"
                  />
                </div>
                <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                  Your subscription is now active. You will be redirected shortly.
                </p>

                <div className="mt-8 flex items-center justify-center text-neutral-500">
                  <LoaderCircle className="mr-3 h-5 w-5 animate-spin" />
                  Redirecting...
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
