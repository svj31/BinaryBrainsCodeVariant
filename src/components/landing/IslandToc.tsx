"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";

const SECTIONS = [
  { id: "problem", label: "The problem" },
  { id: "how", label: "How it works" },
  { id: "verdicts", label: "Five verdicts" },
  { id: "beyond", label: "Beyond the verdict" },
  { id: "who", label: "Who it is for" },
  { id: "begin", label: "Begin" },
];

/**
 * Dynamic scroll island: a floating pill under the header that names the
 * chapter you are reading, rings with page progress, and opens into a table
 * of contents on hover or tap.
 */
export function IslandToc() {
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const ring = useSpring(scrollYProgress, { stiffness: 120, damping: 26 });

  useEffect(() => {
    // a thin band across the upper middle of the screen decides the current chapter
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = SECTIONS.findIndex((s) => s.id === e.target.id);
          if (e.isIntersecting) setActive(i);
          else if (e.boundingClientRect.top > 0 && i === 0) setActive(-1);
        }
      },
      { rootMargin: "-40% 0px -59% 0px" },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {active >= 0 && (
        <motion.nav
          aria-label="On this page"
          className="fixed top-[76px] left-1/2 z-[45] -translate-x-1/2"
          initial={{ y: -40, opacity: 0, scale: 0.6, rotateX: 60 }}
          animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
          exit={{ y: -40, opacity: 0, scale: 0.6 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          style={{ transformPerspective: 600 }}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="overflow-hidden bg-[#0d1b26]/90 text-[#f4f1e6] shadow-[0_18px_50px_-18px_rgba(13,27,38,0.9)] ring-1 ring-white/10 backdrop-blur-xl"
            style={{ borderRadius: open ? 22 : 999 }}
          >
            <motion.button layout="position" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex items-center gap-3 py-2 pr-4 pl-2">
              <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
                <circle cx="13" cy="13" r="10" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" fill="none" />
                <motion.circle cx="13" cy="13" r="10" stroke="#f2b34a" strokeWidth="2.5" fill="none" strokeLinecap="round" pathLength={1} style={{ pathLength: ring }} transform="rotate(-90 13 13)" />
                <circle cx="13" cy="13" r="3" fill="#f9e7b0" />
              </svg>
              <AnimatePresence mode="wait">
                <motion.span
                  key={active}
                  className="text-sm font-semibold whitespace-nowrap"
                  initial={{ y: 14, opacity: 0, rotateX: -90 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  exit={{ y: -14, opacity: 0, rotateX: 90 }}
                  transition={{ duration: 0.3 }}
                >
                  {SECTIONS[active].label}
                </motion.span>
              </AnimatePresence>
              <span className="font-mono text-[11px] text-[#b9c2c9]">
                {active + 1}/{SECTIONS.length}
              </span>
            </motion.button>
            <AnimatePresence>
              {open && (
                <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-2 pb-2">
                  {SECTIONS.map((s, i) => (
                    <motion.li key={s.id} initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.04 }}>
                      <button
                        onClick={() => go(s.id)}
                        className={`flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-left text-sm transition-colors ${i === active ? "bg-white/10 text-dawn" : "text-[#c9cfd4] hover:bg-white/5"}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${i <= active ? "bg-dawn" : "bg-white/25"}`} />
                        {s.label}
                      </button>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
