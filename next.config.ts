import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow images from Clerk avatar CDNs
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: '**.clerk.accounts.dev' },
    ],
  },
  // Stripe webhooks need raw body
  async headers() {
    return [
      {
        source: '/api/stripe/webhook',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
      },
    ]
  },
}

export default nextConfig
