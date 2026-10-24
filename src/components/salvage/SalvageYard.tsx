"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGraveyard } from "@/lib/store";
import type { Organ } from "@/lib/types";

const KINDS: Organ["kind"][] = ["component", "script", "dataset", "design", "api", "research"];
const KIND_MARK: Record<Organ["kind"], string> = {
  component: "UI",
  script: "fn",
  dataset: "db",
  design: "Aa",
  api: "{}",
  research: "§",
};

export function SalvageYard() {
  const projects = useGraveyard((s) => s.projects);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<Organ["kind"] | "all">("all");
  const [copied, setCopied] = useState<string | null>(null);

  const parts = useMemo(
    () => projects.flatMap((p) => p.organs.map((o) => ({ ...o, from: p }))),
    [projects],
  );
  const shown = parts.filter(
    (o) =>
      (kind === "all" || o.kind === kind) &&
      (!q.trim() || [o.name, o.note, o.from.name, ...o.from.stack].some((s) => s.toLowerCase().includes(q.trim().toLowerCase()))),
  );

  const borrow = async (o: (typeof parts)[number]) => {
    const text = `${o.name} (${o.kind}) from ${o.from.name}${o.from.repoUrl ? `: ${o.from.repoUrl}` : ""}${o.note ? `. ${o.note}` : ""}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard blocked, the visual confirmation still helps */
    }
    setCopied(o.id);
    setTimeout(() => setCopied((c) => (c === o.id ? null : c)), 1800);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-10 sm:px-6">
      <p className="eyebrow">Reusable organs</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Salvage Yard</h1>
      <p className="mt-2 max-w-2xl text-ink-2">
        Working parts pulled from buried projects. Before you start something new, check whether you already built half
        of it.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="yard-q" className="sr-only">
          Search parts
        </label>
        <input id="yard-q" type="search" className="field sm:w-80" placeholder="Search parts, projects, stack" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by type">
          {(["all", ...KINDS] as const).map((k) => (
            <button
              key={k}
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
              className={`shrink-0 rounded-md border px-3 py-1.5 text-sm capitalize transition-colors ${
                kind === k ? "border-ink bg-ink text-paper" : "border-line bg-card text-ink-2 hover:border-ink-3"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm text-ink-3" aria-live="polite">
        {shown.length} of {parts.length} parts
      </p>

      <motion.ul layout className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((o, i) => (
            <motion.li
              layout
              key={o.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.025, 0.2) }}
              className="flex flex-col rounded-lg border border-line bg-card p-4"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line bg-paper font-mono text-sm text-ink-2" aria-hidden="true">
                  {KIND_MARK[o.kind]}
                </span>
                <div className="min-w-0">
                  <h2 className="font-semibold leading-snug">{o.name}</h2>
                  <p className="text-xs capitalize text-ink-3">{o.kind}</p>
                </div>
              </div>
              {o.note && <p className="mt-3 text-sm text-ink-2">{o.note}</p>}
              <div className="mt-auto flex items-center justify-between gap-2 border-t border-line-2 pt-3 text-sm">
                <Link href={`/garden/${o.from.id}`} className="truncate text-ink-2 hover:text-ink">
                  from <span className="font-medium text-ink underline-offset-2 hover:underline">{o.from.name}</span>
                </Link>
                <button className="shrink-0 font-medium text-moss hover:underline" onClick={() => borrow(o)} aria-live="polite">
                  {copied === o.id ? "Copied" : "Borrow"}
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
      {shown.length === 0 && (
        <div className="mt-6 rounded-lg border border-dashed border-line p-8 text-center text-ink-2">
          No parts match. Open any project and save parts from its Salvage path.
        </div>
      )}
    </div>
  );
}
