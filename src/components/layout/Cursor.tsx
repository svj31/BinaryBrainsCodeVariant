"use client";

import { useEffect, useRef, useState } from "react";

type Mode = "default" | "link" | "button" | "text" | "drag" | "stone" | "hidden";

const LABEL: Partial<Record<Mode, string>> = { drag: "Drag", stone: "Open" };

/**
 * A lantern cursor: a small dot follows the pointer exactly and a ring trails
 * behind with easing. The ring changes shape for links, buttons, text fields,
 * the 3D garden and graves. Off for touch screens and reduced motion.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("default");
  const [down, setDown] = useState(false);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || calm) return;
    setOn(true);
    document.documentElement.classList.add("sw-cursor");

    const pos = { x: -100, y: -100 };
    const trail = { x: -100, y: -100 };
    let raf = 0;

    const move = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const el = e.target as HTMLElement | null;
      const tagged = el?.closest<HTMLElement>("[data-cursor]");
      let m: Mode = "default";
      if (tagged) m = tagged.dataset.cursor as Mode;
      else if (el?.closest("input:not([type=range]):not([type=checkbox]), textarea, select")) m = "text";
      else if (el?.closest("button, [role=tab], [role=radio], label")) m = "button";
      else if (el?.closest("a")) m = "link";
      setMode((prev) => (prev === m ? prev : m));
    };
    const loop = () => {
      trail.x += (pos.x - trail.x) * 0.18;
      trail.y += (pos.y - trail.y) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    const press = () => setDown(true);
    const release = () => setDown(false);
    const leave = () => setMode("hidden");

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
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90]">
      <div ref={ring} className="absolute top-0 left-0">
        <div className={`sw-ring sw-ring-${mode} ${down ? "sw-ring-down" : ""}`}>
          {LABEL[mode] && <span>{LABEL[mode]}</span>}
        </div>
      </div>
      <div ref={dot} className="absolute top-0 left-0">
        <div className={`sw-dot sw-dot-${mode}`} />
      </div>
    </div>
  );
}
