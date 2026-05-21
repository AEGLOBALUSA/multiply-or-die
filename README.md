# Multiply or Die — Landing Page

Pastor book launch page for `multiplyordie.com`. Free hardback + pay-what-you-can donation + Multiplication Masterclass drip enrollment.

**Live date:** May 28, 2026 (pre-launch) · June 30, 2026 (public)

---

## Stack

- **Framework:** Next.js 15 (App Router), TypeScript strict
- **Styling:** Tailwind CSS (FCG design system)
- **Payments:** Stripe Checkout (two line items: shipping + donation)
- **Database:** Supabase Postgres
- **Email:** Resend + React Email
- **Drip automation:** Supabase pg_cron + Edge Functions
- **Deploy:** Vercel

---

## Setup

### 1. Clone and install

```bash
git clone <repo> multiply-or-die
cd multiply-or-die
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
# Fill in all values — see .env.example for documentation
```

### 3. Supabase

1. Create a new Supabase project (do NOT reuse futures-church-web)
2. Enable extensions in Dashboard → Database → Extensions:
   - `pgcrypto` (usually pre-enabled)
   - `pg_cron`
   - `pg_net`
3. Run migrations in order:
   ```sql
   -- Run in Supabase SQL Editor:
   -- 1. supabase/migrations/0001_multiply_schema.sql
   -- 2. supabase/migrations/0002_pg_cron_drip.sql
   ```
4. Set app settings (Database → Settings):
   - `app.supabase_url` = your project URL
   - `app.cron_secret` = same value as `CRON_SECRET` env var

### 4. Stripe Dashboard (test mode first)

- [ ] Create product "Multiply or Die — Standard Shipping" → price $9.95 → copy ID to `STRIPE_PRICE_SHIPPING_STANDARD`
- [ ] Create product "Multiply or Die — Priority Shipping" → price $12.95 → copy ID to `STRIPE_PRICE_SHIPPING_PRIORITY`
- [ ] *(Option B, recommended)* Create product "Multiply or Die Book" → price $24.99 → copy ID to `STRIPE_PRICE_BOOK`
- [ ] Enable Stripe Tax (Settings → Tax → Enable)
- [ ] Register webhook endpoint: `https://multiplyordie.com/api/webhooks/stripe`
- [ ] Subscribe to events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
- [ ] Copy webhook secret → `STRIPE_WEBHOOK_SECRET`
- [ ] Configure branding: FCG logo, violet `#5D1FEC`
- [ ] Apply for nonprofit pricing: email nonprofit@stripe.com with 501(c)(3) documentation

### 5. Deploy Edge Function

```bash
npx supabase functions deploy process-drip --project-ref <your-ref>
```

Set secrets in Supabase Dashboard or via CLI:
```bash
npx supabase secrets set RESEND_API_KEY=... CRON_SECRET=... --project-ref <your-ref>
```

### 6. Vercel deploy

```bash
vercel --prod
```

Set all environment variables in Vercel Dashboard before promoting to production.

---

## Development

```bash
npm run dev          # Start dev server on :3000
npm run typecheck    # TypeScript strict check
npm run lint         # ESLint
npm test             # Vitest unit tests
npm run test:e2e     # Playwright (requires dev server running)
```

---

## Pre-Launch Checklist

### Legal (MUST complete before first live transaction)

- [ ] CPA reviews `emails/donation-receipt.tsx` — confirms deductible amount formula
- [ ] Attorney confirms FCG DBA on Stripe matches IRS filing
- [ ] Book FMV ($24.99) confirmed as established retail price
- [ ] Stripe tax code `txcd_10000000` confirmed with Stripe support for FCG's nexus states
- [ ] CAN-SPAM/CASL compliance confirmed for drip sequence

### Technical

- [ ] All environment variables set in Vercel (Production + Preview)
- [ ] Stripe live keys configured
- [ ] Webhook endpoint registered with live Stripe keys
- [ ] Supabase migrations applied on production project
- [ ] Edge Function deployed and pg_cron job active
- [ ] Test purchase (Stripe test mode): verify order confirmation + receipt emails arrive
- [ ] Test refund: verify counter decrements
- [ ] Lighthouse score: 90+ performance

### Content (before launch)

- [ ] Book cover image at `/public/images/book-cover.png` (WebP preferred)
- [ ] VSL poster image at `/public/images/vsl-poster.jpg`
- [ ] Real endorser quotes + photos in `components/endorsements/EndorserCards.tsx`
- [ ] Vimeo or Wistia video ID set (env var or hardcoded in `app/page.tsx`)
- [ ] OG image at `/public/og.png` (1200×630)
- [ ] FCG EIN, legal name, address set in environment variables
- [ ] Privacy policy at `/privacy`

---

## Architecture Decisions

**Why Supabase for CRM/analytics?** Ashley's existing Futures projects all use Supabase. Consistent tooling, no new platform to manage.

**Why 3-line-item Stripe model?** The donation line item IS the deductible amount — no subtraction math, no IRS calculation risk. Cleanest audit trail.

**Why Resend (not Supabase email)?** Supabase's built-in email is for auth flows. Resend gives templated transactional emails, delivery tracking, and bounce handling.

**Why pg_cron for drip?** No extra queuing service needed. Fires every 5 min, processes due rows in `email_queue`, marks sent. Simple, auditable, fits existing Supabase stack.

---

## Key Files

| File | Purpose |
|------|---------|
| `app/api/webhooks/stripe/route.ts` | Stripe webhook — most complex; raw body, idempotency, receipt trigger |
| `app/api/checkout/route.ts` | Creates Stripe session server-side |
| `emails/donation-receipt.tsx` | IRS-critical — reviewed by CPA before launch |
| `lib/pwyc.ts` | Pure math functions for slider — unit tested |
| `supabase/migrations/0001_multiply_schema.sql` | Full schema + RLS + trigger |
| `supabase/functions/process-drip/index.ts` | Drip email sender (pg_cron target) |

---

## ⚠️ Legal Flags

See [plan file](../.claude/plans/code-prompt-effervescent-sketch.md) Legal Flags section for the 6 items that require professional review before the first live transaction.
