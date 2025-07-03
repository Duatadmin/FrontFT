import { useState } from 'react';
import { useUserStore } from '@/lib/stores/useUserStore';
import { SubscriptionService } from '@/lib/services/subscriptionService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
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
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Subscription Required</CardTitle>
            <CardDescription className="text-muted-foreground">
              Unlock all features by subscribing to our premium plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-foreground mb-3">Premium Access Includes:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
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
              <Alert variant="destructive">
                <CircleAlert className="h-4 w-4" />
                <p>{error}</p>
              </Alert>
            )}

            <Button 
              onClick={handleSubscribe} 
              disabled={isLoading} 
              className="w-full font-semibold"
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

            <p className="text-xs text-center text-muted-foreground">
              Secure payment processing by Stripe
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}