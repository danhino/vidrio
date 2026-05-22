# CLAUDE.md — Vidrio

## What is Vidrio
Vidrio (Spanish for glass) is a web-based AI-powered notes app
with a signature transparency/frosted glass feature.
Live at vidrio.app. Built with Next.js 14, Supabase, Clerk,
Stripe, and CodeMirror 6.

## Core concept
The transparency feature is the hero. Users can make the note
window see-through so it overlays other content on screen.
This is implemented via:
1. CSS opacity + backdrop-filter blur (all browsers)
2. Picture-in-Picture API (Chrome/Edge — floats over other apps)

## Tier system
- Anonymous: local storage only, 3-second transparency teaser
- Free account: Vidrio cloud saves, auto-expire, shareable links,
  30-second transparency preview every 10 minutes
- Basic ($2.99/month or $29.99/year): full transparency, 8 notes,
  all layouts, Google Drive sync, basic AI (Haiku/GPT-4o-mini),
  50 AI calls/day, RTF/CSV/XML toolbars
- AI Pro ($9.99/month or $99.99/year): everything in Basic +
  all AI models, unlimited AI calls, all developer formats,
  Compare dialog, HTML viewer, Auto-detect, bring your own key,
  Dropbox sync, Picture-in-Picture mode

## Transparency behavior by tier
- Anonymous: click transparency → 3s preview → locks → banner
  "Sign up free to unlock more"
- Free account: 30s transparency → fades → resets every 10 min →
  banner "Upgrade to Basic for full transparency — $2.99/month"
- Basic+: full opacity slider 0-100%, persists, no timeout
- AI Pro: full opacity slider + Picture-in-Picture mode

## Stack
- Framework: Next.js 14 App Router + TypeScript
- Editor: CodeMirror 6
- Styling: Tailwind CSS 4
- Auth: Clerk with Google OAuth
- Database: Supabase (Postgres)
- Payments: Stripe
- AI: Anthropic Claude + OpenAI via server-side API routes
- Hosting: Vercel
- PWA: yes — Add to Home Screen on mobile

## Database schema (Supabase)
users: id, clerk_id, email, name, avatar_url, created_at
subscriptions: id, user_id, stripe_customer_id,
  stripe_subscription_id, plan (free/basic/pro),
  status, trial_ends_at, current_period_end
settings: id, user_id, theme, font, font_size, opacity,
  layout, ai_provider, ai_model, custom_api_key
notes: id, user_id (nullable for anonymous), title,
  encrypted_content, share_token (unique), password_hash,
  expires_at, size_bytes, created_at, updated_at
usage: id, user_id, date, ai_calls_count

## AI limits by tier
- Anonymous: 0 AI calls
- Free account: 0 AI calls
- Basic: 50 AI calls/day (Haiku or GPT-4o-mini only)
- AI Pro: unlimited (all models)

## Save options
When user clicks Save:
1. Local (anonymous) — browser localStorage only
2. Vidrio cloud (free account+):
   - Auto-expire: 1 Hour, 1 Day, 7 Days, 30 Days, Never (paid)
   - Password protect (optional)
   - Shareable link: vidrio.app/note/[share_token]
   - Shared notes show "Created with Vidrio" footer
3. Google Drive (Basic+)
4. Dropbox (Pro+)

## Note encryption
- Notes encrypted client-side before sending to Supabase
- Use Web Crypto API: AES-GCM 256-bit
- Encryption key derived from user's Clerk session token
- Password-protected notes use PBKDF2 key derivation
- Server never sees plaintext note content

## Supabase auto-cleanup
Enable pg_cron to delete expired notes:
SELECT cron.schedule(
  'delete-expired-notes',
  '0 * * * *',
  $$ DELETE FROM notes WHERE expires_at < NOW() $$
);

## Shareable links
- Anonymous share: vidrio.app/note/[share_token]
- Password protected: prompt for password before showing
- Expired notes: show "This note has expired" page
- Shared note footer: "Created with Vidrio — vidrio.app"
  with subtle branding, not intrusive

## App routes
/ — landing page (hero, pricing, features, CTA)
/app — main editor (the actual notes app)
/note/[token] — shared note viewer
/sign-in — Clerk sign in
/sign-up — Clerk sign up
/pricing — pricing page
/api/ai — AI proxy endpoint (server-side, hides API keys)
/api/notes — note CRUD
/api/stripe/checkout — create checkout session
/api/stripe/webhook — Stripe webhook handler
/api/usage — check and increment AI usage

## Editor features (CodeMirror 6)
- All formats from desktop app: Plain text, Markdown, Python,
  JavaScript, TypeScript, Java, C#, C, C++, SQL, HTML/CSS,
  PowerShell, Bash, JSON, Rust, CSS, XML, RTF, CSV
- Syntax highlighting per format
- RTF contextual toolbar (Basic+)
- CSV contextual toolbar with table view (Basic+)
- XML contextual toolbar (Basic+)
- Line numbers toggle
- Font family and size controls

## Transparency implementation
CSS approach (all browsers):
  document.body.style.opacity = value
  document.body.style.backdropFilter = 'blur(8px)'
  document.body.style.backgroundColor = 'rgba(0,0,0,0.3)'

PiP approach (AI Pro, Chrome/Edge):
  Use Document Picture-in-Picture API:
  const pipWindow = await documentPictureInPicture.requestWindow({
    width: 600,
    height: 400
  })
  pipWindow.document.body.append(noteElement.cloneNode(true))

## Responsive / mobile
- Single pane on mobile
- Bottom action bar replaces top toolbar on mobile
- RTF/CSV/XML toolbars scroll horizontally on mobile
- Workspace panel is slide-in drawer on mobile
- PWA manifest for Add to Home Screen

## Conventions
- No em dashes — use commas or shorter sentences
- Sentence case for all UI text
- README.md updated after every code change
- Components: src/components/
- Server actions: src/app/api/
- Supabase client: src/lib/supabase.ts
- Stripe helpers: src/lib/stripe.ts
- Clerk helpers: src/lib/auth.ts
- AI service: src/lib/ai.ts

## Reference
## Reference
Desktop app (original WPF): 
github.com/danhino/ai-transparent-notes

Desktop app v2 (Tauri/React — primary reference):
github.com/danhino/ai-transparent-notes-v2

Use ai-transparent-notes-v2 as the primary reference for:
- AI prompts and actions (src/services/aiService.ts)
- Editor features and toolbar layouts
- RTF, CSV, XML contextual toolbar implementation
- Theme color values (src/styles.css)
- Format options and language map (src/utils/languageMap.ts)
- CodeMirror 6 setup and configuration
- Diff highlighting implementation
- Compare dialog behavior
- Settings structure

Use ai-transparent-notes (original WPF) only as a fallback
if something is not found in v2.