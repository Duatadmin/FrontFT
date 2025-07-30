import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface SubscriptionStatus {
  isActive: boolean;
  status: 'active' | 'inactive' | 'pending' | 'unknown';
  subscriptionId?: string;
  customerId?: string;
  error?: string;
}

export class SubscriptionService {
  /**
   * Check user's subscription status using the database view
   * 
   * NOTE: The subscription check uses two methods:
   * 1. View 'v_active_users' (primary method - always works)
   * 2. Direct table query to 'stripe_subscriptions' (fallback - may be blocked by RLS)
   * 
   * The RPC function 'is_subscription_active' is not implemented in this environment,
   * so we skip it and use the v_active_users view which is reliable and sufficient.
   */
  static async checkSubscriptionStatus(user: User): Promise<SubscriptionStatus> {
    try {
      if (!user) {
        return {
          isActive: false,
          status: 'unknown',
          error: 'No user provided'
        };
      }

      console.log('[SubscriptionService] Checking subscription for user:', user.id);

      // Skip Method 1 (RPC function) since it doesn't exist in the database
      // The v_active_users view is the primary reliable method
      
      // Method 2: Use v_active_users view (primary method)
      try {
        const { data: activeUsers, error: viewError } = await supabase
          .from('v_active_users')
          .select('user_id')
          .eq('user_id', user.id)
          .limit(1);

        if (!viewError) {
          const isActive = activeUsers && activeUsers.length > 0;
          console.log('[SubscriptionService] View check result:', isActive);

          if (isActive) {
            // Skip fetching subscription details to avoid RLS errors
            // The v_active_users view is sufficient to confirm active status
            return {
              isActive: true,
              status: 'active'
              // subscriptionId and customerId are not critical for access control
            };
          } else {
            return {
              isActive: false,
              status: 'inactive'
            };
          }
        }
      } catch (viewError) {
        console.log('[SubscriptionService] View check failed, trying direct query:', viewError);
      }

      // Method 3: Direct query fallback (matches database logic)
      const { data: subscriptions, error } = await supabase
        .from('stripe_subscriptions')
        .select('id, status, customer_id, current_period_end')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing', 'past_due'])
        .order('created', { ascending: false });

      if (error) {
        console.error('[SubscriptionService] Error querying subscriptions:', error);
        
        // If table doesn't exist or RLS blocks access, assume no subscription
        if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('permission')) {
          console.log('[SubscriptionService] Subscriptions table not accessible, user needs subscription');
          return {
            isActive: false,
            status: 'inactive',
            error: 'Subscriptions table not accessible'
          };
        }

        return {
          isActive: false,
          status: 'unknown',
          error: error.message
        };
      }

      // Check if any subscription is currently active (matches database logic)
      const now = new Date();
      const activeSubscription = subscriptions?.find(sub => 
        !sub.current_period_end || new Date(sub.current_period_end) >= now
      );

      if (activeSubscription) {
        console.log('[SubscriptionService] Active subscription found:', activeSubscription);
        return {
          isActive: true,
          status: 'active',
          subscriptionId: activeSubscription.id,
          customerId: activeSubscription.customer_id
        };
      }

      // Check for any subscription to determine precise status
      const { data: allSubscriptions } = await supabase
        .from('stripe_subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .order('created', { ascending: false })
        .limit(1);

      if (allSubscriptions && allSubscriptions.length > 0) {
        const latestStatus = allSubscriptions[0].status;
        console.log('[SubscriptionService] Found inactive subscription with status:', latestStatus);
        return {
          isActive: false,
          status: latestStatus === 'incomplete' ? 'pending' : 'inactive'
        };
      }

      console.log('[SubscriptionService] No subscription found, user needs subscription');
      return {
        isActive: false,
        status: 'inactive'
      };

    } catch (error) {
      console.error('[SubscriptionService] Unexpected error:', error);
      return {
        isActive: false,
        status: 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create a Stripe checkout session for the user
   */
  static async createCheckoutSession(
    user: User,
    couponId?: string,
  ): Promise<{ sessionId?: string; url?: string; error?: string }> {
    try {
      console.log('[SubscriptionService] Creating checkout session for user:', user.id);

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { couponId }, // Pass couponId to the edge function
      });

      if (error) {
        console.error('[SubscriptionService] Edge function error:', error);
        return { error: error.message || 'Failed to create checkout session' };
      }
      
      if (!data?.url) {
        console.error('[SubscriptionService] No checkout URL received:', data);
        return { error: 'No checkout URL received from checkout service' };
      }
      
      console.log('[SubscriptionService] Checkout session created:', data.url);
      return { url: data.url };
      
    } catch (error) {
      console.error('[SubscriptionService] Checkout creation error:', error);
      return { 
        error: error instanceof Error ? error.message : 'Failed to create checkout session' 
      };
    }
  }

  /**
   * Redirect user to Stripe checkout
   */
  static async redirectToCheckout(checkoutUrl: string): Promise<{ error?: string }> {
    try {
      console.log('[SubscriptionService] Redirecting to checkout:', checkoutUrl);
      window.location.href = checkoutUrl;
      return {};
    } catch (error) {
      console.error('[SubscriptionService] Redirect error:', error);
      return { 
        error: error instanceof Error ? error.message : 'Failed to redirect to checkout' 
      };
    }
  }
}