"use client";

import { motion } from "framer-motion";
import type { ScoreFactor } from "@/lib/types";

export function FactorBars({ factors, compact = false }: { factors: ScoreFactor[]; compact?: boolean }) {
  return (
    <dl className={compact ? "space-y-2" : "space-y-3"}>
      {factors.map((f, i) => {
        const pct = Math.round(f.value * 100);
        return (
          <div key={f.key} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1">
            <dt className="text-sm text-ink-2">
              {f.label}
              {!compact && <span className="ml-1.5 font-mono text-[11px] text-ink-3">x{f.weight.toFixed(2)}</span>}
            </dt>
            <dd className="font-mono text-xs text-ink-2">{pct}</dd>
            <div className="col-span-2 h-1.5 overflow-hidden rounded-[2px] bg-stone-light" aria-hidden="true">
              <motion.div
                className="h-full rounded-[2px]"
                style={{ background: pct >= 60 ? "var(--moss)" : pct >= 35 ? "var(--dawn)" : "var(--clay)" }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        );
      })}
    </dl>
  );
}
