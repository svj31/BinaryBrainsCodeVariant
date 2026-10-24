<div align="center">

<img src="public/logo.svg" alt="SecondWind logo" width="110" />

# 🪦 SecondWind

### *Every unfinished project deserves a second look.*

**A graveyard for abandoned side projects, with a scoring engine that decides which ones deserve to live again.**

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-project--graveyard--gold.vercel.app-2d5a43?style=for-the-badge)](https://project-graveyard-gold.vercel.app/)
[![Demo Video](https://img.shields.io/badge/🎬_Demo_Video-Watch_on_Drive-f2b34a?style=for-the-badge&labelColor=1e2721)](https://drive.google.com/drive/folders/1eYu63fIn4m9T0o77mvZciTtYZnracijG?usp=sharing)

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=threedotjs&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=flat-square&logo=react&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

![Tests](https://img.shields.io/badge/tests-39_passing-2ea44f?style=flat-square)
![A11y](https://img.shields.io/badge/WCAG-AA-6f42c1?style=flat-square)
![LCP](https://img.shields.io/badge/LCP-%3C1.2s-0a7ea4?style=flat-square)
![Devices](https://img.shields.io/badge/devices-desktop_·_tablet_·_phone-e9a53a?style=flat-square)

<br/>

**Code Variant · Build 01 · PS 05 — *The Project Graveyard***
**Team Binary Brains** — Sagnik Chandra · Shrusti Jain

</div>

---

## 📑 Table of Contents

| | | |
|---|---|---|
| 1. [💡 The Problem](#-the-problem) | 7. [🧮 Resurrection Score](#-the-resurrection-score) | 13. [🔐 Security & Privacy](#-security--privacy) |
| 2. [✨ The Solution](#-the-solution) | 8. [🗺️ Routes](#️-routes) | 14. [📁 Project Structure](#-project-structure) |
| 3. [🎬 Demo](#-demo) | 9. [🔄 Data Flow](#-data-flow) | 15. [🚀 Getting Started](#-getting-started) |
| 4. [🧰 Tech Stack](#-tech-stack) | 10. [🖐️ Canvas Protocol](#️-the-canvas-protocol-surprise-challenge) | 16. [🧪 Testing](#-testing) |
| 5. [🏗️ Architecture](#️-system-architecture) | 11. [🌌 Feature Map](#-feature-map) | 17. [☁️ Deployment](#️-deployment) |
| 6. [🧭 User Journey](#-user-journey) | 12. [⚡ Performance & A11y](#-performance--accessibility) | 18. [👥 Team](#-team) |

---

## 💡 The Problem

Most builders have a folder full of projects they started and never finished. They stopped because of scope creep, lack of time, or a shinier idea, and nobody wrote down why.

> Project trackers manage **active** work. Nothing helps you decide what to do with work you've already **dropped**.

The real gap is a decision: ***should this project live again, and in what form?***

## ✨ The Solution

SecondWind turns a pile of abandoned repos into a guided, visual decision.

<table>
<tr>
<td align="center" width="25%">🔬<br/><b>1. Autopsy</b><br/><sub>A 3-step wizard records what was built, what's left, and why it stopped.</sub></td>
<td align="center" width="25%">⚖️<br/><b>2. Verdict</b><br/><sub>A transparent score weighs six signals and recommends a path, with the reasons spelled out.</sub></td>
<td align="center" width="25%">🌱<br/><b>3. Second Wind</b><br/><sub>Each path does real work: a 7-day sprint, a pivot sketch, saved parts, a merge, or an epitaph.</sub></td>
<td align="center" width="25%">🧠<br/><b>4. Remember</b><br/><sub>A 3D garden, the Salvage Yard, the Death Report and reminders keep the graveyard useful over time.</sub></td>
</tr>
</table>

**Five possible verdicts:**

| 🌿 Revive | 🔀 Pivot | 🧰 Salvage | 🧵 Merge | 🕯️ Archive |
|:---:|:---:|:---:|:---:|:---:|
| Finish it with a focused 7-day sprint | Keep the core, change the direction | Harvest the reusable parts | Stitch it into a sibling project | Lay it to rest with an epitaph |

---

### How it works

<p align="center"><img src="docs/how-it-works.jpg" alt="How SecondWind works: your idea, drag and drop, autopsy, score and verdict lead to revive, pivot, salvage, merge or archive" width="100%" /></p>

## 🎬 Demo

<div align="center">

| 🌐 Live App | 🎥 Walkthrough Video |
|:---:|:---:|
| **[project-graveyard-gold.vercel.app](https://project-graveyard-gold.vercel.app/)** | **[Watch on Google Drive](https://drive.google.com/drive/folders/1eYu63fIn4m9T0o77mvZciTtYZnracijG?usp=sharing)** |

</div>

> 💡 Sample projects load automatically, so you can explore every feature right away. Try **Bury a project → Use sample** for a 30-second tour of the full flow.

---

## 🧰 Tech Stack

<div align="center">

<a href="https://skillicons.dev">
  <img src="https://skillicons.dev/icons?i=nextjs,react,ts,tailwind,threejs,html,css,js,nodejs,vercel,git,github,vscode&perline=13" alt="Tech stack icons" />
</a>

</div>

<br/>

| Layer | Technology | Why we chose it |
|---|---|---|
| ⚛️ **Framework** | Next.js 15 (App Router) · React 19 | Server components, file-based routing, built-in SEO and edge middleware |
| 🟦 **Language** | TypeScript 5 (strict) | Types shared end to end, from the scoring engine to the UI |
| 🎨 **Styling** | Tailwind CSS v4 · CSS custom properties | Design tokens, light/dark themes, no runtime CSS cost |
| 🌌 **3D** | three.js · React Three Fiber · drei | The interactive space garden and hero scene |
| 🎞️ **Motion** | Framer Motion | Jelly-physics drag, rituals, view-change spells, reveals |
| 🗃️ **State** | Zustand + `persist` | Small global store, saved to localStorage, no backend needed |
| 🧪 **Testing** | Playwright | End-to-end tests plus a 7-device smoke suite |
| ☁️ **Hosting** | Vercel | Edge network, preview deploys, security headers |

---

## 🏗️ System Architecture

<p align="center"><img src="docs/technical-architecture.jpg" alt="SecondWind technical architecture: clients, Next.js frontend, Canvas Protocol interaction layer, Zustand state and score engine, platform and security" width="100%" /></p>


<details>
<summary><b>View diagram</b></summary>

```mermaid
flowchart TB
    subgraph Client["🖥️ Browser (Client)"]
        direction TB
        UI["🎨 UI Layer<br/>Pages · Components · Tailwind"]
        DND["🖐️ Canvas Protocol<br/>Drag & Drop Engine"]
        MAGIC["✨ Magic Layer<br/>Rituals · Spells · Sound"]
        THREE["🌌 3D Layer<br/>R3F Space Garden"]
        STORE[("🗃️ Zustand Store<br/>persist → localStorage")]
        SCORE["🧮 Scoring Engine<br/>lib/score.ts"]

        UI <--> DND
        UI <--> MAGIC
        UI <--> THREE
        DND -->|"onDrop actions"| STORE
        STORE -->|"projects"| SCORE
        SCORE -->|"assessments"| UI
    end

    subgraph Edge["⚡ Vercel Edge"]
        MW["🛡️ Middleware<br/>HTTPS · Security headers"]
    end

    subgraph Server["🖧 Next.js Server"]
        RSC["📄 Server Components<br/>+ Metadata / OG / Sitemap"]
        API["📬 /api/contact<br/>Validation · Honeypot · Rate limit"]
    end

    EXT["🔗 Contact Webhook<br/>(server-only secret)"]
    PLA["📊 Plausible Analytics<br/>(consent-gated, cookie-free)"]

    Client -->|"request"| MW --> RSC
    RSC -->|"HTML + JS"| Client
    UI -->|"POST form"| API --> EXT
    UI -.->|"only after consent"| PLA

    classDef client fill:#e1ebe2,stroke:#2d5a43,color:#1e2721
    classDef edge fill:#f8e7c8,stroke:#8a520c,color:#1e2721
    classDef server fill:#dcebf0,stroke:#22617a,color:#1e2721
    class UI,DND,MAGIC,THREE,STORE,SCORE client
    class MW edge
    class RSC,API server
```

</details>

### Layered design

<details>
<summary><b>View diagram</b></summary>

```mermaid
flowchart LR
    A["📄 Routes<br/><sub>src/app</sub>"] --> B["🧩 Feature Components<br/><sub>garden · bury · salvage · insights</sub>"]
    B --> C["🧱 Primitives<br/><sub>canvas · ui · magic · motion · three</sub>"]
    C --> D["🧠 Domain Logic<br/><sub>score · verdicts · validate · format</sub>"]
    D --> E[("💾 Persistence<br/><sub>store · seed</sub>")]
```

</details>

> **Design principle:** the domain layer (`src/lib`) is pure TypeScript with no React, so the scoring rules are easy to test and to argue with.

---

## 🧭 User Journey

<details>
<summary><b>View diagram</b></summary>

```mermaid
journey
    title A project's afterlife in SecondWind
    section Bury
      Open the Autopsy wizard: 4: Builder
      Tag the causes of death: 3: Builder
      Drag the card into the grave: 5: Builder
    section Judge
      Read the Resurrection Score: 5: Builder
      Open "Why this verdict?": 5: Builder
    section Act
      Run the 7-day sprint: 5: Builder
      Salvage parts to the Yard: 4: Builder
      Merge with a sibling: 4: Builder
    section Learn
      Read the Death Report: 5: Builder
      Get a nudge reminder: 4: Builder
```

</details>

### Project lifecycle

<details>
<summary><b>View diagram</b></summary>

```mermaid
stateDiagram-v2
    [*] --> Resting: 🪦 Buried via Autopsy
    Resting --> Reviving: 🌿 Revive / 🔀 Pivot
    Reviving --> Alive: ✅ Sprint complete
    Resting --> Archived: 🕯️ Lay to rest
    Resting --> Resting: 🧰 Salvage parts
    Resting --> Merged: 🧵 Stitch into sibling
    Merged --> Archived
    Alive --> Resting: 💤 Stalled again
    Archived --> [*]: ♻️ Compost
```

</details>

---

## 🧮 The Resurrection Score

`src/lib/score.ts` is **fully rule-based**, so you can trace every verdict back to its inputs. No black box.

<details>
<summary><b>View diagram</b></summary>

```mermaid
flowchart LR
    I1["💡 Idea strength<br/><b>20%</b>"] --> S
    I2["🧱 Work completed<br/><b>15%</b>"] --> S
    I3["⏳ Effort remaining<br/><b>15%</b> (inverted)"] --> S
    I4["🔧 Cause is fixable<br/><b>15%</b>"] --> S
    I5["📈 Still relevant<br/><b>15%</b>"] --> S
    I6["❤️ Your interest now<br/><b>20%</b>"] --> S
    S(("Σ<br/>Score<br/>0–100")) --> R{"⚖️ Verdict<br/>rules"}
    R --> V1["🌿 Revive"]
    R --> V2["🔀 Pivot"]
    R --> V3["🧰 Salvage"]
    R --> V4["🧵 Merge"]
    R --> V5["🕯️ Archive"]
```

</details>

### Verdict decision tree

<details>
<summary><b>View diagram</b></summary>

```mermaid
flowchart TD
    A([Score computed]) --> B{"score ≥ 68<br/>and interest ≥ 4?"}
    B -- yes --> RV["🌿 REVIVE"]
    B -- no --> C{"score < 35?"}
    C -- yes --> C2{"completion ≥ 40%?"}
    C2 -- yes --> SV["🧰 SALVAGE"]
    C2 -- no --> AR["🕯️ ARCHIVE"]
    C -- no --> D{"completion ≥ 45%<br/>and interest ≤ 2?"}
    D -- yes --> SV
    D -- no --> E{"sibling shares<br/>≥ 3 tags/stack?"}
    E -- yes --> MG["🧵 MERGE"]
    E -- no --> F{"relevance ≤ 2, or<br/>strong idea + heavy effort?"}
    F -- yes --> PV["🔀 PIVOT"]
    F -- no --> G{"score ≥ 55?"}
    G -- yes --> RV
    G -- no --> H{"completion ≥ 30%?"}
    H -- yes --> SV
    H -- no --> PV

    style RV fill:#2d5a43,color:#fff
    style PV fill:#e9a53a,color:#1e2721
    style SV fill:#22617a,color:#fff
    style MG fill:#84452a,color:#fff
    style AR fill:#434e47,color:#fff
```

</details>

| Signal | Weight | Source |
|---|:---:|---|
| 💡 Idea strength | `0.20` | Autopsy slider (1–5) |
| 🧱 Work completed | `0.15` | Completion % |
| ⏳ Effort remaining | `0.15` | Inverted slider (1–5) |
| 🔧 Cause is fixable | `0.15` | Average fixability of the tagged causes of death |
| 📈 Still relevant | `0.15` | Autopsy slider (1–5) |
| ❤️ Your interest now | `0.20` | Autopsy slider (1–5) |

After the verdict, the engine generates a shrunk **7-day plan** from the "still unfinished" list.

---

## 🗺️ Routes

<details>
<summary><b>View diagram</b></summary>

```mermaid
flowchart LR
    HOME["🏠 /"] --> GARDEN["🌌 /garden"]
    HOME --> BURY["🪦 /bury"]
    GARDEN --> DETAIL["📜 /garden/[id]"]
    BURY -->|"after burial"| DETAIL
    DETAIL --> SALV["🧰 /salvage"]
    GARDEN --> INS["📊 /insights"]
    HOME --> CONTACT["✉️ /contact"]
    CONTACT -->|POST| API["⚙️ /api/contact"]
```

</details>

| Route | Purpose |
|---|---|
| `/` | Landing page with a live score demo and the journey |
| `/garden` | The garden in four views (Space · Plots · Ledger · Timeline) plus the action dock |
| `/garden/[id]` | Full verdict and path workspace |
| `/bury` (`?sample=1`) | The Autopsy wizard |
| `/salvage` | Salvage Yard: borrow parts into living projects |
| `/insights` | Death Report: patterns across all your projects |
| `/contact` · `/privacy` · `/terms` | Contact form and legal pages |
| `/api/contact` | Server-side validation, honeypot and rate limit |
| `/sitemap.xml` · `/robots.txt` · `/opengraph-image` · `/manifest.webmanifest` | SEO and app metadata |

---

## 🔄 Data Flow

### Burying a project

<details>
<summary><b>View diagram</b></summary>

```mermaid
sequenceDiagram
    autonumber
    actor U as 👤 Builder
    participant W as 🪦 Autopsy Wizard
    participant D as 🖐️ DnD Engine
    participant S as 🗃️ Zustand Store
    participant E as 🧮 Score Engine
    participant G as 🌌 Garden

    U->>W: Fill in steps 1–3
    W->>S: Autosave draft (each change)
    U->>D: Drag Autopsy card → "Open grave"
    D->>D: Hit-test zone, play sound, burst
    D->>W: onDrop()
    W->>W: validate()
    W->>S: addProject(project)
    S-->>E: projects changed
    E-->>G: assess() → score + verdict
    G-->>U: ✨ Burial ritual → verdict page
```

</details>

### Borrowing a salvaged part

<details>
<summary><b>View diagram</b></summary>

```mermaid
sequenceDiagram
    autonumber
    actor U as 👤 Builder
    participant C as 🧩 Part Card
    participant T as 📥 Mobile Drop Tray
    participant R as ✨ Ritual
    participant S as 🗃️ Store

    U->>C: Press & hold (touch) / drag (mouse)
    C->>T: Lift → zones float up as a tray
    U->>T: Drop on a living project
    T->>R: cast("borrow")
    R->>S: update(target.organs + timeline)
    S-->>U: 🎉 "Part delivered" toast
```

</details>

---

## 🖐️ The Canvas Protocol (Surprise Challenge)

> **Rule:** primary actions use **no standard buttons**. Every one is done by **dragging a data card into an Action Zone**.

<details>
<summary><b>View diagram</b></summary>

```mermaid
flowchart LR
    subgraph Input["Input"]
        M["🖱️ Mouse / Pen"]
        T["👆 Touch<br/>(press & hold)"]
        K["⌨️ Keyboard<br/>(Space · Tab · Enter)"]
    end
    Input --> P["📦 DragCard<br/>lift + ghost physics"]
    P --> H{"🎯 Hit-test<br/>registered zones"}
    H -->|"over accepting zone"| Z["✨ Zone glows<br/>'Release to …'"]
    H -->|"near screen edge"| SC["↕️ Auto-scroll"]
    SC --> H
    Z -->|"release"| DROP["✅ onDrop → action"]
    H -->|"released elsewhere"| RET["↩️ Card returns"]
    DROP --> A11Y["📢 aria-live announcement"]
    RET --> A11Y
```

</details>

| Feature | 📦 Card | 🎯 Action Zones |
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

**Highlights**
- 🫧 **Jelly physics:** the ghost card stretches along its direction of travel and gets "sipped" into hot zones.
- 👆 **Touch-friendly:** a swipe scrolls the page and press-and-hold lifts the card. On phones, drop zones float up as a bottom tray.
- ⌨️ **Keyboard:** Space picks up, Tab moves between zones, Enter drops, Escape cancels.
- 📢 **Screen readers** hear every step through an `aria-live` region.
- 🛑 **Destructive drops** (compost, reset) ask for a deliberate *slide-to-confirm* instead of a dialog.

---

## 🌌 Feature Map

<details>
<summary><b>View diagram</b></summary>

```mermaid
mindmap
  root((🪦 SecondWind))
    🔬 Autopsy
      3-step wizard
      Cause-of-death tags
      Autosave drafts
      Sample prefill
    ⚖️ Verdict
      Resurrection Score
      Why this verdict?
      Signal radar
    🌱 Paths
      7-day sprint board
      Pivot sketch
      Frankenstein merge
      Epitaph
    🌌 Garden
      3D Space view
      Easy and Pilot flight
      Auto tour
      Plots · Ledger · Timeline
    🧰 Salvage Yard
      Kind previews
      Borrow into project
    📊 Death Report
      Graveyard by cause
      Verdict donut
      ECG lifelines
      Score histogram
      Burial seasons
    ✨ Magic
      Rituals and spells
      Themed loaders
      Lantern cursor
      Sound design
```

</details>

| Feature | Where |
|---|---|
| Guided Autopsy, cause-of-death tags, autosave, sample prefill | `/bury` |
| Resurrection Score, "Why this verdict?", signal radar | Garden side panel, `/garden/[id]` |
| Sprint plan, pivot sketch, salvage, Frankenstein merge, epitaph | `/garden/[id]` |
| 3D space garden (**Easy** mode by default, optional **Pilot** mode), Plots, Ledger, Timeline | `/garden` |
| Salvage Yard with kind-specific previews and Borrow | `/salvage` |
| Death Report: causes, verdict donut, ECG lifelines, histogram, seasons, stacks | `/insights` |
| Magic rituals, view-change spells, themed loaders, animated logo, lantern cursor | Site-wide |

---

## ⚡ Performance & Accessibility

<div align="center">

| ⏱️ First Paint | 🖼️ Largest Paint | 📐 Layout Shift | ♿ Contrast |
|:---:|:---:|:---:|:---:|
| **~0.35 s** | **< 1.2 s** | **~0** | **WCAG AA** |

<sub>Measured on a throttled mid-range phone profile.</sub>

</div>

<details>
<summary><b>View diagram</b></summary>

```mermaid
flowchart LR
    V["👤 Visitor"] --> Q{"Device &<br/>preferences"}
    Q -->|"desktop · capable GPU"| HI["🌌 Full WebGL<br/>AA · higher DPR · 1,400 stars"]
    Q -->|"phone · ≤ 4 cores"| LO["🌙 Light 3D<br/>no AA · DPR 1 · 600 stars"]
    Q -->|"data saver · small screen hero"| SVG["🖼️ Lightweight SVG hero"]
    Q -->|"prefers-reduced-motion"| RM["🧘 Motion minimized"]
    HI & LO --> OFF["⏸️ Rendering pauses<br/>when off screen"]
```

</details>

- 🚀 The cinematic intro plays **once per visit** and any tap or key skips it. Repeat loads fade in within 0.4 s.
- 📦 3D code is **lazy-loaded** (`next/dynamic`, `ssr: false`) and only fetched for the garden view.
- 🧘 `prefers-reduced-motion` is respected throughout.
- ♿ Skip link, ARIA labels, focus rings, full keyboard support and AA contrast in both themes.
- 📱 Responsive from 320 px up, with no sideways scrolling (checked by the device test suite).

---

## 🔐 Security & Privacy

<details>
<summary><b>View diagram</b></summary>

```mermaid
flowchart LR
    R["🌐 Request"] --> MW["🛡️ Middleware<br/>HTTPS redirect"]
    MW --> H["📋 Headers<br/>HSTS · CSP · X-Frame-Options<br/>nosniff · Referrer · Permissions"]
    H --> APP["⚛️ App"]
    APP --> F["✉️ Contact form"]
    F --> C1{"🍯 Honeypot<br/>empty?"}
    C1 -- no --> X["🚫 Reject"]
    C1 -- yes --> C2{"⏱️ Min time<br/>to submit?"}
    C2 -- no --> X
    C2 -- yes --> C3{"🚦 Per-IP<br/>rate limit"}
    C3 -- over --> X
    C3 -- ok --> C4["✅ Validate"] --> WH["🔗 Webhook<br/>(server-only)"]
```

</details>

- 🔒 Strict security headers on every response.
- 🗝️ **No secrets in the frontend.** The contact webhook URL stays on the server.
- 🍪 Consent banner, and **no tracking cookies**. Analytics are cookie-free and only load after consent.
- 💾 Your projects never leave your browser. They're stored in `localStorage`.

---

## 📁 Project Structure

```bash
📦 secondwind
├── 📂 src
│   ├── 📂 app                 # 🗺️ Routes, layout, loaders, SEO files, API
│   │   ├── 📂 api/contact     #   📬 Server-validated contact endpoint
│   │   ├── 📂 bury            #   🪦 Autopsy wizard
│   │   ├── 📂 garden          #   🌌 Garden + [id] verdict workspace
│   │   ├── 📂 insights        #   📊 Death Report
│   │   └── 📂 salvage         #   🧰 Salvage Yard
│   ├── 📂 components
│   │   ├── 📂 canvas          # 🖐️ Drag & drop engine (Canvas Protocol)
│   │   ├── 📂 three           # 🌌 3D hero + space garden (R3F)
│   │   ├── 📂 magic           # ✨ Rituals, view spells, bursts
│   │   ├── 📂 garden          # 🌿 Garden app, views, switcher, panels
│   │   ├── 📂 project         # 📜 Verdict page and path panels
│   │   ├── 📂 insights        # 📊 Death Report charts
│   │   ├── 📂 salvage         # 🧰 Salvage Yard
│   │   └── 📂 bury · landing · layout · ui · motion · legal
│   ├── 📂 lib                 # 🧠 Pure domain logic
│   │   ├── 🧮 score.ts        #   Resurrection Score + verdict rules
│   │   ├── 🗃️ store.ts        #   Zustand store (persisted)
│   │   ├── 🌱 seed.ts         #   Sample graveyard
│   │   ├── ✅ validate.ts     #   Form validation
│   │   └── 🔊 sound.ts        #   Sound design
│   └── 🛡️ middleware.ts       # HTTPS + security headers
├── 📂 tests                   # 🧪 Playwright e2e + device suites
└── ⚙️ next.config.ts · playwright.config.ts · tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

![Node](https://img.shields.io/badge/Node.js-≥_18.18-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![npm](https://img.shields.io/badge/npm-≥_9-CB3837?style=flat-square&logo=npm&logoColor=white)

### Install & run

```bash
# 1️⃣ Clone
git clone <repo-url> secondwind && cd secondwind

# 2️⃣ Install dependencies
npm install

# 3️⃣ Start the dev server → http://localhost:3000
npm run dev

# 4️⃣ Production build
npm run build && npm start
```

> 🌱 Sample projects load automatically. Data lives in your browser, and **Replant** in the garden restores the sample set.

### 🔧 Environment variables

| Variable | Scope | Purpose |
|---|:---:|---|
| `NEXT_PUBLIC_SITE_URL` | 🌍 public | Canonical domain for metadata, sitemap and OG tags |
| `NEXT_PUBLIC_ANALYTICS_DOMAIN` | 🌍 public | Turns on cookie-free Plausible analytics, after consent |
| `CONTACT_WEBHOOK_URL` | 🔒 server | Where contact messages are delivered |

---

## 🧪 Testing

```bash
# Build into a separate folder so it never clashes with `next dev`
NEXT_DIST_DIR=.next-test npm run build
NEXT_DIST_DIR=.next-test npx next start -p 3100 &
BASE_URL=http://localhost:3100 npx playwright test
```

<details>
<summary><b>View diagram</b></summary>

```mermaid
flowchart LR
    B["🏗️ Isolated build<br/>.next-test"] --> S["🖧 next start :3100"]
    S --> P["🎭 Playwright"]
    P --> D1["🖥️ chrome-desktop<br/>full functional suite"]
    P --> D2["🧭 chrome · safari"]
    P --> D3["📱 iphone · android-phone"]
    P --> D4["📟 ipad"]
    D1 & D2 & D3 & D4 --> R["✅ 39 passing"]
```

</details>

| Playwright project | Covers |
|---|---|
| 🖥️ `chrome-desktop` | Full functional suite: wizard, validation, bot traps, every drag-and-drop flow, keyboard dragging, SEO files, headers, a11y labels |
| 📱 `chrome` · `safari` · `ipad` · `iphone` · `android-phone` | Device smoke: every page renders, no sideways scrolling, fast boot, Easy/Pilot garden, real touch drag on Android |
| 🦊 `firefox` | Same smoke suite. Not verified in our environment, because Playwright's bundled Firefox wouldn't start on our macOS version. |

> **Last run: 39 tests passed** across 6 Playwright projects (Firefox not run).

---

## ☁️ Deployment

<details>
<summary><b>View diagram</b></summary>

```mermaid
flowchart LR
    DEV["💻 git push"] --> GH["🐙 GitHub"]
    GH --> VC["▲ Vercel build"]
    VC --> PREV["🔍 Preview URL"]
    VC -->|"main"| PROD["🌐 project-graveyard-gold.vercel.app"]
```

</details>

- [x] Deployed to Vercel → **[project-graveyard-gold.vercel.app](https://project-graveyard-gold.vercel.app/)**
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the production domain
- [ ] Optionally set the analytics and webhook variables
- [ ] Check the site by hand in Firefox

---

## 👥 Team

<div align="center">

### Team **Binary Brains** 🧠⚡

| <img src="https://img.shields.io/badge/-Sagnik_Chandra-2d5a43?style=for-the-badge" /> | <img src="https://img.shields.io/badge/-Shrusti_Jain-f2b34a?style=for-the-badge&labelColor=1e2721" /> |
|:---:|:---:|
| Developer | Developer |

<sub>Built for **Code Variant · Build 01 · PS 05 — The Project Graveyard**</sub>

<br/><br/>

**[🌐 Try it live](https://project-graveyard-gold.vercel.app/)** · **[🎬 Watch the demo](https://drive.google.com/drive/folders/1eYu63fIn4m9T0o77mvZciTtYZnracijG?usp=sharing)**

<br/>

<sub>🪦 Every project deserves a second look. 🌱</sub>

</div>
