"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import type { Assessed } from "@/lib/store";
import type { ScoreFactor } from "@/lib/types";
import { VERDICTS, CAUSES } from "@/lib/verdicts";
import { ago, fmtMonth } from "@/lib/format";
import { StatusTag } from "@/components/ui/VerdictBadge";
import { VerdictIcon } from "@/components/landing/Interactive";

const ease = [0.16, 1, 0.3, 1] as const;

function CountUp({ to }: { to: number }) {
  const mv = useMotionValue(0);
  const txt = useTransform(mv, (v) => Math.round(v).toString());
  useEffect(() => {
    const c = animate(mv, to, { duration: 1.1, ease });
    return () => c.stop();
  }, [to, mv]);
  return <motion.span>{txt}</motion.span>;
}

/** Six-signal radar. Points glide between projects instead of jumping. */
export function Radar({ factors, color, size = 190 }: { factors: ScoreFactor[]; color: string; size?: number }) {
  const R = 70;
  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / factors.length - Math.PI / 2;
    return [Math.cos(a) * R * v, Math.sin(a) * R * v] as const;
  };
  const poly = factors.map((f, i) => pt(i, Math.max(0.06, f.value)).join(",")).join(" ");
  return (
    <svg viewBox="-110 -95 220 190" width={size} height={size * 0.86} role="img" aria-label={factors.map((f) => `${f.label} ${Math.round(f.value * 100)}`).join(", ")}>
      {[0.25, 0.5, 0.75, 1].map((r) => (
        <polygon key={r} points={factors.map((_, i) => pt(i, r).join(",")).join(" ")} fill="none" stroke="var(--line)" strokeWidth="1" />
      ))}
      {factors.map((_, i) => {
        const [x, y] = pt(i, 1);
        return <line key={i} x1="0" y1="0" x2={x} y2={y} stroke="var(--line-2)" />;
      })}
      <motion.polygon
        initial={false}
        animate={{ points: poly }}
        transition={{ duration: 0.7, ease }}
        fill={color}
        fillOpacity="0.22"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {factors.map((f, i) => {
        const [x, y] = pt(i, Math.max(0.06, f.value));
        const [lx, ly] = pt(i, 1.3);
        return (
          <g key={f.key}>
            <motion.circle initial={false} animate={{ cx: x, cy: y }} transition={{ duration: 0.7, ease }} r="3.5" fill={color} />
            <text x={lx} y={ly + 3} textAnchor="middle" fontSize="9" fill="var(--ink-2)" fontFamily="var(--font-body)">
              {f.label.split(" ")[0]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const TABS = ["Signals", "Story", "Parts"] as const;

export function QuickPanel({ item, onClose }: { item: Assessed; onClose?: () => void }) {
  const { project: p, a } = item;
  const v = VERDICTS[a.verdict];
  const [tab, setTab] = useState<(typeof TABS)[number]>("Signals");
  const r = 40;
  const c = 2 * Math.PI * r;
  const built = p.done.length / Math.max(1, p.done.length + p.left.length);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18, rotateX: -8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.45, ease }}
      style={{ transformPerspective: 900 }}
      className="relative flex flex-col overflow-hidden rounded-xl border border-line bg-card shadow-[0_24px_60px_-34px_rgba(30,39,33,0.55)]"
      aria-labelledby={`qp-${p.id}`}
    >
      {/* verdict aura */}
      <motion.div
        key={`bar-${p.id}`}
        className="absolute inset-x-0 top-0 h-1 origin-left"
        style={{ background: `linear-gradient(90deg, ${v.color}, var(--dawn))` }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, ease }}
        aria-hidden="true"
      />
      <div className="relative p-5 pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
              Buried {ago(p.buriedOn)} · {CAUSES[p.causes[0]]?.label.toLowerCase()}
            </p>
            <h2 id={`qp-${p.id}`} className="mt-1 font-display text-2xl font-semibold leading-tight">
              {p.name.split("").map((ch, i) => (
                <motion.span key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02, duration: 0.3 }}>
                  {ch}
                </motion.span>
              ))}
            </h2>
          </div>
          {onClose && (
            <button onClick={onClose} className="rounded-md p-1.5 text-ink-3 hover:bg-paper hover:text-ink" aria-label="Close details">
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="relative h-24 w-24 shrink-0" role="img" aria-label={`Resurrection Score ${a.score} out of 100`}>
            <svg viewBox="0 0 100 100" className="-rotate-90" aria-hidden="true">
              <circle cx="50" cy="50" r={r} fill="none" stroke="var(--stone-light)" strokeWidth="7" />
              <motion.circle
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke={v.color}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={c}
                initial={{ strokeDashoffset: c }}
                animate={{ strokeDashoffset: c * (1 - a.score / 100) }}
                transition={{ duration: 1.1, ease }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-display text-3xl font-semibold" aria-hidden="true">
              <CountUp to={a.score} />
            </span>
          </div>
          <div className="space-y-2">
            <motion.div
              key={a.verdict}
              initial={{ scale: 2.2, rotate: -18, opacity: 0 }}
              animate={{ scale: 1, rotate: -4, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.25 }}
              className="inline-flex items-center gap-2 rounded-[8px] border-2 px-2.5 py-1 font-mono text-sm font-medium uppercase tracking-wider"
              style={{ color: v.color, borderColor: v.color, background: v.soft }}
            >
              <VerdictIcon v={a.verdict} size={16} />
              {v.label}
            </motion.div>
            <p className="text-sm font-medium">{v.path}</p>
            <StatusTag status={p.status} />
          </div>
        </div>

        <div role="tablist" aria-label="Project details" className="mt-5 flex gap-1 border-b border-line-2">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`relative px-3 py-2 text-sm font-medium ${tab === t ? "text-ink" : "text-ink-3 hover:text-ink"}`}
            >
              {t}
              {tab === t && <motion.span layoutId={`qp-tab-${onClose ? "m" : "d"}`} className="absolute inset-x-2 -bottom-px h-[2px]" style={{ background: v.color }} />}
            </button>
          ))}
        </div>
      </div>

      <div className="relative min-h-[230px] px-5 py-4" role="tabpanel">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.25 }}>
            {tab === "Signals" && (
              <div className="flex flex-col items-center">
                <Radar factors={a.factors} color={v.color} />
                <p className="mt-1 text-center text-sm text-ink-2">{a.reasons[0]}</p>
              </div>
            )}
            {tab === "Story" && (
              <div>
                <p className="font-display text-lg italic text-ink-2">&ldquo;{p.epitaph}&rdquo;</p>
                <ol className="mt-4 space-y-2.5 border-l border-line pl-4">
                  {[...p.timeline]
                    .sort((x, y) => x.date.localeCompare(y.date))
                    .map((t, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} className="relative text-sm">
                        <span className={`absolute top-1.5 -left-[21px] h-2 w-2 rounded-full ${t.kind === "afterlife" ? "bg-dawn" : t.kind === "buried" ? "bg-ink" : "bg-moss"}`} aria-hidden="true" />
                        <span className="font-mono text-[11px] text-ink-3">{fmtMonth(t.date)}</span> · {t.note}
                      </motion.li>
                    ))}
                </ol>
              </div>
            )}
            {tab === "Parts" && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-2">Finished vs left</span>
                    <span className="font-mono">
                      {p.done.length}/{p.done.length + p.left.length}
                    </span>
                  </div>
                  <div className="mt-1.5 flex h-2.5 overflow-hidden rounded-[3px] bg-stone-light">
                    <motion.div className="h-full bg-moss" initial={{ width: 0 }} animate={{ width: `${built * 100}%` }} transition={{ duration: 0.8, ease }} />
                  </div>
                </div>
                <ul className="flex flex-wrap gap-1.5">
                  {p.done.map((d, i) => (
                    <motion.li key={d} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.05 }} className="rounded-[5px] bg-moss-soft px-2 py-0.5 text-xs text-moss">
                      {d}
                    </motion.li>
                  ))}
                  {p.left.map((d, i) => (
                    <motion.li key={d} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 + i * 0.05 }} className="rounded-[5px] border border-dashed border-line px-2 py-0.5 text-xs text-ink-2">
                      {d}
                    </motion.li>
                  ))}
                </ul>
                <p className="text-sm text-ink-2">
                  {p.organs.length} reusable part{p.organs.length === 1 ? "" : "s"} in the{" "}
                  <Link href="/salvage" className="font-medium text-moss underline underline-offset-2">
                    Salvage Yard
                  </Link>
                  .
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative flex flex-col gap-2 border-t border-line-2 p-5">
        <Link href={`/garden/${p.id}`} className="btn btn-primary w-full">
          {v.action}
        </Link>
        {a.mergeWith && (
          <Link href={`/garden/${p.id}#merge`} className="text-center text-sm font-medium text-moss hover:underline">
            Overlaps with {a.mergeWith.name}
          </Link>
        )}
      </div>
    </motion.article>
  );
}

