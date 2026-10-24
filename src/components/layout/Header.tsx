"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { ThemeSwitch } from "./ThemeSwitch";
import { CommandChip } from "./CommandBox";

const NAV = [
  { href: "/garden", label: "Garden" },
  { href: "/salvage", label: "Salvage Yard" },
  { href: "/insights", label: "Death Report" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <motion.header className="sticky top-0 z-50 border-b border-line-2 bg-paper/90 backdrop-blur-sm" initial={{ y: -80 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 160, damping: 20, delay: 0.3 }}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[70] focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="SecondWind home" className="sw-hover shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((n, i) => (
            <motion.span key={n.href} initial={{ y: -20, opacity: 0, rotateX: -90 }} animate={{ y: 0, opacity: 1, rotateX: 0 }} transition={{ delay: 0.5 + i * 0.1 }} whileHover={{ y: -2 }}>
            <Link
              key={n.href}
              href={n.href}
              aria-current={active(n.href) ? "page" : undefined}
              className="relative rounded-md px-3 py-2 text-sm font-medium text-ink-2 transition-colors hover:text-ink"
            >
              {n.label}
              {active(n.href) && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute inset-x-3 -bottom-[13px] h-[2px] bg-moss"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              )}
            </Link>
            </motion.span>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <CommandChip />
          <ThemeSwitch />
          <Link href="/bury" className="btn btn-primary hidden !py-2 text-sm sm:inline-flex">
            Bury a project
          </Link>
          <button
            className="btn btn-ghost !px-2.5 !py-2 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              <path
                d={open ? "M5 5l10 10M15 5L5 15" : "M3 6h14M3 10h14M3 14h14"}
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-line-2 bg-paper md:hidden"
          >
            <ul className="flex flex-col px-4 py-3">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={active(n.href) ? "page" : undefined}
                    className={`block rounded-md px-2 py-3 text-base font-medium ${active(n.href) ? "text-moss" : "text-ink"}`}
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link href="/bury" className="btn btn-primary w-full">
                  Bury a project
                </Link>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
