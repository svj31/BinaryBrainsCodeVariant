"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Assessed } from "@/lib/store";
import { CAUSES, VERDICTS } from "@/lib/verdicts";
import { ago, fmtMonth } from "@/lib/format";
import { Headstone } from "@/components/ui/Headstone";
import { StatusTag, VerdictBadge } from "@/components/ui/VerdictBadge";

interface ViewProps {
  items: Assessed[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const ease = [0.22, 1, 0.36, 1] as const;

/* ---------- Plots: a card per grave ---------- */
export function PlotsView({ items, selectedId, onSelect }: ViewProps) {
  return (
    <motion.ul layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {items.map(({ project: p, a }, i) => {
          const selected = p.id === selectedId;
          return (
            <motion.li
              key={p.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.25), ease }}
            >
              <button
                onClick={() => onSelect(p.id)}
                aria-pressed={selected}
                className={`group flex h-full w-full flex-col rounded-lg border bg-card p-4 text-left transition-colors ${
                  selected ? "border-moss ring-2 ring-moss-soft" : "border-line hover:border-ink-3"
                }`}
              >
                <div className="flex items-start gap-4">
                  <Headstone
                    score={a.score}
                    archived={p.status === "archived"}
                    sprout={p.status !== "archived" && (p.status !== "resting" || a.score >= 55)}
                    className="h-20 w-16 shrink-0 transition-transform duration-300 group-hover:-translate-y-1"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate font-display text-lg font-semibold">{p.name}</h3>
                      <span className="font-mono text-lg font-medium" style={{ color: VERDICTS[a.verdict].color }}>
                        {a.score}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-ink-2">{p.pitch}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <VerdictBadge verdict={a.verdict} size="sm" />
                      <StatusTag status={p.status} />
                    </div>
                  </div>
                </div>
                <p className="mt-4 border-t border-line-2 pt-3 text-xs text-ink-3">
                  Buried {ago(p.buriedOn)} · {CAUSES[p.causes[0]]?.label ?? "No cause recorded"}
                </p>
              </button>
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
      sort.key === "name"
        ? x.project.name.toLowerCase()
        : sort.key === "score"
          ? x.a.score
          : sort.key === "completion"
            ? x.project.inputs.completion
            : x.project.buriedOn;
    return [...items].sort((a, b) => (val(a) > val(b) ? 1 : val(a) < val(b) ? -1 : 0) * sort.dir);
  }, [items, sort]);

  const header = (key: SortKey, label: string, cls = "") => {
    const active = sort.key === key;
    return (
      <th scope="col" className={`px-3 py-3 font-medium ${cls}`} aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
        <button
          className="inline-flex items-center gap-1 hover:text-ink"
          onClick={() => setSort((s) => ({ key, dir: s.key === key ? ((s.dir * -1) as 1 | -1) : key === "name" ? 1 : -1 }))}
        >
          {label}
          <span aria-hidden="true" className={active ? "text-ink" : "text-transparent"}>
            {sort.dir === 1 ? "↑" : "↓"}
          </span>
        </button>
      </th>
    );
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-card">
      <table className="w-full min-w-[720px] text-left text-sm">
        <caption className="sr-only">All buried projects. Select a column header to sort.</caption>
        <thead className="border-b border-line text-xs uppercase tracking-wider text-ink-3">
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
        <motion.tbody layout>
          {rows.map(({ project: p, a }) => (
            <motion.tr
              layout
              key={p.id}
              transition={{ duration: 0.3, ease }}
              onClick={() => onSelect(p.id)}
              className={`cursor-pointer border-b border-line-2 last:border-0 ${p.id === selectedId ? "bg-moss-soft" : "hover:bg-paper"}`}
            >
              <td className="px-3 py-3">
                <Link href={`/garden/${p.id}`} className="font-semibold text-ink hover:underline" onClick={(e) => e.stopPropagation()}>
                  {p.name}
                </Link>
              </td>
              <td className="px-3 py-3 font-mono">{a.score}</td>
              <td className="px-3 py-3">
                <VerdictBadge verdict={a.verdict} size="sm" />
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-[2px] bg-stone-light" aria-hidden="true">
                    <div className="h-full bg-ink-3" style={{ width: `${p.inputs.completion}%` }} />
                  </div>
                  <span className="font-mono text-xs text-ink-2">{p.inputs.completion}%</span>
                </div>
              </td>
              <td className="px-3 py-3 text-ink-2">{CAUSES[p.causes[0]]?.label}</td>
              <td className="px-3 py-3 text-ink-2">{fmtMonth(p.buriedOn)}</td>
              <td className="px-3 py-3">
                <StatusTag status={p.status} />
              </td>
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  );
}

/* ---------- Timeline: lifespans on a shared axis ---------- */
export function TimelineView({ items, selectedId, onSelect }: ViewProps) {
  const { min, max, years } = useMemo(() => {
    const dates = items.flatMap(({ project: p }) => [p.startedOn, p.buriedOn, ...p.timeline.map((t) => t.date)]);
    const ts = dates.map((d) => new Date(d).getTime());
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
    <div className="overflow-x-auto rounded-lg border border-line bg-card p-4 sm:p-6">
      <div className="min-w-[680px]">
        <div className="relative ml-40 h-6 border-b border-line text-xs text-ink-3" aria-hidden="true">
          {years.map((y) => (
            <span key={y} className="absolute -translate-x-1/2 font-mono" style={{ left: `${pos(`${y}-01-01`)}%` }}>
              {y}
            </span>
          ))}
          <span className="absolute -translate-x-1/2 font-mono text-moss" style={{ left: `${pos(Date.now())}%`, top: 0 }}>
            today
          </span>
        </div>
        <div className="relative mt-2">
          {/* year gridlines */}
          <div className="pointer-events-none absolute inset-y-0 left-40 right-0" aria-hidden="true">
            {years.map((y) => (
              <span key={y} className="absolute inset-y-0 w-px bg-line-2" style={{ left: `${pos(`${y}-01-01`)}%` }} />
            ))}
            <span className="absolute inset-y-0 w-px bg-moss/50" style={{ left: `${pos(Date.now())}%` }} />
          </div>
          <ul className="relative">
          {sorted.map(({ project: p, a }, i) => {
            const left = pos(p.startedOn);
            const width = Math.max(0.8, pos(p.buriedOn) - left);
            const after = p.timeline.filter((t) => t.kind === "afterlife");
            const color = VERDICTS[a.verdict].color;
            return (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: i * 0.03, ease }}
                className="relative flex h-11 items-center"
              >
                <button
                  onClick={() => onSelect(p.id)}
                  aria-pressed={p.id === selectedId}
                  className={`w-40 shrink-0 truncate pr-3 text-left text-sm ${p.id === selectedId ? "font-semibold text-moss" : "text-ink hover:text-moss"}`}
                >
                  {p.name}
                </button>
                <div className="relative h-full flex-1">
                  <motion.button
                    onClick={() => onSelect(p.id)}
                    aria-label={`${p.name}: active from ${fmtMonth(p.startedOn)} to ${fmtMonth(p.buriedOn)}`}
                    className="absolute top-1/2 h-3 -translate-y-1/2 origin-left rounded-[2px]"
                    style={{ left: `${left}%`, width: `${width}%`, background: color, opacity: p.status === "archived" ? 0.45 : 1 }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.03, ease }}
                  />
                  <span
                    className="absolute top-1/2 h-4 w-[3px] -translate-y-1/2 bg-ink"
                    style={{ left: `${pos(p.buriedOn)}%` }}
                    title={`Buried ${fmtMonth(p.buriedOn)}`}
                    aria-hidden="true"
                  />
                  {after.map((t) => (
                    <span
                      key={t.date + t.note}
                      className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 border-card bg-dawn"
                      style={{ left: `${pos(t.date)}%` }}
                      title={`${fmtMonth(t.date)}: ${t.note}`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </motion.li>
            );
          })}
          </ul>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 border-t border-line-2 pt-3 text-xs text-ink-2">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-5 rounded-[2px] bg-ink-3" aria-hidden="true" /> Active life, coloured by verdict
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-[3px] bg-ink" aria-hidden="true" /> Buried
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rotate-45 bg-dawn" aria-hidden="true" /> Afterlife event
          </span>
        </div>
      </div>
    </div>
  );
}
