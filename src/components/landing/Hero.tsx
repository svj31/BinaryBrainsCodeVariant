"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { SEED } from "@/lib/seed";
import { assess } from "@/lib/score";
import { Headstone } from "@/components/ui/Headstone";

const GardenScene = dynamic(() => import("@/components/three/GardenScene"), {
  ssr: false,
  loading: () => <HeroPlaceholder />,
});

const stones = SEED.slice(0, 9).map((p) => {
  const a = assess(p, SEED);
  return { id: p.id, name: p.name, score: a.score, verdict: a.verdict, status: p.status };
});

/** Lightweight garden for phones and slow connections: stones rise, glows breathe, no WebGL. */
function HeroPlaceholder({ live = false }: { live?: boolean }) {
  return (
    <div className="relative flex h-full items-end justify-center gap-3 pb-14 sm:gap-4" aria-hidden="true">
      <span className="absolute top-8 left-10 h-10 w-10 rounded-full bg-[#f7d79c] opacity-80 blur-[1px]" />
      <span className="absolute inset-x-0 bottom-0 h-24 bg-[#c9d6b4]" />
      {[40, 70, 85, 60, 35].map((s, i) => (
        <motion.div
          key={i}
          className="relative"
          initial={live ? { y: 40, opacity: 0 } : false}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 + i * 0.1 }}
        >
          <motion.span
            className="absolute inset-x-0 -bottom-1 mx-auto h-4 w-16 rounded-full bg-dawn blur-md"
            animate={{ opacity: [0.2 + s / 250, 0.45 + s / 250, 0.2 + s / 250] }}
            transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.3 }}
          />
          <Headstone score={s} className={`relative ${s > 70 ? "w-16" : "w-12 sm:w-14"}`} sprout={s > 55} />
        </motion.div>
      ))}
    </div>
  );
}

const TITLE = "Your unfinished projects deserve a second look.".split(" ");

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  // the 3D hero is decoration: phones and data-saver visitors get the light version and a faster page
  const [use3d, setUse3d] = useState(false);
  useEffect(() => {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    const big = matchMedia("(min-width: 768px)").matches;
    if (!big || nav.connection?.saveData) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(() => setUse3d(true), { timeout: 1200 });
    else setTimeout(() => setUse3d(true), 300);
  }, []);
  // on a fresh load, wait for the boot curtains to part so the opening reads as one continuous shot
  const [d] = useState(() =>
    typeof window === "undefined" || document.getElementById("sw-boot")?.classList.contains("sw-boot-quick") ? 0 : Math.max(0, 4 - performance.now() / 1000),
  );
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 24 });
  // two depth layers: copy lifts away faster than the scene, both fade together
  const textY = useTransform(p, [0, 1], [0, -120]);
  const sceneY = useTransform(p, [0, 1], [0, 60]);
  const sceneScale = useTransform(p, [0, 1], [1, 0.94]);
  const fade = useTransform(p, [0, 0.85], [1, 0]);
  return (
    <section ref={ref} className="relative overflow-hidden border-b border-line-2">

      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pt-10 pb-6 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-16 lg:pb-12">
        <motion.div className="relative z-10" style={{ y: textY, opacity: fade }}>
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: d + 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            For students, hackathoners and indie makers
          </motion.p>
          <h1 className="mt-4 font-display text-[2.6rem] font-semibold leading-[1.04] tracking-tight text-ink sm:text-6xl" style={{ perspective: 700 }}>
            {TITLE.map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.1em] align-top -mb-[0.1em]">
                <motion.span
                  className="sw-word"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1, delay: d + 0.5 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                  {w}
                  {i < TITLE.length - 1 ? "\u00a0" : ""}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: d + 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            Write down what you built, what is left and why you stopped. SecondWind scores the project on six
            signals and tells you whether to revive, pivot, salvage, merge or archive it, with the reasons in plain
            words.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: d + 1.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href="/bury" data-tour="bury" className="btn btn-primary !px-5 !py-3 text-base">
              Bury your first project
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              </svg>
            </Link>
            <Link href="/garden" className="text-sm font-semibold text-moss underline-offset-4 hover:underline">
              or walk through the sample garden
            </Link>
          </motion.div>
          <motion.p className="mt-6 text-sm text-ink-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: d + 1.4, ease: [0.22, 1, 0.36, 1] }}>
            Takes about two minutes. No account. Saved in your browser.
          </motion.p>
        </motion.div>

        <motion.div
          className="relative h-[340px] sm:h-[420px] lg:h-[520px]"
          style={{ y: sceneY, scale: sceneScale }}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: d + 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-xl border border-line bg-[#f3ede0]">
            {use3d ? <GardenScene stones={stones} mode="hero" className="h-full w-full" /> : <HeroPlaceholder live />}
          </div>
          <p className="pointer-events-none absolute bottom-3 left-3 rounded-[4px] bg-card/90 px-2 py-1 text-xs text-ink-2">
            Taller, brighter stones have more revival potential
          </p>
        </motion.div>
      </div>
    </section>
  );
}
