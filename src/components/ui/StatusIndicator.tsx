"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const PHASES = ["Garden awake", "Keeper on watch", "Fireflies out", "Soil is warm"];

/** A pulsing status lamp whose message slowly cycles, so even the footer breathes. */
export function StatusIndicator({ tone = "#6dbf86", className = "" }: { tone?: string; className?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % PHASES.length), 3200);
    return () => clearInterval(t);
  }, []);
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border border-line bg-card/70 px-3 py-1 text-xs font-medium text-ink-2 ${className}`} role="status">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inset-0 animate-ping rounded-full opacity-60" style={{ background: tone }} />
        <span className="relative h-2.5 w-2.5 rounded-full" style={{ background: tone, boxShadow: `0 0 8px ${tone}` }} />
      </span>
      <span className="relative h-4 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span key={i} className="block" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.3 }}>
            {PHASES[i]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
