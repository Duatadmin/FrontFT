import { useSubscription, usePremiumAccess } from '@/hooks/useSubscription';
import { useSubscriptionStore } from '@/lib/stores/useSubscriptionStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SubscriptionGateV2 } from '@/components/auth/SubscriptionGateV2';

/**
 * Test page for the new simplified subscription system
 * Compare this with the old system to verify functionality
 */
export default function TestSubscriptionV2() {
  const subscription = useSubscription();
  const premium = usePremiumAccess();
  const store = useSubscriptionStore();

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Subscription System V2 Test</h1>
      
      {/* Status Overview */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Current Status</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Authentication</p>
            <p className="font-medium">
              {subscription.isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Subscription</p>
            <p className="font-medium">
              {subscription.isLoading ? '⏳ Loading...' : 
               subscription.isActive ? '✅ Active' : '❌ Inactive'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Premium Access</p>
            <p className="font-medium">
              {premium.hasPremium ? '✅ Has Premium' : 
               premium.needsAuth ? '🔐 Needs Auth' : 
               premium.needsSubscription ? '💳 Needs Subscription' : '⏳ Checking...'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Store Status</p>
            <p className="font-medium">{store.status}</p>
          </div>
        </div>
        
        {subscription.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700">Error: {subscription.error}</p>
          </div>
        )}
      </Card>

      {/* Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        <div className="flex gap-3">
          <Button 
            onClick={() => subscription.refetch()}
            disabled={subscription.isLoading}
          >
            Refetch Status
          </Button>
          <Button 
            onClick={() => subscription.invalidate()}
            variant="outline"
          >
            Clear Cache & Refetch
          </Button>
          <Button 
            onClick={() => store.reset()}
            variant="outline"
          >
            Reset Store
          </Button>
        </div>
      </Card>

      {/* Debug Info */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
        <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
          {JSON.stringify({
            subscription: {
              isActive: subscription.isActive,
              isLoading: subscription.isLoading,
              hasError: subscription.hasError,
              isAuthenticated: subscription.isAuthenticated,
              userId: subscription.user?.id,
            },
            store: {
              status: store.status,
              error: store.error,
              lastChecked: store.lastChecked ? new Date(store.lastChecked).toISOString() : null,
            },
            premium: {
              hasPremium: premium.hasPremium,
              isChecking: premium.isChecking,
              needsAuth: premium.needsAuth,
              needsSubscription: premium.needsSubscription,
            }
          }, null, 2)}
        </pre>
      </Card>

      {/* Gate Test */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Subscription Gate Test</h2>
        <SubscriptionGateV2 
          fallback={<p className="text-gray-500">Loading subscription status...</p>}
        >
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-700 font-medium">
              ✅ This content is only visible with an active subscription!
            </p>
          </div>
        </SubscriptionGateV2>
      </Card>

      {/* Performance Metrics */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
        <div className="space-y-2 text-sm">
          <p>• React Query handles caching automatically (5 min stale time)</p>
          <p>• No manual cache management needed</p>
          <p>• Automatic retry with exponential backoff</p>
          <p>• Background refetch on window focus</p>
          <p>• Deduplication of simultaneous requests</p>
        </div>
      </Card>
    </div>
  );
}