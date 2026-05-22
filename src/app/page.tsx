'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Sparkles, Eye, FileText, Share2, HardDrive, Smartphone,
  ChevronDown, Check,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Eye,
    title: 'See through your notes',
    description: 'Drag the opacity slider and watch your notes become a glass overlay. Work on anything underneath without switching windows.',
  },
  {
    icon: Sparkles,
    title: 'AI writing tools',
    description: 'Fix, polish, rephrase, spell-check, and auto-detect code language. All powered by Claude and GPT-4o-mini.',
  },
  {
    icon: FileText,
    title: 'Every format you need',
    description: 'Plain text, Markdown, RTF, CSV, XML, and 14 code languages — each with syntax highlighting and contextual toolbars.',
  },
  {
    icon: Share2,
    title: 'Shareable links',
    description: 'Share any note with a single link. Set an expiry time or password-protect it. No account needed for the viewer.',
  },
  {
    icon: HardDrive,
    title: 'Google Drive sync',
    description: 'Save directly to your Google Drive or Dropbox. Your notes live where you already work.',
  },
  {
    icon: Smartphone,
    title: 'Works everywhere',
    description: 'Install as a PWA on mobile, use in any browser on desktop. One app, every device.',
  },
]

const PLANS = [
  {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Try Vidrio with no commitment.',
    features: [
      'Unlimited local notes',
      'Vidrio cloud saves',
      'Shareable links',
      'Auto-expire notes',
      '30-second transparency preview',
    ],
    cta: 'Get started free',
    href: '/app',
    highlighted: false,
  },
  {
    name: 'Basic',
    monthlyPrice: 2.99,
    annualPrice: 29.99,
    description: 'Full transparency and AI writing tools.',
    features: [
      'Everything in Free',
      'Full opacity slider — no timeout',
      'Up to 8 note tabs',
      'All layouts (side-by-side, 2x2)',
      'RTF, CSV, XML toolbars',
      'Google Drive sync',
      'Basic AI — 50 calls/day',
      '14-day free trial',
    ],
    cta: 'Start free trial',
    href: '/sign-up',
    highlighted: true,
  },
  {
    name: 'AI Pro',
    monthlyPrice: 9.99,
    annualPrice: 99.99,
    description: 'Unlimited AI with every model.',
    features: [
      'Everything in Basic',
      'All AI models (Claude Opus, GPT-4o)',
      'Unlimited AI calls',
      'Compare dialog',
      'HTML viewer, Auto-detect',
      'Bring your own API key',
      'Dropbox sync',
      'Picture-in-Picture mode',
      '14-day free trial',
    ],
    cta: 'Start free trial',
    href: '/sign-up',
    highlighted: false,
  },
]

