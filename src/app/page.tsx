import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/landing/Hero";
import { ScoreDemo } from "@/components/landing/ScoreDemo";
import { Reveal } from "@/components/ui/Reveal";
import { FinalCta, ProblemSection, WhoFor } from "@/components/landing/Sections";
import { Journey, Marquee, TiltCard, VerdictExplorer } from "@/components/landing/Interactive";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};



const FEATURES = [
  {
    title: "Salvage Yard",
    body: "Every reusable part from every buried project in one searchable shelf. Components, scripts, datasets, designs.",
    href: "/salvage",
  },
  {
    title: "Frankenstein mode",
    body: "When two stalled projects share a stack and an audience, SecondWind suggests stitching them into one stronger build.",
    href: "/garden/study-buddy",
  },
  {
    title: "Death Report",
    body: "See your own pattern. If scope creep killed four projects, the next one needs a smaller first version.",
    href: "/insights",
  },
  {
    title: "Epitaph and timeline",
    body: "Born, peak, stall, buried, afterlife. Each project keeps its story and a one-line epitaph you will remember it by.",
    href: "/garden/pocket-planner",
  },
];

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6" aria-labelledby="problem-h">
        <Reveal>
          <p className="eyebrow">The problem</p>
          <h2 id="problem-h" className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Unfinished does not mean worthless. It usually means undecided.
          </h2>
        </Reveal>
        <div className="mt-12">
          <ProblemSection />
        </div>
      </section>

      <section id="how" className="scroll-mt-20 border-y border-line-2 bg-paper-2" aria-labelledby="how-h">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <Reveal>
            <p className="eyebrow">How it works</p>
            <h2 id="how-h" className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              From a dusty folder to a clear next step in about two minutes.
            </h2>
          </Reveal>
          <div className="mt-12">
            <Journey />
          </div>

          <Reveal className="mt-16">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="font-display text-2xl font-semibold">Try the score</h3>
                <p className="mt-1 text-ink-2">Move the sliders. The verdict and its reasons update as you go.</p>
              </div>
            </div>
            <ScoreDemo />
          </Reveal>
        </div>
      </section>

      <section id="verdicts" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6" aria-labelledby="verdicts-h">
        <Reveal>
          <p className="eyebrow">The five verdicts</p>
          <h2 id="verdicts-h" className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Not every project should come back. Each one gets an honest path.
          </h2>
        </Reveal>
        <div className="mt-10">
          <VerdictExplorer />
        </div>
      </section>

      <section className="border-y border-line-2 bg-paper-2" aria-labelledby="features-h">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <Reveal>
            <p className="eyebrow">Beyond the verdict</p>
            <h2 id="features-h" className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              A graveyard you can learn from, borrow from and come back to.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.06}>
                <TiltCard className="h-full">
                <Link
                  href={f.href}
                  className="group flex h-full flex-col justify-between rounded-lg border border-line bg-card p-6 transition-colors hover:border-ink-3"
                >
                  <div>
                    <h3 className="font-display text-xl font-semibold">{f.title}</h3>
                    <p className="mt-2 leading-relaxed text-ink-2">{f.body}</p>
                  </div>
                  <span className="mt-5 text-sm font-semibold text-moss">
                    See it in the sample garden
                    <span className="ml-1 inline-block transition-transform group-hover:translate-x-1" aria-hidden="true">
                      →
                    </span>
                  </span>
                </Link>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6" aria-labelledby="who-h">
        <Reveal>
          <p className="eyebrow">Who it is for</p>
          <h2 id="who-h" className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            People with more ideas than time.
          </h2>
          <p className="mt-3 max-w-xl text-ink-2">Not another project manager. A quiet place where unfinished work can rest, be understood, and maybe return. Pick who you are.</p>
        </Reveal>
        <div className="mt-10">
          <WhoFor />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6" aria-labelledby="cta-h">
        <Reveal>
          <FinalCta />
        </Reveal>
      </section>
    </>
  );
}
