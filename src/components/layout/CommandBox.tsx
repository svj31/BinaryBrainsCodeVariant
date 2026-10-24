"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { create } from "zustand";
import { toggleTheme } from "./ThemeSwitch";
import { play } from "@/lib/sound";
import { startTourHere } from "./Tour";

export const useCommand = create<{ open: boolean; setOpen: (o: boolean) => void }>((set) => ({ open: false, setOpen: (open) => set({ open }) }));

interface Spell {
  id: string;
  label: string;
  hint: string;
  group: string;
  run: (r: ReturnType<typeof useRouter>) => void;
}

const SPELLS: Spell[] = [
  { id: "garden", label: "Fly into the space garden", hint: "/garden", group: "Travel", run: (r) => r.push("/garden") },
  { id: "plots", label: "Walk the plots", hint: "/garden?view=plots", group: "Travel", run: (r) => r.push("/garden?view=plots") },
  { id: "ledger", label: "Open the ledger", hint: "/garden?view=ledger", group: "Travel", run: (r) => r.push("/garden?view=ledger") },
  { id: "bury", label: "Bury a project", hint: "/bury", group: "Rituals", run: (r) => r.push("/bury") },
  { id: "sample", label: "Bury a sample project", hint: "/bury?sample=1", group: "Rituals", run: (r) => r.push("/bury?sample=1") },
  { id: "salvage", label: "Search the salvage yard", hint: "/salvage", group: "Travel", run: (r) => r.push("/salvage") },
  { id: "insights", label: "Read the death report", hint: "/insights", group: "Travel", run: (r) => r.push("/insights") },
  { id: "home", label: "Return to the gate", hint: "/", group: "Travel", run: (r) => r.push("/") },
  { id: "verdicts", label: "Learn the five verdicts", hint: "/#verdicts", group: "Travel", run: (r) => r.push("/#verdicts") },
  { id: "contact", label: "Send a raven", hint: "/contact", group: "Travel", run: (r) => r.push("/contact") },
  { id: "theme", label: "Turn day into night", hint: "theme", group: "Magic", run: () => toggleTheme({ x: innerWidth / 2, y: innerHeight / 2 }) },
  { id: "tour", label: "Show the guided tour", hint: "help", group: "Magic", run: () => startTourHere() },
  { id: "top", label: "Float to the top", hint: "scroll", group: "Magic", run: () => scrollTo({ top: 0, behavior: "smooth" }) },
];

/** The keeper's spellbook: ⌘K / Ctrl+K opens a command box for travel and magic. */
export function CommandBox() {
  const router = useRouter();
  const open = useCommand((s) => s.open);
  const setOpen = useCommand((s) => s.setOpen);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!useCommand.getState().open);
      } else if (e.key === "Escape") setOpen(false);
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [setOpen]);

  useEffect(() => {
    if (open) {
      play("open");
      setQ("");
      setIdx(0);
      setTimeout(() => input.current?.focus(), 40);
    }
  }, [open]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? SPELLS.filter((s) => (s.label + s.hint + s.group).toLowerCase().includes(t)) : SPELLS;
  }, [q]);

  const cast = (s: Spell) => {
    setOpen(false);
    s.run(router);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[115] flex items-start justify-center bg-[#0b1620]/55 px-4 pt-[14vh] backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Spellbook"
            onClick={(e) => e.stopPropagation()}
            className="sw-glass w-full max-w-lg overflow-hidden rounded-2xl text-[#f4f1e6]"
            initial={{ y: -30, scale: 0.9, rotateX: 30, opacity: 0 }}
            animate={{ y: 0, scale: 1, rotateX: 0, opacity: 1 }}
            exit={{ y: -20, scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            style={{ transformPerspective: 900, background: "linear-gradient(160deg, rgba(27,49,64,0.92), rgba(13,27,38,0.94))" }}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4">
              <motion.svg width="18" height="18" viewBox="0 0 22 22" animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} aria-hidden="true">
                <path d="M11 2l2.2 6.3L20 9l-5.2 4.1L16.6 20 11 16.2 5.4 20l1.8-6.9L2 9l6.8-.7z" fill="#f2b34a" />
              </motion.svg>
              <input
                ref={input}
                value={q}
                onChange={(e) => (setQ(e.target.value), setIdx(0))}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setIdx((i) => Math.min(list.length - 1, i + 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setIdx((i) => Math.max(0, i - 1));
                  } else if (e.key === "Enter" && list[idx]) cast(list[idx]);
                }}
                placeholder="Whisper a spell… (travel, rituals, magic)"
                aria-label="Search spells"
                className="h-14 flex-1 bg-transparent text-base focus-visible:!outline-none text-[#f4f1e6] outline-none placeholder:text-[#8a96a0]"
              />
              <kbd className="rounded border border-white/15 px-1.5 py-0.5 font-mono text-[10px] text-[#b9c2c9]">ESC</kbd>
            </div>
            <ul className="max-h-[50vh] overflow-y-auto p-2" role="listbox">
              {list.length === 0 && <li className="px-3 py-6 text-center text-sm text-[#b9c2c9]">No spell by that name.</li>}
              {list.map((s, i) => (
                <motion.li key={s.id} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.025 }} role="option" aria-selected={i === idx}>
                  <button onMouseEnter={() => setIdx(i)} onClick={() => cast(s)} className="relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left">
                    {i === idx && <motion.span layoutId="spell-hl" className="absolute inset-0 rounded-xl bg-white/10 ring-1 ring-[#f2b34a]/50" transition={{ type: "spring", stiffness: 500, damping: 36 }} />}
                    <span className="relative font-mono text-[10px] tracking-[0.14em] text-[#f2b34a] uppercase">{s.group}</span>
                    <span className="relative flex-1 text-sm font-medium">{s.label}</span>
                    <span className="relative font-mono text-[11px] text-[#8a96a0]">{s.hint}</span>
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Small chip that opens the spellbook. */
export function CommandChip() {
  const setOpen = useCommand((s) => s.setOpen);
  return (
    <button onClick={() => setOpen(true)} data-tour="spellbook" className="hidden items-center gap-2 rounded-full border border-line bg-card/70 px-3 py-1.5 text-xs text-ink-2 transition-colors hover:border-dawn lg:inline-flex" aria-label="Open spellbook">
      <motion.svg width="12" height="12" viewBox="0 0 22 22" animate={{ rotate: [0, 20, -20, 0] }} transition={{ duration: 3, repeat: Infinity }} aria-hidden="true">
        <path d="M11 2l2.2 6.3L20 9l-5.2 4.1L16.6 20 11 16.2 5.4 20l1.8-6.9L2 9l6.8-.7z" fill="var(--dawn)" />
      </motion.svg>
      Spellbook <kbd className="font-mono text-[10px] text-ink-3">⌘K</kbd>
    </button>
  );
}
