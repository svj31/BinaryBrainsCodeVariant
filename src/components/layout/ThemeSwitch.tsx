"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { create } from "zustand";

type Theme = "day" | "night";

export const useTheme = create<{ theme: Theme; set: (t: Theme, at?: { x: number; y: number }) => void }>((set) => ({
  theme: "day",
  set: (theme, at) => {
    const root = document.documentElement;
    const apply = () => {
      root.dataset.theme = theme;
      try {
        localStorage.setItem("sw-theme", theme);
      } catch {}
      set({ theme });
    };
    // moonrise wipe: the new theme spreads in a circle from where you clicked
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    if (doc.startViewTransition && at && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const r = Math.hypot(Math.max(at.x, innerWidth - at.x), Math.max(at.y, innerHeight - at.y));
      doc.startViewTransition(apply).ready.then(() => {
        root.animate({ clipPath: [`circle(0px at ${at.x}px ${at.y}px)`, `circle(${r}px at ${at.x}px ${at.y}px)`] }, { duration: 750, easing: "cubic-bezier(.65,0,.35,1)", pseudoElement: "::view-transition-new(root)" });
      });
    } else {
      root.classList.add("sw-theme-shift");
      apply();
      setTimeout(() => root.classList.remove("sw-theme-shift"), 800);
    }
  },
}));

export const toggleTheme = (at?: { x: number; y: number }) => {
  const s = useTheme.getState();
  s.set(s.theme === "day" ? "night" : "day", at);
};

/** Sun that sets into a crescent moon. */
export function ThemeSwitch() {
  const theme = useTheme((s) => s.theme);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = document.documentElement.dataset.theme === "night" ? "night" : "day";
    useTheme.setState({ theme: t });
    setReady(true);
  }, []);
  const night = theme === "night";
  return (
    <button
      onClick={(e) => toggleTheme({ x: e.clientX, y: e.clientY })}
      aria-label={night ? "Switch to day" : "Switch to night"}
      aria-pressed={night}
      className="relative flex h-9 w-16 items-center rounded-full border border-line bg-paper-2 p-1"
      style={{ opacity: ready ? 1 : 0 }}
    >
      <motion.span
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
        animate={{ background: night ? "linear-gradient(135deg,#0d1b26,#1b3140)" : "linear-gradient(135deg,#fbebcb,#e1ebe2)" }}
        transition={{ duration: 0.6 }}
        aria-hidden="true"
      >
        {[0, 1, 2].map((i) => (
          <motion.i key={i} className="absolute h-[2px] w-[2px] rounded-full bg-white" style={{ left: 10 + i * 9, top: 8 + (i % 2) * 12 }} animate={{ opacity: night ? [0.3, 1, 0.3] : 0 }} transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.3 }} />
        ))}
      </motion.span>
      <motion.span
        layout
        className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-md"
        animate={{ x: night ? 28 : 0, rotate: night ? 320 : 0, background: night ? "#f9e7b0" : "#f2b34a" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        aria-hidden="true"
      >
        <motion.span className="absolute h-6 w-6 rounded-full" animate={{ x: night ? 6 : 18, y: night ? -4 : -14, background: night ? "#1b3140" : "rgba(0,0,0,0)" }} transition={{ type: "spring", stiffness: 260, damping: 22 }} />
      </motion.span>
    </button>
  );
}
