"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";

/**
 * A transformation spell for switching layouts: fireflies spiral in, a rune
 * sigil flares, and the new view's name appears. No figure, just the magic.
 */
export function ViewSpell({ spell }: { spell: { key: number; to: string } | null }) {
  const motes = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * Math.PI * 2;
        const r = 160 + (i % 4) * 40;
        return { x: Math.cos(a) * r, y: Math.sin(a) * r, d: (i % 6) * 0.04 };
      }),
    [],
  );
  return (
    <AnimatePresence>
      {spell && (
        <motion.div
          key={spell.key}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-hidden rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
        >
          <motion.div
            className="absolute inset-0 bg-[#0d1b26]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.55, 0.35] }}
            transition={{ duration: 0.6 }}
          />
          {motes.map((m, i) => (
            <motion.span
              key={i}
              className="absolute h-2 w-2 rounded-full bg-[#ffd27a]"
              style={{ boxShadow: "0 0 12px 3px rgba(255,210,122,0.8)" }}
              initial={{ x: m.x, y: m.y, opacity: 0, scale: 0.6 }}
              animate={{ x: [m.x, m.x * 0.4, 0], y: [m.y, m.y * 0.4 - 20, 0], opacity: [0, 1, 0], scale: [0.6, 1.2, 0.2] }}
              transition={{ duration: 0.75, delay: m.d, ease: "easeIn" }}
            />
          ))}
          <motion.svg viewBox="-60 -60 120 120" className="absolute h-56 w-56" initial={{ rotate: -90, scale: 0.3, opacity: 0 }} animate={{ rotate: 90, scale: [0.3, 1.1, 1.4], opacity: [0, 1, 0] }} transition={{ duration: 1, delay: 0.25 }}>
            <circle r="50" fill="none" stroke="#f2b34a" strokeWidth="1.5" strokeDasharray="4 6" />
            <circle r="38" fill="none" stroke="#ffd27a" strokeWidth="1" />
            {Array.from({ length: 6 }, (_, i) => (
              <path key={i} d="M0 -38 L5 -50 L-5 -50 Z" fill="#f2b34a" transform={`rotate(${i * 60})`} />
            ))}
            <path d="M0 -24 L21 12 L-21 12 Z M0 24 L-21 -12 L21 -12 Z" fill="none" stroke="#ffd27a" strokeWidth="1.2" />
          </motion.svg>
          <motion.span
            className="absolute h-28 w-28 rounded-full bg-[#ffd27a] blur-2xl"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.6, 2.4], opacity: [0, 0.8, 0] }}
            transition={{ duration: 0.9, delay: 0.55 }}
          />
          <motion.p
            className="relative font-display text-2xl font-semibold text-[#f4f1e6] sm:text-3xl"
            initial={{ opacity: 0, letterSpacing: "0.4em", filter: "blur(6px)" }}
            animate={{ opacity: [0, 1, 0], letterSpacing: ["0.4em", "0.02em", "0.02em"], filter: ["blur(6px)", "blur(0px)", "blur(4px)"] }}
            transition={{ duration: 1.2, delay: 0.35, times: [0, 0.5, 1] }}
          >
            {spell.to}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
