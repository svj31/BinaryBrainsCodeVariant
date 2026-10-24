"use client";

import { motion } from "framer-motion";
import type { Dir } from "@/components/motion/Scroll3D";

const FROM: Record<Dir, Record<string, number>> = {
  up: { y: 60, rotateX: 24 },
  down: { y: -60, rotateX: -24 },
  left: { x: 90, rotateY: -20 },
  right: { x: -90, rotateY: 20 },
  depth: { z: -220, rotateX: 14 },
};

/** Scroll reveal through 3D space: rises or slides in with a tilt, once. */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div",
  from = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
  from?: Dir;
}) {
  const M = motion[as];
  return (
    <M
      className={className}
      style={{ transformPerspective: 1000 }}
      initial={{ opacity: 0, scale: 0.96, x: 0, y: 0, z: 0, rotateX: 0, rotateY: 0, ...FROM[from] }}
      whileInView={{ opacity: 1, scale: 1, x: 0, y: 0, z: 0, rotateX: 0, rotateY: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 1.1, delay: delay * 1.6 + 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </M>
  );
}
