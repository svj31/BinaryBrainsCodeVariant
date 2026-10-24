"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAssessed, useGraveyard } from "@/lib/store";
import { VERDICTS, VERDICT_ORDER } from "@/lib/verdicts";
import type { Verdict } from "@/lib/types";
import { track } from "@/lib/consent";
import { GraveLoader } from "@/components/ui/GraveLoader";
import { LedgerView, PlotsView, TimelineView } from "./Views";
import { QuickPanel } from "./QuickPanel";

const GardenScene = dynamic(() => import("@/components/three/GardenScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <GraveLoader label="Growing the garden" />
    </div>
  ),
});

const VIEWS = [
  { id: "garden", label: "Garden", hint: "3D map, glow shows potential" },
  { id: "plots", label: "Plots", hint: "One card per project" },
  { id: "ledger", label: "Ledger", hint: "Sortable table" },
  { id: "timeline", label: "Timeline", hint: "Lifespans side by side" },
] as const;
type ViewId = (typeof VIEWS)[number]["id"];

type Filter = "all" | Verdict | "high";

export function GardenApp() {
  const router = useRouter();
  const params = useSearchParams();
  const initialView = (VIEWS.find((v) => v.id === params.get("view"))?.id ?? "garden") as ViewId;
  const [view, setView] = useState<ViewId>(initialView);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const all = useAssessed();
  const hydrated = useGraveyard((s) => s.hydrated);
  const resetDemo = useGraveyard((s) => s.resetDemo);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(({ project: p, a }) => {
      if (filter === "high" && a.score < 60) return false;
      if (filter !== "all" && filter !== "high" && a.verdict !== filter) return false;
      if (!q) return true;
      return [p.name, p.pitch, p.epitaph, ...p.tags, ...p.stack].some((s) => s.toLowerCase().includes(q));
    });
  }, [all, query, filter]);

  // Keep a sensible selection: the most promising visible project.
  useEffect(() => {
    if (!items.length) return setSelectedId(null);
    if (!selectedId || !items.some((i) => i.project.id === selectedId)) {
      setSelectedId([...items].sort((a, b) => b.a.score - a.a.score)[0].project.id);
    }
  }, [items, selectedId]);

  const changeView = useCallback(
    (v: ViewId) => {
      setView(v);
      router.replace(`/garden?view=${v}`, { scroll: false });
      track("view_change", { view: v });
    },
    [router],
  );

  const select = useCallback((id: string) => {
    setSelectedId(id);
    if (window.matchMedia("(max-width: 1023px)").matches) setSheetOpen(true);
  }, []);

  const onTabKey = (e: React.KeyboardEvent, idx: number) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (idx + dir + VIEWS.length) % VIEWS.length;
    changeView(VIEWS[next].id);
    tabRefs.current[next]?.focus();
  };

  const selected = all.find((i) => i.project.id === selectedId) ?? null;
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: all.length, high: all.filter((x) => x.a.score >= 60).length };
    VERDICT_ORDER.forEach((v) => (c[v] = all.filter((x) => x.a.verdict === v).length));
    return c;
  }, [all]);

  const stones = useMemo(
    () => items.map(({ project: p, a }) => ({ id: p.id, name: p.name, score: a.score, verdict: a.verdict, status: p.status })),
    [items],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Your graveyard</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">The Garden</h1>
          <p className="mt-1 text-ink-2">
            {all.length} projects resting. {counts.revive} ready to revive.
          </p>
        </div>
        <div role="tablist" aria-label="Choose a view" className="flex rounded-lg border border-line bg-card p-1">
          {VIEWS.map((v, i) => (
            <button
              key={v.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              id={`tab-${v.id}`}
              aria-selected={view === v.id}
              aria-controls="garden-view"
              tabIndex={view === v.id ? 0 : -1}
              title={v.hint}
              onClick={() => changeView(v.id)}
              onKeyDown={(e) => onTabKey(e, i)}
              className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 ${
                view === v.id ? "text-white" : "text-ink-2 hover:text-ink"
              }`}
            >
              {view === v.id && (
                <motion.span
                  layoutId="view-tab"
                  className="absolute inset-0 rounded-md bg-moss"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <span className="relative">{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-80">
          <label htmlFor="garden-search" className="sr-only">
            Search projects
          </label>
          <svg className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-3" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" fill="none" />
            <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            id="garden-search"
            type="search"
            className="field !pl-9"
            placeholder="Search names, tags, stack"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0" role="group" aria-label="Filter by verdict">
          {(["all", "high", ...VERDICT_ORDER] as Filter[]).map((f) => {
            const active = filter === f;
            const label = f === "all" ? "All" : f === "high" ? "High potential" : VERDICTS[f].label;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={active}
                className={`shrink-0 rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  active ? "border-ink bg-ink text-paper" : "border-line bg-card text-ink-2 hover:border-ink-3"
                }`}
              >
                {label} <span className={`font-mono text-xs ${active ? "text-paper/75" : "text-ink-3"}`}>{counts[f]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div id="garden-view" role="tabpanel" aria-labelledby={`tab-${view}`} className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              {items.length === 0 ? (
                <EmptyState query={query} onClear={() => (setQuery(""), setFilter("all"))} />
              ) : view === "garden" ? (
                <div className="relative h-[460px] overflow-hidden rounded-xl border border-line bg-[#f3ede0] sm:h-[560px]">
                  <GardenScene stones={stones} selectedId={selectedId} onSelect={select} className="h-full w-full" />
                  <p className="pointer-events-none absolute bottom-3 left-3 rounded-[4px] bg-card/90 px-2 py-1 text-xs text-ink-2">
                    Drag to look around. Brighter glow means higher revival potential.
                  </p>
                </div>
              ) : view === "plots" ? (
                <PlotsView items={items} selectedId={selectedId} onSelect={select} />
              ) : view === "ledger" ? (
                <LedgerView items={items} selectedId={selectedId} onSelect={select} />
              ) : (
                <TimelineView items={items} selectedId={selectedId} onSelect={select} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <aside className="hidden lg:block" aria-label="Selected project">
          <div className="sticky top-24">
            <AnimatePresence mode="wait">{selected && <QuickPanel key={selected.project.id} item={selected} />}</AnimatePresence>
          </div>
        </aside>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-line px-4 py-3 text-sm text-ink-2">
        <p>
          {hydrated ? "Sample projects are loaded so you can explore. Your own burials are saved in this browser." : "Loading your garden."}
        </p>
        <button
          className="font-medium text-moss hover:underline"
          onClick={() => {
            if (confirm("Reset the garden to the sample projects? Projects you added will be removed.")) resetDemo();
          }}
        >
          Reset to sample data
        </button>
      </div>

      {/* Mobile bottom sheet */}
      <AnimatePresence>
        {sheetOpen && selected && (
          <motion.div className="fixed inset-0 z-[55] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="absolute inset-0 bg-ink/30" aria-label="Close details" onClick={() => setSheetOpen(false)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`${selected.project.name} details`}
              className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
            >
              <QuickPanel item={selected} onClose={() => setSheetOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-line bg-card px-6 py-16 text-center">
      <svg width="64" height="64" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M6 42.5h36" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round" />
        <path d="M12.5 42.5V21a11.5 11.5 0 0 1 23 0v21.5" stroke="var(--ink-3)" strokeWidth="2" strokeDasharray="3 3" />
      </svg>
      <h2 className="mt-4 font-display text-xl font-semibold">Nothing rests here</h2>
      <p className="mt-2 max-w-sm text-ink-2">
        {query ? `No project matches "${query}".` : "No project matches this filter."} Try another word or clear the filters.
      </p>
      <div className="mt-5 flex gap-3">
        <button className="btn btn-ghost" onClick={onClear}>
          Clear filters
        </button>
        <Link href="/bury" className="btn btn-primary">
          Bury a project
        </Link>
      </div>
    </div>
  );
}
