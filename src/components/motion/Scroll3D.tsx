"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;
export type Dir = "up" | "down" | "left" | "right" | "depth";

const OFFSET: Record<Dir, { x?: number; y?: number; z?: number; rotateX?: number; rotateY?: number }> = {
  up: { y: 70, rotateX: 28 },
  down: { y: -70, rotateX: -28 },
  left: { x: 110, rotateY: -24 },
  right: { x: -110, rotateY: 24 },
  depth: { z: -260, rotateX: 18 },
};

/** Thin glowing wisp on the left edge that fills as the page scrolls. */
export function ScrollWisp() {
  const { scrollYProgress } = useScroll();
  const y = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });
  return <motion.div aria-hidden="true" className="sw-scroll-wisp" style={{ scaleY: y }} />;
}

/** Element flies in from a direction through 3D space, and back out when it leaves. */
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
      style={{ transformPerspective: 1100 }}
      initial={{ opacity: 0, scale: 0.95, x: o.x ?? 0, y: o.y ?? 0, z: o.z ?? 0, rotateX: o.rotateX ?? 0, rotateY: o.rotateY ?? 0 }}
      whileInView={{ opacity: 1, scale: 1, x: 0, y: 0, z: 0, rotateX: 0, rotateY: 0 }}
      viewport={{ once, amount: 0.25 }}
      transition={{ duration: 1.15, delay, ease }}
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
  const v = useTransform(scrollYProgress, [0, 1], [amount, -amount]);
  return (
    <motion.div ref={ref} className={className} style={axis === "x" ? { x: v } : { y: v }}>
      {children}
    </motion.div>
  );
}

/**
 * A section that tips back in 3D as it enters, lies flat in the middle of the
 * screen and tips forward as it leaves, like turning the page of a grimoire.
 */
export function Tilt3D({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = scrollYProgress;
  const rotateX = useTransform(p, [0, 0.35, 0.65, 1], [22, 0, 0, -14]);
  const scale = useTransform(p, [0, 0.35, 0.65, 1], [0.88, 1, 1, 0.94]);
  const opacity = useTransform(p, [0, 0.2, 0.85, 1], [0.2, 1, 1, 0.5]);
  return (
    <div ref={ref} style={{ perspective: 1400 }}>
      <motion.div className={className} style={{ rotateX, scale, opacity, transformOrigin: "50% 100%" }}>
        {children}
      </motion.div>
    </div>
  );
}

/** Words flip up one by one out of the soil, each with a slight 3D twist. */
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
    <M
      id={id}
      className={className}
      aria-label={text}
      initial="hide"
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
      transition={{ staggerChildren: 0.07, delayChildren: delay }}
      style={{ perspective: 800 }}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="sw-word"
          style={{ transformOrigin: "50% 100%" }}
          variants={{
            hide: { opacity: 0, y: "0.9em", rotateX: -80, rotateZ: i % 2 ? 4 : -4 },
            show: { opacity: 1, y: 0, rotateX: 0, rotateZ: 0, transition: { duration: 0.9, ease } },
          }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </M>
  );
}

/** Scroll-linked parallax depth for a background layer. */
export function useParallax(value: MotionValue<number>, distance: number) {
  return useTransform(value, [0, 1], [-distance, distance]);
}
