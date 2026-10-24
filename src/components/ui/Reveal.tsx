"use client";

import { motion } from "framer-motion";
import { DUR, EASE, OFFSET, type Dir } from "@/components/motion/Scroll3D";

/** Scroll reveal in the site-wide motion language: rises into place once, on the shared curve. */
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
      initial={{ opacity: 0, scale: 0.985, ...OFFSET[from] }}
      whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: DUR, delay: delay * 1.5, ease: EASE }}
    >
      {children}
    </M>
  );
}