/**
 * Horizontal version for under the garden: identity, signals, story and parts
 * side by side, so nothing hides behind tabs on a wide screen.
 */
export function QuickStrip({ item }: { item: Assessed }) {
  const { project: p, a } = item;
  const v = VERDICTS[a.verdict];
  const r = 40;
  const c = 2 * Math.PI * r;
  const built = p.done.length / Math.max(1, p.done.length + p.left.length);
  const col = (i: number) => ({ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.08 * i, ease } });

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative overflow-hidden rounded-2xl border border-line bg-card shadow-[0_24px_60px_-40px_rgba(30,39,33,0.55)]"
      aria-labelledby={`qs-${p.id}`}
    >
      <motion.div
        className="absolute inset-x-0 top-0 h-1 origin-left"
        style={{ background: `linear-gradient(90deg, ${v.color}, var(--dawn))` }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, ease }}
        aria-hidden="true"
      />
      <div className="grid divide-line-2 md:grid-cols-2 md:divide-x xl:grid-cols-[1.15fr_1fr_1fr_1fr]">
        {/* who */}
        <motion.div {...col(0)} className="p-5">
          <p className="font-mono text-[11px] tracking-[0.14em] text-ink-3 uppercase">
            Buried {ago(p.buriedOn)} · {CAUSES[p.causes[0]]?.label.toLowerCase()}
          </p>
          <h2 id={`qs-${p.id}`} className="mt-1 font-display text-2xl leading-tight font-semibold">
            {p.name}
          </h2>
          <div className="mt-4 flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0" role="img" aria-label={`Resurrection Score ${a.score} out of 100`}>
              <svg viewBox="0 0 100 100" className="-rotate-90" aria-hidden="true">
                <circle cx="50" cy="50" r={r} fill="none" stroke="var(--stone-light)" strokeWidth="7" />
                <motion.circle cx="50" cy="50" r={r} fill="none" stroke={v.color} strokeWidth="7" strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - a.score / 100) }} transition={{ duration: 1.1, ease }} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-display text-2xl font-semibold" aria-hidden="true">
                <CountUp to={a.score} />
              </span>
            </div>
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-[8px] border-2 px-2 py-0.5 font-mono text-xs font-medium tracking-wider uppercase" style={{ color: v.color, borderColor: v.color, background: v.soft }}>
                <VerdictIcon v={a.verdict} size={14} />
                {v.label}
              </span>
              <p className="text-sm font-medium">{v.path}</p>
              <StatusTag status={p.status} />
            </div>
          </div>
          <Link href={`/garden/${p.id}`} className="btn btn-primary mt-4 w-full !py-2 text-sm">
            {v.action}
          </Link>
        </motion.div>

        {/* signals */}
        <motion.div {...col(1)} className="flex flex-col items-center p-5">
          <p className="self-start text-xs font-semibold text-ink-2">Six signals</p>
          <Radar factors={a.factors} color={v.color} size={170} />
          <p className="text-center text-xs text-ink-2">{a.reasons[0]}</p>
        </motion.div>

        {/* story */}
        <motion.div {...col(2)} className="p-5">
          <p className="text-xs font-semibold text-ink-2">Story</p>
          <p className="mt-2 font-display text-base text-ink-2 italic">&ldquo;{p.epitaph}&rdquo;</p>
          <ol className="mt-3 space-y-2 border-l border-line pl-4">
            {[...p.timeline]
              .sort((x, y) => x.date.localeCompare(y.date))
              .slice(-4)
              .map((t, i) => (
                <li key={i} className="relative text-xs">
                  <span className={`absolute top-1 -left-[21px] h-2 w-2 rounded-full ${t.kind === "afterlife" ? "bg-dawn" : t.kind === "buried" ? "bg-ink" : "bg-moss"}`} aria-hidden="true" />
                  <span className="font-mono text-[10px] text-ink-3">{fmtMonth(t.date)}</span> · {t.note}
                </li>
              ))}
          </ol>
        </motion.div>

        {/* parts */}
        <motion.div {...col(3)} className="p-5">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-ink-2">Finished vs left</span>
            <span className="font-mono">
              {p.done.length}/{p.done.length + p.left.length}
            </span>
          </div>
          <div className="mt-1.5 flex h-2 overflow-hidden rounded-[3px] bg-stone-light">
            <motion.div className="h-full bg-moss" initial={{ width: 0 }} animate={{ width: `${built * 100}%` }} transition={{ duration: 0.8, ease }} />
          </div>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {p.done.map((d) => (
              <li key={d} className="rounded-[5px] bg-moss-soft px-2 py-0.5 text-xs text-moss">
                {d}
              </li>
            ))}
            {p.left.map((d) => (
              <li key={d} className="rounded-[5px] border border-dashed border-line px-2 py-0.5 text-xs text-ink-2">
                {d}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink-2">
            {p.organs.length} reusable part{p.organs.length === 1 ? "" : "s"} in the{" "}
            <Link href="/salvage" className="font-medium text-moss underline underline-offset-2">
              Salvage Yard
            </Link>
            {a.mergeWith && (
              <>
                {" "}· overlaps with{" "}
                <Link href={`/garden/${p.id}#merge`} className="font-medium text-moss underline underline-offset-2">
                  {a.mergeWith.name}
                </Link>
              </>
            )}
          </p>
        </motion.div>
      </div>
    </motion.article>
  );
}
