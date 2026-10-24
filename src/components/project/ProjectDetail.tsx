"use client";

import Link from "next/link";
import { Tick } from "@/components/ui/Tick";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAssessed, useGraveyard } from "@/lib/store";
import { CAUSES, VERDICTS, VERDICT_ORDER } from "@/lib/verdicts";
import { ago, daysBetween, fmtDate } from "@/lib/format";
import type { TimelineEvent, Verdict } from "@/lib/types";
import { track } from "@/lib/consent";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { FactorBars } from "@/components/ui/FactorBars";
import { StatusTag, VerdictBadge } from "@/components/ui/VerdictBadge";
import { GraveLoader } from "@/components/ui/GraveLoader";
import { Reveal } from "@/components/ui/Reveal";
import { PathBody } from "./PathPanels";

const KIND_LABEL: Record<TimelineEvent["kind"], string> = {
  born: "Born",
  peak: "Peak",
  stall: "Stall",
  buried: "Buried",
  afterlife: "Afterlife",
};

export function ProjectDetail({ id }: { id: string }) {
  const router = useRouter();
  const all = useAssessed();
  const hydrated = useGraveyard((s) => s.hydrated);
  const choose = useGraveyard((s) => s.choosePath);
  const update = useGraveyard((s) => s.update);
  const remove = useGraveyard((s) => s.remove);
  const [showWhy, setShowWhy] = useState(true);
  const item = all.find((x) => x.project.id === id);

  if (!item) {
    if (!hydrated)
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <GraveLoader label="Finding the grave" />
        </div>
      );
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">No grave by that name</h1>
        <p className="mt-3 text-ink-2">It may have been removed, or it was saved in a different browser.</p>
        <Link href="/garden" className="btn btn-primary mt-6">
          Back to the garden
        </Link>
      </div>
    );
  }

  const { project: p, a } = item;
  const path: Verdict = p.chosenPath ?? a.verdict;
  const v = VERDICTS[a.verdict];
  const timeline = [...p.timeline].sort((x, y) => x.date.localeCompare(y.date));

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-3">
        <Link href="/garden" className="hover:text-ink">
          Garden
        </Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <span className="text-ink-2" aria-current="page">
          {p.name}
        </span>
      </nav>

      {/* Headstone header */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mt-5 grid items-start gap-6 lg:grid-cols-[1fr_380px]"
      >
        <div className="relative overflow-hidden rounded-t-[140px] rounded-b-lg border border-line bg-[linear-gradient(#ebe5d8,#e2dbcc)] px-6 pt-14 pb-8 text-center sm:px-12">
          <div className="flex justify-center gap-2">
            <StatusTag status={p.status} />
          </div>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{p.name}</h1>
          <p className="mt-2 font-mono text-sm text-ink-2">
            {fmtDate(p.startedOn)} to {fmtDate(p.buriedOn)} · lived {daysBetween(p.startedOn, p.buriedOn)} days
          </p>
          <p className="mx-auto mt-5 max-w-lg font-display text-xl italic text-ink-2">&ldquo;{p.epitaph}&rdquo;</p>
          <p className="mx-auto mt-5 max-w-xl text-[0.95rem] leading-relaxed text-ink-2">{p.pitch}</p>
          {p.repoUrl && (
            <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-medium text-moss underline underline-offset-2">
              Open repository
            </a>
          )}
        </div>

        <section aria-labelledby="verdict-h" className="flex flex-col rounded-xl border border-line bg-card p-5">
          <h2 id="verdict-h" className="eyebrow">
            Resurrection verdict
          </h2>
          <div className="mt-4 flex items-center gap-5">
            <ScoreRing score={a.score} color={v.color} size={116} />
            <div className="space-y-2">
              <VerdictBadge verdict={a.verdict} size="lg" />
              <p className="font-medium">{v.path}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink-2">{v.blurb}</p>
          <button
            className="mt-4 flex items-center justify-between border-t border-line-2 pt-3 text-left text-sm font-semibold text-ink"
            aria-expanded={showWhy}
            aria-controls="why"
            onClick={() => setShowWhy((s) => !s)}
          >
            Why this verdict?
            <motion.span animate={{ rotate: showWhy ? 180 : 0 }} aria-hidden="true">
              ▾
            </motion.span>
          </button>
          <motion.div
            id="why"
            initial={false}
            animate={{ height: showWhy ? "auto" : 0, opacity: showWhy ? 1 : 0 }}
            className="overflow-hidden"
          >
            <ul className="mt-3 space-y-2 text-sm text-ink-2">
              {a.reasons.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-3" aria-hidden="true" />
                  {r}
                </li>
              ))}
            </ul>
          </motion.div>
        </section>
      </motion.header>

      {/* Score breakdown + path choice */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
        <Reveal className="rounded-xl border border-line bg-card p-5">
          <h2 className="font-display text-xl font-semibold">How the score adds up</h2>
          <p className="mt-1 text-sm text-ink-2">Six signals, each weighted. Edit the autopsy to change them.</p>
          <div className="mt-5">
            <FactorBars factors={a.factors} />
          </div>
          <EditInputs id={p.id} />
        </Reveal>

        <Reveal className="rounded-xl border border-line bg-card p-5" delay={0.05}>
          <h2 className="font-display text-xl font-semibold">Choose a path</h2>
          <p className="mt-1 text-sm text-ink-2">The verdict is a suggestion. You decide.</p>
          <div role="radiogroup" aria-label="Revival path" className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {VERDICT_ORDER.map((k) => {
              const on = path === k;
              const vv = VERDICTS[k];
              return (
                <button
                  key={k}
                  role="radio"
                  aria-checked={on}
                  onClick={() => {
                    choose(p.id, k);
                    track("path_chosen", { path: k });
                  }}
                  className={`relative rounded-md border px-3 py-2.5 text-left transition-colors ${
                    on ? "border-transparent" : "border-line hover:border-ink-3"
                  }`}
                  style={on ? { background: vv.soft } : undefined}
                >
                  {on && (
                    <motion.span
                      layoutId="path-outline"
                      className="absolute inset-0 rounded-md border-2"
                      style={{ borderColor: vv.color }}
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <span className="relative block text-sm font-semibold" style={{ color: on ? vv.color : undefined }}>
                    {vv.label}
                  </span>
                  <span className="relative block text-xs text-ink-2">{vv.path}</span>
                  {k === a.verdict && (
                    <span className="relative mt-1 block font-mono text-[10px] uppercase tracking-wider text-ink-3">Suggested</span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-6 border-t border-line-2 pt-6">
            <PathBody project={p} a={a} />
          </div>
        </Reveal>
      </div>

      {/* Autopsy record + timeline */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <Reveal className="rounded-xl border border-line bg-card p-5">
          <h2 className="font-display text-xl font-semibold">Autopsy record</h2>
          <dl className="mt-4 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="eyebrow">What you wanted to build</dt>
              <dd className="mt-1 text-ink-2">{p.goal}</dd>
            </div>
            <div>
              <dt className="eyebrow">Finished</dt>
              <dd>
                <ul className="mt-1 space-y-1">
                  {p.done.map((d) => (
                    <li key={d} className="flex gap-2 text-sm">
                      <Tick />
                      {d}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Still unfinished</dt>
              <dd>
                <ul className="mt-1 space-y-1">
                  {p.left.map((d) => (
                    <li key={d} className="flex gap-2 text-sm text-ink-2">
                      <span aria-hidden="true">○</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="eyebrow">Why it stopped</dt>
              <dd className="mt-1">
                <div className="flex flex-wrap gap-1.5">
                  {p.causes.map((c) => (
                    <span key={c} className="rounded-[4px] border border-line px-2 py-0.5 text-xs">
                      {CAUSES[c].label}
                    </span>
                  ))}
                </div>
                {p.causeNote && <p className="mt-2 text-sm text-ink-2">{p.causeNote}</p>}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="eyebrow">Stack and tags</dt>
              <dd className="mt-1 font-mono text-xs text-ink-2">{[...p.stack, ...p.tags.map((t) => `#${t}`)].join("  ·  ")}</dd>
            </div>
          </dl>
        </Reveal>

        <Reveal className="rounded-xl border border-line bg-card p-5" delay={0.05}>
          <h2 className="font-display text-xl font-semibold">Timeline</h2>
          <ol className="relative mt-4 border-l border-line pl-5">
            {timeline.map((t, i) => (
              <li key={t.date + t.note + i} className="relative pb-5 last:pb-0">
                <span
                  className={`absolute top-1.5 -left-[25px] h-2.5 w-2.5 rounded-full border-2 border-card ${
                    t.kind === "afterlife" ? "bg-dawn" : t.kind === "buried" ? "bg-ink" : t.kind === "peak" ? "bg-moss" : "bg-stone"
                  }`}
                  aria-hidden="true"
                />
                <p className="font-mono text-xs text-ink-3">
                  {fmtDate(t.date)} · {KIND_LABEL[t.kind]}
                </p>
                <p className="text-sm">{t.note}</p>
              </li>
            ))}
          </ol>
          <Reminder id={p.id} remindOn={p.remindOn} onSet={(d) => update(p.id, { remindOn: d })} />
        </Reveal>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm">
        <Link href="/garden" className="font-medium text-moss hover:underline">
          ← Back to the garden
        </Link>
        <button
          className="text-ink-3 hover:text-clay"
          onClick={() => {
            if (confirm(`Remove ${p.name} from your garden? This cannot be undone.`)) {
              remove(p.id);
              router.push("/garden");
            }
          }}
        >
          Remove from garden
        </button>
      </div>
      <p className="mt-2 text-xs text-ink-3">Buried {ago(p.buriedOn)}.</p>
    </div>
  );
}

function EditInputs({ id }: { id: string }) {
  const project = useGraveyard((s) => s.projects.find((p) => p.id === id));
  const update = useGraveyard((s) => s.update);
  const [open, setOpen] = useState(false);
  if (!project) return null;
  const fields = [
    ["ideaStrength", "Idea strength", 1, 5],
    ["completion", "Built (%)", 0, 100],
    ["effortLeft", "Effort left", 1, 5],
    ["relevance", "Still relevant", 1, 5],
    ["interest", "Your interest now", 1, 5],
  ] as const;
  return (
    <div className="mt-5 border-t border-line-2 pt-4">
      <button className="text-sm font-semibold text-moss hover:underline" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? "Done adjusting" : "Feel differently today? Adjust the signals"}
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          {fields.map(([k, label, min, max]) => (
            <div key={k}>
              <div className="flex justify-between text-sm">
                <label htmlFor={`edit-${k}`}>{label}</label>
                <span className="font-mono text-xs text-ink-2">{project.inputs[k]}</span>
              </div>
              <input
                id={`edit-${k}`}
                type="range"
                min={min}
                max={max}
                step={k === "completion" ? 5 : 1}
                value={project.inputs[k]}
                onChange={(e) => update(id, { inputs: { ...project.inputs, [k]: Number(e.target.value) } })}
                className="w-full accent-[var(--moss)]"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Reminder({ id, remindOn, onSet }: { id: string; remindOn?: string; onSet: (d: string | undefined) => void }) {
  const opts = [
    ["2 weeks", 14],
    ["1 month", 30],
    ["3 months", 90],
  ] as const;
  const set = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    onSet(d.toISOString().slice(0, 10));
    track("reminder_set", { days });
  };
  return (
    <div className="mt-6 rounded-lg border border-line-2 bg-paper p-4" aria-labelledby={`remind-${id}`}>
      <h3 id={`remind-${id}`} className="text-sm font-semibold">
        Revisit later
      </h3>
      {remindOn ? (
        <p className="mt-1 text-sm text-ink-2">
          We will nudge you on <strong className="text-ink">{fmtDate(remindOn)}</strong>.{" "}
          <button className="font-medium text-moss hover:underline" onClick={() => onSet(undefined)}>
            Cancel
          </button>
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm text-ink-2">A gentle nudge, never a nag. Pick when to look again.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {opts.map(([l, d]) => (
              <button key={l} className="btn btn-ghost !px-3 !py-1.5 text-sm" onClick={() => set(d)}>
                {l}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
