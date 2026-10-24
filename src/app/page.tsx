import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/landing/Hero";
import { ScoreDemo } from "@/components/landing/ScoreDemo";
import { Reveal } from "@/components/ui/Reveal";
import { FinalCta, ProblemSection, WhoFor } from "@/components/landing/Sections";
import { Journey, Marquee, TiltCard, VerdictExplorer } from "@/components/landing/Interactive";
import { Drift, Fly, SplitText, Tilt3D } from "@/components/motion/Scroll3D";
import { IslandToc } from "@/components/landing/IslandToc";

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
      <IslandToc />
      <Marquee />

      <section id="problem" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6" aria-labelledby="problem-h">
        <Reveal>
          <Drift amount={60}><p className="eyebrow">The problem</p></Drift>
          <SplitText as="h2" id="problem-h" className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl" text="Unfinished does not mean worthless. It usually means undecided." />
        </Reveal>
        <Fly from="left" delay={0.15} className="mt-12">
          <ProblemSection />
        </Fly>
      </section>

      <section id="how" className="scroll-mt-20 border-y border-line-2 bg-paper-2" aria-labelledby="how-h">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <Reveal>
            <Drift amount={-60}><p className="eyebrow">How it works</p></Drift>
            <SplitText as="h2" id="how-h" className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl" text="From a dusty folder to a clear next step in about two minutes." />
          </Reveal>
          <div className="mt-12">
            <Journey />
          </div>

          <Reveal className="mt-16" from="depth">
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
          <Drift amount={60}><p className="eyebrow">The five verdicts</p></Drift>
          <SplitText as="h2" id="verdicts-h" className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl" text="Not every project should come back. Each one gets an honest path." />
        </Reveal>
        <Tilt3D className="mt-10">
          <VerdictExplorer />
        </Tilt3D>
      </section>

      <section id="beyond" className="scroll-mt-20 border-y border-line-2 bg-paper-2" aria-labelledby="features-h">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <Reveal>
            <Drift amount={-60}><p className="eyebrow">Beyond the verdict</p></Drift>
            <SplitText as="h2" id="features-h" className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl" text="A graveyard you can learn from, borrow from and come back to." />
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08} from={i % 2 ? "left" : "right"}>
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

      <section id="who" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6" aria-labelledby="who-h">
        <Reveal>
          <Drift amount={60}><p className="eyebrow">Who it is for</p></Drift>
          <SplitText as="h2" id="who-h" className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl" text="People with more ideas than time." />
          <p className="mt-3 max-w-xl text-ink-2 sw-float">Not another project manager. A quiet place where unfinished work can rest, be understood, and maybe return. Pick who you are.</p>
        </Reveal>
        <Fly from="right" delay={0.15} className="mt-10">
          <WhoFor />
        </Fly>
      </section>

      <section id="begin" className="mx-auto max-w-7xl scroll-mt-20 px-4 sm:px-6" aria-labelledby="cta-h">
        <Tilt3D>
          <FinalCta />
        </Tilt3D>
      </section>
    </>
  );
}
