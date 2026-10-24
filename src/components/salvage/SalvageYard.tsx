"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGraveyard } from "@/lib/store";
import type { Organ, Project } from "@/lib/types";
import { useRitual } from "@/components/magic/Ritual";
import { track } from "@/lib/consent";

const KINDS: Organ["kind"][] = ["component", "script", "dataset", "design", "api", "research"];
const KIND_META: Record<Organ["kind"], { label: string; tint: string; ink: string }> = {
  component: { label: "Components", tint: "#e1ebe2", ink: "#2d5a43" },
  script: { label: "Scripts", tint: "#1e2721", ink: "#9fe3b0" },
  dataset: { label: "Datasets", tint: "#dcebf0", ink: "#22617a" },
  design: { label: "Designs", tint: "#f8e7c8", ink: "#8a520c" },
  api: { label: "APIs", tint: "#f3e1d6", ink: "#84452a" },
  research: { label: "Research", tint: "#ece5d6", ink: "#434e47" },
};

/** Little living illustrations, one per kind of part. */
function KindArt({ kind, hot }: { kind: Organ["kind"]; hot: boolean }) {
  const m = KIND_META[kind];
  const t = { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const };
  return (
    <div className="relative flex h-28 items-center justify-center overflow-hidden" style={{ background: m.tint }} aria-hidden="true">
      {kind === "component" && (
        <div className="w-40 space-y-2 rounded-lg border border-[#c9d8cc] bg-card p-3 shadow-sm">
          <div className="h-2 w-16 rounded bg-[#c9d8cc]" />
          <div className="h-6 rounded border border-[#c9d8cc]" />
          <motion.div className="h-6 rounded" style={{ background: m.ink }} animate={{ width: hot ? "100%" : "55%" }} transition={t} />
        </div>
      )}
      {kind === "script" && (
        <div className="w-44 space-y-1.5 font-mono text-[10px]">
          {["fn parse(src) {", "  return dates", "    .filter(ok)", "}"].map((l, i) => (
            <motion.div key={i} className="overflow-hidden whitespace-nowrap" style={{ color: i % 3 === 0 ? "#f2b34a" : m.ink }} animate={{ width: hot ? ["0%", "100%"] : "100%" }} transition={{ ...t, delay: i * 0.08 }}>
              {l}
            </motion.div>
          ))}
          <motion.span className="inline-block h-3 w-1.5 bg-[#9fe3b0]" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} />
        </div>
      )}
      {kind === "dataset" && (
        <div className="grid grid-cols-4 gap-1">
          {Array.from({ length: 16 }, (_, i) => (
            <motion.span key={i} className="h-4 w-8 rounded-[2px]" style={{ background: i < 4 ? m.ink : "#ffffffcc" }} animate={{ opacity: hot ? [1, 0.4, 1] : 1 }} transition={{ duration: 0.8, delay: (i % 4) * 0.08 + Math.floor(i / 4) * 0.05 }} />
          ))}
        </div>
      )}
      {kind === "design" && (
        <div className="flex items-end gap-2">
          {["#2d5a43", "#e9a53a", "#22617a", "#a4482a"].map((c, i) => (
            <motion.span key={c} className="h-14 w-9 rounded-md shadow-sm" style={{ background: c }} animate={{ y: hot ? (i % 2 ? -8 : 4) : 0, rotate: hot ? (i - 1.5) * 6 : 0 }} transition={t} />
          ))}
          <span className="ml-2 font-display text-3xl" style={{ color: m.ink }}>
            Aa
          </span>
        </div>
      )}
      {kind === "api" && (
        <div className="font-mono text-xs" style={{ color: m.ink }}>
          <motion.div animate={{ x: hot ? 6 : 0 }} transition={t}>
            <span className="rounded bg-[#84452a] px-1.5 py-0.5 text-white">GET</span> /api/parts
          </motion.div>
          <motion.div className="mt-2 opacity-80" animate={{ opacity: hot ? 1 : 0.6 }}>
            {"{ \"ok\": true }"}
          </motion.div>
        </div>
      )}
      {kind === "research" && (
        <motion.div className="w-28 space-y-1.5 rounded-sm bg-card p-3 shadow-md" animate={{ rotate: hot ? -4 : 2 }} transition={t}>
          <div className="h-2 w-14 rounded bg-ink-3" />
          {[1, 0.8, 0.9, 0.6].map((w, i) => (
            <div key={i} className="h-1.5 rounded bg-stone" style={{ width: `${w * 100}%` }} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

type Part = Organ & { from: Project };

export function SalvageYard() {
  const projects = useGraveyard((s) => s.projects);
  const update = useGraveyard((s) => s.update);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<Organ["kind"] | "all">("all");
  const [hot, setHot] = useState<string | null>(null);
  const [borrowing, setBorrowing] = useState<Part | null>(null);

  const parts = useMemo<Part[]>(() => projects.flatMap((p) => p.organs.filter((o) => !o.id.includes("~")).map((o) => ({ ...o, from: p }))), [projects]);
  const borrowCount = (id: string) => projects.filter((p) => p.organs.some((o) => o.id.startsWith(`${id}~`))).length;
  const shown = parts.filter(
    (o) =>
      (kind === "all" || o.kind === kind) &&
      (!q.trim() || [o.name, o.note, o.from.name, ...o.from.stack].some((s) => s.toLowerCase().includes(q.trim().toLowerCase()))),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Reusable organs</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Salvage Yard</h1>
          <p className="mt-2 max-w-2xl text-ink-2">Working parts pulled from buried projects. Borrow one into a living project instead of building it twice.</p>
        </div>
        <p className="font-mono text-sm text-ink-3" aria-live="polite">
          {shown.length} of {parts.length} parts
        </p>
      </div>

      {/* shelf by kind */}
      <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-7" role="group" aria-label="Filter by type">
        {(["all", ...KINDS] as const).map((k) => {
          const n = k === "all" ? parts.length : parts.filter((p) => p.kind === k).length;
          const on = kind === k;
          return (
            <motion.button
              key={k}
              aria-pressed={on}
              onClick={() => setKind(k)}
              whileTap={{ scale: 0.95 }}
              className={`relative rounded-lg border px-3 py-2.5 text-left transition-colors ${on ? "border-ink text-paper" : "border-line bg-card hover:border-ink-3"}`}
            >
              {on && <motion.span layoutId="yard-kind" className="absolute inset-0 rounded-lg bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative block text-sm font-semibold capitalize">{k === "all" ? "Everything" : KIND_META[k].label}</span>
              <span className={`relative font-mono text-xs ${on ? "text-paper/70" : "text-ink-3"}`}>{n}</span>
            </motion.button>
          );
        })}
      </div>

      <label htmlFor="yard-q" className="sr-only">
        Search parts
      </label>
      <input id="yard-q" type="search" className="field mt-4 sm:w-96" placeholder="Search parts, projects, stack" value={q} onChange={(e) => setQ(e.target.value)} />

      <motion.ul layout className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((o, i) => {
            const n = borrowCount(o.id);
            return (
              <motion.li
                layout
                key={o.id}
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.45, delay: Math.min(i * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={() => setHot(o.id)}
                onMouseLeave={() => setHot(null)}
                className="group flex flex-col overflow-hidden rounded-xl border border-line bg-card transition-shadow hover:shadow-[0_22px_44px_-28px_rgba(30,39,33,0.55)]"
              >
                <KindArt kind={o.kind} hot={hot === o.id} />
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold leading-snug">{o.name}</h2>
                    <span className="shrink-0 rounded-[4px] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider" style={{ background: KIND_META[o.kind].tint, color: o.kind === "script" ? "#f4f1e6" : KIND_META[o.kind].ink }}>
                      {o.kind}
                    </span>
                  </div>
                  {o.note && <p className="mt-2 text-sm text-ink-2">{o.note}</p>}
                  {n > 0 && <p className="mt-2 text-xs font-medium text-moss">Living on in {n} project{n > 1 ? "s" : ""}</p>}
                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-line-2 pt-3 text-sm">
                    <Link href={`/garden/${o.from.id}`} className="truncate text-ink-2 hover:text-ink">
                      from <span className="font-medium text-ink underline-offset-2 hover:underline">{o.from.name}</span>
                    </Link>
                    <button className="btn btn-primary !px-3 !py-1.5 text-sm" onClick={() => setBorrowing(o)}>
                      Borrow
                    </button>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>
      {shown.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-line p-10 text-center text-ink-2">
          No parts match. Open any project and save parts from its Salvage path.
        </div>
      )}

      <BorrowDialog part={borrowing} projects={projects} onClose={() => setBorrowing(null)} update={update} />
    </div>
  );
}

function BorrowDialog({
  part,
  projects,
  onClose,
  update,
}: {
  part: Part | null;
  projects: Project[];
  onClose: () => void;
  update: (id: string, patch: Partial<Project>) => void;
}) {
  const targets = projects.filter((p) => part && p.id !== part.from.id && p.status !== "archived");
  const [target, setTarget] = useState("");
  const [done, setDone] = useState<Project | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setTarget("");
    setDone(null);
    setCopied(false);
  }, [part]);

  useEffect(() => {
    if (!part) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [part, onClose]);

  if (!part) return null;
  const already = (t: Project) => t.organs.some((o) => o.id === `${part.id}~${t.id}`);

  const borrow = async () => {
    const t = projects.find((p) => p.id === target);
    if (!t || already(t)) return;
    await useRitual.getState().cast("borrow", `${part.name} → ${t.name}`, 1900);
    update(t.id, {
      organs: [...t.organs, { id: `${part.id}~${t.id}`, name: part.name, kind: part.kind, note: `Borrowed from ${part.from.name}` }],
      timeline: [...t.timeline, { date: new Date().toISOString().slice(0, 10), kind: "afterlife", note: `Borrowed "${part.name}" from ${part.from.name}` }],
    });
    track("part_borrowed");
    setDone(t);
  };

  const copy = async () => {
    const text = `${part.name} (${part.kind}) from ${part.from.name}${part.from.repoUrl ? `: ${part.from.repoUrl}` : ""}${part.note ? `. ${part.note}` : ""}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[70] flex items-end justify-center p-3 sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <button className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" aria-label="Close" onClick={onClose} />
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="borrow-title"
          className="relative w-full max-w-md overflow-hidden rounded-xl border border-line bg-card shadow-2xl"
          initial={{ y: 40, scale: 0.96 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
        >
          <KindArt kind={part.kind} hot />
          <div className="p-5">
            {done ? (
              <div role="status">
                <h2 id="borrow-title" className="font-display text-xl font-semibold text-moss">
                  Part delivered
                </h2>
                <p className="mt-2 text-ink-2">
                  <strong className="text-ink">{part.name}</strong> now lives in <strong className="text-ink">{done.name}</strong>. It shows in that project&apos;s parts and timeline.
                </p>
                <div className="mt-5 flex gap-2">
                  <Link href={`/garden/${done.id}`} className="btn btn-primary" onClick={onClose}>
                    Open {done.name}
                  </Link>
                  <button className="btn btn-ghost" onClick={onClose}>
                    Keep browsing
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 id="borrow-title" className="font-display text-xl font-semibold">
                  Borrow {part.name}
                </h2>
                <p className="mt-1 text-sm text-ink-2">From {part.from.name}. Pick the project that should get it.</p>
                <label htmlFor="borrow-target" className="mt-4 block text-sm font-medium">
                  Send to
                </label>
                <select id="borrow-target" className="field mt-1.5" value={target} onChange={(e) => setTarget(e.target.value)}>
                  <option value="">Choose a project</option>
                  {targets.map((t) => (
                    <option key={t.id} value={t.id} disabled={already(t)}>
                      {t.name}
                      {already(t) ? " (already has it)" : ""}
                    </option>
                  ))}
                </select>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <button className="btn btn-primary" disabled={!target} onClick={borrow}>
                    Borrow into project
                  </button>
                  <button className="btn btn-ghost" onClick={copy}>
                    {copied ? "Reference copied" : "Copy reference"}
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
