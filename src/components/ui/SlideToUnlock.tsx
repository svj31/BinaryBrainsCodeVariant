"use client";

import { useRef, useState } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from "framer-motion";

/**
 * Slide-to-unlock in liquid glass. Dragging the moonstone across is the
 * action, so it fits the Canvas Protocol: no plain button commits anything.
 * Keyboard: focus the knob and press Enter or the right arrow.
 */
export function SlideToUnlock({
  label,
  done = "Unlocked",
  onUnlock,
  onProgress,
  tone = "var(--dawn)",
  className = "",
  dark = false,
}: {
  label: string;
  done?: string;
  onUnlock: () => void;
  onProgress?: (p: number) => void;
  tone?: string;
  className?: string;
  dark?: boolean;
}) {
  const track = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [max, setMax] = useState(220);
  const [unlocked, setUnlocked] = useState(false);
  const progress = useTransform(x, (v) => Math.min(1, Math.max(0, v / max)));
  const fill = useTransform(progress, (p) => `${8 + p * 92}%`);
  const textOpacity = useTransform(progress, [0, 0.6], [1, 0]);
  useMotionValueEvent(progress, "change", (p) => onProgress?.(p));

  const measure = () => {
    const w = track.current?.offsetWidth ?? 280;
    setMax(w - 56);
  };
  const finish = () => {
    setUnlocked(true);
    animate(x, max, { type: "spring", stiffness: 300, damping: 26 });
    setTimeout(onUnlock, 380);
    setTimeout(() => {
      setUnlocked(false);
      animate(x, 0, { duration: 0.6 });
    }, 2200);
  };

  return (
    <div
      ref={track}
      onPointerEnter={measure}
      className={`sw-glass relative h-14 w-full max-w-sm overflow-hidden rounded-full ${dark ? "!bg-white/5" : ""} ${className}`}
    >
      <motion.span aria-hidden="true" className="absolute inset-y-1 left-1 rounded-full opacity-35" style={{ width: fill, background: tone }} />
      <motion.span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 flex items-center justify-center pl-12 text-sm font-semibold ${dark ? "text-[#f4f1e6]" : "text-ink"}`}
        style={{ opacity: textOpacity }}
      >
        <span
          className="bg-clip-text text-transparent"
          style={{
            backgroundImage: `linear-gradient(90deg, currentColor 30%, ${dark ? "#fff" : "var(--dawn)"} 50%, currentColor 70%)`,
            backgroundSize: "200% 100%",
            animation: "sw-shimmer 2.6s linear infinite",
            color: dark ? "#c9cfd4" : "var(--ink-2)",
          }}
        >
          {label} ›››
        </span>
      </motion.span>
      {unlocked && <span className={`absolute inset-0 flex items-center justify-center text-sm font-semibold ${dark ? "text-[#f4f1e6]" : "text-ink"}`}>{done}</span>}
      <motion.div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress.get() * 100)}
        data-cursor="grab"
        drag="x"
        dragConstraints={{ left: 0, right: max }}
        dragElastic={0.05}
        dragMomentum={false}
        onPointerDown={measure}
        onDragEnd={() => (progress.get() > 0.85 ? finish() : animate(x, 0, { type: "spring", stiffness: 400, damping: 30 }))}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "ArrowRight") {
            e.preventDefault();
            measure();
            finish();
          }
        }}
        style={{ x, background: tone }}
        whileTap={{ scale: 0.92 }}
        className="absolute top-1 left-1 flex h-12 w-12 cursor-grab touch-none items-center justify-center rounded-full text-[#1e2721] shadow-[0_6px_20px_-4px_rgba(242,179,74,0.7)]"
      >
        <motion.svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" animate={{ rotate: unlocked ? 360 : 0 }}>
          {unlocked ? (
            <path d="M5 11l4 4 8-9" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          ) : (
            <path d="M11 2l2.2 6.3L20 9l-5.2 4.1L16.6 20 11 16.2 5.4 20l1.8-6.9L2 9l6.8-.7z" fill="currentColor" />
          )}
        </motion.svg>
        <span className="absolute inset-0 animate-ping rounded-full opacity-30" style={{ background: tone }} aria-hidden="true" />
      </motion.div>
    </div>
  );
}
