<div align="center">

<img src="public/logo.svg" alt="SecondWind logo" width="88" />

# SecondWind

**A gentle place for unfinished projects to rest, and a clear way to decide which ones deserve another go.**

Code Variant · Build 01 · PS 05 *The Project Graveyard* · Team **Binary Brains** (Sagnik Chandra, Shrusti Jain)

`Next.js 15` · `TypeScript` · `Tailwind CSS v4` · `three.js / React Three Fiber` · `Framer Motion` · `Zustand` · `Playwright`

</div>

---

## Table of contents

1. [The problem](#the-problem)
2. [What SecondWind does](#what-secondwind-does)
3. [Surprise challenge: the Canvas Protocol](#surprise-challenge-the-canvas-protocol)
4. [Feature map](#feature-map)
5. [How the Resurrection Score works](#how-the-resurrection-score-works)
6. [Routes](#routes)
7. [Getting started](#getting-started)
8. [Testing](#testing)
9. [Performance and accessibility](#performance-and-accessibility)
10. [Security and privacy](#security-and-privacy)
11. [Project structure](#project-structure)
12. [Deployment checklist](#deployment-checklist)

---

## The problem

Most builders have a folder of projects they started and never finished. They stopped because of scope creep, lost time or a newer idea, and nobody wrote down why. Trackers manage active work; nothing helps you decide what to do with work you already dropped. The real gap is a decision: **should this project live again, and in what form?**

## What SecondWind does

| Step | What happens |
|---|---|
| **1. Autopsy** | A 3-step wizard records what the project was, what you finished, what is left and why you stopped. |
| **2. Verdict** | The rule-based Resurrection Score weighs six signals and recommends **Revive, Pivot, Salvage, Merge or Archive**, with the reasons spelled out. |
| **3. Second wind** | Each path does real work: a 7-day sprint, a pivot sketch, saved parts, a merged project or an epitaph. |
| **4. Remember** | A 3D garden, the Salvage Yard, the Death Report and reminders keep the graveyard useful over time. |

## Surprise challenge: the Canvas Protocol

Primary actions use **no standard buttons**. Every one is done by dragging a data card into an Action Zone.

| Feature | Card | Action Zones |
|---|---|---|
| Bury a project | Autopsy card | Next step → Open grave |
| Choose a path | Project headstone | Revive · Pivot · Salvage · Merge · Archive · Compost |
| 7-day sprint | Day cards | To do ⇄ Done |
| Save / pivot / archive | Part, pivot and epitaph cards | Salvage crate · Replant · Lay to rest |
| Merge | Sibling project | Stitching table |
| Reminders | Nudge card | 2 weeks · 1 month · 3 months · Clear |
| Garden dock | Any project card | Open verdict · Nudge · Compost |
| Borrow a part | Part card | Any living project |
| Contact | Letter | Mailbox |

- Works with **mouse, pen and touch**, with ghost-card physics, glowing zones and edge auto-scroll.
- **Keyboard:** Space picks a card up, Tab moves between zones, Enter drops, Escape cancels. Screen readers announce every step.

## Feature map

| Pitch deck feature | Where |
|---|---|
| Guided Autopsy, cause-of-death tags, autosave, sample prefill | `/bury` |
| Resurrection Score, "Why this verdict?", radar of signals | Garden side panel, `/garden/[id]` |
| Sprint plan, pivot sketch, salvage, Frankenstein merge, epitaph | `/garden/[id]` |
| Graveyard Garden: 3D space garden (**Easy** mode by default, **Pilot** mode optional), Plots, Ledger, Timeline | `/garden` |
| Salvage Yard with kind-specific previews and Borrow | `/salvage` |
| Death Report: causes, verdict donut, lifespan scatter, histogram, seasons, stacks | `/insights` |
| Epitaph, timeline and reminders | `/garden/[id]` |
| Magic rituals, view-change spells, themed loaders, animated logo, lantern cursor | Site-wide |

## How the Resurrection Score works

`src/lib/score.ts` is fully rule-based, so every verdict can be traced to its inputs.

| Signal | Weight |
|---|---|
| Idea strength | 0.20 |
| Work completed | 0.15 |
| Effort remaining (inverted) | 0.15 |
| Cause is fixable (per cause of death) | 0.15 |
| Still relevant | 0.15 |
| Your interest now | 0.20 |

The verdict comes from the score plus rules: for example, high interest and a score of 68 or more means **Revive**, and three or more shared tags with a sibling means **Merge**. A shrunk 7-day plan is then generated from the "still unfinished" list.

## Routes

| Route | Purpose |
|---|---|
| `/` | Landing page with a live score demo and journey |
| `/garden` | The garden in four views, plus the action dock |
| `/garden/[id]` | Full verdict and path workspace |
| `/bury` (`?sample=1`) | Autopsy wizard |
| `/salvage` | Salvage Yard |
| `/insights` | Death Report |
| `/contact`, `/privacy`, `/terms` | Contact form and legal pages |
| `/api/contact` | Server-side validation, honeypot and rate limit |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image`, `/manifest.webmanifest` | SEO and app metadata |

## Getting started

```bash
npm install
npm run dev                    # http://localhost:3000
npm run build && npm start     # production build
```

Sample projects load automatically. Your data is saved in the browser (localStorage), and "Reset to sample data" in the garden restores the sample set.

### Environment variables (see `.env.example`)

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public | Canonical domain for metadata, sitemap and OG tags (**set before deploying**) |
| `NEXT_PUBLIC_ANALYTICS_DOMAIN` | public | Turns on cookie-free Plausible analytics, only after visitor consent |
| `CONTACT_WEBHOOK_URL` | server only | Where contact messages are delivered |

## Testing

```bash
# build into a separate folder so it never clashes with a running `next dev`
NEXT_DIST_DIR=.next-test npm run build
NEXT_DIST_DIR=.next-test npx next start -p 3100 &
BASE_URL=http://localhost:3100 npx playwright test
```

| Playwright project | Covers |
|---|---|
| `chrome-desktop` | Full functional suite: wizard, validation, bot traps, every drag-and-drop flow, keyboard dragging, SEO files, headers, a11y labels |
| `chrome`, `safari`, `ipad`, `iphone`, `android-phone` | Device smoke: every page renders, no sideways scrolling, fast boot, Easy/Pilot garden, real touch drag on Android |
| `firefox` | Same smoke suite. Not verified in our environment, because Playwright's bundled Firefox would not start on our macOS version. |

Last run: **39 tests passed** across 6 Playwright projects (Firefox not run).

## Performance and accessibility

- The cinematic intro plays **once per visit** and can be skipped with any tap or key; repeat loads fade in within 0.4 s.
- Phones and data-saver visitors get a light SVG hero instead of WebGL. 3D scenes pause when off screen and use fewer particles on low-power devices.
- On a throttled mid-range phone: first paint about **0.35 s**, largest paint under **1.2 s**, layout shift about **0**.
- `prefers-reduced-motion` is respected throughout. All text meets WCAG AA contrast, plus a skip link, ARIA labels and full keyboard support.

## Security and privacy

- HTTPS redirect middleware, HSTS, CSP, `X-Frame-Options`, `nosniff`, `Referrer-Policy` and `Permissions-Policy`.
- No secrets in the frontend; the contact webhook is server-only.
- Forms are protected by a honeypot, a minimum time-to-submit check and per-IP rate limiting.
- Cookie consent banner, and no tracking cookies. See `/privacy` and `/terms`.

## Project structure

```
src/
├─ app/            routes, layout, loaders, SEO files, API route
├─ components/
│  ├─ canvas/      drag-and-drop engine (Canvas Protocol)
│  ├─ magic/       rituals, view spells, reveal bursts
│  ├─ three/       3D hero garden and space garden
│  ├─ garden/      garden app, views, switcher, side panel
│  ├─ project/     verdict page and path panels
│  ├─ bury/ salvage/ insights/ landing/ layout/ ui/
├─ lib/            scoring engine, store, seed data, validation
tests/             Playwright e2e and device suites
```

## Deployment checklist

- [ ] Connect the custom domain and set `NEXT_PUBLIC_SITE_URL`
- [ ] Turn off the host's "Made with" badge
- [ ] Optionally set the analytics and webhook variables
- [ ] Open the site once in Firefox to check it by hand

---

<div align="center"><sub>Every project deserves a second look.</sub></div>
