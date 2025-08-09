/**
 * Edge Function: create-portal-session
 * -------------------------------------
 * • Creates a Stripe Customer Portal session for subscription management
 * • Allows users to view/cancel subscriptions, update payment methods, download invoices
 * • Follows the same pattern as create-checkout-session
 *
 * Required environment variables (load via `supabase secrets set`):
 *   STRIPE_SECRET               – sk_test_… or sk_live_…
 *   SUPABASE_URL                – for database access
 *   SUPABASE_SERVICE_ROLE_KEY   – for database access
 */

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import Stripe from 'npm:stripe@18.3.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

// --- CORS --------------------------------------------------------------------
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Update to 'https://main.jarvis-ai.online' in production
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
} as const

// -----------------------------------------------------------------------------
serve(async (req) => {
  /* 1. PRE-FLIGHT ----------------------------------------------------------- */
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders })
  }

  /* 2. AUTH & SUPABASE CLIENT --------------------------------------------- */
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return respond(401, 'Missing Authorization header')
  }

  const jwt = authHeader.replace('Bearer ', '')
  const { data: { user }, error: userError } = await supabase.auth.getUser(jwt)
  if (userError || !user) {
    console.error('Auth error:', userError)
    return respond(401, 'User not authenticated')
  }

  /* 3. PARSE BODY ---------------------------------------------------------- */
  let body: { returnUrl?: string }
  try {
    body = await req.json()
  } catch {
    body = {} // Default to empty if no body
  }

  // Get return URL from body or use default
  const returnUrl = body.returnUrl || `${req.headers.get('origin') || Deno.env.get('SUPABASE_URL')}/profile`

  /* 4. GET STRIPE CUSTOMER ------------------------------------------------- */
  const { data: customerData, error: customerError } = await supabase
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (customerError || !customerData?.stripe_customer_id) {
    console.error('Customer lookup error:', customerError)
    return respond(404, {
      error: 'No subscription found. Please subscribe first.',
      needsSubscription: true
    })
  }

  const customerId = customerData.stripe_customer_id
  console.log('Found Stripe customer:', customerId)

  /* 5. STRIPE PORTAL SESSION ----------------------------------------------- */
  const stripeKey = Deno.env.get('STRIPE_SECRET')
  if (!stripeKey) return respond(500, 'Server misconfigured: STRIPE_SECRET')

  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    console.log('Portal session created:', session.id)
    return respond(200, { url: session.url })
  } catch (err) {
    console.error('[Stripe] portal session error:', err)
    return respond(500, (err as Error).message)
  }
})

/* ──────────────────────────────────────────────────────────────────────────── */
function respond(status: number, payload: unknown) {
  const headers = {
    ...corsHeaders,
    'Content-Type': 'application/json',
  }
  return new Response(
    typeof payload === 'string' ? JSON.stringify({ error: payload }) : JSON.stringify(payload),
    { status, headers },
  )
}