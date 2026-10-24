"use client";

import { create } from "zustand";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo } from "react";

export type RitualKind = "verdict" | "revive" | "pivot" | "salvage" | "merge" | "archive" | "borrow" | "reset";

const SPELLS: Record<RitualKind, { title: string; line: string; color: string }> = {
  verdict: { title: "Reading the stone", line: "The keeper weighs six signals in the moonlight", color: "#f2b34a" },
  revive: { title: "Breathing life back in", line: "A second wind stirs the soil", color: "#6dbf86" },
  pivot: { title: "Turning the compass", line: "Same roots, new direction", color: "#f2b34a" },
  salvage: { title: "Extracting the good parts", line: "Lifting what still works out of the ground", color: "#7cc3dc" },
  merge: { title: "Stitching two halves", line: "Two stalled projects, one heartbeat", color: "#e89a6b" },
  archive: { title: "Laying it to rest", line: "Carving the epitaph, closing the folder", color: "#c9c4b8" },
  borrow: { title: "Summoning the part", line: "Carrying it across the garden", color: "#7cc3dc" },
  reset: { title: "Replanting the garden", line: "Every stone back where it began", color: "#6dbf86" },
};

interface RitualState {
  kind: RitualKind | null;
  subject?: string;
  cast: (kind: RitualKind, subject?: string, ms?: number) => Promise<void>;
}

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Call `await cast("revive", name)` and the keeper performs the spell before the change lands. */
export const useRitual = create<RitualState>((set) => ({
  kind: null,
  cast: (kind, subject, ms = 2100) =>
    new Promise((resolve) => {
      set({ kind, subject });
      setTimeout(() => {
        resolve();
        set({ kind: null });
      }, reduced() ? 300 : ms);
    }),
}));

function Keeper({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 220" className="h-full w-full" aria-hidden="true">
      {/* rune circle */}
      <motion.ellipse
        cx="100"
        cy="190"
        rx="78"
        ry="16"
        fill="none"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeDasharray="6 5"
        animate={{ strokeDashoffset: [0, -44] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
      />
      <motion.ellipse cx="100" cy="190" rx="60" ry="11" fill={color} animate={{ opacity: [0.15, 0.4, 0.15] }} transition={{ duration: 1.4, repeat: Infinity }} />
      {/* cloak */}
      <motion.g animate={{ y: [0, -4, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}>
        <path d="M100 52c-20 0-30 24-34 52l-12 82h92l-12-82c-4-28-14-52-34-52z" fill="#1b2a35" stroke="#2c4252" strokeWidth="2" />
        <path d="M100 52c-14 0-22 12-22 28 0 10 10 16 22 16s22-6 22-16c0-16-8-28-22-28z" fill="#0d1820" />
        {/* hood tip */}
        <path d="M100 52c4-14 14-22 26-24-6 8-10 16-12 26" fill="#1b2a35" stroke="#2c4252" strokeWidth="2" />
        {/* eyes */}
        <motion.g animate={{ opacity: [1, 1, 0.1, 1] }} transition={{ duration: 3, repeat: Infinity, times: [0, 0.9, 0.95, 1] }}>
          <circle cx="93" cy="80" r="2.4" fill={color} />
          <circle cx="107" cy="80" r="2.4" fill={color} />
        </motion.g>
        {/* staff arm */}
        <motion.g style={{ originX: "128px", originY: "120px" }} animate={{ rotate: [0, -14, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
          <path d="M120 112l22-6" stroke="#2c4252" strokeWidth="9" strokeLinecap="round" />
          <path d="M144 40v150" stroke="#8a6f4e" strokeWidth="4" strokeLinecap="round" />
          <motion.circle cx="144" cy="36" r="9" fill={color} animate={{ r: [8, 11, 8], opacity: [0.8, 1, 0.8] }} transition={{ duration: 0.9, repeat: Infinity }} />
          <motion.circle cx="144" cy="36" r="22" fill={color} animate={{ opacity: [0.1, 0.35, 0.1], scale: [0.8, 1.3, 0.8] }} transition={{ duration: 0.9, repeat: Infinity }} style={{ originX: "144px", originY: "36px" }} />
        </motion.g>
      </motion.g>
    </svg>
  );
}

export function RitualOverlay() {
  const kind = useRitual((s) => s.kind);
  const subject = useRitual((s) => s.subject);
  const spell = kind ? SPELLS[kind] : null;
  const sparks = useMemo(
    () => Array.from({ length: 26 }, (_, i) => ({ x: Math.cos(i * 2.4) * (60 + (i % 5) * 22), y: -40 - (i % 7) * 26, d: (i % 9) * 0.12, s: 3 + (i % 3) * 2 })),
    [],
  );

  useEffect(() => {
    if (!kind) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [kind]);

  return (
    <AnimatePresence>
      {spell && (
        <motion.div
          role="status"
          aria-live="assertive"
          aria-label={`${spell.title}${subject ? `: ${subject}` : ""}`}
          className="fixed inset-0 z-[95] flex flex-col items-center justify-center bg-[#0b1620]/85 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
        >
          <div className="relative h-60 w-56">
            <Keeper color={spell.color} />
            {sparks.map((p, i) => (
              <motion.span
                key={i}
                className="absolute left-[72%] top-[16%] rounded-full"
                style={{ width: p.s, height: p.s, background: spell.color, boxShadow: `0 0 10px 2px ${spell.color}` }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{ x: p.x, y: [0, p.y, p.y + 140], opacity: [0, 1, 0], scale: [0, 1, 0.4] }}
                transition={{ duration: 1.6, delay: p.d, repeat: Infinity, ease: "easeOut" }}
              />
            ))}
          </div>
          <motion.p
            className="mt-4 font-display text-2xl font-semibold text-[#f4f1e6] sm:text-3xl"
            initial={{ y: 10, opacity: 0, letterSpacing: "0.2em" }}
            animate={{ y: 0, opacity: 1, letterSpacing: "0em" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {spell.title}
          </motion.p>
          {subject && <p className="mt-1 font-display text-lg italic" style={{ color: spell.color }}>{subject}</p>}
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-[#b9c2c9]">{spell.line}</p>
          <div className="mt-5 h-[2px] w-48 overflow-hidden rounded bg-white/10">
            <motion.div className="h-full" style={{ background: spell.color, boxShadow: `0 0 12px ${spell.color}` }} initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2, ease: "easeInOut" }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
