/**
 * Edge Function: create-checkout-session
 * -------------------------------------
 * • CORS pre-flight всегда отвечает 200 OK
 * • Stripe и прочие SDK инициализируются ТОЛЬКО после OPTIONS
 * • Ожидает body: { successUrl, cancelUrl } или { priceId, successUrl, cancelUrl }
 *
 * Требуемые переменные окружения (загрузите через `supabase secrets set`):
 *   STRIPE_SECRET               – sk_test_… или sk_live_…
 *   STRIPE_PRICE_ID             – price_... (default subscription price)
 *   CHECKOUT_SUCCESS_URL        – URL для успешного завершения
 *   CHECKOUT_CANCEL_URL         – URL для отмены
 *   SUPABASE_URL                – если нужна работа с БД (необязательно)
 *   SUPABASE_SERVICE_ROLE_KEY   – ″
 */

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import Stripe from 'npm:stripe@18.3.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

// --- CORS --------------------------------------------------------------------
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://main.jarvis-ai.online', // prod-origin
  // Для локальных тестов можно временно заменить на '*'
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
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

  /* 3. ПАРСИРУЕМ BODY ------------------------------------------------------- */
  let body: { priceId?: string; successUrl?: string; cancelUrl?: string }
  try {
    body = await req.json()
  } catch {
    return respond(400, 'Invalid JSON')
  }

  // Get URLs from body or environment
  const successUrl = body.successUrl || Deno.env.get('CHECKOUT_SUCCESS_URL')
  const cancelUrl = body.cancelUrl || Deno.env.get('CHECKOUT_CANCEL_URL')
  
  if (!successUrl || !cancelUrl) {
    return respond(400, 'successUrl, cancelUrl are required (either in body or CHECKOUT_SUCCESS_URL/CHECKOUT_CANCEL_URL env vars)')
  }

  // Get priceId from body or environment
  const priceId = body.priceId || Deno.env.get('STRIPE_PRICE_ID')
  if (!priceId) {
    return respond(400, 'priceId is required (either in body or STRIPE_PRICE_ID env var)')
  }

  /* 4. STRIPE ---------------------------------------------------------------- */
  const stripeKey = Deno.env.get('STRIPE_SECRET')
  if (!stripeKey) return respond(500, 'Server misconfigured: STRIPE_SECRET')

  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      customer_email: user.email,
      metadata: {
        supabase_uid: user.id,
      },
    })

    return respond(200, { url: session.url })
  } catch (err) {
    console.error('[Stripe] create session error:', err)
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