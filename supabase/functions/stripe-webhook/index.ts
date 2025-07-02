/*
 * Stripe Webhook — Supabase Edge Function
 * ------------------------------------------------------------
 * - Автоматически банит всех новых пользователей (см. триггер)
 * - Снимает бан после первой успешной оплаты
 * - Снова банит, если подписка перестаёт быть active/trialing
 *
 * Требуемые Secrets (Project → Settings → Secrets):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   STRIPE_SECRET_KEY     sk_test_… / sk_live_…
 *   STRIPE_WEBHOOK_SECRET whsec_…
 */

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import Stripe from 'npm:stripe'                           // ✅ Edge‑runtime совместимый импорт
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

// ────────────────────────────────────────────────────────────────────────────────
//  Init SDKs
// ────────────────────────────────────────────────────────────────────────────────
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2025-05-28',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// ────────────────────────────────────────────────────────────────────────────────
//  Helpers
// ────────────────────────────────────────────────────────────────────────────────
async function setBan(userId: string, banned: boolean) {
  await supabase
    .schema('auth')
    .from('users')
    .update({ banned_until: banned ? '9999-12-31' : null })
    .eq('id', userId)
}

async function upsertSub(data: Record<string, any>) {
  await supabase.from('stripe_subscriptions').upsert(data)
}

async function userIdByCustomer(customerId: string) {
  const { data } = await supabase
    .from('customers')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()
  return data?.user_id ?? null
}

// ────────────────────────────────────────────────────────────────────────────────
//  Main handler
// ────────────────────────────────────────────────────────────────────────────────
serve(async (req) => {
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
    return new Response(`Bad signature: ${(err as Error).message}`, { status: 400 })
  }

  try {
    switch (event.type) {
      // ───────────────────────────────────── 1. Первая успешная оплата
      case 'checkout.session.completed': {
        const s = event.data.object as Stripe.Checkout.Session
        if (!s.customer || !s.subscription) break

        let uid = await userIdByCustomer(s.customer as string)
        if (!uid && s.metadata?.supabase_uid) {
          uid = s.metadata.supabase_uid
          await supabase.from('customers').insert({
            id: uid,
            stripe_customer_id: s.customer as string,
          })
        }
        if (!uid) break

        const full = await stripe.checkout.sessions.retrieve(s.id, {
          expand: ['line_items.data.price', 'subscription']
        })
        const line  = full.line_items?.data[0]
        const price = line?.price as Stripe.Price | undefined
        const sub   = full.subscription as Stripe.Subscription

        await upsertSub({
          id: sub.id,
          user_id: uid,
          status: sub.status,
          price_id: price?.id ?? null,
          quantity: line?.quantity ?? 1,
          current_period_end: new Date(sub.current_period_end * 1000),
        })

        await setBan(uid, false)
        break
      }

      // ───────────────────────────────────── 2. Любое изменение подписки
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const uid = await userIdByCustomer(sub.customer as string)
        if (!uid) break

        const active = ['active', 'trialing'].includes(sub.status)
        await setBan(uid, !active)

        await upsertSub({
          id: sub.id,
          user_id: uid,
          status: sub.status,
          current_period_end: new Date(sub.current_period_end * 1000),
        })
        break
      }
    }

    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error('stripe-webhook error', err)
    return new Response((err as Error).message, { status: 500 })
  }
})
