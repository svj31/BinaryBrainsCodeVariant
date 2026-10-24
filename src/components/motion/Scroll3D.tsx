"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";

export type Dir = "up" | "down" | "left" | "right" | "depth";

/**
 * One motion language for the whole site: things rise into place on the same
 * curve and timing. Direction only nudges the start a little sideways, so the
 * page reads as one calm, cinematic system instead of many separate tricks.
 */
export const EASE = [0.22, 1, 0.36, 1] as const;
export const DUR = 1;
export const OFFSET: Record<Dir, { x: number; y: number }> = {
  up: { x: 0, y: 48 },
  down: { x: 0, y: -36 },
  left: { x: 36, y: 24 },
  right: { x: -36, y: 24 },
  depth: { x: 0, y: 32 },
};

/** Thin glowing wisp on the left edge that fills as the page scrolls. */
export function ScrollWisp() {
  const { scrollYProgress } = useScroll();
  const y = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });
  return <motion.div aria-hidden="true" className="sw-scroll-wisp" style={{ scaleY: y }} />;
}

/** Rises into place (with an optional slight sideways start) when it scrolls into view. */
export function Fly({
  children,
  from = "up",
  delay = 0,
  className = "",
  once = true,
}: {
  children: React.ReactNode;
  from?: Dir;
  delay?: number;
  className?: string;
  once?: boolean;
}) {
  const o = OFFSET[from];
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: o.x, y: o.y, scale: 0.985 }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once, amount: 0.2 }}
      transition={{ duration: DUR, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Moves its child along an axis as it travels through the viewport (scroll-linked, not timed). */
export function Drift({
  children,
  axis = "x",
  amount = 80,
  className = "",
}: {
  children: React.ReactNode;
  axis?: "x" | "y";
  amount?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const v = useTransform(scrollYProgress, [0, 1], [amount * 0.35, -amount * 0.35]);
  return (
    <motion.div ref={ref} className={className} style={axis === "x" ? { x: v } : { y: v }}>
      {children}
    </motion.div>
  );
}

/** A section that settles in as it enters: a gentle scale and fade tied to scroll, no tilting. */
export function Tilt3D({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 45%"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [60, 0]);
  return (
    <div ref={ref}>
      <motion.div className={className} style={{ scale, opacity, y }}>
        {children}
      </motion.div>
    </div>
  );
}

/** Film-title reveal: each word rises from behind a mask, one after another. */
export function SplitText({
  text,
  as = "h2",
  className = "",
  id,
  delay = 0,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  id?: string;
  delay?: number;
}) {
  const M = motion[as];
  const words = text.split(" ");
  return (
    <M id={id} className={className} aria-label={text} initial="hide" whileInView="show" viewport={{ once: true, amount: 0.6 }} transition={{ staggerChildren: 0.045, delayChildren: delay }}>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.12em] align-top -mb-[0.12em]">
          <motion.span
            className="sw-word"
            variants={{ hide: { y: "110%" }, show: { y: 0, transition: { duration: 0.9, ease: EASE } } }}
          >
            {w}
            {i < words.length - 1 ? "\u00a0" : ""}
          </motion.span>
        </span>
      ))}
    </M>
  );
}

/** Scroll-linked parallax depth for a background layer. */
export function useParallax(value: MotionValue<number>, distance: number) {
  return useTransform(value, [0, 1], [-distance, distance]);
}
