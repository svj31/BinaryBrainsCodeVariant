"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

export const VIEWS = [
  { id: "garden", label: "Garden", hint: "Fly through a 3D space garden" },
  { id: "plots", label: "Plots", hint: "One card per project" },
  { id: "ledger", label: "Ledger", hint: "Sortable table" },
  { id: "timeline", label: "Timeline", hint: "Lifespans side by side" },
] as const;
export type ViewId = (typeof VIEWS)[number]["id"];

function Icon({ id }: { id: ViewId }) {
  const p = { stroke: "currentColor", strokeWidth: 1.7, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      {id === "garden" && (
        <>
          <path d="M4 14V7.5a4 4 0 0 1 8 0V14" {...p} />
          <path d="M2 14h12M8 12V9.5" {...p} />
        </>
      )}
      {id === "plots" && (
        <>
          <rect x="2" y="2" width="5" height="5" rx="1" {...p} />
          <rect x="9" y="2" width="5" height="5" rx="1" {...p} />
          <rect x="2" y="9" width="5" height="5" rx="1" {...p} />
          <rect x="9" y="9" width="5" height="5" rx="1" {...p} />
        </>
      )}
      {id === "ledger" && <path d="M2 4h12M2 8h12M2 12h12M5.5 2.5v11" {...p} />}
      {id === "timeline" && <path d="M2 4h7M5 8h8M3 12h6" {...p} />}
    </svg>
  );
}

/**
 * Segmented control: all four layouts are always visible, the current one
 * sits on a sliding moss chip. Arrow keys move between them.
 */
export function ViewSwitcher({ view, onChange }: { view: ViewId; onChange: (v: ViewId) => void }) {
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + VIEWS.length) % VIEWS.length;
    tabs.current[n]?.focus();
    onChange(VIEWS[n].id);
  };

  return (
    <div role="tablist" aria-label="Choose a layout" data-tour="views" className="inline-flex rounded-xl border border-line bg-card p-1 shadow-[0_8px_24px_-18px_rgba(30,39,33,0.45)]">
      {VIEWS.map((v, i) => {
        const active = v.id === view;
        return (
          <button
            key={v.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            role="tab"
            id={`tab-${v.id}`}
            aria-selected={active}
            aria-controls="garden-view"
            tabIndex={active ? 0 : -1}
            aria-label={v.label}
            title={v.hint}
            onClick={() => onChange(v.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={`relative flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors ${active ? "text-[var(--on-fill)]" : "text-ink-2 hover:text-ink"}`}
          >
            {active && <motion.span layoutId="view-chip" className="absolute inset-0 rounded-lg bg-moss" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className="relative flex items-center gap-1.5">
              <Icon id={v.id} />
              <span className={active ? "" : "hidden sm:inline"}>{v.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
