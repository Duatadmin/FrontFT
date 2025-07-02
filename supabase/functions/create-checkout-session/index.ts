/*
 * Edge Function: create-checkout-session
 * ------------------------------------------------------------
 * Создаёт Checkout Session в Stripe и отдаёт sessionId клиенту.
 *
 * Требуемые секреты:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   STRIPE_SECRET_KEY   sk_test_ / sk_live_
 *   STRIPE_PRICE_BASIC  price_...
 *   CHECKOUT_SUCCESS_URL https://your-app.com/pay/success
 *   CHECKOUT_CANCEL_URL  https://your-app.com/pay/cancel
 */

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import Stripe from 'npm:stripe'                        // 🟢 фиксация импорта
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

// ────────────────────────────────────────────────────────────────────────────────
// Init SDKs
// ────────────────────────────────────────────────────────────────────────────────
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2025-05-28',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// ────────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────────
async function getOrCreateCustomer(userId: string): Promise<string> {
  const { data } = await supabase
    .from('customers')
    .select('stripe_customer_id')
    .eq('id', userId)
    .maybeSingle()

  if (data?.stripe_customer_id) return data.stripe_customer_id

  const customer = await stripe.customers.create({
    metadata: { supabase_uid: userId }
  })

  await supabase.from('customers').insert({
    id: userId,
    stripe_customer_id: customer.id,
  })

  return customer.id
}

// ────────────────────────────────────────────────────────────────────────────────
// Main handler
// ────────────────────────────────────────────────────────────────────────────────
serve(async (req) => {
  try {
    const { user_id } = await req.json()
    if (!user_id) return new Response('Missing user_id', { status: 400 })

    const customerId = await getOrCreateCustomer(user_id)

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      success_url: `${Deno.env.get('CHECKOUT_SUCCESS_URL')}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  Deno.env.get('CHECKOUT_CANCEL_URL')!,
      line_items: [{
        price: Deno.env.get('STRIPE_PRICE_BASIC')!,
        quantity: 1,
      }],
      allow_promotion_codes: true,
      metadata: { supabase_uid: user_id },
    })

    return new Response(JSON.stringify({ sessionId: session.id }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('create-checkout-session error', err)
    return new Response((err as Error).message, { status: 500 })
  }
})
