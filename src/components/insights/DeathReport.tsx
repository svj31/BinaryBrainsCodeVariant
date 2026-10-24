"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { useAssessed } from "@/lib/store";
import { CAUSES, CAUSE_KEYS, VERDICTS, VERDICT_ORDER } from "@/lib/verdicts";
import { daysBetween } from "@/lib/format";
import { Reveal } from "@/components/ui/Reveal";

const ease = [0.22, 1, 0.36, 1] as const;

const ADVICE: Record<string, string> = {
  "scope-creep": "Write the smallest version on day one and refuse anything outside it until it ships.",
  "no-time": "Plan in one-week sprints. Short commitments survive busy months better than open-ended ones.",
  "lost-interest": "Before starting, write why you care. Re-read it when the novelty fades.",
  "tech-blocker": "Spike the riskiest technical part first, before building anything around it.",
  "team-left": "Agree on an owner before the hackathon ends, or plan for a solo version.",
  "better-idea": "Park new ideas in a list for a week. Most lose their shine; the good ones will wait.",
  "market-gone": "Check what already exists before week two. Ten minutes of searching saves a month.",
  burnout: "Build at a pace you could keep for a semester, not a weekend.",
};

export function DeathReport() {
  const all = useAssessed();

  const stats = useMemo(() => {
    const causeCounts = CAUSE_KEYS.map((c) => ({ c, n: all.filter((x) => x.project.causes.includes(c)).length }))
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n);
    const verdicts = VERDICT_ORDER.map((v) => ({ v, n: all.filter((x) => x.a.verdict === v).length }));
    const lifespans = all.map((x) => daysBetween(x.project.startedOn, x.project.buriedOn));
    const avgLife = lifespans.length ? Math.round(lifespans.reduce((a, b) => a + b, 0) / lifespans.length) : 0;
    const avgBuilt = all.length ? Math.round(all.reduce((a, x) => a + x.project.inputs.completion, 0) / all.length) : 0;
    const revived = all.filter((x) => x.project.status === "alive" || x.project.status === "reviving").length;
    const parts = all.reduce((a, x) => a + x.project.organs.length, 0);
    const byMonth = new Map<number, number>();
    all.forEach((x) => {
      const m = Number(x.project.buriedOn.slice(5, 7));
      byMonth.set(m, (byMonth.get(m) ?? 0) + 1);
    });
    return { causeCounts, verdicts, avgLife, avgBuilt, revived, parts, byMonth };
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

  const top = stats.causeCounts[0];
  const maxCause = top?.n ?? 1;
  const maxMonth = Math.max(...Array.from(stats.byMonth.values()), 1);
  const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-10 sm:px-6">
      <p className="eyebrow">Learn your pattern</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Death Report</h1>
      <p className="mt-2 max-w-2xl text-ink-2">
        Built from the {all.length} projects in your garden. Change the garden and this page changes with it.
      </p>

      {top && (
        <Reveal className="mt-8 rounded-xl border border-ink bg-ink p-6 text-paper sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#cfc9bc]">Your pattern</p>
          <p className="mt-3 max-w-3xl font-display text-2xl leading-snug sm:text-3xl">
            {CAUSES[top.c].label} ended {top.n} of your {all.length} projects. They usually stop after about{" "}
            {Math.round(stats.avgLife / 7)} weeks, with {stats.avgBuilt}% of the plan built.
          </p>
          <p className="mt-4 max-w-2xl text-[#dcd6ca]">
            <span className="font-semibold text-paper">Next time:</span> {ADVICE[top.c]}
          </p>
        </Reveal>
      )}

      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-4">
        {[
          ["Projects buried", String(all.length)],
          ["Average lifespan", `${stats.avgLife} days`],
          ["Average built", `${stats.avgBuilt}%`],
          ["Back in progress", `${stats.revived}`],
        ].map(([k, v]) => (
          <div key={k} className="bg-card p-5">
            <dt className="text-sm text-ink-2">{k}</dt>
            <dd className="mt-1 font-display text-3xl font-semibold">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Reveal className="rounded-xl border border-line bg-card p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold">Causes of death</h2>
          <p className="mt-1 text-sm text-ink-2">A project can have more than one cause.</p>
          <ul className="mt-5 space-y-3">
            {stats.causeCounts.map(({ c, n }, i) => (
              <li key={c} className="grid grid-cols-[150px_1fr_28px] items-center gap-3 text-sm sm:grid-cols-[190px_1fr_28px]">
                <span className="truncate text-ink-2">{CAUSES[c].label}</span>
                <span className="h-5 overflow-hidden rounded-[3px] bg-stone-light/70" aria-hidden="true">
                  <motion.span
                    className="block h-full rounded-[3px]"
                    style={{ background: i === 0 ? "var(--clay)" : "var(--ink-3)" }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(n / maxCause) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: i * 0.05, ease }}
                  />
                </span>
                <span className="text-right font-mono text-ink">{n}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="rounded-xl border border-line bg-card p-5 sm:p-6" delay={0.05}>
          <h2 className="font-display text-xl font-semibold">Verdict mix</h2>
          <p className="mt-1 text-sm text-ink-2">Where your graveyard would go if you followed every suggestion.</p>
          <div className="mt-5 flex h-8 overflow-hidden rounded-[4px]" role="img" aria-label={stats.verdicts.map((x) => `${VERDICTS[x.v].label} ${x.n}`).join(", ")}>
            {stats.verdicts
              .filter((x) => x.n > 0)
              .map((x, i) => (
                <motion.div
                  key={x.v}
                  className="h-full border-r-2 border-card last:border-r-0"
                  style={{ background: VERDICTS[x.v].color }}
                  initial={{ flexGrow: 0 }}
                  whileInView={{ flexGrow: x.n }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.05, ease }}
                />
              ))}
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {stats.verdicts.map((x) => (
              <li key={x.v} className="flex items-center gap-2 text-sm">
                <span className="h-3 w-3 rounded-[2px]" style={{ background: VERDICTS[x.v].color }} aria-hidden="true" />
                <span className="text-ink-2">{VERDICTS[x.v].label}</span>
                <span className="ml-auto font-mono sm:ml-0">{x.n}</span>
              </li>
            ))}
          </ul>

          <h3 className="mt-8 font-semibold">When projects get buried</h3>
          <div className="mt-3 flex h-24 items-end gap-1.5" role="img" aria-label="Number of projects buried in each calendar month">
            {MONTHS.map((m, i) => {
              const n = stats.byMonth.get(i + 1) ?? 0;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <motion.div
                    className="w-full rounded-t-[2px] bg-moss"
                    initial={{ height: 0 }}
                    whileInView={{ height: `${(n / maxMonth) * 72}px` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.03, ease }}
                    style={{ opacity: n ? 1 : 0 }}
                  />
                  <span className="font-mono text-[10px] text-ink-3">{m}</span>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-paper-2 p-5 sm:p-6">
        <p className="max-w-xl text-ink-2">
          {stats.parts} reusable parts are already sitting in your Salvage Yard. Check them before you start the next
          project.
        </p>
        <Link href="/salvage" className="btn btn-ghost">
          Open the Salvage Yard
        </Link>
      </Reveal>
    </div>
  );
}