function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <motion.nav
      className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-3 transition-all duration-300 ${
        scrolled ? 'backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/10' : ''
      }`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-[#89B4FA]/20 border border-[#89B4FA]/40 backdrop-blur-sm flex items-center justify-center">
          <Eye className="w-4 h-4 text-[#89B4FA]" />
        </div>
        <span className="font-semibold text-white text-lg tracking-tight">Vidrio</span>
      </div>
      <div className="hidden md:flex items-center gap-6 text-sm text-[#A6ADC8]">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#demo" className="hover:text-white transition-colors">Demo</a>
        <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/sign-in" className="text-sm text-[#A6ADC8] hover:text-white transition-colors">
          Sign in
        </Link>
        <Link
          href="/app"
          className="px-4 py-1.5 rounded-md bg-[#89B4FA] hover:bg-[#74C7EC] text-[#1E1E2E] text-sm font-medium transition-colors"
        >
          Try free
        </Link>
      </div>
    </motion.nav>
  )
}

function HeroSection() {
  const panels = [
    { x: -180, y: -60, rotate: -8, delay: 0 },
    { x: 160, y: -40, rotate: 6, delay: 0.1 },
    { x: -100, y: 120, rotate: 4, delay: 0.2 },
    { x: 200, y: 100, rotate: -5, delay: 0.15 },
  ]

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1f] to-[#0a0a1a]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#89B4FA]/5 via-transparent to-[#74C7EC]/5" />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {panels.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-56 h-36 rounded-xl backdrop-blur-sm border border-white/10 bg-white/5"
            style={{ x: p.x, y: p.y, rotate: p.rotate }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0.2, 0.35, 0.2],
              scale: [1, 1.02, 1],
              y: [p.y, p.y - 12, p.y],
            }}
            transition={{
              opacity: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: p.delay },
              scale: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: p.delay },
              y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: p.delay },
            }}
          >
            <div className="p-3 space-y-1.5">
              <div className="h-2 w-3/4 rounded bg-white/20" />
              <div className="h-2 w-full rounded bg-white/10" />
              <div className="h-2 w-2/3 rounded bg-white/10" />
              <div className="h-2 w-5/6 rounded bg-white/10" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 text-center max-w-3xl">
        <motion.div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#89B4FA]/30 bg-[#89B4FA]/10 text-[#89B4FA] text-sm mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI-powered transparent notes
        </motion.div>

        <motion.h1
          className="text-5xl md:text-6xl font-bold text-white leading-tight mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Notes that disappear
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#89B4FA] to-[#74C7EC]">
            into your work
          </span>
        </motion.h1>

        <motion.p
          className="text-lg text-[#A6ADC8] mb-8 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          The only notes app that lets you see through your notes — overlay them on anything, anywhere.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link
            href="/app"
            className="px-6 py-3 rounded-lg bg-[#89B4FA] hover:bg-[#74C7EC] text-[#1E1E2E] font-semibold text-base transition-all hover:scale-105 active:scale-95"
          >
            Try free — no account needed
          </Link>
          <a
            href="#demo"
            className="flex items-center gap-2 px-6 py-3 rounded-lg border border-[#45475A] hover:border-[#89B4FA]/50 text-[#A6ADC8] hover:text-white text-base transition-all"
          >
            See how it works
            <ChevronDown className="w-4 h-4" />
          </a>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="w-5 h-5 text-[#45475A]" />
      </motion.div>
    </section>
  )
}

function DemoSection() {
  const [demoOpacity, setDemoOpacity] = useState(85)

  const blurAmount = Math.round((100 - demoOpacity) / 10)

  return (
    <section id="demo" className="py-24 px-6 bg-gradient-to-b from-[#0a0a0f] to-[#0d0d1a]">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">See it to believe it</h2>
          <p className="text-[#A6ADC8]">Drag the slider to control transparency</p>
        </motion.div>

        <motion.div
          className="relative rounded-2xl overflow-hidden border border-[#45475A]"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          {/* Colorful simulated background — visible through the transparent note */}
          <div className="absolute inset-0 bg-[#0f1117] overflow-hidden">
            <div className="p-6 space-y-3">
              {/* Fake app toolbar */}
              <div className="flex items-center gap-2 mb-2 pb-3 border-b border-white/10">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#F38BA8]/80" />
                  <div className="w-3 h-3 rounded-full bg-[#F9B742]/80" />
                  <div className="w-3 h-3 rounded-full bg-[#A6E3A1]/80" />
                </div>
                <div className="h-4 w-48 rounded bg-white/10 ml-2" />
              </div>
              {/* Fake metric cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Revenue', value: '$48.2k', color: '#A6E3A1' },
                  { label: 'Users', value: '2,841', color: '#89B4FA' },
                  { label: 'Growth', value: '+24%', color: '#CBA6F7' },
                ].map((card) => (
                  <div key={card.label} className="rounded-lg p-3" style={{ background: card.color + '15', border: `1px solid ${card.color}30` }}>
                    <div className="text-xs mb-1" style={{ color: card.color + 'aa' }}>{card.label}</div>
                    <div className="text-sm font-semibold" style={{ color: card.color }}>{card.value}</div>
                  </div>
                ))}
              </div>
              {/* Fake chart bars */}
              <div className="flex items-end gap-1.5 h-14 px-1 pt-2">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${h}%`,
                      background: i % 3 === 0 ? '#89B4FA60' : i % 3 === 1 ? '#CBA6F750' : '#A6E3A140',
                    }}
                  />
                ))}
              </div>
              {/* Fake data rows */}
              <div className="space-y-2 pt-1">
                {[
                  { color: '#F38BA8', w: '85%' },
                  { color: '#FAB387', w: '62%' },
                  { color: '#89B4FA', w: '91%' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: row.color }} />
                    <div className="h-2 rounded" style={{ width: row.w, background: row.color + '35' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Note card — opacity and backdrop-filter controlled by slider */}
          <div
            className="relative m-8 rounded-xl border border-white/20 p-6"
            style={{
              opacity: demoOpacity / 100,
              background: `rgba(30, 30, 46, ${0.3 + (demoOpacity / 100) * 0.55})`,
              backdropFilter: blurAmount > 0 ? `blur(${blurAmount}px)` : 'none',
              transition: 'opacity 0.1s ease, backdrop-filter 0.1s ease, background 0.1s ease',
            }}
          >
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
              <div className="w-2.5 h-2.5 rounded-full bg-[#F38BA8]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#F9B742]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#A6E3A1]" />
              <span className="ml-2 text-xs text-[#A6ADC8]">Meeting notes.txt</span>
            </div>
            <div className="space-y-2 text-sm text-[#CDD6F4]">
              <p className="font-medium">Q2 planning — key points</p>
              <p className="text-[#A6ADC8]">- Launch transparency feature on web</p>
              <p className="text-[#A6ADC8]">- PWA for mobile users</p>
              <p className="text-[#A6ADC8]">- Google Drive integration</p>
              <p className="text-[#A6ADC8]">- AI writing tools rollout</p>
            </div>
          </div>

          {/* Controls — always fully visible, outside the note card */}
          <div className="relative px-8 pb-8 flex flex-col items-center gap-3">
            <div className="flex items-center gap-4 w-full max-w-sm">
              <Eye className="w-4 h-4 text-[#89B4FA] shrink-0" />
              <input
                type="range"
                min={10}
                max={100}
                value={demoOpacity}
                onChange={e => setDemoOpacity(Number(e.target.value))}
                className="flex-1 accent-[#89B4FA]"
              />
              <span className="text-xs text-[#A6ADC8] w-8 text-right">{demoOpacity}%</span>
            </div>
            <p className="text-xs text-[#A6ADC8]">
              This is what Basic unlocks — full opacity control, no time limit
            </p>
            <Link
              href="/sign-up"
              className="px-5 py-2 rounded-lg bg-[#89B4FA] hover:bg-[#74C7EC] text-[#1E1E2E] text-sm font-semibold transition-all hover:scale-105"
            >
              Get full transparency — $2.99/month
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 bg-[#0d0d1a]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Every tool you need, none you don&apos;t
          </h2>
          <p className="text-[#A6ADC8] max-w-xl mx-auto">Vidrio is built for focused work. Everything is intentional.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="p-6 rounded-xl backdrop-blur-sm bg-white/5 border border-white/10 hover:border-[#89B4FA]/30 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
            >
              <div className="w-10 h-10 rounded-lg bg-[#89B4FA]/10 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-[#89B4FA]" />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-[#A6ADC8] leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="py-24 px-6 bg-gradient-to-b from-[#0d0d1a] to-[#0a0a0f]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Simple, honest pricing</h2>
          <p className="text-[#A6ADC8] mb-6">Start free. Upgrade when you need more.</p>
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#2A2A3E] border border-[#45475A]">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                !annual ? 'bg-[#89B4FA] text-[#1E1E2E]' : 'text-[#A6ADC8] hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                annual ? 'bg-[#89B4FA] text-[#1E1E2E]' : 'text-[#A6ADC8] hover:text-white'
              }`}
            >
              Annual
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#A6E3A1]/20 text-[#A6E3A1]">
                Save 17%
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`relative rounded-2xl p-6 flex flex-col ${
                plan.highlighted
                  ? 'border-2 border-[#89B4FA] bg-[#89B4FA]/5'
                  : 'border border-[#45475A] backdrop-blur-sm bg-white/5'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-[#89B4FA] text-[#1E1E2E] text-xs font-semibold">
                    Most popular
                  </span>
                </div>
              )}
              <div className="mb-4">
                <h3 className="text-white font-bold text-lg">{plan.name}</h3>
                <p className="text-[#A6ADC8] text-sm mt-1">{plan.description}</p>
              </div>
              <div className="mb-6">
                {plan.monthlyPrice === 0 ? (
                  <div className="text-3xl font-bold text-white">Free</div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">
                      ${annual ? (plan.annualPrice / 12).toFixed(2) : plan.monthlyPrice}
                    </span>
                    <span className="text-[#A6ADC8] text-sm">/month</span>
                  </div>
                )}
                {annual && plan.annualPrice > 0 && (
                  <p className="text-xs text-[#A6ADC8] mt-1">${plan.annualPrice}/year — billed annually</p>
                )}
              </div>
              <ul className="space-y-2 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#A6ADC8]">
                    <Check className="w-4 h-4 text-[#A6E3A1] shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block text-center py-2.5 rounded-lg font-medium text-sm transition-all hover:scale-105 ${
                  plan.highlighted
                    ? 'bg-[#89B4FA] hover:bg-[#74C7EC] text-[#1E1E2E]'
                    : 'border border-[#45475A] hover:border-[#89B4FA]/50 text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16 overflow-x-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#45475A]">
                <th className="text-left py-3 text-[#A6ADC8] font-normal">Feature</th>
                {['Free', 'Basic', 'AI Pro'].map(p => (
                  <th key={p} className="py-3 text-center text-white font-semibold">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Cloud saves', true, true, true],
                ['Shareable links', true, true, true],
                ['Auto-expire', true, true, true],
                ['Full transparency', false, true, true],
                ['Multiple panes', false, true, true],
                ['RTF / CSV / XML toolbars', false, true, true],
                ['Google Drive sync', false, true, true],
                ['AI writing tools', false, true, true],
                ['All AI models', false, false, true],
                ['Unlimited AI calls', false, false, true],
                ['Picture-in-Picture', false, false, true],
                ['Dropbox sync', false, false, true],
              ].map(([feature, free, basic, pro]) => (
                <tr key={String(feature)} className="border-b border-[#45475A]/50">
                  <td className="py-2.5 text-[#A6ADC8]">{String(feature)}</td>
                  {[free, basic, pro].map((val, j) => (
                    <td key={j} className="py-2.5 text-center">
                      {val ? (
                        <Check className="w-4 h-4 text-[#A6E3A1] mx-auto" />
                      ) : (
                        <span className="text-[#45475A]">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-[#45475A]/50 bg-[#0a0a0f]">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#89B4FA]/20 border border-[#89B4FA]/40 flex items-center justify-center">
            <Eye className="w-4 h-4 text-[#89B4FA]" />
          </div>
          <div>
            <div className="font-semibold text-white">Vidrio</div>
            <div className="text-xs text-[#A6ADC8]">Transparent AI notes</div>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm text-[#A6ADC8]">
          <Link href="/app" className="hover:text-white transition-colors">App</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/sign-in" className="hover:text-white transition-colors">Sign in</Link>
        </div>
        <p className="text-xs text-[#45475A]">Built by Daniel Hinojosa</p>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <main className="bg-[#0a0a0f] min-h-screen">
      <NavBar />
      <HeroSection />
      <DemoSection />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </main>
  )
}
