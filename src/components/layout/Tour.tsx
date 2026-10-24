"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { create } from "zustand";
import { play } from "@/lib/sound";

interface Step {
  /** CSS selector of the element to spotlight; omitted = centred card */
  target?: string;
  title: string;
  body: string;
}

const TOURS: Record<string, Step[]> = {
  home: [
    {
      title: "Welcome to SecondWind",
      body: "A calm place for projects you never finished. Describe one in about two minutes and you get a clear verdict: revive, pivot, salvage, merge or archive, with the reasons.",
    },
    { target: '[data-tour="bury"]', title: "Start here", body: "Bury a project: three short questions about what it was, what is done and why it stopped." },
    { target: '[data-tour="nav-garden"]', title: "Explore the Garden", body: "Every project you bury becomes a stone in a 3D garden. Sample projects are already there to try." },
    { target: '[data-tour="spellbook"]', title: "Jump anywhere", body: "Open the Spellbook (⌘K or Ctrl+K) to go to any page or switch day and night." },
    { target: '[data-tour="prefs"]', title: "Sound and night mode", body: "Each kind of action has its own soft sound. Mute it here, or switch the whole site to night." },
    {
      title: "Actions are drag and drop",
      body: "There are no submit buttons. To act, drag a card onto a glowing zone. On a keyboard: focus the card, press Space, Tab to a zone, press Enter.",
    },
  ],
  garden: [
    { target: '[data-tour="scene"]', title: "Your garden", body: "You pilot a small ship through your graveyard. Each stone is a project, coloured by its verdict. Use ◀ ▶ to autopilot between them, or set the throttle and point where you want to go." },
    { target: '[data-tour="toolbar"]', title: "Find a project", body: "Switch between the 3D Garden, Plots, Ledger and Timeline, or search and filter by verdict." },
    { target: '[data-tour="dock"]', title: "Act on it", body: "Drag the selected card onto Open verdict, Nudge me in 2 weeks, or Compost. Destructive actions ask you to slide to confirm." },
  ],
};

const tourFor = (path: string) => (path === "/" ? "home" : path === "/garden" ? "garden" : null);
const seenKey = (id: string) => `sw-tour-${id}`;

export const useTour = create<{ id: string | null; step: number; start: (id: string) => void; stop: () => void; go: (n: number) => void }>((set) => ({
  id: null,
  step: 0,
  start: (id) => set({ id, step: 0 }),
  stop: () => set({ id: null }),
  go: (step) => set({ step }),
}));

/** Replays the tour for this page (or the home tour on pages without one). */
export function startTourHere() {
  const id = tourFor(location.pathname) ?? "home";
  if (id === "home" && location.pathname !== "/") {
    location.href = "/?tour=1";
    return;
  }
  useTour.getState().start(id);
}

export function TourButton() {
  return (
    <button
      onClick={startTourHere}
      aria-label="Show the guided tour"
      title="Guided tour"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card/70 text-sm font-semibold text-ink-2 transition-colors hover:border-dawn hover:text-ink"
    >
      ?
    </button>
  );
}

type Box = { x: number; y: number; w: number; h: number } | null;

