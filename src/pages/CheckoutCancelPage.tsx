import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';
import ShinyText from '@/components/ShinyText/ShinyText';
import Logo from '../../assets/Logo.svg?react';

export default function CheckoutCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-dark-bg">
      {/* Animated gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          <defs>
            <filter id="cancel-glow">
              <feGaussianBlur stdDeviation="40" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="cancel-grad1">
              <stop offset="0%" stopColor="#DFF250" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#DFF250" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="cancel-grad2">
              <stop offset="0%" stopColor="#F2A03D" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#F2A03D" stopOpacity="0" />
            </radialGradient>
          </defs>
          <motion.circle
            cx="25%"
            cy="20%"
            r="300"
            fill="url(#cancel-grad1)"
            filter="url(#cancel-glow)"
            animate={{ cx: ['25%', '75%', '25%'], cy: ['20%', '70%', '20%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="75%"
            cy="80%"
            r="400"
            fill="url(#cancel-grad2)"
            filter="url(#cancel-glow)"
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
                {/* Cancel icon */}
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-accent-orange/30 bg-accent-orange/10 mb-5">
                  <XCircle className="h-10 w-10 text-accent-orange" />
                </div>

                <div className="mb-2">
                  <ShinyText
                    text="Payment Cancelled"
                    className="text-[26px] sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white"
                  />
                </div>
                <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                  Your payment was cancelled. You have not been charged.
                </p>

                {/* CTA with glow */}
                <div className="group relative mt-8 w-full">
                  <div className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-accent-lime/40 to-accent-orange/40 opacity-50 blur transition-opacity group-hover:opacity-70" />
                  <Button
                    onClick={() => navigate('/')}
                    className="relative w-full rounded-2xl bg-gradient-to-r from-accent-lime to-accent-orange text-dark-bg font-title font-semibold ring-1 ring-white/10 transition-all hover:shadow-[0_20px_40px_-16px_rgba(163,230,53,0.35)]"
                    size="lg"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Go to Homepage
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
