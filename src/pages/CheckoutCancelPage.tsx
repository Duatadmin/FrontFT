import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function CheckoutCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-[440px] rounded-[12px] bg-[#1d1d1d] p-8 shadow-xl shadow-orange-700/15">
        <div className="flex flex-col items-center text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-900/50 mb-4 border border-red-700">
            <XCircle className="h-10 w-10 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Payment Cancelled</h1>
          <p className="text-neutral-400 mt-2">
            Your payment process was cancelled. You have not been charged.
          </p>
          <Button 
            onClick={() => navigate('/')} 
            className="w-full font-semibold bg-[#ff6700] hover:bg-[#e65c00] text-white transition-colors duration-200 mt-6"
            style={{ borderRadius: '8px' }}
            size="lg"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
}