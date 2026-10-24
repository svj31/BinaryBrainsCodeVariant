"use client";

import { useEffect, useRef, useState } from "react";
import { useDnd } from "@/components/canvas/dnd";

type Mode = "default" | "link" | "button" | "text" | "drag" | "stone" | "grab" | "carry" | "release" | "hidden";

const LABEL: Partial<Record<Mode, string>> = { drag: "Fly", stone: "Open", grab: "Grab", carry: "Drop", release: "Release" };
const COLORS = ["#ffe2a8", "#f2b34a", "#9fe3b0", "#7cc3dc", "#ffffff"];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  star: boolean;
}
interface Beam {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  life: number;
}
interface Ring {
  x: number;
  y: number;
  life: number;
}

/**
 * The keeper's wand. A wand follows the pointer and sheds stardust; fast
 * flicks leave a glowing beam, and a click casts a burst of stars with a rune
 * ring. The ring still morphs per element and pulls toward a drop zone.
 */
export function Cursor() {
  const wand = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<Mode>("default");
  const [down, setDown] = useState(false);
  const [on, setOn] = useState(false);
  const drag = useDnd((s) => s.drag);
  const over = useDnd((s) => s.over);

  const mode: Mode = drag ? (over ? "release" : "carry") : hover;

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || calm) return;
    setOn(true);
    document.documentElement.classList.add("sw-cursor");
  }, []);

  useEffect(() => {
    if (!on) return;
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const dpr = 1; // the sparkles are soft; full retina resolution only costs fill rate
    const resize = () => {
      cv.width = innerWidth * dpr;
      cv.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const pos = { x: -100, y: -100 };
    const last = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    const parts: Particle[] = [];
    const beams: Beam[] = [];
    const rings: Ring[] = [];
    let speed = 0;
    let angle = 0;
    let raf = 0;
    let lastTarget: HTMLElement | null = null;

    const emit = (x: number, y: number, n: number, force: number, star = false) => {
      for (let i = 0; i < n && parts.length < 160; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = Math.random() * force;
        parts.push({
          x,
          y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - force * 0.15,
          life: 0,
          max: 30 + Math.random() * 40,
          size: 1 + Math.random() * (star ? 3.5 : 2.2),
          color: COLORS[(Math.random() * COLORS.length) | 0],
          star: star || Math.random() < 0.18,
        });
      }
    };

    const move = (e: PointerEvent) => {
      const dx = e.clientX - pos.x;
      const dy = e.clientY - pos.y;
      const d = Math.hypot(dx, dy);
      speed = Math.min(80, d);
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (d > 0.5) angle = Math.atan2(dy, dx);
      // the tip of the wand sits at the pointer: trail stardust behind it
      emit(pos.x, pos.y, Math.min(3, Math.ceil(d / 14)), 0.6 + speed * 0.02);
      if (speed > 38 && d < 260) beams.push({ x1: last.x, y1: last.y, x2: pos.x, y2: pos.y, life: 0 });
      last.x = pos.x;
      last.y = pos.y;
      const el = e.target as HTMLElement | null;
      if (el === lastTarget) return;
      lastTarget = el;
      const tagged = el?.closest<HTMLElement>("[data-cursor]");
      let m: Mode = "default";
      if (tagged) m = tagged.dataset.cursor as Mode;
      else if (el?.closest("input:not([type=range]):not([type=checkbox]), textarea, select")) m = "text";
      else if (el?.closest("button, [role=tab], [role=radio], label")) m = "button";
      else if (el?.closest("a")) m = "link";
      setHover((prev) => (prev === m ? prev : m));
    };

    const drawStar = (x: number, y: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const rr = i % 2 ? r * 0.35 : r;
        const a = (i * Math.PI) / 4;
        ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      }
      ctx.closePath();
      ctx.fill();
    };

    let dirty = false;
    const loop = () => {
      // nothing to draw: skip the clear and the whole pass
      const busy = parts.length || beams.length || rings.length;
      if (busy || dirty) ctx.clearRect(0, 0, innerWidth, innerHeight);
      dirty = !!busy;
      ctx.globalCompositeOperation = "lighter";

      for (let i = beams.length - 1; i >= 0; i--) {
        const b = beams[i];
        b.life++;
        const k = 1 - b.life / 18;
        if (k <= 0) {
          beams.splice(i, 1);
          continue;
        }
        const g = ctx.createLinearGradient(b.x1, b.y1, b.x2, b.y2);
        g.addColorStop(0, "rgba(124,195,220,0)");
        g.addColorStop(1, `rgba(255,226,168,${k})`);
        ctx.strokeStyle = g;
        ctx.lineCap = "round";
        ctx.lineWidth = 5 * k;
        ctx.beginPath();
        ctx.moveTo(b.x1, b.y1);
        ctx.lineTo(b.x2, b.y2);
        ctx.stroke();
      }

      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.life++;
        const k = r.life / 40;
        if (k >= 1) {
          rings.splice(i, 1);
          continue;
        }
        const rad = 8 + k * 70;
        ctx.save();
        ctx.translate(r.x, r.y);
        ctx.rotate(k * 2);
        ctx.strokeStyle = `rgba(242,179,74,${1 - k})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 6]);
        ctx.beginPath();
        ctx.ellipse(0, 0, rad, rad, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = `rgba(159,227,176,${(1 - k) * 0.8})`;
        ctx.beginPath();
        for (let s = 0; s < 6; s++) {
          const a = (s * Math.PI) / 3;
          ctx.moveTo(Math.cos(a) * rad * 0.55, Math.sin(a) * rad * 0.55);
          ctx.lineTo(Math.cos(a + 2.1) * rad * 0.55, Math.sin(a + 2.1) * rad * 0.55);
        }
        ctx.stroke();
        ctx.restore();
      }

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life++;
        if (p.life > p.max) {
          parts.splice(i, 1);
          continue;
        }
        p.vx *= 0.95;
        p.vy = p.vy * 0.95 + 0.03;
        p.x += p.vx;
        p.y += p.vy;
        const k = 1 - p.life / p.max;
        ctx.globalAlpha = k;
        ctx.fillStyle = p.color;
        if (p.star) {
          ctx.globalAlpha = k * 0.25;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = k;
          drawStar(p.x, p.y, p.size * 1.8 * (0.6 + k * 0.4));
        }
        else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * k, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

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
      speed *= 0.9;
      // the wand leans into the direction of travel
      const lean = Math.max(-25, Math.min(25, Math.cos(angle) * speed * 0.6));
      if (wand.current) wand.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${lean}deg)`;
      if (ring.current) ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    const press = (e: PointerEvent) => {
      setDown(true);
      emit(e.clientX, e.clientY, 22, 6, true);
      rings.push({ x: e.clientX, y: e.clientY, life: 0 });
      // a short beam shoots from the tip along the last direction
      beams.push({ x1: e.clientX, y1: e.clientY, x2: e.clientX + Math.cos(angle) * 60, y2: e.clientY + Math.sin(angle) * 60, life: 0 });
    };
    const release = () => setDown(false);
    const leave = () => setHover("hidden");

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", press);
    window.addEventListener("pointerup", release);
    document.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
      document.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("sw-cursor");
    };
  }, [on]);

  if (!on) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[130]">
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
      <div ref={ring} className="absolute top-0 left-0">
        <div className={`sw-ring sw-ring-${mode} ${down ? "sw-ring-down" : ""}`}>{LABEL[mode] && <span>{LABEL[mode]}</span>}</div>
      </div>
      <div ref={wand} className="absolute top-0 left-0">
        <div className={`sw-wand sw-wand-${mode} ${down ? "sw-wand-down" : ""}`}>
          <svg width="34" height="34" viewBox="0 0 34 34">
            <defs>
              <linearGradient id="sw-wand-g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#5a3b22" />
                <stop offset="1" stopColor="#2a1a0e" />
              </linearGradient>
            </defs>
            <path d="M5 5 L31 31" stroke="url(#sw-wand-g)" strokeWidth="3.4" strokeLinecap="round" />
            <path d="M22 22 L31 31" stroke="#f2b34a" strokeWidth="3.6" strokeLinecap="round" />
            <path d="M6 6 L12 12" stroke="#fff4d6" strokeWidth="1.6" strokeLinecap="round" />
            <g className="sw-wand-star">
              <path d="M4 0 L5 3 L8 4 L5 5 L4 8 L3 5 L0 4 L3 3 Z" fill="#ffe2a8" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
