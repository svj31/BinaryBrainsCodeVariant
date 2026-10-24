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

function Card({ title, sub, children, className = "", delay = 0 }: { title: string; sub?: string; children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <Reveal delay={delay} className={`rounded-xl border border-line bg-card p-5 sm:p-6 ${className}`}>
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
  const [tip, setTip] = useState<Assessed | null>(null);

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
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-10 sm:px-6">
      <p className="eyebrow">Learn your pattern</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Death Report</h1>
      <p className="mt-2 max-w-2xl text-ink-2">Built live from the {total} projects in your garden. Click a cause to trace it through every chart.</p>

      {top && (
        <Reveal className="relative mt-8 overflow-hidden rounded-xl bg-ink p-6 text-paper sm:p-8">
          <motion.div className="absolute -right-20 -bottom-24 h-72 w-72 rounded-full bg-dawn/30 blur-3xl" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden="true" />
          <p className="relative font-mono text-xs uppercase tracking-[0.14em] text-[#cfc9bc]">Your pattern</p>
          <p className="relative mt-3 max-w-3xl font-display text-2xl leading-snug sm:text-3xl">
            {CAUSES[top.c].label} ended {top.n} of your {total} projects. They usually stop after about {Math.round(s.avgLife / 7)} weeks, with {s.avgBuilt}% of the plan built.
          </p>
          <p className="relative mt-4 max-w-2xl text-[#dcd6ca]">
            <span className="font-semibold text-paper">Next time:</span> {ADVICE[top.c]}
          </p>
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
          <Reveal key={k as string} delay={i * 0.05} className="rounded-xl border border-line bg-card p-4">
            <dt className="text-sm text-ink-2">{k}</dt>
            <dd className="mt-1 font-display text-3xl font-semibold">
              <Count to={v as number} suffix={suf as string} />
            </dd>
          </Reveal>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Causes of death" sub="Click one to focus. A project can have more than one cause.">
          <ul className="space-y-2">
            {s.causes.map(({ c, n }, i) => {
              const on = focus === c;
              return (
                <li key={c}>
                  <button
                    onClick={() => setFocus(on ? null : c)}
                    aria-pressed={on}
                    className={`grid w-full grid-cols-[150px_1fr_28px] items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm transition-colors sm:grid-cols-[180px_1fr_28px] ${on ? "bg-dawn-soft" : "hover:bg-paper"}`}
                  >
                    <span className={`truncate ${on ? "font-semibold text-ink" : "text-ink-2"}`}>{CAUSES[c].label}</span>
                    <span className="h-5 overflow-hidden rounded-[3px] bg-stone-light/70" aria-hidden="true">
                      <motion.span
                        className="block h-full rounded-[3px]"
                        style={{ background: on || (!focus && i === 0) ? "var(--clay)" : "var(--ink-3)" }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(n / s.causes[0].n) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: i * 0.05, ease }}
                      />
                    </span>
                    <span className="text-right font-mono">{n}</span>
                  </button>
                </li>
              );
            })}
          </ul>
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
            <svg viewBox="-80 -80 160 160" className="h-48 w-48 shrink-0" role="img" aria-label={s.verdicts.map((x) => `${VERDICTS[x.v].label} ${x.n}`).join(", ")}>
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

        <Card title="Lifespan vs work built" sub="Each dot is a project. Bigger means a higher score. Hover for details." className="lg:col-span-2">
          <div className="relative">
            <svg viewBox="0 0 640 260" className="w-full" role="img" aria-label="Scatter of project lifespan in days against percentage built">
              {[0, 25, 50, 75, 100].map((y) => (
                <g key={y}>
                  <line x1="40" x2="630" y1={230 - y * 2.1} y2={230 - y * 2.1} stroke="var(--line-2)" />
                  <text x="32" y={234 - y * 2.1} textAnchor="end" fontSize="10" fill="var(--ink-3)">
                    {y}%
                  </text>
                </g>
              ))}
              <text x="335" y="256" textAnchor="middle" fontSize="10" fill="var(--ink-3)">
                Days alive before burial (max {s.maxLife})
              </text>
              {all.map((x, i) => {
                const cx = 40 + (daysBetween(x.project.startedOn, x.project.buriedOn) / s.maxLife) * 580;
                const cy = 230 - x.project.inputs.completion * 2.1;
                const on = inFocus(x);
                return (
                  <motion.circle
                    key={x.project.id}
                    cx={cx}
                    cy={cy}
                    fill={VERDICTS[x.a.verdict].color}
                    stroke="var(--card)"
                    strokeWidth="2"
                    initial={{ r: 0 }}
                    whileInView={{ r: 5 + x.a.score / 10 }}
                    viewport={{ once: true }}
                    animate={{ opacity: on ? 0.9 : 0.12 }}
                    transition={{ duration: 0.6, delay: i * 0.04, ease }}
                    onMouseEnter={() => setTip(x)}
                    onMouseLeave={() => setTip(null)}
                    style={{ cursor: "pointer" }}
                  />
                );
              })}
            </svg>
            <AnimatePresence>
              {tip && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute top-2 right-2 rounded-lg bg-ink px-3 py-2 text-sm text-paper shadow-lg"
                >
                  <p className="font-semibold">{tip.project.name}</p>
                  <p className="text-xs text-[#cfc9bc]">
                    {daysBetween(tip.project.startedOn, tip.project.buriedOn)} days · {tip.project.inputs.completion}% built · score {tip.a.score} · {VERDICTS[tip.a.verdict].label}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
          <div className="grid grid-cols-12 gap-1.5">
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
                style={{ fontSize: `${0.8 + n * 0.08}rem` }}
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
