"use client";

import { motion } from "framer-motion";

export function ScoreRing({
  score,
  size = 120,
  color = "var(--moss)",
  label = "Resurrection Score",
}: {
  score: number;
  size?: number;
  color?: string;
  label?: string;
}) {
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${score} out of 100`}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--stone-light)" strokeWidth="8" />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - score / 100) }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
        <span className="font-display font-semibold leading-none text-ink" style={{ fontSize: size * 0.3 }}>
          {score}
        </span>
        {size >= 100 && <span className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink-3">of 100</span>}
      </div>
    </div>
  );
}
