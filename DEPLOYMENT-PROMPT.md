# Multiply or Die — Deployment Continuation Prompt

## Context
The multiply-or-die codebase at `/Users/ashleymarkevans/multiply-or-die` is a complete sales funnel for an Indonesian church leadership conference. All 32 source files are built and pushed to GitHub at `AEGLOBALUSA/multiply-or-die` (main branch). The code reads all config from environment variables — no hardcoded secrets or project IDs.

## Supabase Setup
- **Project:** Indonesian National Conference (`qpvghoqrfbpfjywyteeg`), region: Singapore
- API URL: `https://qpvghoqrfbpfjywyteeg.supabase.co`
- Org ID: `dzywonzthocftaowyqoa`
- Get keys via: `npx supabase projects api-keys --project-ref qpvghoqrfbpfjywyteeg`

## Remaining Tasks (in order)

### 1. Run Migration on New Supabase Project
```bash
cd /Users/ashleymarkevans/multiply-or-die
npx supabase link --project-ref qpvghoqrfbpfjywyteeg
npx supabase db query --linked -f supabase-migration.sql
```
If IPv6 fails, use the Supabase SQL Editor in browser at:
https://supabase.com/dashboard/project/qpvghoqrfbpfjywyteeg/sql
Paste contents of `supabase-migration.sql` and run.

### 2. Create Netlify Site
```bash
# If netlify CLI available:
netlify sites:create --name multiply-or-die
netlify link
netlify deploy --prod

# Otherwise: connect via Netlify dashboard → Import existing project → GitHub → AEGLOBALUSA/multiply-or-die
# Build settings: No build command, publish directory: "."
```

### 3. Set Netlify Environment Variables
Set these in Netlify dashboard (Site settings > Environment variables):

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | `https://qpvghoqrfbpfjywyteeg.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | *(get from `npx supabase projects api-keys --project-ref qpvghoqrfbpfjywyteeg`, use the `service_role` key)* |
| `DESK_PIN` | *(ask Ashley's team for 4-digit PIN)* |
| `TWILIO_ACCOUNT_SID` | *(from Twilio dashboard)* |
| `TWILIO_AUTH_TOKEN` | *(from Twilio dashboard)* |
| `TWILIO_WHATSAPP_NUMBER` | *(verified WhatsApp Business number from Twilio)* |

### 4. Configure DNS
Point `multiplyordie.com` to Netlify:
- Add custom domain in Netlify dashboard
- Update DNS records at domain registrar to point to Netlify
- Enable HTTPS (automatic via Let's Encrypt)

### 5. Replace Vimeo Placeholders
Once videos are uploaded to Vimeo Pro (domain-restricted to multiplyordie.com), replace `PLACEHOLDER_1` through `PLACEHOLDER_5` in:
- `netlify/functions/masterclass-data.js` (VIDEOS array, ~line 7)
- `netlify/functions/start-video.js` (VIMEO_IDS object, ~line 7)

### 6. Submit WhatsApp Templates
Submit all 9+ message templates to Meta for approval via Twilio console. Allow 2-3 business days. Templates are in Bahasa Indonesia — see `cron-whatsapp.js` and `submit-assignment.js` for exact message text.

## What's Already Done
- [x] All HTML pages (6 files)
- [x] All CSS (styles.css)
- [x] All client JS (5 files)
- [x] All Netlify Functions (10 functions)
- [x] All shared server libs (5 files)
- [x] Images (ashley-headshot.jpg, book-cover.jpg, checkmark.svg)
- [x] netlify.toml with cron, CSP headers, redirects
- [x] package.json with dependencies
- [x] npm install (node_modules present)
- [x] Git repo created and pushed to GitHub (AEGLOBALUSA/multiply-or-die)
- [x] New Supabase project created (qpvghoqrfbpfjywyteeg)
- [ ] Migration run on new project
- [ ] Netlify site created and connected
- [ ] Environment variables set
- [ ] DNS configured
- [ ] Vimeo IDs populated
- [ ] WhatsApp templates submitted

## Key Architecture Notes
- Static HTML site — NO build step, NO framework
- All API calls go through `/api/*` → Netlify Functions (secrets stay server-side)
- Supabase client uses lazy singleton pattern in `lib/supabase.js`
- Rate limiting is in-memory per function instance
- WhatsApp dedup via `whatsapp_log` table prevents duplicate sends
- Timing-safe comparison for PIN and masterclass tokens
- Cron runs daily at 2 AM UTC (9 AM Jakarta WIB)
- User-facing pages: Bahasa Indonesia; Admin tools: English
