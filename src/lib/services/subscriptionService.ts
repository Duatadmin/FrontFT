import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface SubscriptionStatus {
  isActive: boolean;
  status: 'active' | 'inactive' | 'pending' | 'unknown';
  subscriptionId?: string;
  customerId?: string;
  error?: string;
}

interface CachedSubscriptionStatus extends SubscriptionStatus {
  cachedAt: number;
  userId: string;
}

export class SubscriptionService {
  private static readonly CACHE_KEY = 'subscription_status';
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Get cached subscription status if valid
   */
  private static getCachedStatus(userId: string): SubscriptionStatus | null {
    try {
      const cached = sessionStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const parsedCache: CachedSubscriptionStatus = JSON.parse(cached);
      
      // Check if cache is for the same user and not expired
      if (parsedCache.userId === userId && 
          Date.now() - parsedCache.cachedAt < this.CACHE_TTL) {
        console.log('[SubscriptionService] Using cached subscription status', {
          userId,
          cachedAt: new Date(parsedCache.cachedAt).toISOString(),
          age: `${Math.round((Date.now() - parsedCache.cachedAt) / 1000)}s`
        });
        return {
          isActive: parsedCache.isActive,
          status: parsedCache.status,
          subscriptionId: parsedCache.subscriptionId,
          customerId: parsedCache.customerId,
          error: parsedCache.error
        };
      }
    } catch (error) {
      console.warn('[SubscriptionService] Failed to parse cached status:', error);
    }
    return null;
  }

  /**
   * Cache subscription status
   */
  private static cacheStatus(userId: string, status: SubscriptionStatus): void {
    try {
      const cacheData: CachedSubscriptionStatus = {
        ...status,
        userId,
        cachedAt: Date.now()
      };
      sessionStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
      console.log('[SubscriptionService] Cached subscription status', {
        userId,
        status: status.status,
        isActive: status.isActive
      });
    } catch (error) {
      console.warn('[SubscriptionService] Failed to cache status:', error);
    }
  }

  /**
   * Clear cached subscription status
   */
  static clearCache(): void {
    sessionStorage.removeItem(this.CACHE_KEY);
    console.log('[SubscriptionService] Cleared subscription cache');
  }

  /**
   * Force a fresh subscription check, bypassing cache
   */
  static async forceCheckSubscriptionStatus(user: User): Promise<SubscriptionStatus> {
    console.log('[SubscriptionService] Forcing fresh subscription check');
    this.clearCache();
    return this.checkSubscriptionStatus(user);
  }

  /**
   * Check user's subscription status using the v_active_users view
   * 
   * This method now:
   * 1. Checks cache first
   * 2. Uses only the reliable v_active_users view
   * 3. Implements proper error handling
   * 4. Caches successful results
   */
  static async checkSubscriptionStatus(user: User): Promise<SubscriptionStatus> {
    const checkStartTime = Date.now();
    
    try {
      if (!user) {
        return {
          isActive: false,
          status: 'unknown',
          error: 'No user provided'
        };
      }

      // Check cache first (unless bypassed)
      const cachedStatus = this.getCachedStatus(user.id);
      if (cachedStatus) {
        return cachedStatus;
      }

      console.log('[SubscriptionService] Checking subscription for user:', user.id, {
        timestamp: new Date().toISOString()
      });

      // Use only the reliable v_active_users view
      const { data: activeUsers, error: viewError } = await supabase
        .from('v_active_users')
        .select('user_id')
        .eq('user_id', user.id)
        .limit(1);

      const queryDuration = Date.now() - checkStartTime;

      if (viewError) {
        console.error('[SubscriptionService] View query error:', {
          error: viewError,
          duration: `${queryDuration}ms`,
          code: viewError.code,
          message: viewError.message
        });

        // Network or connection error - don't cache, throw for retry
        if (viewError.message?.includes('network') || 
            viewError.message?.includes('fetch') ||
            viewError.code === 'PGRST301') {
          throw new Error('Network error checking subscription');
        }

        // Database error - user likely doesn't have subscription
        const errorStatus: SubscriptionStatus = {
          isActive: false,
          status: 'inactive',
          error: 'Unable to verify subscription status'
        };
        
        // Cache the error status to prevent repeated failed checks
        this.cacheStatus(user.id, errorStatus);
        return errorStatus;
      }

      const isActive = activeUsers && activeUsers.length > 0;
      console.log('[SubscriptionService] View check completed:', {
        isActive,
        duration: `${queryDuration}ms`,
        resultCount: activeUsers?.length || 0
      });

      const status: SubscriptionStatus = {
        isActive,
        status: isActive ? 'active' : 'inactive'
      };

      // Cache the successful result
      this.cacheStatus(user.id, status);
      
      return status;

    } catch (error) {
      const totalDuration = Date.now() - checkStartTime;
      console.error('[SubscriptionService] Unexpected error:', {
        error,
        duration: `${totalDuration}ms`,
        userId: user?.id
      });
      
      // Re-throw network errors for retry logic
      if (error instanceof Error && error.message.includes('Network error')) {
        throw error;
      }
      
      // For other errors, return a safe default
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

  /**
   * Create a Stripe Customer Portal session for subscription management
   * Allows users to:
   * - View subscription details
   * - Cancel or pause subscription
   * - Update payment methods
   * - Download invoices
   */
  static async createPortalSession(
    user: User,
    returnUrl?: string
  ): Promise<{ url?: string; error?: string; needsSubscription?: boolean }> {
    try {
      console.log('[SubscriptionService] Creating portal session for user:', user.id);

      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: { returnUrl: returnUrl || window.location.href },
      });

      if (error) {
        console.error('[SubscriptionService] Edge function error:', error);
        return { error: error.message || 'Failed to create portal session' };
      }

      if (data?.needsSubscription) {
        console.log('[SubscriptionService] User needs subscription first');
        return { 
          needsSubscription: true,
          error: 'No subscription found. Please subscribe first.' 
        };
      }
      
      if (!data?.url) {
        console.error('[SubscriptionService] No portal URL received:', data);
        return { error: 'No portal URL received from service' };
      }
      
      console.log('[SubscriptionService] Portal session created:', data.url);
      return { url: data.url };
      
    } catch (error) {
      console.error('[SubscriptionService] Portal creation error:', error);
      return { 
        error: error instanceof Error ? error.message : 'Failed to create portal session' 
      };
    }
  }

  /**
   * Redirect user to Stripe Customer Portal
   */
  static async redirectToPortal(portalUrl: string): Promise<{ error?: string }> {
    try {
      console.log('[SubscriptionService] Redirecting to portal:', portalUrl);
      window.location.href = portalUrl;
      return {};
    } catch (error) {
      console.error('[SubscriptionService] Portal redirect error:', error);
      return { 
        error: error instanceof Error ? error.message : 'Failed to redirect to portal' 
      };
    }
  }
}