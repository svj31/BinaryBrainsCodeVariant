"use client";

import { motion } from "framer-motion";

/** A one-shot burst of light rays and sparks around its children, for reveal moments. */
export function Burst({ children, color = "var(--dawn)" }: { children: React.ReactNode; color?: string }) {
  return (
    <div className="relative inline-flex items-center justify-center">
      <motion.div
        className="absolute h-[220%] w-[220%] rounded-full"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 60%)` }}
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: [0, 0.45, 0.18], scale: [0.3, 1.1, 1] }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        aria-hidden="true"
      />
      <motion.svg
        viewBox="-100 -100 200 200"
        className="absolute h-[200%] w-[200%]"
        aria-hidden="true"
        initial={{ rotate: -20, opacity: 0 }}
        animate={{ rotate: 40, opacity: [0, 1, 0.5] }}
        transition={{ duration: 6, ease: "easeOut" }}
      >
        {Array.from({ length: 12 }, (_, i) => (
          <motion.line
            key={i}
            x1="0"
            y1="-52"
            x2="0"
            y2="-92"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            transform={`rotate(${i * 30})`}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.1 + i * 0.03 }}
          />
        ))}
        <motion.circle r="56" fill="none" stroke={color} strokeWidth="1" strokeDasharray="3 6" initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ duration: 0.8 }} />
      </motion.svg>
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return (
          <motion.span
            key={i}
            aria-hidden="true"
            className="absolute h-1.5 w-1.5 rounded-full"
            style={{ background: color, boxShadow: `0 0 8px ${color}` }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos(a) * 120, y: Math.sin(a) * 120, opacity: 0, scale: 0.2 }}
            transition={{ duration: 1.1, delay: 0.15, ease: "easeOut" }}
          />
        );
      })}
      <motion.div className="relative" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 180, damping: 13 }}>
        {children}
      </motion.div>
    </div>
  );
}
