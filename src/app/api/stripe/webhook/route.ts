import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, getPlanFromPriceId } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = (await headers()).get('stripe-signature')!
  const secret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  async function getSupabaseUserId(clerkId: string): Promise<string | null> {
    const { data } = await supabaseAdmin.from('users').select('id').eq('clerk_id', clerkId).single()
    return data?.id ?? null
  }

  async function updateSub(userId: string, updates: Record<string, unknown>) {
    await supabaseAdmin.from('subscriptions').update({ ...updates, updated_at: new Date().toISOString() }).eq('user_id', userId)
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const clerkId = sub.metadata?.clerk_id
      if (!clerkId) break
      const userId = await getSupabaseUserId(clerkId)
      if (!userId) break

      const priceId = sub.items.data[0]?.price.id
      const plan = getPlanFromPriceId(priceId) ?? 'free'

      await updateSub(userId, {
        stripe_customer_id: sub.customer as string,
        stripe_subscription_id: sub.id,
        plan,
        status: sub.status,
        current_period_end: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
      })
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const clerkId = sub.metadata?.clerk_id
      if (!clerkId) break
      const userId = await getSupabaseUserId(clerkId)
      if (!userId) break
      await updateSub(userId, { plan: 'free', status: 'canceled' })
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const subId = (invoice as unknown as { subscription: string }).subscription
      if (!subId) break
      const { data: sub } = await supabaseAdmin
        .from('subscriptions').select('user_id').eq('stripe_subscription_id', subId).single()
      if (sub) await updateSub(sub.user_id, { status: 'past_due' })
      break
    }
  }

  return NextResponse.json({ received: true })
}
