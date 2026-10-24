"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { useRef } from "react";
import { useAssessed, type Assessed } from "@/lib/store";
import { CAUSES, CAUSE_KEYS, VERDICTS, VERDICT_ORDER } from "@/lib/verdicts";
import type { Cause, Verdict } from "@/lib/types";
import { daysBetween } from "@/lib/format";
import { Reveal } from "@/components/ui/Reveal";

const ease = [0.16, 1, 0.3, 1] as const;

const ADVICE: Record<Cause, string> = {
  "scope-creep": "Write the smallest version on day one and refuse anything outside it until it ships.",
  "no-time": "Plan in one-week sprints. Short commitments survive busy months better than open-ended ones.",
  "lost-interest": "Before starting, write why you care. Re-read it when the novelty fades.",
  "tech-blocker": "Spike the riskiest technical part first, before building anything around it.",
  "team-left": "Agree on an owner before the hackathon ends, or plan for a solo version.",
  "better-idea": "Park new ideas in a list for a week. Most lose their shine; the good ones will wait.",
  "market-gone": "Check what already exists before week two. Ten minutes of searching saves a month.",
  burnout: "Build at a pace you could keep for a semester, not a weekend.",
};

function Count({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const txt = useTransform(mv, (v) => `${Math.round(v)}${suffix}`);
  useEffect(() => {
    if (!inView) return;
    const c = animate(mv, to, { duration: 1.2, ease });
    return () => c.stop();
  }, [inView, to, mv]);
  return <motion.span ref={ref}>{txt}</motion.span>;
}

/** Builds an ECG trace: `beats` heartbeats spread over `alive` px, then a flat line to `w`. */
function ecg(alive: number, w: number, beats: number, y = 22) {
  let d = `M0 ${y}`;
  const step = alive / Math.max(1, beats);
  for (let i = 0; i < beats; i++) {
    const x = i * step;
    const k = Math.min(1, step / 34);
    d += ` L${x + step * 0.35} ${y} l${3 * k} ${-3} l${3 * k} ${3} l${3 * k} 0 l${3 * k} ${-16} l${4 * k} ${26} l${3 * k} ${-12} l${4 * k} 0 q${4 * k} ${-5} ${8 * k} 0`;
  }
  return `${d} L${w} ${y}`;
}

/** A bedside monitor that beats, slows, then flatlines: how long your projects usually live. */
function Monitor({ days }: { days: number }) {
  const W = 320;
  const path = ecg(220, W, 6);
  return (
    <div className="relative w-full max-w-sm rounded-xl border border-[#2c4252] bg-[#081219] p-4 font-mono text-[#7fd29a]" aria-hidden="true">
      <div className="flex items-center justify-between text-[10px] tracking-[0.14em] uppercase">
        <span>Vital signs</span>
        <motion.span className="flex items-center gap-1.5 text-[#f07a5a]" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#f07a5a]" /> flatline
        </motion.span>
      </div>
      <svg viewBox={`0 0 ${W} 44`} className="mt-2 w-full overflow-visible">
        {[11, 22, 33].map((y) => (
          <line key={y} x1="0" x2={W} y1={y} y2={y} stroke="#12303a" />
        ))}
        <motion.path
          d={path}
          fill="none"
          stroke="#7fd29a"
          strokeWidth="1.8"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 1] }}
          transition={{ duration: 4, times: [0, 0.8, 1], repeat: Infinity, ease: "linear" }}
          style={{ filter: "drop-shadow(0 0 4px #7fd29a)" }}
        />
        <motion.line x1="220" x2="220" y1="2" y2="42" stroke="#f07a5a" strokeDasharray="3 3" initial={{ opacity: 0 }} animate={{ opacity: [0, 0, 1, 1] }} transition={{ duration: 4, times: [0, 0.55, 0.6, 1], repeat: Infinity }} />
      </svg>
      <div className="mt-2 flex items-end justify-between">
        <span className="text-[10px] text-[#9aa6ad]">average life</span>
        <span className="font-display text-2xl text-[#f4f1e6]">
          <Count to={days} /> <span className="text-sm text-[#9aa6ad]">days</span>
        </span>
      </div>
    </div>
  );
}

