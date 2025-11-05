import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripe: Stripe | null = null;

export async function getStripe() {
  if (!stripe) {
    stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripe!;
}
