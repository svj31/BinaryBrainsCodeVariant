"use client";

import { useEffect, useRef, useState } from "react";
import { useDnd } from "@/components/canvas/dnd";

type Mode = "default" | "link" | "button" | "text" | "drag" | "stone" | "grab" | "carry" | "release" | "hidden";

const LABEL: Partial<Record<Mode, string>> = { drag: "Drag", stone: "Open", grab: "Grab", carry: "Drop", release: "Release" };
const TRAIL = 7;

/**
 * Lantern cursor. A dot tracks the pointer, a ring trails it, and a comet of
 * fireflies follows fast moves and drags. The ring changes per element, grows
 * into a drop target while carrying a card, and snaps toward a hovered zone.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const tail = useRef<(HTMLSpanElement | null)[]>([]);
  const [hover, setHover] = useState<Mode>("default");
  const [down, setDown] = useState(false);
  const [on, setOn] = useState(false);
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number }[]>([]);
  const drag = useDnd((s) => s.drag);
  const over = useDnd((s) => s.over);

  const mode: Mode = drag ? (over ? "release" : "carry") : hover;

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || calm) return;
    setOn(true);
    document.documentElement.classList.add("sw-cursor");

    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    const chain = Array.from({ length: TRAIL }, () => ({ x: -100, y: -100 }));
    let speed = 0;
    let raf = 0;

    const move = (e: PointerEvent) => {
      speed = Math.min(60, Math.hypot(e.clientX - pos.x, e.clientY - pos.y));
      pos.x = e.clientX;
      pos.y = e.clientY;
      const el = e.target as HTMLElement | null;
      const tagged = el?.closest<HTMLElement>("[data-cursor]");
      let m: Mode = "default";
      if (tagged) m = tagged.dataset.cursor as Mode;
      else if (el?.closest("input:not([type=range]):not([type=checkbox]), textarea, select")) m = "text";
      else if (el?.closest("button, [role=tab], [role=radio], label")) m = "button";
      else if (el?.closest("a")) m = "link";
      setHover((prev) => (prev === m ? prev : m));
    };
    const loop = () => {
      // magnetic pull toward the hovered action zone while carrying a card
      let tx = pos.x;
      let ty = pos.y;
      const s = useDnd.getState();
      if (s.drag && s.over) {
        const r = s.zones.get(s.over)?.el.getBoundingClientRect();
        if (r) {
          tx = pos.x + (r.left + r.width / 2 - pos.x) * 0.35;
          ty = pos.y + (r.top + r.height / 2 - pos.y) * 0.35;
        }
      }
      ringPos.x += (tx - ringPos.x) * 0.2;
      ringPos.y += (ty - ringPos.y) * 0.2;
      let px = pos.x;
      let py = pos.y;
      chain.forEach((c, i) => {
        c.x += (px - c.x) * 0.38;
        c.y += (py - c.y) * 0.38;
        px = c.x;
        py = c.y;
        const el = tail.current[i];
        if (el) {
          const vis = s.drag ? 0.9 : Math.min(1, speed / 25);
          el.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) scale(${1 - i / TRAIL})`;
          el.style.opacity = String(vis * (1 - i / TRAIL));
        }
      });
      speed *= 0.9;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    const press = (e: PointerEvent) => {
      setDown(true);
      const id = Date.now() + Math.random();
      setSparks((s) => [...s.slice(-4), { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setSparks((s) => s.filter((p) => p.id !== id)), 650);
    };
    const release = () => setDown(false);
    const leave = () => setHover("hidden");

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", press);
    window.addEventListener("pointerup", release);
    document.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
      document.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("sw-cursor");
    };
  }, []);

  if (!on) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[99]">
      {Array.from({ length: TRAIL }, (_, i) => (
        <span
          key={i}
          ref={(el) => {
            tail.current[i] = el;
          }}
          className="sw-tail absolute top-0 left-0"
        />
      ))}
      {sparks.map((s) => (
        <span key={s.id} className="sw-spark absolute" style={{ left: s.x, top: s.y }}>
          {Array.from({ length: 6 }, (_, k) => (
            <i key={k} style={{ transform: `rotate(${k * 60}deg)` }} />
          ))}
        </span>
      ))}
      <div ref={ring} className="absolute top-0 left-0">
        <div className={`sw-ring sw-ring-${mode} ${down ? "sw-ring-down" : ""}`}>{LABEL[mode] && <span>{LABEL[mode]}</span>}</div>
      </div>
      <div ref={dot} className="absolute top-0 left-0">
        <div className={`sw-dot sw-dot-${mode}`} />
      </div>
    </div>
  );
}