export function Tour() {
  const path = usePathname();
  const { id, step, stop, go } = useTour();
  const [box, setBox] = useState<Box>(null);
  const steps = id ? TOURS[id] : null;
  const cur = steps?.[step];

  // first visit to a page with a tour: start after the boot curtain has lifted
  useEffect(() => {
    const t = tourFor(path);
    if (!t) return;
    let seen = false;
    try {
      seen = !!localStorage.getItem(seenKey(t));
    } catch {}
    const forced = new URLSearchParams(location.search).get("tour") === "1";
    if (seen && !forced) return;
    // on a fresh load the boot curtain plays for ~4.5s; on client navigation start sooner
    const wait = Math.max(900, 4800 - performance.now());
    const timer = setTimeout(() => useTour.getState().start(t), wait);
    return () => clearTimeout(timer);
  }, [path]);

  const finish = useCallback(() => {
    if (id)
      try {
        localStorage.setItem(seenKey(id), "1");
      } catch {}
    play("close");
    stop();
  }, [id, stop]);

  const measure = useCallback(() => {
    const el = cur?.target ? document.querySelector<HTMLElement>(cur.target) : null;
    const r = el?.getBoundingClientRect();
    setBox(r && r.width > 0 && r.height > 0 ? { x: r.left, y: r.top, w: r.width, h: r.height } : null);
  }, [cur]);

  useLayoutEffect(() => {
    if (!cur) return;
    const el = cur.target ? document.querySelector<HTMLElement>(cur.target) : null;
    if (el && el.getBoundingClientRect().width > 0) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      const t = setTimeout(measure, 450);
      measure();
      return () => clearTimeout(t);
    }
    setBox(null);
  }, [cur, measure]);

  useEffect(() => {
    if (!cur) return;
    addEventListener("resize", measure);
    addEventListener("scroll", measure, { passive: true });
    return () => (removeEventListener("resize", measure), removeEventListener("scroll", measure));
  }, [cur, measure]);

  const next = useCallback(() => {
    if (!steps) return;
    if (step >= steps.length - 1) return finish();
    play("step");
    go(step + 1);
  }, [steps, step, go, finish]);
  const back = useCallback(() => {
    if (step > 0) {
      play("step");
      go(step - 1);
    }
  }, [step, go]);

  useEffect(() => {
    if (!cur) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") back();
      else if (e.key === "Escape") finish();
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [cur, next, back, finish]);

  // stop when navigating away from the page the tour belongs to
  useEffect(() => {
    if (id && tourFor(path) !== id) stop();
  }, [path, id, stop]);

  if (!steps || !cur) return null;

  const pad = 8;
  const hole = box ? { x: box.x - pad, y: box.y - pad, w: box.w + pad * 2, h: box.h + pad * 2 } : null;
  // card goes below the spotlight when there is room, otherwise above; centred when there is no target
  const vw = typeof window !== "undefined" ? innerWidth : 1200;
  const vh = typeof window !== "undefined" ? innerHeight : 800;
  const cardW = Math.min(360, vw - 32);
  const below = hole ? hole.y + hole.h + 220 < vh : true;
  const cardStyle: React.CSSProperties = hole
    ? {
        left: Math.max(16, Math.min(vw - cardW - 16, hole.x + hole.w / 2 - cardW / 2)),
        top: below ? Math.min(vh - 230, hole.y + hole.h + 14) : undefined,
        bottom: below ? undefined : Math.max(16, vh - hole.y + 14),
        width: cardW,
      }
    : { left: (vw - cardW) / 2, top: vh / 2 - 130, width: cardW };

  return (
    <div className="fixed inset-0 z-[125]" role="dialog" aria-modal="true" aria-labelledby="tour-title" aria-describedby="tour-body">
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true" onClick={finish}>
        <defs>
          <mask id="tour-hole">
            <rect width="100%" height="100%" fill="white" />
            {hole && <motion.rect initial={false} animate={{ x: hole.x, y: hole.y, width: hole.w, height: hole.h }} transition={{ type: "spring", stiffness: 260, damping: 30 }} rx="14" fill="black" />}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(11,22,32,0.62)" mask="url(#tour-hole)" />
        {hole && (
          <motion.rect
            initial={false}
            animate={{ x: hole.x, y: hole.y, width: hole.w, height: hole.h }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            rx="14"
            fill="none"
            stroke="#f2b34a"
            strokeWidth="2"
          />
        )}
      </svg>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="absolute rounded-2xl border border-line bg-card p-5 text-ink shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]"
          style={cardStyle}
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] tracking-[0.14em] text-ink-3 uppercase">
              Step {step + 1} of {steps.length}
            </span>
            <button onClick={finish} data-sound="off" className="text-sm font-medium text-ink-3 underline-offset-4 hover:text-ink hover:underline">
              Skip tour
            </button>
          </div>
          <h2 id="tour-title" className="mt-2 font-display text-xl font-semibold">
            {cur.title}
          </h2>
          <p id="tour-body" className="mt-1.5 text-sm leading-relaxed text-ink-2">
            {cur.body}
          </p>
          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="flex gap-1.5" aria-hidden="true">
              {steps.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-5 bg-moss" : i < step ? "w-1.5 bg-moss/50" : "w-1.5 bg-line"}`} />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={back} disabled={step === 0} data-sound="off" className="btn btn-ghost !px-3 !py-2 text-sm">
                Back
              </button>
              <button onClick={next} data-sound="off" autoFocus className="btn btn-primary !px-4 !py-2 text-sm">
                {step === steps.length - 1 ? "Got it" : "Next"}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
