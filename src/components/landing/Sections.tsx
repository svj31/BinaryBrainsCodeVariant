"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SEED } from "@/lib/seed";
import { assess } from "@/lib/score";
import { VERDICTS } from "@/lib/verdicts";
import { ago } from "@/lib/format";
import { Headstone } from "@/components/ui/Headstone";
import { useRouter } from "next/navigation";
import { SlideToUnlock } from "@/components/ui/SlideToUnlock";
import { SplitText } from "@/components/motion/Scroll3D";

const ease = [0.16, 1, 0.3, 1] as const;
const P = { stroke: "currentColor", strokeWidth: 1.7, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/* ---------- The problem ---------- */
const PROBLEMS = [
  {
    title: "Projects stop without a decision",
    body: "Time runs out, the scope grows, a new idea shows up. Nobody writes down why it stopped, so the same thing happens next time.",
    icon: <path d="M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM10 6v4l3 2" {...P} />,
  },
  {
    title: "Good parts get buried with them",
    body: "A working parser, a clean component, a dataset you spent a week on. All of it sits in a repo you will never open again.",
    icon: <path d="M4 8l6-5 6 5-6 9-6-9zM4 8h12M8 8l2 9 2-9" {...P} />,
  },
  {
    title: "Trackers only care about active work",
    body: "Kanban boards manage what you are doing now. Nothing helps you decide what to do with what you already dropped.",
    icon: <path d="M3 4h4v12H3zM8 4h4v8H8zM13 4h4v5h-4zM2 18L18 2" {...P} />,
  },
];

const FILES = SEED.slice(0, 7);

export function ProblemSection() {
  const [open, setOpen] = useState(0);
  const [hover, setHover] = useState<string | null>(null);
  const [seen, setSeen] = useState(false);
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <ul className="space-y-3">
        {PROBLEMS.map((p, i) => {
          const on = open === i;
          return (
            <motion.li key={p.title} layout className={`overflow-hidden rounded-xl border transition-colors ${on ? "border-ink bg-card shadow-[0_20px_44px_-30px_rgba(30,39,33,0.6)]" : "border-line bg-card/60 hover:border-ink-3"}`}>
              <button className="flex w-full items-center gap-4 p-5 text-left" aria-expanded={on} onClick={() => setOpen(i)} onMouseEnter={() => setOpen(i)}>
                <motion.span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] ${on ? "bg-ink text-dawn" : "bg-dawn-soft text-[#7a4a0b]"}`}
                  animate={{ rotate: on ? [0, -8, 6, 0] : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <svg width="22" height="22" viewBox="0 0 20 20" aria-hidden="true">
                    {p.icon}
                  </svg>
                </motion.span>
                <span className="font-display text-xl font-semibold">{p.title}</span>
              </button>
              <AnimatePresence initial={false}>
                {on && (
                  <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease }} className="px-5 pb-5 pl-20 leading-relaxed text-ink-2">
                    {p.body}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.li>
          );
        })}
      </ul>

      {/* The dusty folder: files spill out as it scrolls into view */}
      <motion.div className="relative mx-auto h-[360px] w-full max-w-md" aria-label="A folder of unfinished projects" onViewportEnter={() => setSeen(true)} viewport={{ once: true, margin: "-80px" }}>
        <div className="absolute inset-x-6 bottom-0 h-44 rounded-b-xl rounded-tr-xl bg-[#d9c79f] shadow-[0_30px_60px_-30px_rgba(30,39,33,0.6)]" aria-hidden="true">
          <div className="absolute -top-5 left-0 h-6 w-32 rounded-t-lg bg-[#d9c79f]" />
          <p className="absolute bottom-4 left-5 font-mono text-xs uppercase tracking-[0.18em] text-[#6b5530]">~/projects/old</p>
        </div>
        {FILES.map((f, i) => {
          const angle = (i - (FILES.length - 1) / 2) * 9;
          const lifted = hover === f.id;
          return (
            <motion.div
              key={f.id}
              className="absolute bottom-20 left-[calc(50%-88px)] w-44"
              initial={{ y: 60, rotate: 0, opacity: 0 }}
              animate={
                seen
                  ? { y: -i * 4 - (lifted ? 90 : 40), x: (i - 3) * 26, rotate: lifted ? 0 : angle, opacity: 1, scale: lifted ? 1.08 : 1 }
                  : { y: 60, rotate: 0, opacity: 0 }
              }
              transition={{ type: "spring", stiffness: 110, damping: 15, delay: hover ? 0 : 0.2 + i * 0.07 }}
              onMouseEnter={() => setHover(f.id)}
              onMouseLeave={() => setHover(null)}
              style={{ zIndex: lifted ? 20 : i }}
            >
              <Link href={`/garden/${f.id}`} className="block rounded-lg border border-line bg-card p-3 shadow-md">
                <p className="truncate font-mono text-[11px] text-ink-3">{f.id}/</p>
                <p className="mt-0.5 truncate font-semibold">{f.name}</p>
                <p className="mt-1 text-[11px] text-ink-3">last touched {ago(f.buriedOn)}</p>
              </Link>
            </motion.div>
          );
        })}
        <p className="absolute -bottom-8 inset-x-0 text-center text-xs text-ink-3">Hover a file. Click to see what SecondWind thinks of it.</p>
      </motion.div>
    </div>
  );
}

/* ---------- Who it is for ---------- */
const PERSONAS = [
  { id: "student", label: "Students and hackathoners", line: "Weekend builds that never got a Monday.", picks: ["study-buddy", "type-racer", "habit-hike"] },
  { id: "indie", label: "Indie developers", line: "Side projects stacked behind the day job.", picks: ["pocket-planner", "notes-sync", "budget-bee"] },
  { id: "maker", label: "Designers and makers", line: "Half finished concepts and prototypes.", picks: ["portfolio-v3", "plant-pal", "recipe-roulette"] },
  { id: "team", label: "Small student teams", line: "Shared ideas that faded when the team moved on.", picks: ["campus-radar", "chess-bot", "sign-speak"] },
];

function PersonaIcon({ id }: { id: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      {id === "student" && <path d="M2 7l8-4 8 4-8 4-8-4zM5 9v4c3 2 7 2 10 0V9" {...P} />}
      {id === "indie" && <path d="M3 5h14v9H3zM7 17h6M10 14v3M6 9l2 2-2 2" {...P} />}
      {id === "maker" && <path d="M4 16l2-6 8-8 4 4-8 8-6 2zM12 4l4 4" {...P} />}
      {id === "team" && <path d="M7 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM14 9a2.5 2.5 0 1 0 0-5M2 17c0-3 2-5 5-5s5 2 5 5M13 12c3 0 5 2 5 5" {...P} />}
    </svg>
  );
}

export function WhoFor() {
  const [pid, setPid] = useState(PERSONAS[0].id);
  const persona = PERSONAS.find((p) => p.id === pid)!;
  const graves = useMemo(
    () =>
      persona.picks
        .map((id) => SEED.find((p) => p.id === id)!)
        .filter(Boolean)
        .map((p) => ({ p, a: assess(p, SEED) })),
    [persona],
  );
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div role="tablist" aria-label="Who it is for" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {PERSONAS.map((p) => {
          const on = p.id === pid;
          return (
            <button key={p.id} role="tab" aria-selected={on} onClick={() => setPid(p.id)} className={`relative flex items-center gap-3 rounded-xl border p-4 text-left ${on ? "border-transparent text-[var(--on-fill)]" : "border-line bg-card hover:border-ink-3"}`}>
              {on && <motion.span layoutId="persona-bg" className="absolute inset-0 rounded-xl bg-moss" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
              <span className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] ${on ? "bg-white/15" : "bg-moss-soft text-moss"}`}>
                <PersonaIcon id={p.id} />
              </span>
              <span className="relative">
                <span className="block font-semibold">{p.label}</span>
                <span className={`block text-sm ${on ? "text-[var(--on-fill)] opacity-80" : "text-ink-2"}`}>{p.line}</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="relative overflow-hidden rounded-xl bg-[#0d1b26] p-6 text-[#f4f1e6]" role="tabpanel">
        <Stars />
        <p className="relative font-mono text-xs uppercase tracking-[0.16em] text-[#b9c2c9]">A typical graveyard</p>
        <AnimatePresence mode="wait">
          <motion.ul key={pid} className="relative mt-6 grid grid-cols-3 items-end gap-3" exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}>
            {graves.map(({ p, a }, i) => (
              <motion.li
                key={p.id}
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 140, damping: 14, delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <span className="mb-2 rounded-[6px] px-2 py-0.5 font-mono text-xs" style={{ background: VERDICTS[a.verdict].color, color: "var(--on-fill)" }}>
                  {a.score}
                </span>
                <div className="relative">
                  <motion.span className="absolute inset-x-0 bottom-0 h-6 rounded-full bg-dawn blur-lg" animate={{ opacity: [0.2 + a.score / 200, 0.5 + a.score / 200, 0.2 + a.score / 200] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3 }} aria-hidden="true" />
                  <Headstone score={a.score} sprout={a.score >= 55} className="relative h-24 w-20" />
                </div>
                <p className="mt-2 text-sm font-semibold">{p.name}</p>
                <p className="text-xs text-[#b9c2c9]">{VERDICTS[a.verdict].label}</p>
              </motion.li>
            ))}
          </motion.ul>
        </AnimatePresence>
        <Link href="/garden" className="relative mt-6 inline-flex text-sm font-semibold text-dawn hover:underline">
          Walk through the whole garden →
        </Link>
      </div>
    </div>
  );
}

/** Starfield painted as one layer with a single twinkle, instead of dozens of animated dots. */
function Stars() {
  return <div className="sw-stars pointer-events-none absolute inset-0" aria-hidden="true" />;
}

/* ---------- Final call to action ---------- */
export function FinalCta() {
  const [grow, setGrow] = useState(false);
  const [pull, setPull] = useState(0);
  const router = useRouter();
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0d1b26] px-6 py-14 text-[#f4f1e6] sm:px-12 sm:py-20">
      <Stars />
      <motion.div className="absolute top-8 right-10 h-14 w-14 rounded-full bg-[#f9e7b0] shadow-[0_0_60px_20px_rgba(249,231,176,0.25)]" style={{ maskImage: "radial-gradient(circle at 75% 30%, transparent 46%, #000 48%)", WebkitMaskImage: "radial-gradient(circle at 75% 30%, transparent 46%, #000 48%)" }} aria-hidden="true" />
      <div className="relative grid items-center gap-10 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-dawn">Your turn</p>
          <SplitText as="h2" id="cta-h" className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-5xl" text="Pick one project you keep thinking about." />
          <p className="mt-4 max-w-lg text-[#c9cfd4]">Give it two minutes. You leave with a verdict, the reasons behind it, and the first thing to do tomorrow.</p>
          <div className="mt-8 max-w-sm">
            <SlideToUnlock dark label="Slide to open a fresh plot" done="The soil is ready" onProgress={setPull} onUnlock={() => router.push("/bury")} />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4" onMouseEnter={() => setGrow(true)} onMouseLeave={() => setGrow(false)}>
            <Link href="/bury" className="btn !rounded-lg border border-dawn bg-dawn !px-6 !py-3.5 text-base text-[#1e2721] shadow-[0_0_40px_-6px_rgba(242,179,74,0.7)] hover:bg-[#f7c66d]" onFocus={() => setGrow(true)} onBlur={() => setGrow(false)}>
              Bury your first project
            </Link>
            <Link href="/bury?sample=1" className="text-sm font-semibold text-[#f4f1e6] underline-offset-4 hover:underline">
              or try it with a sample project
            </Link>
          </div>
        </div>
        <svg viewBox="0 0 200 180" className="mx-auto h-56 w-full max-w-xs" aria-hidden="true">
          <motion.ellipse cx="100" cy="160" rx="80" ry="12" fill="#f2b34a" animate={{ opacity: grow ? 0.5 : 0.18 + pull * 0.4 }} />
          <path d="M20 160h160" stroke="#3b5a4a" strokeWidth="3" strokeLinecap="round" />
          <path d="M60 160V90a40 40 0 0 1 80 0v70" fill="#d9dce4" stroke="#8a8f9c" strokeWidth="2" />
          <rect x="82" y="100" width="36" height="4" rx="2" fill="#8a8f9c" />
          <rect x="88" y="112" width="24" height="4" rx="2" fill="#8a8f9c" />
          <motion.g style={{ originX: "100px", originY: "52px" }} animate={{ scaleY: grow ? 1 : 0.15 + pull * 0.85, opacity: grow ? 1 : 0.6 + pull * 0.4 }} transition={{ type: "spring", stiffness: 140, damping: 11 }}>
            <path d="M100 52V14" stroke="#6dbf86" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M100 32c-2-9-9-13-17-12 1 8 7 13 17 12z" fill="#6dbf86" />
            <path d="M100 25c1.5-10 9-15 18-14-1 9-7 15-18 14z" fill="#f2b34a" />
          </motion.g>
          <motion.circle cx="100" cy="12" r="5" fill="#f2b34a" animate={{ opacity: grow ? [0.6, 1, 0.6] : 0, r: grow ? [4, 7, 4] : 0 }} transition={{ duration: 1.2, repeat: Infinity }} />
        </svg>
      </div>
    </div>
  );
}
