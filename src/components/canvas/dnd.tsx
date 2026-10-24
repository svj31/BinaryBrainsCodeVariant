"use client";

/**
 * The Canvas Protocol: primary actions happen by dragging a data card into an
 * Action Zone. Pointer (mouse, pen, touch) and keyboard are both supported:
 * focus a card, press Space or Enter to lift it, Tab to a zone, Enter to drop,
 * Escape to put it back.
 */
import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState } from "react";
import { create } from "zustand";
import { AnimatePresence, motion } from "framer-motion";
import { play } from "@/lib/sound";

export interface CardData {
  kind: string;
  id: string;
  label: string;
  payload?: unknown;
}

interface Zone {
  id: string;
  label: string;
  accepts: string[];
  el: HTMLElement;
  onDrop: (d: CardData) => void | Promise<void>;
}

interface DndState {
  drag: CardData | null;
  mode: "pointer" | "keyboard" | null;
  over: string | null;
  announce: string;
  zones: Map<string, Zone>;
  start: (d: CardData, mode: "pointer" | "keyboard") => void;
  setOver: (id: string | null) => void;
  end: () => void;
  say: (s: string) => void;
}

export const useDnd = create<DndState>((set) => ({
  drag: null,
  mode: null,
  over: null,
  announce: "",
  zones: new Map(),
  start: (drag, mode) => set({ drag, mode, over: null, announce: `Picked up ${drag.label}. Move to an action zone and release${mode === "keyboard" ? " with Enter. Escape cancels" : ""}.` }),
  setOver: (over) => set({ over }),
  end: () => set({ drag: null, mode: null, over: null }),
  say: (announce) => set({ announce }),
}));

const accepts = (z: Zone, d: CardData | null) => !!d && z.accepts.includes(d.kind);

async function dropOn(zoneId: string | null) {
  const s = useDnd.getState();
  const d = s.drag;
  const z = zoneId ? s.zones.get(zoneId) : undefined;
  s.end();
  if (!d) return;
  if (z && accepts(z, d)) {
    play("drop");
    s.say(`Dropped ${d.label} on ${z.label}.`);
    z.el.dispatchEvent(new CustomEvent("sw-dropped"));
    await z.onDrop(d);
  } else {
    play("return");
    s.say(`${d.label} returned.`);
  }
}

