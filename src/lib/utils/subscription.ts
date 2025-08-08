import type { User } from '@supabase/supabase-js';

/**
 * Simplified subscription utilities
 * Only contains essential checkout-related functions
 */

const STRIPE_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID || 'price_1QXN8zITg7THQxOIGz0RkkQO';

export interface CheckoutResult {
  url?: string;
  error?: string;
}

/**
 * Create a Stripe checkout session for subscription
 */
export async function createCheckoutSession(user: User): Promise<CheckoutResult> {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: STRIPE_PRICE_ID,
        userId: user.id,
        email: user.email,
        successUrl: `${window.location.origin}/checkout-success`,
        cancelUrl: `${window.location.origin}/cancel`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { error: `Failed to create checkout session: ${error}` };
    }

    const { url } = await response.json();
    return { url };
  } catch (error) {
    console.error('[createCheckoutSession] Error:', error);
    return { 
      error: error instanceof Error ? error.message : 'Failed to create checkout session' 
    };
  }
}

/**
 * Redirect to Stripe checkout
 */
export async function redirectToCheckout(checkoutUrl: string): Promise<{ error?: string }> {
  try {
    window.location.href = checkoutUrl;
    return {};
  } catch (error) {
    console.error('[redirectToCheckout] Error:', error);
    return { 
      error: error instanceof Error ? error.message : 'Failed to redirect to checkout' 
    };
  }
}