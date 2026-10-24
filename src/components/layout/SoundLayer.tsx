"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { loadSoundPref, play, useSound } from "@/lib/sound";

/** Listens once for every click on the page and gives each kind of control its own sound. */
export function SoundLayer() {
  useEffect(() => {
    loadSoundPref();
    const click = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("a, button, [role=tab], [role=option], summary, input[type=checkbox], input[type=radio], select");
      if (!el || el.dataset.sound === "off") return;
      if (el.dataset.sound) return play(el.dataset.sound as never);
      const role = el.getAttribute("role");
      if (role === "tab") play("tab");
      else if (el.hasAttribute("aria-pressed") || el.matches("input[type=checkbox], input[type=radio]")) play("toggle");
      else if (el.hasAttribute("aria-expanded")) play(el.getAttribute("aria-expanded") === "true" ? "close" : "open");
      else if (el.tagName === "A" && (el as HTMLAnchorElement).origin === location.origin) play("nav");
      else play("tick");
    };
    document.addEventListener("click", click, true);
    return () => document.removeEventListener("click", click, true);
  }, []);
  return null;
}

/** Speaker toggle for the header. */
export function SoundToggle() {
  const on = useSound((s) => s.on);
  const toggle = useSound((s) => s.toggle);
  return (
    <button
      onClick={toggle}
      data-sound="off"
      aria-label={on ? "Mute sounds" : "Turn sounds on"}
      title={on ? "Sounds on" : "Sounds off"}
      data-tour="sound"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card/70 text-ink-2 transition-colors hover:border-dawn hover:text-ink"
    >
      <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 8h3l4-3v10l-4-3H3z" fill="currentColor" fillOpacity="0.15" />
        {on ? (
          <>
            <motion.path d="M13 7.5a3.5 3.5 0 0 1 0 5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
            <motion.path d="M15.5 5a7 7 0 0 1 0 10" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.1 }} />
          </>
        ) : (
          <path d="M13 8l4 4M17 8l-4 4" />
        )}
      </svg>
    </button>
  );
}
