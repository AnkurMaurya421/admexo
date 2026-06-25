# Lead Management & Email Tracking System

## Technologies used
- **Next.js 14 (App Router)** — frontend form, dashboard, and API route handlers in one app
- **Supabase (Postgres)** — single `leads` table stores submissions + tracking state
- **Nodemailer + Gmail SMTP** — transactional email delivery (sends to any recipient immediately, no domain verification needed)
- **TypeScript**

## Architecture
1. `src/app/page.tsx` — lead capture form, posts JSON to `/api/leads`.
2. `src/app/api/leads/route.ts` —
   - validates input
   - runs `classifyLead()` (rule-based bonus AI step) to tag `category` + `priority`
   - inserts the row into Supabase
   - calls `sendLeadEmail()` to send the personalized email
   - marks `email_sent = true`
3. `src/lib/email.ts` — builds the email HTML using Nodemailer over Gmail SMTP, embedding:
   - a 1×1 tracking pixel pointing at `/api/track/open/[id]`
   - a "Learn more" link pointing at `/api/track/click/[id]?url=<real destination>`
4. `src/app/dashboard/page.tsx` — server component that queries all leads from Supabase and aggregates Total Leads / Emails Sent / Opened / Open Rate / Clicked / Click Rate.

## How tracking works
- **Open tracking**: most email clients auto-load `<img>` tags. When the pixel loads, `/api/track/open/[id]` fires, updates `opened`, `opened_at`, and increments `open_count`, then returns a real (cached-disabled) transparent GIF so the email still renders normally.
- **Click tracking**: the visible link doesn't point straight at the destination — it points at our own `/api/track/click/[id]` endpoint with the real URL as a query param. That route logs the click (`clicked`, `clicked_at`, `click_count`) and then issues a 302 redirect to the actual destination, so the user experience is unaffected.
- Both endpoints are intentionally "fail open": if the DB write fails, the pixel/redirect still returns successfully so tracking never breaks the email or the user's click.

## Bonus AI feature
`src/lib/classify.ts` calls OpenAI (`gpt-4o-mini` by default, configurable via `OPENAI_MODEL`) to classify the `requirement` text into:
- `category` — a short label like "AI Automation", "Web Development", "Booking & Payments", "Marketing", "Design", "App Development", or "General Inquiry"
- `priority` — High / Medium / Low, based on urgency and how specific/serious the lead sounds

The prompt forces strict JSON output (`response_format: { type: "json_object" }`) so the result parses reliably every time.

**Reliability for a live demo**: the call has a 6-second timeout, and if `OPENAI_API_KEY` is missing, the request errors, or it times out, classification silently falls back to `classifyLeadRuleBased()` — a zero-dependency keyword classifier in the same file. So a flaky network or rate limit never blocks lead submission.

## Design
The UI uses a dark "signal tracking" theme — `src/app/globals.css` holds the design tokens (color, type, motion), with `page.module.css` / `dashboard/page.module.css` for each screen and a shared `Nav` component (`src/components/Nav.tsx`) linking the form and dashboard. The dashboard's "journey" column (sent → opened → clicked, with live counts) is the signature visual element, built directly from the same tracking fields the API writes to.

## Setup
1. Run `supabase/schema.sql` in your Supabase project's SQL editor.
2. Copy `.env.example` to `.env.local` and fill in Supabase + Gmail credentials (see comments in `.env.example` for the App Password setup steps).
3. `npm install`
4. `npm run dev`
5. Visit `/` for the form, `/dashboard` for analytics.

Gmail SMTP sends to any recipient as soon as the App Password is set up — no sandbox restriction to work around, unlike Resend's default `resend.dev` domain.
