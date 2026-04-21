# FireDoor Network

**A network that leads to work.**

FireDoor Network is the UK-facing professional network that connects **verified fire door surveyors and inspectors** with **property managers, contractors, and clients** who need compliant door work done properly.

This repository holds the marketing site: a single landing experience that explains how affiliates apply, get verified, and win work through a searchable directory—without the noise of generic trade bodies.

## What the site covers

- **Hero**: Value proposition, primary calls to action (affiliate signup, directory), and trust signals (vetted credentials, insurance, UK coverage).
- **How it works**: Apply with certifications and DBS, get a Verified Affiliate profile, get discovered in the directory.
- **Why join**: Leads, geographic control, client trust, professional profiles, low friction onboarding, compliance framing (BS 8214, Regulation 10, Fire Safety Act).
- **Trust & compliance**: Document checks, alignment with Fire Safety (England) Regulations 2022, and secure handling of affiliate data.
- **Directory CTA**: Prompt to apply and go live in the public directory quickly.

Content and visual language follow the same positioning as the reference experience at [fire-door-connect.lovable.app](https://fire-door-connect.lovable.app/).

## Stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [lucide-react](https://lucide.dev/) for icons
- [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) and [Inter](https://fonts.google.com/specimen/Inter) via `next/font`

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run start   # run production server
npm run lint    # eslint
```

## Project layout

- `app/page.tsx` — home route
- `app/layout.tsx` — root layout, fonts, metadata
- `app/globals.css` — design tokens and utilities
- `components/landing/` — landing page sections and header
- `public/hero-firedoor.jpg` — hero imagery
