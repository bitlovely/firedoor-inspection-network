# Fire Door Network

**A network that leads to work.**

UK-focused platform for verified fire door surveyors and inspectors: **inspector signup**, **admin review**, **public directory**, **per-inspector profiles**, and **Stripe** for Advanced plan subscriptions. Marketing, auth, and dashboards are built with **Next.js** (App Router).

---

## Features

- **Landing** (`/`) — Hero, how it works, why join, trust, CTAs.
- **Inspector signup** (`/signup`) → **Dashboard** (`/dashboard`) — authenticated users complete registration and upload documents via **`POST /api/me/register-affiliate`**.
- **Inspector dashboard** — Application status, profile, documents, subscription (Stripe Checkout / Portal when configured).
- **Admin** (`/admin`) — Session-based login; list and detail views for applications, document verification toggles, approve / reject / verified workflow.
- **Public directory** (`/directory`) — Search and filters; profile cards link to **`/directory/[id]`**.
- **Email** — Optional **Resend** confirmation when an application is submitted successfully.

---

## Stack

| Layer | Technology |
|--------|------------|
| Framework | [Next.js](https://nextjs.org/) 16 (App Router) |
| UI | [React](https://react.dev/) 19, [Tailwind CSS](https://tailwindcss.com/) v4 |
| Data | [Supabase](https://supabase.com/) — Postgres + Auth + Storage |
| Validation | [Zod](https://zod.dev/) |
| Payments | [Stripe](https://stripe.com/) |
| Email | [Resend](https://resend.com/) |
| Icons | [lucide-react](https://lucide.dev/) |

---

## Environment variables

Copy **`.env.example`** to **`.env`** (or `.env.local`) and fill values. Never commit real secrets.

### Supabase (required for core app)

| Variable | Scope | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anon key (browser + server routes that act on behalf of the user). |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | Bypasses RLS; used for admin APIs, webhooks, storage, and privileged reads/writes. **Do not expose to the client.** |

### Site URL (recommended in production)

| Variable | Scope | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_SITE_URL` | Public | Canonical site origin (no trailing slash), e.g. `https://example.com`. Used for Stripe redirect URLs when `Origin` is missing, confirmation email dashboard links, etc. |

### Stripe (optional — subscriptions)

| Variable | Scope | Purpose |
|----------|--------|---------|
| `STRIPE_SECRET_KEY` | Server | Stripe API secret (`sk_…`). |
| `STRIPE_WEBHOOK_SECRET` | Server | Signing secret for `POST /api/stripe/webhook` (`whsec_…`). |
| `STRIPE_PRICE_ID_ADVANCED_MONTHLY` | Server | Price ID for the Advanced monthly plan used in Checkout. |

Configure the webhook in Stripe to point at:

`https://<your-domain>/api/stripe/webhook`

### Resend (optional — application received email)

| Variable | Scope | Purpose |
|----------|--------|---------|
| `RESEND_API_KEY` | Server | Resend API key. If unset, confirmation email is skipped (application still succeeds). |
| `RESEND_FROM_EMAIL` | Server | Verified sender, e.g. `Fire Door Network <onboarding@resend.dev>` or your domain. Required together with `RESEND_API_KEY` to send mail. |

### Admin dashboard

| Variable | Scope | Purpose |
|----------|--------|---------|
| `ADMIN_EMAIL` | Server | Email allowed to sign in at `/admin`. |
| `ADMIN_PASSWORD` | Server | Password for that admin user. |
| `ADMIN_SESSION_SECRET` | Server | Secret used to sign admin session cookies. Set a long random string in production (see `lib/admin/session.ts`). |

### Footer

| Variable | Scope | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_CONTACT_EMAIL` | Public | Optional. Used for the footer “Contact us” `mailto:`; if unset, a code fallback may be used—set this in production. |

---

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com/).
2. In the **SQL Editor**, run the migrations in order (newest additions depend on earlier files):

   - `supabase/migrations/001_affiliate_applications.sql`
   - `supabase/migrations/002_affiliate_applications_user_id.sql`
   - `supabase/migrations/003_affiliate_public_profile_fields.sql`
   - `supabase/migrations/004_affiliate_subscriptions.sql`
   - `supabase/migrations/005_affiliate_fdin_pin.sql`

3. Enable **Auth** (email/password) and add redirect URLs your app uses (e.g. `/dashboard`, `/reset-password`) under Authentication → URL configuration.

4. Set the Supabase-related env vars (see table above).

5. Restart the dev server after changing `.env`.

Application files live in a **private** storage bucket (see migrations); uploads are tied to application IDs under `{application_id}/…`.

---

## Local development

```bash
npm install
npm run dev
```

| URL | Description |
|-----|-------------|
| [http://localhost:3000](http://localhost:3000) | Landing |
| [http://localhost:3000/signup](http://localhost:3000/signup) | Inspector signup |
| [http://localhost:3000/signin](http://localhost:3000/signin) | Sign in |
| [http://localhost:3000/dashboard](http://localhost:3000/dashboard) | Inspector dashboard (auth required) |
| [http://localhost:3000/directory](http://localhost:3000/directory) | Public directory |
| [http://localhost:3000/admin](http://localhost:3000/admin) | Admin login |

Other commands:

```bash
npm run build
npm run start
npm run lint
```

---

## Project layout (selected)

| Path | Role |
|------|------|
| `app/page.tsx` | Landing |
| `app/signup/`, `app/signin/` | Auth |
| `app/dashboard/` | Inspector dashboard + registration completion |
| `app/directory/` | Public directory + profile |
| `app/admin/` | Admin login + application dashboard |
| `app/api/me/register-affiliate/` | Submit inspector application + uploads |
| `app/api/me/application/` | Current user’s application JSON / PATCH |
| `app/api/billing/checkout`, `portal` | Stripe Checkout / Customer Portal |
| `app/api/stripe/webhook/` | Sync subscription status to Supabase |
| `app/api/admin/` | Admin session + applications |
| `app/api/directory/` | Public directory API |
| `components/landing/` | Marketing UI |
| `lib/supabase/` | Supabase clients (browser / admin) |
| `lib/stripe/server.ts` | Stripe server client |
| `lib/email/send-application-received.ts` | Resend “application received” email |
| `supabase/migrations/` | SQL migrations |

---

## Security notes

- Keep **`SUPABASE_SERVICE_ROLE_KEY`**, **`STRIPE_SECRET_KEY`**, **`STRIPE_WEBHOOK_SECRET`**, **`ADMIN_PASSWORD`**, **`ADMIN_SESSION_SECRET`**, and **`RESEND_API_KEY`** out of git and client bundles.
- Use strong **`ADMIN_SESSION_SECRET`** and **`ADMIN_PASSWORD`** in production.
- Stripe webhooks must use HTTPS in deployed environments.

---

## Licence / legal

See `terms` and `privacy` routes in the app for on-site policies.
