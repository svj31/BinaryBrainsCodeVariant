"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SpellLoader, spellFor, type SpellVariant } from "@/components/ui/SpellLoader";

/** Fades the server-rendered boot screen once the app is interactive. */
export function BootDone() {
  useEffect(() => {
    const el = document.getElementById("sw-boot");
    if (!el) return;
    // React owns this node, so hide it with CSS instead of removing it.
    const t = setTimeout(() => el.classList.add("sw-boot-done"), 450);
    // once the opening has played, take it out of rendering entirely so its layers cost nothing
    const gone = setTimeout(() => (el.style.display = "none"), el.classList.contains("sw-boot-quick") ? 450 : 5600);
    return () => (clearTimeout(t), clearTimeout(gone));
  }, []);
  return null;
}

/**
 * Page-change loader: a dawn-coloured bar with a sprout tip grows across the
 * top on every internal navigation; if the page is slow, mist and the
 * sprouting headstone appear until it lands.
 */
export function RouteProgress() {
  const path = usePathname();
  const [active, setActive] = useState(false);
  const [slow, setSlow] = useState(false);
  const [variant, setVariant] = useState<SpellVariant>("portal");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const click = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement).closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
      setVariant(spellFor(url.pathname));
      setActive(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setSlow(true), 120);
    };
    document.addEventListener("click", click, true);
    return () => document.removeEventListener("click", click, true);
  }, []);

  useEffect(() => {
    clearTimeout(timer.current);
    // hold the spell a beat so each route's loader is actually seen
    const s = setTimeout(() => setSlow(false), 700);
    const t = setTimeout(() => setActive(false), 250);
    return () => (clearTimeout(t), clearTimeout(s));
  }, [path]);

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed top-0 left-0 z-[110] h-[3px] bg-dawn shadow-[0_0_14px_rgba(242,179,74,0.8)]"
            initial={{ width: "0%", opacity: 1 }}
            animate={{ width: "85%" }}
            exit={{ width: "100%", opacity: 0, transition: { duration: 0.35 } }}
            transition={{ duration: 2.4, ease: [0.1, 0.8, 0.2, 1] }}
            aria-hidden="true"
          >
            <span className="absolute -top-[7px] -right-2 h-4 w-4">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 15V7M8 10C6.5 7 4 7 3 8c1 2.5 3 3 5 2zm0-2c1-3 4-3.5 5-2.6-.8 2.6-2.8 3.4-5 2.6z" fill="#2d5a43" />
              </svg>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {slow && (
          <motion.div
            className="fixed inset-0 z-[105] flex items-center justify-center bg-paper/80 backdrop-blur-md"
            initial={{ opacity: 0, clipPath: "circle(0% at 50% 50%)" }}
            animate={{ opacity: 1, clipPath: "circle(75% at 50% 50%)" }}
            exit={{ opacity: 0, clipPath: "circle(0% at 50% 50%)", transition: { duration: 0.45 } }}
          >
            <motion.div initial={{ scale: 0.6, rotateX: 40, opacity: 0 }} animate={{ scale: 1, rotateX: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 18 }} style={{ transformPerspective: 800 }}>
              <SpellLoader variant={variant} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