/** Each project drops into the column of what killed it, as a little headstone. */
function Graveyard({ causes, all, focus, setFocus }: { causes: { c: Cause; n: number }[]; all: Assessed[]; focus: Cause | null; setFocus: (c: Cause | null) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.3 });
  return (
    <div ref={ref} className="grid grid-cols-4 items-end gap-1.5 sm:flex sm:gap-3" role="group" aria-label="Causes of death">
      {causes.map(({ c, n }, ci) => {
        const on = focus === c;
        const dim = focus && !on;
        const projects = all.filter((x) => x.project.causes.includes(c));
        return (
          <button
            key={c}
            onClick={() => setFocus(on ? null : c)}
            aria-pressed={on}
            aria-label={`${CAUSES[c].label}: ${n} projects`}
            className={`group flex min-w-0 flex-col sm:min-w-[64px] sm:flex-1 items-center rounded-xl px-1 pt-2 pb-2 transition-[background,opacity] ${on ? "bg-dawn-soft" : "hover:bg-paper"} ${dim ? "opacity-35" : ""}`}
          >
            <span className="font-display text-lg font-semibold">{n}</span>
            <span className="mt-1 flex min-h-[72px] flex-col-reverse items-center gap-0.5 sm:min-h-[96px]">
              {projects.map((x, i) => (
                <motion.svg
                  key={x.project.id}
                  viewBox="0 0 20 22"
                  className="h-6 w-5 sm:h-8 sm:w-7"
                  initial={{ y: -160, opacity: 0, rotate: i % 2 ? 14 : -14 }}
                  animate={seen ? { y: 0, opacity: 1, rotate: 0 } : undefined}
                  transition={{ type: "spring", stiffness: 260, damping: 13, delay: 0.15 + ci * 0.12 + i * 0.09 }}
                >
                  <title>{x.project.name}</title>
                  <path d="M3 21V9a7 7 0 0 1 14 0v12z" fill={VERDICTS[x.a.verdict].color} stroke="var(--ink)" strokeOpacity="0.25" />
                  <path d="M7 10h6M8 13h4" stroke="var(--card)" strokeWidth="1.3" strokeLinecap="round" />
                </motion.svg>
              ))}
            </span>
            <span className="mt-2 h-[3px] w-full rounded-full bg-[#8a6f4e]/60" aria-hidden="true" />
            <span className={`mt-2 h-[3.6em] w-full break-words text-center text-[10px] leading-tight sm:text-[11px] ${on ? "font-semibold text-ink" : "text-ink-2"}`}>{CAUSES[c].label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Lifelines: an ECG per project, drawn as you scroll, that flatlines when the project stopped. */
function Lifelines({ all, maxLife, inFocus }: { all: Assessed[]; maxLife: number; inFocus: (x: Assessed) => boolean }) {
  const rows = [...all].sort((a, b) => daysBetween(b.project.startedOn, b.project.buriedOn) - daysBetween(a.project.startedOn, a.project.buriedOn));
  const W = 600;
  return (
    <ul className="space-y-1">
      {rows.map((x, i) => {
        const days = daysBetween(x.project.startedOn, x.project.buriedOn);
        const alive = Math.max(40, (days / maxLife) * (W - 40));
        const color = VERDICTS[x.a.verdict].color;
        const on = inFocus(x);
        return (
          <motion.li key={x.project.id} animate={{ opacity: on ? 1 : 0.2 }} className="group grid grid-cols-[88px_minmax(0,1fr)] items-center gap-2 sm:gap-3 sm:grid-cols-[150px_1fr_120px]">
            <Link href={`/garden/${x.project.id}`} className="truncate text-xs font-medium hover:underline sm:text-sm">
              {x.project.name}
            </Link>
            <svg viewBox={`0 0 ${W} 44`} className="h-9 w-full overflow-visible" role="img" aria-label={`${x.project.name} lived ${days} days`}>
              <motion.path
                d={ecg(alive, alive + 10, Math.max(2, Math.round(x.project.inputs.completion / 12)))}
                fill="none"
                stroke={color}
                strokeWidth="1.8"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, delay: Math.min(i * 0.08, 0.8), ease: "easeInOut" }}
              />
              <motion.g initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i * 0.08, 0.8) + 1.3 }}>
                <path d={`M${alive + 12} 30V20a6 6 0 0 1 12 0v10z`} fill="var(--stone-light)" stroke={color} strokeWidth="1.4" />
              </motion.g>
            </svg>
            <span className="hidden text-right font-mono text-xs text-ink-3 sm:block">
              {days}d · {x.project.inputs.completion}% built
            </span>
          </motion.li>
        );
      })}
    </ul>
  );
}

function Card({ title, sub, children, className = "", delay = 0 }: { title: string; sub?: string; children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <Reveal delay={delay} className={`min-w-0 rounded-xl border border-line bg-card p-4 sm:p-6 ${className}`}>
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {sub && <p className="mt-1 text-sm text-ink-2">{sub}</p>}
      <div className="mt-5">{children}</div>
    </Reveal>
  );
}

export function DeathReport() {
  const all = useAssessed();
  const [focus, setFocus] = useState<Cause | null>(null);
  const [hoverV, setHoverV] = useState<Verdict | null>(null);

  const s = useMemo(() => {
    const causes = CAUSE_KEYS.map((c) => ({ c, n: all.filter((x) => x.project.causes.includes(c)).length })).filter((x) => x.n).sort((a, b) => b.n - a.n);
    const verdicts = VERDICT_ORDER.map((v) => ({ v, n: all.filter((x) => x.a.verdict === v).length }));
    const life = all.map((x) => daysBetween(x.project.startedOn, x.project.buriedOn));
    const avg = (arr: number[]) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);
    const months = Array.from({ length: 12 }, (_, m) => all.filter((x) => Number(x.project.buriedOn.slice(5, 7)) === m + 1));
    const bins = Array.from({ length: 10 }, (_, b) => all.filter((x) => Math.min(9, Math.floor(x.a.score / 10)) === b));
    const stack = new Map<string, number>();
    all.forEach((x) => x.project.stack.forEach((t) => stack.set(t, (stack.get(t) ?? 0) + 1)));
    return {
      causes,
      verdicts,
      avgLife: avg(life),
      maxLife: Math.max(...life, 1),
      avgBuilt: avg(all.map((x) => x.project.inputs.completion)),
      avgScore: avg(all.map((x) => x.a.score)),
      back: all.filter((x) => x.project.status === "alive" || x.project.status === "reviving").length,
      parts: all.reduce((a, x) => a + x.project.organs.length, 0),
      months,
      bins,
      stack: [...stack.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
      closest: [...all].filter((x) => x.project.status === "resting").sort((a, b) => b.a.score - a.a.score).slice(0, 3),
    };
  }, [all]);

  if (!all.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">No report yet</h1>
        <p className="mt-3 text-ink-2">Bury a project first. Patterns show up after two or three.</p>
        <Link href="/bury" className="btn btn-primary mt-6">
          Bury a project
        </Link>
      </div>
    );
  }

  const top = s.causes[0];
  const inFocus = (x: Assessed) => !focus || x.project.causes.includes(focus);
  const total = all.length;

  // donut arcs
  let acc = 0;
  const arcs = s.verdicts
    .filter((x) => x.n)
    .map((x) => {
      const start = acc / total;
      acc += x.n;
      return { ...x, start, end: acc / total };
    });
  const arcPath = (a0: number, a1: number, r = 70, w = 22) => {
    const p = (t: number, rr: number) => [Math.cos(t * 2 * Math.PI - Math.PI / 2) * rr, Math.sin(t * 2 * Math.PI - Math.PI / 2) * rr];
    const large = a1 - a0 > 0.5 ? 1 : 0;
    const [x0, y0] = p(a0, r);
    const [x1, y1] = p(a1 - 0.002, r);
    const [x2, y2] = p(a1 - 0.002, r - w);
    const [x3, y3] = p(a0, r - w);
    return `M${x0} ${y0}A${r} ${r} 0 ${large} 1 ${x1} ${y1}L${x2} ${y2}A${r - w} ${r - w} 0 ${large} 0 ${x3} ${y3}Z`;
  };
  const hv = hoverV ? s.verdicts.find((x) => x.v === hoverV)! : null;

  return (
    <div className="mx-auto max-w-7xl overflow-x-clip px-4 pt-8 pb-10 sm:px-6">
      <p className="eyebrow">Learn your pattern</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Death Report</h1>
      <p className="mt-2 max-w-2xl text-ink-2">Built live from the {total} projects in your garden. Click a cause to trace it through every chart.</p>

      {top && (
        <Reveal className="relative mt-8 grid min-w-0 items-center gap-6 overflow-hidden rounded-2xl bg-[#13222e] p-5 text-[#f4f1e6] sm:p-8 lg:grid-cols-[1fr_auto]">
          <motion.div className="absolute -right-20 -bottom-24 h-72 w-72 rounded-full bg-dawn/30 blur-3xl" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden="true" />
          <div className="relative min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#cfc9bc]">Your pattern</p>
          <p className="relative mt-3 max-w-3xl font-display text-xl leading-snug sm:text-3xl">
            {CAUSES[top.c].label} ended {top.n} of your {total} projects. They usually stop after about {Math.round(s.avgLife / 7)} weeks, with {s.avgBuilt}% of the plan built.
          </p>
          <p className="relative mt-4 max-w-2xl text-[#dcd6ca]">
            <span className="font-semibold text-[#f2b34a]">Next time:</span> {ADVICE[top.c]}
          </p>
          </div>
          <Monitor days={s.avgLife} />
        </Reveal>
      )}

      <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {[
          ["Projects buried", total, ""],
          ["Average lifespan", s.avgLife, " d"],
          ["Average built", s.avgBuilt, "%"],
          ["Average score", s.avgScore, ""],
          ["Back in progress", s.back, ""],
          ["Parts salvaged", s.parts, ""],
        ].map(([k, v, suf], i) => (
          <motion.div
            key={k as string}
            className="min-w-0 rounded-xl border border-line bg-card p-3 sm:p-4"
            style={{ transformPerspective: 600 }}
            initial={{ rotateX: -80, opacity: 0, y: 20 }}
            whileInView={{ rotateX: 0, opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 180, damping: 16, delay: i * 0.08 }}
          >
            <dt className="flex items-center gap-1.5 text-xs text-ink-2 sm:gap-2 sm:text-sm">
              <span aria-hidden="true">{["🪦", "⏳", "🧱", "✨", "🌱", "🧰"][i]}</span>
              {k}
            </dt>
            <dd className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
              <Count to={v as number} suffix={suf as string} />
            </dd>
          </motion.div>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="How they died" sub="Each headstone is one project, coloured by its verdict. Tap a cause to trace it through every chart below.">
          <Graveyard causes={s.causes} all={all} focus={focus} setFocus={setFocus} />
          <AnimatePresence>
            {focus && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 rounded-md bg-paper p-3 text-sm text-ink-2">
                <strong className="text-ink">Fix for {CAUSES[focus].label.toLowerCase()}:</strong> {ADVICE[focus]}
              </motion.p>
            )}
          </AnimatePresence>
        </Card>

        <Card title="Verdict mix" sub="Where the garden goes if you follow every suggestion." delay={0.05}>
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <svg viewBox="-80 -80 160 160" className="h-40 w-40 shrink-0 sm:h-48 sm:w-48" role="img" aria-label={s.verdicts.map((x) => `${VERDICTS[x.v].label} ${x.n}`).join(", ")}>
              {arcs.map((x, i) => (
                <motion.path
                  key={x.v}
                  d={arcPath(x.start, x.end)}
                  fill={VERDICTS[x.v].color}
                  initial={{ opacity: 0, scale: 0.6 }}
                  whileInView={{ opacity: hoverV && hoverV !== x.v ? 0.3 : 1, scale: hoverV === x.v ? 1.06 : 1 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.5, delay: hoverV ? 0 : i * 0.08 }}
                  onMouseEnter={() => setHoverV(x.v)}
                  onMouseLeave={() => setHoverV(null)}
                  style={{ cursor: "pointer" }}
                />
              ))}
              <text textAnchor="middle" y="-2" fontSize="26" fontWeight="600" fill="var(--ink)" fontFamily="var(--font-fraunces), serif">
                {hv ? hv.n : total}
              </text>
              <text textAnchor="middle" y="16" fontSize="9" fill="var(--ink-3)">
                {hv ? `${VERDICTS[hv.v].label} · ${Math.round((hv.n / total) * 100)}%` : "projects"}
              </text>
            </svg>
            <ul className="grid w-full gap-1.5">
              {s.verdicts.map((x) => (
                <li key={x.v}>
                  <button
                    onMouseEnter={() => setHoverV(x.v)}
                    onMouseLeave={() => setHoverV(null)}
                    onFocus={() => setHoverV(x.v)}
                    onBlur={() => setHoverV(null)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-paper"
                  >
                    <span className="h-3 w-3 rounded-[3px]" style={{ background: VERDICTS[x.v].color }} aria-hidden="true" />
                    <span className="text-ink-2">{VERDICTS[x.v].label}</span>
                    <span className="ml-auto font-mono">{x.n}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card title="Lifelines" sub="Each line is a project's heartbeat: longer means it lived longer, more beats means more of it got built. It flatlines when you stopped." className="lg:col-span-2">
          <Lifelines all={all} maxLife={s.maxLife} inFocus={inFocus} />
        </Card>

        <Card title="Score distribution" sub="How many projects sit in each band of the Resurrection Score.">
          <div className="flex h-40 items-end gap-1.5">
            {s.bins.map((b, i) => {
              const n = b.filter(inFocus).length;
              const max = Math.max(...s.bins.map((x) => x.length), 1);
              return (
                <div key={i} className="group flex flex-1 flex-col items-center gap-1">
                  <span className="font-mono text-[10px] text-ink-3 opacity-0 transition-opacity group-hover:opacity-100">{n}</span>
                  <motion.div
                    className="w-full rounded-t-[3px]"
                    style={{ background: i >= 7 ? "var(--moss)" : i >= 4 ? "var(--dawn)" : "var(--clay)" }}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${(n / max) * 120}px` }}
                    animate={{ height: `${(n / max) * 120}px` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.04, ease }}
                  />
                  <span className="font-mono text-[10px] text-ink-3">{i * 10}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Burial season" sub="Which months your projects tend to stop." delay={0.05}>
          <div className="grid grid-cols-12 gap-1 sm:gap-1.5">
            {s.months.map((m, i) => {
              const n = m.filter(inFocus).length;
              const max = Math.max(...s.months.map((x) => x.length), 1);
              return (
                <div key={i} className="flex flex-col items-center gap-1.5" title={`${n} buried`}>
                  <motion.div
                    className="aspect-square w-full rounded-[4px]"
                    style={{ background: "var(--moss)" }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: n ? 0.25 + (n / max) * 0.75 : 0.06, scale: 1 }}
                    animate={{ opacity: n ? 0.25 + (n / max) * 0.75 : 0.06 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.03 }}
                  />
                  <span className="font-mono text-[10px] text-ink-3">{"JFMAMJJASOND"[i]}</span>
                </div>
              );
            })}
          </div>
          <h3 className="mt-6 text-sm font-semibold">Stacks most often buried</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {s.stack.map(([t, n], i) => (
              <motion.li
                key={t}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-[6px] border border-line px-2.5 py-1 text-sm"
                style={{ fontSize: `${Math.min(1.1, 0.8 + n * 0.06)}rem` }}
              >
                {t} <span className="font-mono text-xs text-ink-3">{n}</span>
              </motion.li>
            ))}
          </ul>
        </Card>
      </div>

      <Reveal className="mt-6 rounded-xl border border-line bg-paper-2 p-5 sm:p-6">
        <h2 className="font-display text-xl font-semibold">Closest to a second wind</h2>
        <p className="mt-1 text-sm text-ink-2">Resting projects with the highest scores. Start with these.</p>
        <ol className="mt-4 grid gap-3 md:grid-cols-3">
          {s.closest.map((x, i) => (
            <motion.li key={x.project.id} whileHover={{ y: -4 }} className="rounded-lg border border-line bg-card">
              <Link href={`/garden/${x.project.id}`} className="flex items-center gap-4 p-4">
                <span className="font-display text-3xl font-semibold text-ink-3">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{x.project.name}</span>
                  <span className="text-xs text-ink-2">{VERDICTS[x.a.verdict].path}</span>
                </span>
                <span className="font-mono text-lg font-semibold" style={{ color: VERDICTS[x.a.verdict].color }}>
                  {x.a.score}
                </span>
              </Link>
            </motion.li>
          ))}
        </ol>
      </Reveal>
    </div>
  );
}
