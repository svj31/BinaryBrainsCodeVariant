# SecondWind

A place for unfinished projects to rest, and a clear way to decide which ones deserve another go.
Code Variant Build 01, Problem Statement 05 (The Project Graveyard). Team Binary Brains.

## Run

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
npx playwright test  # end-to-end tests (builds and serves on :3100)
```

## What is inside

| Route | What it does |
| --- | --- |
| `/` | Landing page with a live Resurrection Score demo |
| `/garden` | Graveyard in four views: 3D Garden, Plots, Ledger, Timeline |
| `/garden/[id]` | Verdict, reasons, score breakdown, path choice (sprint, pivot, salvage, merge, archive), timeline, revisit reminder |
| `/bury` | 3-step autopsy wizard with validation, autosave and bot protection |
| `/salvage` | Salvage Yard of reusable parts |
| `/insights` | Death Report computed from your own garden |
| `/contact`, `/privacy`, `/terms` | Contact form (server-validated), legal pages |

Stack: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, three.js via React Three Fiber, Framer Motion, Zustand.

- Scoring rules: `src/lib/score.ts` (rule-based and explainable)
- Sample data: `src/lib/seed.ts` (stored per browser in localStorage)

## Before launch

1. Connect the custom domain and set `NEXT_PUBLIC_SITE_URL` (used by metadata, sitemap, robots and OG tags).
2. Optional: set `NEXT_PUBLIC_ANALYTICS_DOMAIN` to turn on the consent-gated, cookie-free Plausible analytics.
3. Optional: set `CONTACT_WEBHOOK_URL` (server-only) to deliver contact messages.
4. Turn off any "Made with" badge in your hosting provider's settings.

See `.env.example`. HTTPS is enforced by `src/middleware.ts` and an HSTS header in `next.config.ts`.
