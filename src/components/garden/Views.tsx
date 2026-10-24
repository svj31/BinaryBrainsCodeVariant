"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Assessed } from "@/lib/store";
import { CAUSES, VERDICTS } from "@/lib/verdicts";
import { ago, daysBetween, fmtMonth } from "@/lib/format";
import { Headstone } from "@/components/ui/Headstone";
import { StatusTag, VerdictBadge } from "@/components/ui/VerdictBadge";
import { DragCard } from "@/components/canvas/dnd";

interface ViewProps {
  items: Assessed[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const ease = [0.16, 1, 0.3, 1] as const;

/* ---------- Plots: a card per grave ---------- */
export function PlotsView({ items, selectedId, onSelect }: ViewProps) {
  return (
    <motion.ul layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" style={{ perspective: 1200 }}>
      <AnimatePresence mode="popLayout">
        {items.map(({ project: p, a }, i) => {
          const selected = p.id === selectedId;
          const v = VERDICTS[a.verdict];
          return (
            <motion.li
              key={p.id}
              layout
              initial={{ opacity: 0, rotateX: 35, y: 40 }}
              animate={{ opacity: 1, rotateX: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateX: -20 }}
              transition={{ duration: 0.6, delay: Math.min(i * 0.05, 0.4), ease }}
              style={{ transformOrigin: "50% 100%" }}
            >
              <DragCard data={{ kind: "project", id: p.id, label: p.name }} hint="Click to preview, or drag into the action dock" className="h-full">
              <motion.div
                onClick={() => onSelect(p.id)}
                data-selected={selected || undefined}
                whileTap={{ scale: 0.98 }}
                className={`group flex h-full w-full flex-col overflow-hidden rounded-xl border bg-card text-left transition-shadow ${
                  selected ? "border-transparent shadow-[0_20px_50px_-24px_rgba(30,39,33,0.6)]" : "border-line hover:shadow-[0_20px_40px_-26px_rgba(30,39,33,0.5)]"
                }`}
                style={selected ? { outline: `2px solid ${v.color}`, outlineOffset: -2 } : undefined}
              >
                <div className="relative flex h-32 items-end justify-center overflow-hidden" style={{ background: `linear-gradient(180deg, ${v.soft}, var(--card))` }}>
                  <motion.div
                    className="absolute bottom-2 h-10 w-40 rounded-full blur-xl"
                    style={{ background: "var(--dawn)" }}
                    animate={{ opacity: [0.15 + a.score / 250, 0.35 + a.score / 250, 0.15 + a.score / 250] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                    aria-hidden="true"
                  />
                  <Headstone
                    score={a.score}
                    archived={p.status === "archived"}
                    sprout={p.status !== "archived" && (p.status !== "resting" || a.score >= 55)}
                    className="relative h-28 w-24 translate-y-3 transition-transform duration-500 group-hover:translate-y-1 group-hover:rotate-[-3deg]"
                  />
                  <span
                    className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-full border-2 bg-card font-mono text-base font-semibold"
                    style={{ borderColor: v.color, color: v.color }}
                  >
                    {a.score}
                  </span>
                  <span className="absolute top-3 left-3">
                    <StatusTag status={p.status} />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate font-display text-lg font-semibold">{p.name}</h3>
                    <VerdictBadge verdict={a.verdict} size="sm" />
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-2">{p.pitch}</p>
                  <div className="mt-auto pt-4">
                    {(() => {
                      const weak = [...a.factors].sort((x, y) => x.value - y.value)[0];
                      return (
                        <figure aria-label={`Six signals behind the score. Weakest: ${weak.label}`}>
                          <figcaption className="mb-1.5 flex justify-between font-mono text-[10px] uppercase tracking-wider text-ink-3">
                            <span>Six signals</span>
                            <span>
                              weak spot: <span className="text-clay">{weak.label.toLowerCase()}</span>
                            </span>
                          </figcaption>
                          <div className="flex h-10 items-end gap-1.5">
                            {a.factors.map((f, k) => (
                              <span key={f.key} className="group/bar relative flex h-full flex-1 flex-col justify-end" title={`${f.label}: ${Math.round(f.value * 100)}/100`}>
                                <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[10px] text-ink opacity-0 transition-opacity group-hover/bar:opacity-100">
                                  {Math.round(f.value * 100)}
                                </span>
                                <span className="absolute inset-x-0 bottom-0 h-full rounded-t-[2px] bg-stone-light/60" aria-hidden="true" />
                                <motion.span
                                  className="relative rounded-t-[2px]"
                                  style={{ background: f.key === weak.key ? "var(--clay)" : f.value >= 0.6 ? "var(--moss)" : "var(--dawn)" }}
                                  initial={{ height: 0 }}
                                  animate={{ height: `${Math.max(6, f.value * 100)}%` }}
                                  transition={{ duration: 0.6, delay: 0.3 + k * 0.05, ease }}
                                />
                              </span>
                            ))}
                          </div>
                          <div className="mt-1 flex gap-1.5 font-mono text-[9px] uppercase text-ink-3" aria-hidden="true">
                            {a.factors.map((f) => (
                              <span key={f.key} className="flex-1 truncate text-center">
                                {f.label.split(" ")[0].slice(0, 5)}
                              </span>
                            ))}
                          </div>
                        </figure>
                      );
                    })()}
                    <p className="mt-3 flex justify-between border-t border-line-2 pt-2.5 text-xs text-ink-3">
                      <span>Buried {ago(p.buriedOn)}</span>
                      <span>{CAUSES[p.causes[0]]?.label}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
              </DragCard>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </motion.ul>
  );
}

/* ---------- Ledger: sortable table ---------- */
type SortKey = "name" | "score" | "buriedOn" | "completion";

export function LedgerView({ items, selectedId, onSelect }: ViewProps) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "score", dir: -1 });
  const rows = useMemo(() => {
    const val = (x: Assessed) =>
      sort.key === "name" ? x.project.name.toLowerCase() : sort.key === "score" ? x.a.score : sort.key === "completion" ? x.project.inputs.completion : x.project.buriedOn;
    return [...items].sort((a, b) => (val(a) > val(b) ? 1 : val(a) < val(b) ? -1 : 0) * sort.dir);
  }, [items, sort]);

  const header = (key: SortKey, label: string) => {
    const active = sort.key === key;
    return (
      <th scope="col" className="px-3 py-3 font-medium" aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
        <button
          className={`inline-flex items-center gap-1 rounded px-1 hover:text-ink ${active ? "text-ink" : ""}`}
          onClick={() => setSort((s) => ({ key, dir: s.key === key ? ((s.dir * -1) as 1 | -1) : key === "name" ? 1 : -1 }))}
        >
          {label}
          <motion.span aria-hidden="true" animate={{ rotate: sort.dir === 1 ? 180 : 0, opacity: active ? 1 : 0 }}>
            ↓
          </motion.span>
        </button>
      </th>
    );
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-card shadow-[0_20px_50px_-36px_rgba(30,39,33,0.5)]">
      <table className="w-full min-w-[760px] text-left text-sm">
        <caption className="sr-only">All buried projects. Select a column header to sort.</caption>
        <thead className="border-b border-line bg-paper-2/60 font-mono text-[11px] uppercase tracking-wider text-ink-3">
          <tr>
            {header("name", "Project")}
            {header("score", "Score")}
            <th scope="col" className="px-3 py-3 font-medium">Verdict</th>
            {header("completion", "Built")}
            <th scope="col" className="px-3 py-3 font-medium">Cause</th>
            {header("buriedOn", "Buried")}
            <th scope="col" className="px-3 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ project: p, a }, i) => {
            const v = VERDICTS[a.verdict];
            const sel = p.id === selectedId;
            return (
              <motion.tr
                layout
                key={p.id}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: i * 0.035, ease }}
                onClick={() => onSelect(p.id)}
                className={`group cursor-pointer border-b border-line-2 transition-colors last:border-0 ${sel ? "bg-moss-soft/70" : "hover:bg-paper"}`}
                style={sel ? { boxShadow: `inset 3px 0 0 ${v.color}` } : undefined}
              >
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <Headstone score={a.score} archived={p.status === "archived"} sprout={a.score >= 55 && p.status !== "archived"} className="h-9 w-8 shrink-0 transition-transform group-hover:-translate-y-0.5" />
                    <Link href={`/garden/${p.id}`} className="font-semibold text-ink hover:underline" onClick={(e) => e.stopPropagation()}>
                      {p.name}
                    </Link>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 font-mono font-semibold" style={{ color: v.color }}>
                      {a.score}
                    </span>
                    <span className="h-1.5 w-14 overflow-hidden rounded-[2px] bg-stone-light" aria-hidden="true">
                      <motion.span className="block h-full" style={{ background: v.color }} initial={{ width: 0 }} animate={{ width: `${a.score}%` }} transition={{ duration: 0.7, delay: 0.2 + i * 0.03 }} />
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <VerdictBadge verdict={a.verdict} size="sm" />
                </td>
                <td className="px-3 py-3 font-mono text-xs text-ink-2">{p.inputs.completion}%</td>
                <td className="px-3 py-3 text-ink-2">{CAUSES[p.causes[0]]?.label}</td>
                <td className="px-3 py-3 text-ink-2">{fmtMonth(p.buriedOn)}</td>
                <td className="px-3 py-3">
                  <StatusTag status={p.status} />
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Timeline: lifespans on a shared axis ---------- */
export function TimelineView({ items, selectedId, onSelect }: ViewProps) {
  const [hover, setHover] = useState<string | null>(null);
  const { min, max, years } = useMemo(() => {
    const ts = items.flatMap(({ project: p }) => [p.startedOn, p.buriedOn, ...p.timeline.map((t) => t.date)]).map((d) => new Date(d).getTime());
    const lo = new Date(Math.min(...ts));
    const hi = new Date(Math.max(...ts, Date.now()));
    const min = new Date(lo.getFullYear(), lo.getMonth(), 1).getTime();
    const max = new Date(hi.getFullYear(), hi.getMonth() + 1, 1).getTime();
    const years: number[] = [];
    for (let y = new Date(min).getFullYear() + 1; y <= new Date(max).getFullYear(); y++) years.push(y);
    return { min, max, years };
  }, [items]);

  if (!items.length) return null;
  const pos = (iso: string | number) => ((new Date(iso).getTime() - min) / (max - min)) * 100;
  const sorted = [...items].sort((a, b) => a.project.startedOn.localeCompare(b.project.startedOn));

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-card p-4 shadow-[0_20px_50px_-36px_rgba(30,39,33,0.5)] sm:p-6">
      <div className="min-w-[700px]">
        <div className="relative ml-44 h-6 border-b border-line text-xs text-ink-3" aria-hidden="true">
          {years.map((y) => (
            <span key={y} className="absolute -translate-x-1/2 font-mono" style={{ left: `${pos(`${y}-01-01`)}%` }}>
              {y}
            </span>
          ))}
        </div>
        <div className="relative mt-2">
          <div className="pointer-events-none absolute inset-y-0 left-44 right-0" aria-hidden="true">
            {years.map((y) => (
              <span key={y} className="absolute inset-y-0 w-px bg-line-2" style={{ left: `${pos(`${y}-01-01`)}%` }} />
            ))}
            <motion.span
              className="absolute inset-y-0 w-[2px] bg-dawn"
              style={{ left: `${pos(Date.now())}%`, boxShadow: "0 0 12px 2px rgba(233,165,58,0.6)" }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.9, ease }}
            />
            <span className="absolute -top-7 -translate-x-1/2 rounded bg-dawn px-1.5 font-mono text-[10px] text-ink" style={{ left: `${pos(Date.now())}%` }}>
              today
            </span>
          </div>
          <ul className="relative">
            {sorted.map(({ project: p, a }, i) => {
              const left = pos(p.startedOn);
              const width = Math.max(0.8, pos(p.buriedOn) - left);
              const v = VERDICTS[a.verdict];
              const after = p.timeline.filter((t) => t.kind === "afterlife");
              const sel = p.id === selectedId;
              const hv = hover === p.id;
              return (
                <motion.li
                  key={p.id}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.04, ease }}
                  className={`relative flex h-12 items-center rounded-md ${i % 2 ? "bg-paper/50" : ""} ${sel ? "!bg-moss-soft/70" : ""}`}
                  onMouseEnter={() => setHover(p.id)}
                  onMouseLeave={() => setHover(null)}
                >
                  <button
                    onClick={() => onSelect(p.id)}
                    aria-pressed={sel}
                    className={`flex w-44 shrink-0 items-center gap-2 truncate pr-3 pl-2 text-left text-sm ${sel ? "font-semibold text-moss" : "text-ink hover:text-moss"}`}
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: v.color }} aria-hidden="true" />
                    {p.name}
                  </button>
                  <div className="relative h-full flex-1">
                    <motion.button
                      onClick={() => onSelect(p.id)}
                      aria-label={`${p.name}: active from ${fmtMonth(p.startedOn)} to ${fmtMonth(p.buriedOn)}`}
                      className="absolute top-1/2 h-4 -translate-y-1/2 origin-left rounded-[4px]"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        background: `linear-gradient(90deg, ${v.soft}, ${v.color})`,
                        opacity: p.status === "archived" ? 0.5 : 1,
                        boxShadow: hv || sel ? `0 0 0 2px var(--card), 0 0 0 4px ${v.color}` : undefined,
                      }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 0.15 + i * 0.04, ease }}
                    />
                    <span className="absolute top-1/2 h-5 w-[3px] -translate-y-1/2 rounded bg-ink" style={{ left: `${pos(p.buriedOn)}%` }} aria-hidden="true" />
                    {after.map((t) => (
                      <motion.span
                        key={t.date + t.note}
                        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 border-card bg-dawn"
                        style={{ left: `${pos(t.date)}%` }}
                        animate={{ scale: [1, 1.35, 1] }}
                        transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.1 }}
                        aria-hidden="true"
                      />
                    ))}
                    <AnimatePresence>
                      {hv && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="pointer-events-none absolute -top-9 z-10 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs text-paper shadow-lg"
                          style={{ left: `${Math.min(70, left)}%` }}
                        >
                          {daysBetween(p.startedOn, p.buriedOn)} days alive · score {a.score} · {v.label}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 border-t border-line-2 pt-3 text-xs text-ink-2">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-6 rounded-[2px] bg-gradient-to-r from-moss-soft to-moss" aria-hidden="true" /> Active life, coloured by verdict
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-[3px] bg-ink" aria-hidden="true" /> Buried
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rotate-45 bg-dawn" aria-hidden="true" /> Afterlife event
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-[2px] bg-dawn" aria-hidden="true" /> Today
          </span>
        </div>
      </div>
    </div>
  );
}
