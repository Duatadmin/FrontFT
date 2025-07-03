import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function CheckoutCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center items-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Payment Cancelled</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground">
              Your payment process was cancelled. You have not been charged.
            </p>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full font-semibold"
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}