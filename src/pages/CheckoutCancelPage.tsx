import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function CheckoutCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
            <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[480px] rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl"
      >
        <div className="flex flex-col items-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 mb-5">
            <XCircle className="h-10 w-10 text-red-400" />
          </div>
                    <h1 className="font-title text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-300">Payment Cancelled</h1>
                    <p className="text-neutral-300 mt-3 text-lg">
            Your payment process was cancelled. You have not been charged.
          </p>
          <Button 
            onClick={() => navigate('/')} 
            className="w-full font-title font-semibold bg-orange-600 hover:bg-orange-500 text-white transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-600/20 mt-8"
            style={{ borderRadius: '10px' }}
            size="lg"
          >
                        <ArrowLeft className="mr-2 h-5 w-5" />
            Go to Homepage
          </Button>
                </div>
      </motion.div>
    </div>
  );
}