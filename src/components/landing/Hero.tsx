"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
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

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line-2">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pt-10 pb-6 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-16 lg:pb-12">
        <div className="relative z-10">
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            For students, hackathoners and indie makers
          </motion.p>
          <motion.h1
            className="mt-4 font-display text-[2.6rem] font-semibold leading-[1.04] tracking-tight text-ink sm:text-6xl"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            Your unfinished projects deserve a second look.
          </motion.h1>
          <motion.p
            className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
          >
            Write down what you built, what is left and why you stopped. SecondWind scores the project on six
            signals and tells you whether to revive, pivot, salvage, merge or archive it, with the reasons in plain
            words.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
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
          <p className="mt-6 text-sm text-ink-3">Takes about two minutes. No account. Saved in your browser.</p>
        </div>

        <div className="relative h-[340px] sm:h-[420px] lg:h-[520px]">
          <div className="absolute inset-0 overflow-hidden rounded-xl border border-line bg-[#f3ede0]">
            <GardenScene stones={stones} mode="hero" className="h-full w-full" />
          </div>
          <p className="pointer-events-none absolute bottom-3 left-3 rounded-[4px] bg-card/90 px-2 py-1 text-xs text-ink-2">
            Taller, brighter stones have more revival potential
          </p>
        </div>
      </div>
    </section>
  );
}
