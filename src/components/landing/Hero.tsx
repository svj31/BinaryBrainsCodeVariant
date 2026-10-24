"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef } from "react";
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

function HeroPlaceholder() {
  return (
    <div className="flex h-full items-end justify-center gap-4 pb-16" aria-hidden="true">
      {[40, 70, 85, 60, 35].map((s, i) => (
        <Headstone key={i} score={s} className="w-14 opacity-70" sprout={s > 55} />
      ))}
    </div>
  );
}

const TITLE = "Your unfinished projects deserve a second look.".split(" ");

/** Drifting embers behind the hero copy. */
function Embers() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 8 }, (_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-dawn"
          style={{ left: `${(i * 37) % 100}%`, bottom: -10, width: 3 + (i % 3) * 2, height: 3 + (i % 3) * 2, opacity: 0 }}
          animate={{ y: [0, -520 - (i % 5) * 60], x: [0, (i % 2 ? 1 : -1) * (20 + (i % 4) * 14)], opacity: [0, 0.9, 0] }}
          transition={{ duration: 6 + (i % 5), repeat: Infinity, delay: i * 0.45, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 24 });
  const textY = useTransform(p, [0, 1], [0, -160]);
  const textX = useTransform(p, [0, 1], [0, -80]);
  const textRot = useTransform(p, [0, 1], [0, 12]);
  const sceneY = useTransform(p, [0, 1], [0, 140]);
  const sceneRotX = useTransform(p, [0, 1], [0, 28]);
  const sceneRotY = useTransform(p, [0, 1], [0, -18]);
  const sceneScale = useTransform(p, [0, 1], [1, 0.82]);
  const fade = useTransform(p, [0, 0.9], [1, 0.15]);
  return (
    <section ref={ref} className="relative overflow-hidden border-b border-line-2" style={{ perspective: 1400 }}>
      <Embers />
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pt-10 pb-6 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-16 lg:pb-12">
        <motion.div className="relative z-10" style={{ y: textY, x: textX, rotateY: textRot, opacity: fade }}>
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            For students, hackathoners and indie makers
          </motion.p>
          <h1 className="mt-4 font-display text-[2.6rem] font-semibold leading-[1.04] tracking-tight text-ink sm:text-6xl" style={{ perspective: 700 }}>
            {TITLE.map((w, i) => (
              <motion.span
                key={i}
                className="sw-word"
                style={{ transformOrigin: "50% 100%" }}
                initial={{ opacity: 0, y: 40, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.9, delay: 0.6 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
              >
                {w}
                {i < TITLE.length - 1 ? " " : ""}
              </motion.span>
            ))}
          </h1>
          <motion.p
            className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.4 }}
          >
            Write down what you built, what is left and why you stopped. SecondWind scores the project on six
            signals and tells you whether to revive, pivot, salvage, merge or archive it, with the reasons in plain
            words.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.7 }}
          >
            <Link href="/bury" className="btn btn-primary !px-5 !py-3 text-base">
              Bury your first project
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              </svg>
            </Link>
            <Link href="/garden" className="text-sm font-semibold text-moss underline-offset-4 hover:underline">
              or walk through the sample garden
            </Link>
          </motion.div>
          <motion.p className="mt-6 text-sm text-ink-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2 }}>
            Takes about two minutes. No account. Saved in your browser.
          </motion.p>
        </motion.div>

        <motion.div
          className="relative h-[340px] sm:h-[420px] lg:h-[520px]"
          style={{ y: sceneY, rotateX: sceneRotX, rotateY: sceneRotY, scale: sceneScale }}
          initial={{ opacity: 0, x: 160, z: -300 }}
          animate={{ opacity: 1, x: 0, z: 0 }}
          transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-xl border border-line bg-[#f3ede0]">
            <GardenScene stones={stones} mode="hero" className="h-full w-full" />
          </div>
          <p className="pointer-events-none absolute bottom-3 left-3 rounded-[4px] bg-card/90 px-2 py-1 text-xs text-ink-2">
            Taller, brighter stones have more revival potential
          </p>
        </motion.div>
      </div>
    </section>
  );
}
