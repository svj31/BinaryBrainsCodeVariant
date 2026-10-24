"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { SEED } from "@/lib/seed";
import { assess } from "@/lib/score";
import { VERDICTS, VERDICT_ORDER } from "@/lib/verdicts";
import type { Verdict } from "@/lib/types";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { VerdictBadge } from "@/components/ui/VerdictBadge";

const ease = [0.16, 1, 0.3, 1] as const;

/* ---------- Icons ---------- */
const P = { stroke: "currentColor", strokeWidth: 1.7, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
export function VerdictIcon({ v, size = 20 }: { v: Verdict; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      {v === "revive" && <path d="M10 17V8M10 11C8 7 5 7 4 8c1 3 3 4 6 3zm0-2c1.5-4 5-4.5 6-3.5-1 3.5-3.5 4.5-6 3.5z" {...P} />}
      {v === "pivot" && <path d="M4 14a6 6 0 0 1 10-6l2 2M16 5v5h-5" {...P} />}
      {v === "salvage" && <path d="M3 7l7-4 7 4-7 4-7-4zM3 7v6l7 4 7-4V7M10 11v6" {...P} />}
      {v === "merge" && <path d="M5 3v4a5 5 0 0 0 5 5 5 5 0 0 1 5 5M15 3v4a5 5 0 0 1-3 4.6M5 17" {...P} />}
      {v === "archive" && <path d="M5 17V9a5 5 0 0 1 10 0v8M3 17h14M8 11h4" {...P} />}
    </svg>
  );
}

/* ---------- Marquee ---------- */
export function Marquee() {
  const words = ["Revive", "Pivot", "Salvage", "Merge", "Archive"] as const;
  const row = [...words, ...words];
  return (
    <div className="sw-marquee-wrap overflow-hidden border-y border-line-2 bg-ink py-4 text-paper" aria-label="The five verdicts: revive, pivot, salvage, merge, archive">
      <div className="sw-marquee flex w-max" aria-hidden="true">
        {[0, 1].map((k) => (
          <div key={k} className="flex">
            {row.map((w, i) => (
              <span key={`${k}-${i}`} className="flex items-center gap-4 px-7 font-display text-2xl sm:text-4xl">
                <span className="text-dawn">
                  <VerdictIcon v={w.toLowerCase() as Verdict} size={28} />
                </span>
                {w}
                <span className="h-2 w-2 rounded-full bg-dawn/70" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Journey: sticky, scroll driven, clickable ---------- */
const STEPS = [
  { title: "Buried", body: "Every unfinished project lands here first. No judgement, just a quiet plot with its name on it." },
  { title: "Autopsy", body: "Three short steps: what it was, what you finished and what is left, and why you stopped." },
  { title: "Verdict", body: "Six weighted signals become one Resurrection Score, with every reason spelled out." },
  { title: "Second wind", body: "A 7-day sprint, a pivot, saved parts or a calm goodbye. Then it grows again." },
];

function JourneyArt({ step }: { step: number }) {
  return (
    <svg viewBox="0 0 240 220" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="jglow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="var(--dawn)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--dawn)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <motion.ellipse cx="120" cy="190" rx="100" ry="16" fill="url(#jglow)" animate={{ opacity: step >= 2 ? 1 : 0.15, scale: step >= 3 ? 1.2 : 1 }} transition={{ duration: 0.8 }} />
      <path d="M20 190h200" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
      <motion.g animate={{ y: step === 0 ? 14 : 0 }} transition={{ type: "spring", stiffness: 120, damping: 14 }}>
        <path d="M70 190V100a50 50 0 0 1 100 0v90" fill="#e6e0d4" stroke="var(--ink)" strokeWidth="2.5" />
        <motion.rect x="95" y="112" width="50" height="5" rx="2.5" fill="#a9a294" animate={{ width: step >= 1 ? 50 : 30 }} />
        <motion.rect x="102" y="126" width="36" height="5" rx="2.5" fill="#a9a294" animate={{ opacity: step >= 1 ? 1 : 0.3 }} />
        {/* autopsy checklist lines appearing */}
        {[0, 1, 2].map((i) => (
          <motion.g key={i} initial={false} animate={{ opacity: step >= 1 ? 1 : 0, x: step >= 1 ? 0 : -6 }} transition={{ delay: step >= 1 ? 0.1 + i * 0.12 : 0 }}>
            <path d={`M92 ${146 + i * 13}l3 3 6-6`} stroke="var(--moss)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <rect x="106" y={143 + i * 13} width={34 - i * 6} height="4" rx="2" fill="#bdb6a8" />
          </motion.g>
        ))}
      </motion.g>
      {/* verdict ring */}
      <motion.g initial={false} animate={{ opacity: step >= 2 ? 1 : 0, scale: step >= 2 ? 1 : 0.6 }} style={{ originX: "190px", originY: "60px" }} transition={{ type: "spring", stiffness: 160, damping: 16 }}>
        <circle cx="190" cy="60" r="24" fill="var(--card)" stroke="var(--stone-light)" strokeWidth="5" />
        <motion.circle cx="190" cy="60" r="24" fill="none" stroke="var(--moss)" strokeWidth="5" strokeLinecap="round" pathLength={1} strokeDasharray="1" initial={false} animate={{ strokeDashoffset: step >= 2 ? 0.22 : 1 }} transform="rotate(-90 190 60)" transition={{ duration: 1 }} />
        <text x="190" y="65" textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--ink)" fontFamily="var(--font-fraunces), serif">78</text>
      </motion.g>
      {/* sprout */}
      <motion.g initial={false} animate={{ scaleY: step >= 3 ? 1 : 0 }} style={{ originX: "120px", originY: "50px" }} transition={{ type: "spring", stiffness: 140, damping: 12 }}>
        <path d="M120 52V18" stroke="var(--moss)" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M120 34c-2-9-9-13-17-12 1 8 7 13 17 12z" fill="var(--moss)" />
        <path d="M120 28c1.5-10 9-15 18-14-1 9-7 15-18 14z" fill="var(--dawn)" />
      </motion.g>
      {/* wind */}
      <motion.path d="M150 30c8-6 20-5 23 1 2.5 5.5-3.5 9.5-8.5 6.5" stroke="var(--dawn)" strokeWidth="3" fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" initial={false} animate={{ strokeDashoffset: step >= 3 ? 0 : 1 }} transition={{ duration: 0.9, delay: 0.3 }} />
    </svg>
  );
}

export function Journey() {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 60%", "end 60%"] });
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  useMotionValueEvent(scrollYProgress, "change", (v) => setStep(Math.min(3, Math.max(0, Math.floor(v * 4)))));

  const jump = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.6 + (el.offsetHeight * (i + 0.5)) / 4;
    window.scrollTo({ top, behavior: "smooth" });
    setStep(i);
  };

  return (
    <div ref={ref} className="relative grid gap-10 lg:grid-cols-2">
      <div className="lg:sticky lg:top-28 lg:h-[420px] lg:self-start">
        <div className="relative aspect-[24/22] max-h-[420px] rounded-xl border border-line bg-card p-6">
          <JourneyArt step={step} />
          <div className="absolute inset-x-6 bottom-4 h-1 overflow-hidden rounded-[2px] bg-stone-light">
            <motion.div className="h-full origin-left bg-moss" style={{ scaleX: bar }} />
          </div>
        </div>
      </div>
      <ol className="space-y-4 lg:py-10">
        {STEPS.map((s, i) => {
          const active = i === step;
          return (
            <li key={s.title} className="lg:min-h-[34vh]">
              <motion.button
                onClick={() => jump(i)}
                aria-current={active ? "step" : undefined}
                animate={{ opacity: active ? 1 : 0.45, x: active ? 0 : -4 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.4, ease }}
                className={`w-full rounded-xl border p-5 text-left transition-colors ${active ? "border-moss bg-card shadow-[0_18px_40px_-28px_rgba(45,90,67,0.6)]" : "border-transparent"}`}
              >
                <span className="font-mono text-sm text-ink-3">0{i + 1}</span>
                <h3 className="mt-1 font-display text-2xl font-semibold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-2">{s.body}</p>
              </motion.button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------- Verdict explorer ---------- */
const EXAMPLES = (() => {
  const out = {} as Record<Verdict, { name: string; id: string; score: number; reason: string }>;
  for (const p of SEED) {
    const a = assess(p, SEED);
    if (!out[a.verdict]) out[a.verdict] = { name: p.name, id: p.id, score: a.score, reason: a.reasons[a.reasons.length - 1] };
  }
  return out;
})();

export function VerdictExplorer() {
  const [v, setV] = useState<Verdict>("revive");
  const ex = EXAMPLES[v];
  const meta = VERDICTS[v];
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
      <div role="tablist" aria-label="Verdicts" className="grid gap-2">
        {VERDICT_ORDER.map((k) => {
          const on = k === v;
          const m = VERDICTS[k];
          return (
            <button
              key={k}
              role="tab"
              aria-selected={on}
              onClick={() => setV(k)}
              onMouseEnter={() => setV(k)}
              className={`group relative flex items-center gap-4 overflow-hidden rounded-xl border p-4 text-left transition-colors ${on ? "border-transparent" : "border-line bg-card hover:border-ink-3"}`}
            >
              {on && <motion.span layoutId="verdict-bg" className="absolute inset-0" style={{ background: m.soft }} transition={{ type: "spring", stiffness: 400, damping: 36 }} />}
              <motion.span
                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border bg-card"
                style={{ color: m.color, borderColor: on ? m.color : "var(--line)" }}
                animate={{ rotate: on ? [0, -10, 8, 0] : 0, scale: on ? 1.08 : 1 }}
                transition={{ duration: 0.5 }}
              >
                <VerdictIcon v={k} />
              </motion.span>
              <span className="relative">
                <span className="block font-semibold" style={{ color: on ? m.color : undefined }}>
                  {m.label}
                </span>
                <span className="block text-sm text-ink-2">{m.path}</span>
              </span>
              <motion.span className="relative ml-auto text-ink-3" animate={{ x: on ? 0 : -6, opacity: on ? 1 : 0 }} aria-hidden="true">
                →
              </motion.span>
            </button>
          );
        })}
      </div>
      <div className="relative min-h-[320px] overflow-hidden rounded-xl border border-line bg-card p-6" role="tabpanel" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={v}
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
            transition={{ duration: 0.4, ease }}
            className="flex h-full flex-col"
          >
            <span className="self-start">
              <VerdictBadge verdict={v} size="lg" />
            </span>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-2">{meta.blurb}</p>
            {ex ? (
              <div className="mt-6 flex items-center gap-5 rounded-lg border border-line-2 bg-paper p-4">
                <ScoreRing score={ex.score} size={84} color={meta.color} />
                <div className="min-w-0">
                  <p className="eyebrow">Example from the sample garden</p>
                  <p className="mt-1 font-display text-xl font-semibold">{ex.name}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-2">{ex.reason}</p>
                </div>
              </div>
            ) : null}
            <Link href={ex ? `/garden/${ex.id}` : "/garden"} className="mt-6 inline-flex items-center gap-1 self-start text-sm font-semibold text-moss hover:underline">
              {meta.action}
              <span aria-hidden="true">→</span>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- Tilt card ---------- */
export function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ x: 0, y: 0 });
  return (
    <motion.div
      ref={ref}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        setT({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
      }}
      onPointerLeave={() => setT({ x: 0, y: 0 })}
      animate={{ rotateX: t.y * -7, rotateY: t.x * 7 }}
      style={{ transformPerspective: 800 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