/* ---------- Drag card ---------- */
export function DragCard({
  data,
  children,
  className = "",
  disabled = false,
  hint = "Drag into an action zone",
}: {
  data: CardData;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  hint?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useDnd((s) => s.drag);
  const mode = useDnd((s) => s.mode);
  const lifted = drag?.id === data.id && drag.kind === data.kind;
  const [ghost, setGhost] = useState<{ x: number; y: number; w: number; h: number; ox: number; oy: number; tilt: number; sx: number; sy: number } | null>(null);
  const over = useDnd((s) => s.over);
  const hintId = useId();

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled || e.button !== 0) return;
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const sx = e.clientX;
    const sy = e.clientY;
    let started = false;
    let lastX = sx;
    let py = sy;
    let raf = 0;
    // near the top or bottom edge, the page scrolls so far-away zones are reachable
    const edge = () => {
      const band = Math.min(110, innerHeight * 0.15);
      const v = py < band ? -(band - py) / 6 : py > innerHeight - band ? (py - (innerHeight - band)) / 6 : 0;
      if (v) {
        scrollBy(0, v);
        hitTest(lastX, py);
      }
      raf = requestAnimationFrame(edge);
    };
    const hitTest = (x: number, y: number) => {
      let over: string | null = null;
      for (const z of useDnd.getState().zones.values()) {
        const zr = z.el.getBoundingClientRect();
        if (x >= zr.left && x <= zr.right && y >= zr.top && y <= zr.bottom && accepts(z, data)) over = z.id;
      }
      if (useDnd.getState().over !== over) useDnd.getState().setOver(over);
    };
    let lastY = sy;
    let lastT = performance.now();
    let vx = 0;
    let vy = 0;

    const move = (ev: PointerEvent) => {
      if (!started) {
        if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 5) return;
        started = true;
        useDnd.getState().start(data, "pointer");
        raf = requestAnimationFrame(edge);
        play("pick");
        document.body.classList.add("sw-dragging");
      }
      ev.preventDefault();
      // jelly physics: the card stretches along its direction of travel and squashes across it
      const now = performance.now();
      const dt = Math.max(8, now - lastT);
      vx = vx * 0.6 + ((ev.clientX - lastX) / dt) * 0.4 * 16;
      vy = vy * 0.6 + ((ev.clientY - lastY) / dt) * 0.4 * 16;
      lastX = ev.clientX;
      lastY = ev.clientY;
      py = ev.clientY;
      lastT = now;
      const tilt = Math.max(-16, Math.min(16, vx * 0.9));
      const ax = Math.min(0.35, Math.abs(vx) * 0.012);
      const ay = Math.min(0.35, Math.abs(vy) * 0.012);
      setGhost({ x: ev.clientX, y: ev.clientY, w: r.width, h: r.height, ox: sx - r.left, oy: sy - r.top, tilt, sx: 1 + ax - ay * 0.5, sy: 1 + ay - ax * 0.5 });
      hitTest(ev.clientX, ev.clientY);
    };
    const up = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      document.body.classList.remove("sw-dragging");
      setGhost(null);
      if (started) dropOn(useDnd.getState().over);
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if ((e.key === " " || e.key === "Enter") && !lifted) {
      e.preventDefault();
      useDnd.getState().start(data, "keyboard");
      play("pick");
      requestAnimationFrame(() => {
        const first = [...useDnd.getState().zones.values()].find((z) => accepts(z, data));
        first?.el.focus();
      });
    } else if (e.key === "Escape" && lifted) {
      useDnd.getState().end();
    }
  };

  return (
    <>
      <motion.div
        ref={ref}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-roledescription="draggable card"
        aria-describedby={hintId}
        aria-pressed={lifted}
        aria-disabled={disabled || undefined}
        data-cursor={disabled ? undefined : "grab"}
        data-card={data.kind}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        animate={{
          opacity: lifted && mode === "pointer" ? 0.3 : 1,
          scale: lifted && mode === "pointer" ? 0.94 : lifted && mode === "keyboard" ? 1.05 : 1,
          filter: lifted && mode === "pointer" ? "grayscale(0.8) blur(1px)" : "grayscale(0) blur(0px)",
        }}
        whileHover={disabled ? undefined : { y: -4, scaleX: 1.03, scaleY: 0.97, transition: { type: "spring", stiffness: 500, damping: 12 } }}
        whileTap={disabled ? undefined : { scaleX: 0.95, scaleY: 1.05 }}
        className={`relative touch-none select-none ${disabled ? "cursor-not-allowed opacity-60" : "cursor-grab"} ${lifted && mode === "keyboard" ? "ring-2 ring-dawn ring-offset-2" : ""} ${className}`}
      >
        {children}
        <span id={hintId} className="sr-only">
          {hint}. Press Space to pick up.
        </span>
      </motion.div>
      {ghost &&
        createPortal(
          <div
            className="pointer-events-none fixed top-0 left-0 z-[96]"
            style={{ transform: `translate(${ghost.x - ghost.ox}px, ${ghost.y - ghost.oy}px)`, width: ghost.w }}
            aria-hidden="true"
          >
            <motion.div
              className="relative rounded-xl shadow-[0_30px_60px_-20px_rgba(30,39,33,0.55)] ring-2 ring-dawn"
              style={{ transformOrigin: `${ghost.ox}px ${ghost.oy}px`, transformPerspective: 700 }}
              initial={{ scale: 0.9, rotateX: 0 }}
              animate={
                over
                  ? // hovering a zone: the card shrinks and is drawn in, like being sipped into a cauldron
                    { scaleX: 0.62, scaleY: 0.62, rotate: 0, rotateX: 18, opacity: 0.85, filter: "drop-shadow(0 0 18px rgba(242,179,74,0.9)) brightness(1.15)" }
                  : { scaleX: 1.1 * ghost.sx, scaleY: 1.1 * ghost.sy, rotate: ghost.tilt, rotateX: 0, opacity: 1, filter: "drop-shadow(0 0 0 rgba(0,0,0,0)) brightness(1)" }
              }
              transition={{ type: "spring", stiffness: 520, damping: 18, mass: 0.6 }}
            >
              {children}
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-xl"
                style={{ background: "radial-gradient(circle at 30% 20%, rgba(255,226,168,0.55), transparent 60%)" }}
                animate={{ opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </motion.div>
          </div>,
          document.body,
        )}
    </>
  );
}

/* ---------- Action zone ---------- */
export function ActionZone({
  id,
  label,
  hint,
  accepts: acc,
  onDrop,
  icon,
  tone = "var(--moss)",
  className = "",
  compact = false,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  accepts: string[];
  onDrop: (d: CardData) => void | Promise<void>;
  icon?: React.ReactNode;
  tone?: string;
  className?: string;
  compact?: boolean;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useDnd((s) => s.drag);
  const mode = useDnd((s) => s.mode);
  const over = useDnd((s) => s.over);
  const [burst, setBurst] = useState(0);
  const live = !!drag && acc.includes(drag.kind);
  const hot = over === id && live;
  const onDropRef = useRef(onDrop);
  onDropRef.current = onDrop;

  useEffect(() => {
    const el = ref.current!;
    const zones = useDnd.getState().zones;
    zones.set(id, { id, label, accepts: acc, el, onDrop: (d) => onDropRef.current(d) });
    const ping = () => setBurst((b) => b + 1);
    el.addEventListener("sw-dropped", ping);
    return () => {
      zones.delete(id);
      el.removeEventListener("sw-dropped", ping);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, label, acc.join(",")]);

  return (
    <motion.div
      ref={ref}
      role="region"
      aria-label={`Action zone: ${label}`}
      tabIndex={live && mode === "keyboard" ? 0 : -1}
      data-zone={id}
      onFocus={() => mode === "keyboard" && live && useDnd.getState().setOver(id)}
      onKeyDown={(e) => {
        if (mode !== "keyboard" || !live) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          dropOn(id);
        } else if (e.key === "Escape") useDnd.getState().end();
      }}
      animate={{
        scale: hot ? 1.06 : live ? [1, 1.025, 1] : 1,
        scaleX: hot ? [1, 1.08, 0.98, 1.04] : 1,
        borderColor: hot ? tone : live ? tone : "var(--line)",
      }}
      transition={{
        default: { type: "spring", stiffness: 380, damping: 14 },
        scale: live && !hot ? { duration: 1.2, repeat: Infinity } : { type: "spring", stiffness: 380, damping: 14 },
        scaleX: { duration: 0.55, ease: "easeOut" },
      }}
      className={`relative flex items-center gap-3 overflow-hidden rounded-xl border-2 border-dashed bg-card/80 outline-none ${compact ? "p-3" : "p-4"} ${live ? "" : "opacity-90"} ${className}`}
      style={{ boxShadow: hot ? `0 0 0 4px color-mix(in srgb, ${tone} 22%, transparent), 0 18px 40px -20px ${tone}` : undefined }}
    >
      {/* breathing fill while a compatible card is held */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: tone }}
        animate={{ opacity: hot ? 0.16 : live ? [0.03, 0.09, 0.03] : 0 }}
        transition={live && !hot ? { duration: 1.4, repeat: Infinity } : { duration: 0.2 }}
      />
      {icon && (
        <motion.span
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-[var(--on-fill)]"
          style={{ background: tone }}
          animate={{ rotate: hot ? [0, -10, 10, 0] : 0, scale: hot ? 1.12 : 1 }}
          transition={{ duration: 0.5 }}
          aria-hidden="true"
        >
          {icon}
        </motion.span>
      )}
      <span className="relative min-w-0">
        <span className="block font-semibold leading-tight">{hot ? `Release to ${label.toLowerCase()}` : label}</span>
        {hint && !compact && <span className="block text-xs text-ink-2">{hint}</span>}
      </span>
      {children}
      <AnimatePresence>
        {burst > 0 && (
          <motion.span
            key={burst}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-xl"
            style={{ border: `3px solid ${tone}` }}
            initial={{ opacity: 0.9, scale: 0.9 }}
            animate={{ opacity: 0, scale: 1.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Screen reader announcements + an on-screen hint while dragging. */
export function DndLayer() {
  const announce = useDnd((s) => s.announce);
  const drag = useDnd((s) => s.drag);
  const mode = useDnd((s) => s.mode);
  useEffect(() => {
    if (!drag) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && useDnd.getState().end();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [drag]);
  return (
    <>
      <p className="sr-only" aria-live="assertive">
        {announce}
      </p>
      <AnimatePresence>
        {drag && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            className="pointer-events-none fixed bottom-5 left-1/2 z-[97] -translate-x-1/2 rounded-lg bg-ink px-4 py-2 text-sm text-paper shadow-xl"
            aria-hidden="true"
          >
            Carrying <strong className="text-dawn">{drag.label}</strong>
            {mode === "keyboard" ? " · Tab to a zone, Enter to drop, Esc to cancel" : " · drop it on a glowing zone"}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** Small shared icons for zones. */
const P = { stroke: "currentColor", strokeWidth: 1.8, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
export const ZoneIcon = {
  grave: <svg width="20" height="20" viewBox="0 0 20 20"><path d="M5 17V9a5 5 0 0 1 10 0v8M3 17h14" {...P} /></svg>,
  next: <svg width="20" height="20" viewBox="0 0 20 20"><path d="M4 10h11M11 5l5 5-5 5" {...P} /></svg>,
  open: <svg width="20" height="20" viewBox="0 0 20 20"><path d="M11 3h6v6M17 3l-8 8M15 12v5H3V5h5" {...P} /></svg>,
  bell: <svg width="20" height="20" viewBox="0 0 20 20"><path d="M5 14V9a5 5 0 0 1 10 0v5l2 2H3zM8 18h4" {...P} /></svg>,
  compost: <svg width="20" height="20" viewBox="0 0 20 20"><path d="M3 6h14M6 6l1 11h6l1-11M8 6V3h4v3" {...P} /></svg>,
  check: <svg width="20" height="20" viewBox="0 0 20 20"><path d="M4 10l4 4 8-9" {...P} /></svg>,
  undo: <svg width="20" height="20" viewBox="0 0 20 20"><path d="M7 5L3 9l4 4M3 9h9a5 5 0 0 1 0 10h-2" {...P} /></svg>,
  mail: <svg width="20" height="20" viewBox="0 0 20 20"><path d="M3 5h14v10H3zM3 5l7 6 7-6" {...P} /></svg>,
  crate: <svg width="20" height="20" viewBox="0 0 20 20"><path d="M3 7l7-4 7 4-7 4-7-4zM3 7v6l7 4 7-4V7" {...P} /></svg>,
  plant: <svg width="20" height="20" viewBox="0 0 20 20"><path d="M10 17V8M10 11C8 7 5 7 4 8c1 3 3 4 6 3zm0-2c1.5-4 5-4.5 6-3.5-1 3.5-3.5 4.5-6 3.5z" {...P} /></svg>,
  stitch: <svg width="20" height="20" viewBox="0 0 20 20"><path d="M4 4l12 12M4 16L16 4M7 3v3M13 14v3" {...P} /></svg>,
};

/** Stops Enter from submitting a form; under the Canvas Protocol only a drop submits. */
export const noEnterSubmit = (e: React.KeyboardEvent) => {
  if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") e.preventDefault();
};

/** A form's data card plus the zone that submits it. */
export function SubmitByDrop({
  formId,
  cardLabel,
  cardText,
  zoneLabel,
  zoneHint,
  icon,
  tone = "var(--moss)",
  disabled,
}: {
  formId: string;
  cardLabel: string;
  cardText: React.ReactNode;
  zoneLabel: string;
  zoneHint?: string;
  icon: React.ReactNode;
  tone?: string;
  disabled?: boolean;
}) {
  return (
    <div className="mt-3 grid items-stretch gap-2 sm:grid-cols-2">
      <DragCard data={{ kind: `form-${formId}`, id: formId, label: cardLabel }} disabled={disabled} hint={`Drag into ${zoneLabel}`}>
        <div className="flex h-full items-center gap-2 rounded-xl border border-line bg-card px-3 py-3 text-sm">
          <span className="text-ink-3" aria-hidden="true">
            ⠿
          </span>
          {cardText}
        </div>
      </DragCard>
      <ActionZone
        id={`zone-${formId}`}
        label={zoneLabel}
        hint={zoneHint}
        accepts={[`form-${formId}`]}
        icon={icon}
        tone={tone}
        compact={!zoneHint}
        onDrop={() => (document.getElementById(formId) as HTMLFormElement | null)?.requestSubmit()}
      />
    </div>
  );
}
