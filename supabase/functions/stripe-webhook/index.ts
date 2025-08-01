/*
 * Stripe Webhook — Supabase Edge Function
 * ------------------------------------------------------------
 * - Handles Stripe subscription events
 * - Updates stripe_subscriptions table
 * - RLS policies automatically control access based on subscription status
 *
 * Требуемые Secrets (Project → Settings → Secrets):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   STRIPE_SECRET     sk_test_… / sk_live_…
 *   STRIPE_WEBHOOK_SECRET whsec_…
 */

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import Stripe from 'npm:stripe'                           // ✅ Edge‑runtime совместимый импорт
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

// ────────────────────────────────────────────────────────────────────────────────
//  Init SDKs
// ────────────────────────────────────────────────────────────────────────────────
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET')!, {
  apiVersion: '2023-10-16', // Align with the working checkout function
  httpClient: Stripe.createFetchHttpClient(),
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// ────────────────────────────────────────────────────────────────────────────────
//  Helpers
// ────────────────────────────────────────────────────────────────────────────────
async function upsertSubscription(data: Record<string, any>) {
  console.log('Upserting subscription:', data)
  const { error } = await supabase.from('stripe_subscriptions').upsert(data)
  if (error) {
    console.error('Error upserting subscription:', error)
    throw error
  }
}

async function upsertProduct(product: Stripe.Product) {
  const { error } = await supabase.from('stripe_products').upsert({
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description,
    image: product.images?.[0] ?? null,
    metadata: product.metadata,
  })
  if (error) {
    console.error('Error upserting product:', error)
    throw error
  }
}

async function upsertPrice(price: Stripe.Price) {
  const { error } = await supabase.from('stripe_prices').upsert({
    id: price.id,
    product_id: typeof price.product === 'string' ? price.product : price.product.id,
    active: price.active,
    description: price.description,
    unit_amount: price.unit_amount,
    currency: price.currency,
    type: price.type,
    interval: price.recurring?.interval,
    interval_count: price.recurring?.interval_count,
    trial_period_days: price.recurring?.trial_period_days,
    metadata: price.metadata,
  })
  if (error) {
    console.error('Error upserting price:', error)
    throw error
  }
}

async function getUserIdByCustomer(customerId: string): Promise<string | null> {
  const { data } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()
  return data?.user_id ?? null
}

async function ensureCustomerRecord(userId: string, customerId: string) {
  const { error } = await supabase.from('stripe_customers').upsert({
    user_id: userId,
    stripe_customer_id: customerId,
  })
  if (error) {
    console.error('Error ensuring customer record:', error)
    throw error
  }
}

// ────────────────────────────────────────────────────────────────────────────────
//  Main handler
// ────────────────────────────────────────────────────────────────────────────────
serve(async (req) => {
  // CORS headers for webhook responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'stripe-signature, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  // Handle preflight requests (though Stripe won't send these)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200 
    })
  }

  const sig  = req.headers.get('stripe-signature') || ''
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err)
    return new Response(`Bad signature: ${(err as Error).message}`, { 
      status: 400,
      headers: corsHeaders
    })
  }

  try {
    switch (event.type) {
      // ───────────────────────────────────── 1. Successful checkout completion
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (!session.customer || !session.subscription) {
          console.log('Skipping checkout.session.completed - missing customer or subscription')
          break
        }

        // Get or create user ID mapping
        let userId = await getUserIdByCustomer(session.customer as string)
        if (!userId && session.metadata?.supabase_uid) {
          userId = session.metadata.supabase_uid
          await ensureCustomerRecord(userId, session.customer as string)
        }
        if (!userId) {
          console.error('Could not determine user ID for customer:', session.customer)
          break
        }

        // Get full subscription details
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items.data.price.product', 'subscription'],
        })
        const lineItem = fullSession.line_items?.data[0]
        const price = lineItem?.price as Stripe.Price | undefined
        const product = price?.product as Stripe.Product | undefined
        const subscription = fullSession.subscription as Stripe.Subscription

        if (!price || !product || !subscription) {
          console.error('Missing price, product, or subscription in checkout session.')
          break
        }

        // Upsert product and price first to satisfy foreign key constraints
        await upsertProduct(product)
        await upsertPrice(price)

        // Store subscription in database - RLS will handle access control
        await upsertSubscription({
          id: subscription.id,
          user_id: userId,
          status: subscription.status,
          price_id: price?.id ?? null,
          quantity: lineItem?.quantity ?? 1,
          cancel_at_period_end: subscription.cancel_at_period_end,
          metadata: subscription.metadata,
          created: new Date(subscription.created * 1000),
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
          ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
          cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
          canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
          trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        })

        console.log(`Subscription ${subscription.id} created for user ${userId}`)
        break
      }

      // ───────────────────────────────────── 2. Subscription changes
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = await getUserIdByCustomer(subscription.customer as string)
        if (!userId) {
          console.error('Could not find user for customer:', subscription.customer)
          break
        }

        const firstItem = subscription.items?.data?.[0]

        // Update subscription in database - RLS will handle access control automatically
        await upsertSubscription({
          id: subscription.id,
          user_id: userId,
          status: subscription.status,
          price_id: firstItem?.price?.id ?? null,
          quantity: firstItem?.quantity ?? null,
          cancel_at_period_end: subscription.cancel_at_period_end,
          metadata: subscription.metadata,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
          ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
          cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
          canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
          trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        })

        console.log(`Subscription ${subscription.id} updated for user ${userId} - status: ${subscription.status}`)
        break
      }

      // ───────────────────────────────────── 3. Invoice payment events
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.subscription) break

        // Fetch the subscription to ensure we have latest status
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
        const userId = await getUserIdByCustomer(subscription.customer as string)
        if (!userId) break

        await upsertSubscription({
          id: subscription.id,
          user_id: userId,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
          ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null, // Keep it concise for invoice events
        })

        console.log(`Payment succeeded for subscription ${subscription.id}, user ${userId}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.subscription) break

        // Fetch the subscription to ensure we have latest status
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
        const userId = await getUserIdByCustomer(subscription.customer as string)
        if (!userId) break

        await upsertSubscription({
          id: subscription.id,
          user_id: userId,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
          ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null, // Keep it concise for invoice events
        })

        console.log(`Payment failed for subscription ${subscription.id}, user ${userId}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response('ok', { 
      status: 200,
      headers: corsHeaders
    })
  } catch (err) {
    console.error('[stripe-webhook] Processing error:', err)
    return new Response((err as Error).message, { 
      status: 500,
      headers: corsHeaders
    })
  }
})
