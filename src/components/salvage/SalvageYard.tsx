"use client";

import Link from "next/link";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGraveyard } from "@/lib/store";
import type { Organ, Project } from "@/lib/types";
import { useRitual } from "@/components/magic/Ritual";
import { track } from "@/lib/consent";
import { ActionZone, DragCard, useDnd } from "@/components/canvas/dnd";

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
        // a little spreadsheet: header row, rows of values, and a scan line reading through them
        <div className="relative w-44 overflow-hidden rounded-md border border-[#9cc7d6] bg-white/80 font-mono text-[8px] leading-none shadow-sm">
          <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-px px-1.5 py-1 text-white" style={{ background: m.ink }}>
            <span>name</span>
            <span>water</span>
            <span>light</span>
          </div>
          {[
            ["fern", "2/wk", "low"],
            ["basil", "daily", "high"],
            ["cactus", "1/mo", "high"],
            ["ivy", "1/wk", "mid"],
          ].map((r, i) => (
            <motion.div
              key={i}
              className="grid grid-cols-[1.4fr_1fr_1fr] gap-px border-t border-[#dcebf0] px-1.5 py-[3px] text-[#22617a]"
              initial={false}
              animate={{ opacity: hot ? [0.3, 1] : 1, x: hot ? [-6, 0] : 0 }}
              transition={{ duration: 0.35, delay: hot ? i * 0.09 : 0 }}
            >
              {r.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </motion.div>
          ))}
          <motion.span
            className="pointer-events-none absolute inset-x-0 h-3 bg-[#7cc3dc]/30"
            animate={{ top: ["18%", "92%"] }}
            transition={{ duration: hot ? 0.9 : 2.6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          />
          <span className="absolute right-1 bottom-0.5 text-[7px] text-[#22617a]/60">120 rows</span>
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
  const [delivered, setDelivered] = useState<{ part: string; name: string; id: string } | null>(null);
  const living = projects.filter((p) => p.status !== "archived");
  const carrying = useDnd((s) => s.drag?.kind === "part");
  // keep the aside's space while its zones float as a tray, so cards don't jump under the finger
  const asideRef = useRef<HTMLElement>(null);
  const [asideH, setAsideH] = useState<number>();
  useLayoutEffect(() => {
    if (!carrying) setAsideH(undefined);
  }, [carrying]);
  if (carrying && asideH === undefined && asideRef.current) setAsideH(asideRef.current.offsetHeight);

  const borrow = async (part: Part, t: Project) => {
    if (t.id === part.from.id) return useDnd.getState().say(`${part.name} already belongs to ${t.name}.`);
    if (t.organs.some((o) => o.id === `${part.id}~${t.id}`)) return useDnd.getState().say(`${t.name} already has ${part.name}.`);
    await useRitual.getState().cast("borrow", `${part.name} → ${t.name}`, 1900);
    update(t.id, {
      organs: [...t.organs, { id: `${part.id}~${t.id}`, name: part.name, kind: part.kind, note: `Borrowed from ${part.from.name}` }],
      timeline: [...t.timeline, { date: new Date().toISOString().slice(0, 10), kind: "afterlife", note: `Borrowed "${part.name}" from ${part.from.name}` }],
    });
    track("part_borrowed");
    setDelivered({ part: part.name, name: t.name, id: t.id });
  };

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

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_280px]">
      <aside ref={asideRef} style={{ minHeight: asideH }} className="order-first min-w-0 lg:order-last" aria-label="Borrow into a project">
        <div
          data-dnd-tray
          className={
            carrying
              ? "max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-[95] max-lg:rounded-t-2xl max-lg:border-t max-lg:border-line max-lg:bg-paper max-lg:p-4 max-lg:pb-[max(1rem,env(safe-area-inset-bottom))] max-lg:shadow-[0_-20px_40px_-20px_rgba(30,39,33,0.45)] lg:sticky lg:top-24"
              : "lg:sticky lg:top-24"
          }
        >
          <p className="eyebrow">Borrow into</p>
          <p className="mt-1 text-sm text-ink-2">
            <span className="lg:hidden">{carrying ? "Drop the part on a project below." : "Press and hold a part card, then drag it onto a project."}</span>
            <span className="max-lg:hidden">Drag a part card onto the project that should get it.</span>
          </p>
          <div className={`mt-3 gap-2 lg:flex lg:max-h-[70vh] lg:flex-col lg:overflow-y-auto lg:pb-0 ${carrying ? "grid max-h-[38vh] grid-cols-2 overflow-y-auto" : "flex overflow-x-auto pb-2"}`}>
            {living.map((t) => (
              <ActionZone
                key={t.id}
                id={`borrow-${t.id}`}
                label={t.name}
                accepts={["part"]}
                compact
                tone="var(--c-salvage)"
                className={carrying ? "min-w-0" : "min-w-[180px] lg:min-w-0"}
                onDrop={(c) => borrow(c.payload as Part, t)}
              >
                <span className="relative ml-auto font-mono text-[11px] text-ink-3">{t.organs.length}</span>
              </ActionZone>
            ))}
          </div>
        </div>
      </aside>
      <motion.ul className="grid min-w-0 content-start gap-4 self-start sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((o, i) => {
            const n = borrowCount(o.id);
            return (
              <motion.li
                key={o.id}
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.45, delay: Math.min(i * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={() => setHot(o.id)}
                onMouseLeave={() => setHot(null)}
              >
                <DragCard data={{ kind: "part", id: o.id, label: o.name, payload: o }} hint="Drag onto a project in Borrow into" className="h-full">
                <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-card transition-shadow hover:shadow-[0_22px_44px_-28px_rgba(30,39,33,0.55)]">
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
                    <span className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-ink-3"><span className="lg:hidden">hold &amp; drag</span><span className="max-lg:hidden">drag to borrow</span></span>
                  </div>
                </div>
                </div>
                </DragCard>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>
      </div>
      {shown.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-line p-10 text-center text-ink-2">
          No parts match. Open any project and save parts from its Salvage path.
        </div>
      )}

      <AnimatePresence>
        {delivered && (
          <motion.div
            role="status"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="fixed right-4 bottom-4 z-[80] max-w-sm rounded-xl border border-moss bg-card p-4 shadow-2xl"
          >
            <p className="font-display text-lg font-semibold text-moss">Part delivered</p>
            <p className="mt-1 text-sm text-ink-2">
              <strong className="text-ink">{delivered.part}</strong> now lives in <strong className="text-ink">{delivered.name}</strong>.
            </p>
            <Link href={`/garden/${delivered.id}`} className="mt-2 inline-block text-sm font-semibold text-moss underline underline-offset-2">
              Open {delivered.name}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
