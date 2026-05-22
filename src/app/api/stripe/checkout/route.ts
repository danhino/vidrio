import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { priceId } = await req.json()
  if (!priceId) return NextResponse.json({ error: 'Missing priceId' }, { status: 400 })

  const clerkUser = await currentUser()
  const email = clerkUser?.emailAddresses[0]?.emailAddress

  // Get or create Stripe customer
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', (await supabaseAdmin.from('users').select('id').eq('clerk_id', userId).single()).data?.id ?? '')
    .single()

  let customerId = sub?.stripe_customer_id ?? undefined

  if (!customerId && email) {
    const customer = await stripe.customers.create({ email, metadata: { clerk_id: userId } })
    customerId = customer.id
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 14,
      metadata: { clerk_id: userId },
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { clerk_id: userId },
  })

  return NextResponse.json({ url: session.url })
}
