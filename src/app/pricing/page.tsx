'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Eye, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

const PLANS = [
  {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    monthlyPriceId: null,
    annualPriceId: null,
    description: 'Try Vidrio with no strings attached.',
    features: [
      'Unlimited local notes',
      'Vidrio cloud saves',
      'Shareable links with auto-expire',
      '30-second transparency preview every 10 minutes',
      'Single note tab',
    ],
    notIncluded: ['Full transparency control', 'AI writing tools', 'Google Drive sync'],
    cta: 'Get started free',
    href: '/app',
    highlighted: false,
  },
  {
    name: 'Basic',
    monthlyPrice: 2.99,
    annualPrice: 29.99,
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_ID ?? 'basic-monthly',
    annualPriceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_ANNUAL_ID ?? 'basic-annual',
    description: 'Full transparency. AI writing. All layouts.',
    features: [
      'Everything in Free',
      'Full opacity slider — no timeout',
      'Up to 8 note tabs',
      'Side-by-side, top/bottom, 2x2 panes',
      'RTF, CSV, XML contextual toolbars',
      'Google Drive sync',
      'Basic AI (50 calls/day) — Haiku + GPT-4o-mini',
      '14-day free trial',
    ],
    notIncluded: ['All AI models', 'Unlimited AI calls', 'Picture-in-Picture'],
    cta: 'Start free trial',
    href: null,
    highlighted: true,
  },
  {
    name: 'AI Pro',
    monthlyPrice: 9.99,
    annualPrice: 99.99,
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_ID ?? 'pro-monthly',
    annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_ID ?? 'pro-annual',
    description: 'Unlimited AI. Every model. Picture-in-Picture.',
    features: [
      'Everything in Basic',
      'All AI models — Claude Opus, GPT-4o, and more',
      'Unlimited AI calls',
      'Compare dialog',
      'HTML viewer + Auto-detect language',
      'Bring your own API key',
      'Dropbox sync',
      'Picture-in-Picture mode',
      '14-day free trial',
    ],
    notIncluded: [],
    cta: 'Start free trial',
    href: null,
    highlighted: false,
  },
]

const FAQ = [
  {
    q: 'Can I try paid features before buying?',
    a: 'Yes — all paid plans include a 14-day free trial. No credit card required during trial.',
  },
  {
    q: 'What happens when my trial ends?',
    a: "You'll be charged automatically at the end of the trial. Cancel any time before to stay on the free plan.",
  },
  {
    q: 'What is Picture-in-Picture mode?',
    a: 'Available in Chrome and Edge, PiP floats your note window on top of every other application — even full-screen video.',
  },
  {
    q: 'Can I use my own Anthropic or OpenAI key?',
    a: "AI Pro users can bring their own key. This removes Vidrio's usage tracking entirely and you pay your AI provider directly.",
  },
  {
    q: 'Is my note data private?',
    a: 'All notes are encrypted client-side before reaching our servers. We never see your note contents.',
  },
]

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()
  const { isSignedIn } = useUser()

  async function handleCheckout(priceId: string | null) {
    if (!priceId) return
    if (!isSignedIn) { router.push('/sign-up'); return }
    setLoading(priceId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#45475A]/50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#89B4FA]/20 border border-[#89B4FA]/40 flex items-center justify-center">
            <Eye className="w-4 h-4 text-[#89B4FA]" />
          </div>
          <span className="font-semibold text-white">Vidrio</span>
        </Link>
        <Link href="/app" className="px-4 py-1.5 rounded-md bg-[#89B4FA] hover:bg-[#74C7EC] text-[#1E1E2E] text-sm font-medium transition-colors">
          Try free
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-white mb-3">Simple, honest pricing</h1>
          <p className="text-[#A6ADC8] mb-8">Start free. No credit card required.</p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#2A2A3E] border border-[#45475A]">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${!annual ? 'bg-[#89B4FA] text-[#1E1E2E]' : 'text-[#A6ADC8] hover:text-white'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${annual ? 'bg-[#89B4FA] text-[#1E1E2E]' : 'text-[#A6ADC8] hover:text-white'}`}
            >
              Annual
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#A6E3A1]/20 text-[#A6E3A1]">Save 17%</span>
            </button>
          </div>
        </motion.div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {PLANS.map((plan, i) => {
            const priceId = annual ? plan.annualPriceId : plan.monthlyPriceId
            const price = annual ? plan.annualPrice / 12 : plan.monthlyPrice
            return (
              <motion.div
                key={plan.name}
                className={`relative rounded-2xl p-7 flex flex-col ${plan.highlighted ? 'border-2 border-[#89B4FA] bg-[#89B4FA]/5' : 'border border-[#45475A] bg-white/5 backdrop-blur-sm'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-[#89B4FA] text-[#1E1E2E] text-xs font-bold">Most popular</span>
                  </div>
                )}

                <h2 className="text-white font-bold text-xl mb-1">{plan.name}</h2>
                <p className="text-[#A6ADC8] text-sm mb-5">{plan.description}</p>

                <div className="mb-6">
                  {plan.monthlyPrice === 0 ? (
                    <span className="text-4xl font-bold text-white">Free</span>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white">${price.toFixed(2)}</span>
                        <span className="text-[#A6ADC8]">/month</span>
                      </div>
                      {annual && <p className="text-xs text-[#A6ADC8] mt-1">${plan.annualPrice}/year billed annually</p>}
                    </>
                  )}
                </div>

                {plan.href ? (
                  <Link
                    href={plan.href}
                    className="block text-center py-3 rounded-lg font-semibold text-sm mb-6 border border-[#45475A] hover:border-[#89B4FA]/50 text-white transition-all hover:scale-105"
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleCheckout(priceId)}
                    disabled={loading !== null}
                    className={`py-3 rounded-lg font-semibold text-sm mb-6 transition-all hover:scale-105 disabled:opacity-60 ${plan.highlighted ? 'bg-[#89B4FA] hover:bg-[#74C7EC] text-[#1E1E2E]' : 'border border-[#45475A] hover:border-[#89B4FA]/50 text-white'}`}
                  >
                    {loading === priceId ? 'Loading...' : plan.cta}
                  </button>
                )}

                <ul className="space-y-2.5 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#A6ADC8]">
                      <Check className="w-4 h-4 text-[#A6E3A1] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <div key={i} className="rounded-xl border border-[#45475A] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  style={{ background: 'var(--panel-bg)' }}
                >
                  <span className="font-medium text-white text-sm">{item.q}</span>
                  <ChevronDown
                    className="w-4 h-4 text-[#A6ADC8] shrink-0 transition-transform"
                    style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none' }}
                  />
                </button>
                {openFaq === i && (
                  <motion.div
                    className="px-5 pb-4 text-sm text-[#A6ADC8]"
                    style={{ background: 'var(--panel-bg)' }}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                  >
                    {item.a}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
