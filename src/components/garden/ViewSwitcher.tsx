"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export const VIEWS = [
  { id: "garden", label: "Garden", hint: "3D night garden" },
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
 * Collapsed, it is one control showing the current view. Click it and the
 * other layouts unfold beside it; pick one and it folds back.
 */
export function ViewSwitcher({ view, onChange }: { view: ViewId; onChange: (v: ViewId) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = VIEWS.find((v) => v.id === view)!;

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", away);
    window.addEventListener("keydown", esc);
    requestAnimationFrame(() => tabs.current[VIEWS.findIndex((v) => v.id === view)]?.focus());
    return () => {
      window.removeEventListener("pointerdown", away);
      window.removeEventListener("keydown", esc);
    };
  }, [open, view]);

  const pick = (v: ViewId) => {
    onChange(v);
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    tabs.current[(i + d + VIEWS.length) % VIEWS.length]?.focus();
  };

  return (
    <div ref={root} className="relative h-[46px]">
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
        className="flex h-[46px] items-center overflow-hidden rounded-[14px] border border-line bg-card p-1 shadow-[0_10px_30px_-18px_rgba(30,39,33,0.45)]"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {open ? (
            <motion.div key="open" role="tablist" aria-label="Choose a layout" className="flex gap-1" layout>
              {VIEWS.map((v, i) => {
                const active = v.id === view;
                return (
                  <motion.button
                    key={v.id}
                    ref={(el) => {
                      tabs.current[i] = el;
                    }}
                    role="tab"
                    id={`tab-${v.id}`}
                    aria-selected={active}
                    aria-controls="garden-view"
                    title={v.hint}
                    onClick={() => pick(v.id)}
                    onKeyDown={(e) => onKey(e, i)}
                    initial={{ opacity: 0, x: -12, filter: "blur(4px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.28, delay: i * 0.045, ease: [0.16, 1, 0.3, 1] }}
                    whileTap={{ scale: 0.94 }}
                    className={`relative flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-sm font-medium ${
                      active ? "text-white" : "text-ink-2 hover:bg-paper hover:text-ink"
                    }`}
                  >
                    {active && <motion.span layoutId="view-chip" className="absolute inset-0 rounded-[10px] bg-moss" />}
                    <span className="relative flex items-center gap-1.5">
                      <Icon id={v.id} />
                      <span className={active ? "" : "hidden sm:inline"}>{v.label}</span>
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          ) : (
            <motion.button
              key="closed"
              layout
              aria-haspopup="true"
              aria-expanded={false}
              aria-label={`Layout: ${current.label}. Change layout`}
              onClick={() => setOpen(true)}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.22 }}
              className="relative flex h-9 items-center gap-2 rounded-[10px] px-3 text-sm font-semibold text-ink hover:bg-paper"
            >
              <motion.span layoutId="view-chip" className="absolute inset-0 rounded-[10px] bg-moss-soft" />
              <span className="relative flex items-center gap-2 text-moss">
                <Icon id={view} />
                {current.label}
              </span>
              <svg className="relative text-ink-3" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <path d="M3.5 5.5L7 9l3.5-3.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
