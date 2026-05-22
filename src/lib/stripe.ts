import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
  typescript: true,
})

export function getPlanFromPriceId(priceId: string): 'basic' | 'pro' | null {
  const basicIds = [
    process.env.STRIPE_BASIC_MONTHLY_PRICE_ID,
    process.env.STRIPE_BASIC_ANNUAL_PRICE_ID,
  ]
  const proIds = [
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
  ]
  if (basicIds.includes(priceId)) return 'basic'
  if (proIds.includes(priceId)) return 'pro'
  return null
}
