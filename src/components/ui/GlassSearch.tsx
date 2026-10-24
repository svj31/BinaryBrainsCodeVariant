"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/** Liquid glass search: a refracting highlight follows the pointer and the field swells on focus. */
export function GlassSearch({
  id,
  label,
  value,
  onChange,
  placeholder,
  className = "",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [focus, setFocus] = useState(false);
  return (
    <motion.div
      className={`sw-glass relative rounded-full ${className}`}
      animate={{ boxShadow: focus ? "0 0 0 3px color-mix(in srgb, var(--dawn) 35%, transparent), 0 16px 40px -18px rgba(242,179,74,0.7)" : undefined }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--gx", `${((e.clientX - r.left) / r.width) * 100}%`);
      }}
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <motion.svg
        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-2"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        aria-hidden="true"
        animate={{ rotate: focus ? [0, -20, 15, 0] : 0, scale: focus ? 1.15 : 1 }}
        transition={{ duration: 0.5 }}
      >
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" fill="none" />
        <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </motion.svg>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        placeholder={placeholder}
        className="h-11 w-full rounded-full bg-transparent pr-10 pl-10 text-[0.95rem] text-ink outline-none placeholder:text-ink-3"
      />
      <AnimatePresence>
        {value && (
          <motion.span
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-dawn px-1.5 font-mono text-[10px] font-semibold text-[#1e2721]"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
          >
            {value.length}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
