# Vidrio

**Transparent AI-powered notes.** Live at [vidrio.app](https://vidrio.app).

Vidrio (Spanish for "glass") is a web-based notes app with a signature transparency feature — make your notes see-through and overlay them on anything you're working on.

---

## Features by tier

| Feature | Free | Basic | AI Pro |
|---|---|---|---|
| Local + cloud saves | Yes | Yes | Yes |
| Shareable links | Yes | Yes | Yes |
| Auto-expire notes | Yes | Yes | Yes |
| Full opacity slider | 30s preview | Unlimited | Unlimited |
| Note tabs | 1 | 8 | 8 |
| Multiple panes | — | Yes | Yes |
| RTF / CSV / XML toolbars | — | Yes | Yes |
| Google Drive sync | — | Yes | Yes |
| AI writing tools | — | 50/day | Unlimited |
| All AI models | — | — | Yes |
| Picture-in-Picture | — | — | Yes |
| Dropbox sync | — | — | Yes |
| Bring your own API key | — | — | Yes |

---

## Tech stack

- **Framework**: Next.js 14 App Router + TypeScript
- **Editor**: CodeMirror 6
- **Styling**: Tailwind CSS 4
- **Auth**: Clerk (Google OAuth)
- **Database**: Supabase (Postgres + RLS)
- **Payments**: Stripe (subscriptions + webhooks)
- **AI**: Anthropic Claude + OpenAI via server-side proxy
- **State**: Zustand (persisted)
- **Animations**: Framer Motion
- **Hosting**: Vercel
- **PWA**: Yes — installable on mobile

---

## Running locally

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local .env.local  # Fill in the values below

# 3. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

Create `.env.local` with the following:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/app
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/app

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_BASIC_MONTHLY_PRICE_ID=
STRIPE_BASIC_ANNUAL_PRICE_ID=
STRIPE_PRO_MONTHLY_PRICE_ID=
STRIPE_PRO_ANNUAL_PRICE_ID=

# Google Drive
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI
ANTHROPIC_API_KEY=
```

---

## Database setup

Run the migration in Supabase SQL editor:

```
supabase/migrations/001_initial.sql
```

Or use the Supabase CLI:

```bash
supabase db push
```

---

## Transparency feature

- **CSS approach** (all browsers): sets `document.body.style.opacity`
- **Picture-in-Picture** (Chrome/Edge, AI Pro only): uses Document PiP API to float the note over other apps

Tier behavior:
- Anonymous: 3-second preview, then locked
- Free: 30-second preview every 10 minutes
- Basic+: Full control, persists in settings

---

## Note encryption

All notes are encrypted client-side before being sent to Supabase using the Web Crypto API (AES-GCM 256-bit). The server never sees plaintext content.

---

## App routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/app` | Main editor |
| `/note/[token]` | Shared note viewer |
| `/pricing` | Pricing page |
| `/sign-in` | Clerk sign in |
| `/sign-up` | Clerk sign up |
| `/api/ai` | AI proxy (server-side) |
| `/api/notes` | Note CRUD |
| `/api/notes/shared` | Public note fetch |
| `/api/stripe/checkout` | Stripe checkout |
| `/api/stripe/webhook` | Stripe webhook |
| `/api/usage` | Usage + plan check |
| `/api/auth/sync` | Clerk webhook handler |
