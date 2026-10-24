"use client";

import { useEffect } from "react";

/** Adds a soft ripple from the click point on every .btn and [data-ripple] element. */
export function Ripple() {
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const host = (e.target as HTMLElement | null)?.closest<HTMLElement>(".btn, [data-ripple]");
      if (!host || host.hasAttribute("disabled")) return;
      const r = host.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2;
      const s = document.createElement("span");
      s.className = "sw-ripple";
      s.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
      if (getComputedStyle(host).position === "static") host.style.position = "relative";
      host.style.overflow = "hidden";
      host.appendChild(s);
      setTimeout(() => s.remove(), 650);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);
  return null;
}
