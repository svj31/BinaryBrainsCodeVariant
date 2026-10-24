import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/landing/Hero";
import { ScoreDemo } from "@/components/landing/ScoreDemo";
import { Reveal } from "@/components/ui/Reveal";
import { VerdictBadge } from "@/components/ui/VerdictBadge";
import { VERDICTS, VERDICT_ORDER } from "@/lib/verdicts";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const PROBLEMS = [
  {
    title: "Projects stop without a decision",
    body: "Time runs out, the scope grows, a new idea shows up. Nobody writes down why it stopped, so the same thing happens next time.",
  },
  {
    title: "Good parts get buried with them",
    body: "A working parser, a clean component, a dataset you spent a week on. All of it sits in a repo you will never open again.",
  },
  {
    title: "Trackers only care about active work",
    body: "Kanban boards manage what you are doing now. Nothing helps you decide what to do with what you already dropped.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Autopsy",
    body: "Three short steps: what it was, what you finished and what is left, and why you stopped. Tag the cause of death.",
  },
  {
    n: "02",
    title: "Verdict",
    body: "The Resurrection Score weighs six signals. Every point is visible, so you can see what drove the recommendation and disagree with it.",
  },
  {
    n: "03",
    title: "Second wind",
    body: "Get a 7-day sprint with three milestones, a pivot sketch, or a list of parts to keep. Then come back and mark it alive.",
  },
];

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

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6" aria-labelledby="problem-h">
        <Reveal>
          <p className="eyebrow">The problem</p>
          <h2 id="problem-h" className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Unfinished does not mean worthless. It usually means undecided.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-3">
          {PROBLEMS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08} className="bg-card p-6">
              <h3 className="font-display text-xl font-semibold">{p.title}</h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-2">{p.body}</p>
            </Reveal>
          ))}
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
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.n} delay={i * 0.08} className="relative border-t-2 border-ink pt-5">
                <span className="font-mono text-sm text-ink-3">{s.n}</span>
                <h3 className="mt-1 font-display text-2xl font-semibold">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-ink-2">{s.body}</p>
              </Reveal>
            ))}
          </ol>

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
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {VERDICT_ORDER.map((k, i) => {
            const v = VERDICTS[k];
            return (
              <Reveal key={k} delay={i * 0.06} className="flex flex-col rounded-lg border border-line bg-card p-5">
                <VerdictBadge verdict={k} />
                <h3 className="mt-4 font-display text-lg font-semibold">{v.path}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{v.blurb}</p>
              </Reveal>
            );
          })}
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
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6" aria-labelledby="who-h">
        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Who it is for</p>
            <h2 id="who-h" className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              People with more ideas than time.
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-ink-2">
              If you have a folder of weekend builds that never got a Monday, this is your place. Not another project
              manager. A quiet spot where those projects can rest, be understood, and maybe return.
            </p>
          </Reveal>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              ["Students and hackathoners", "Weekend builds that never got a Monday."],
              ["Indie developers", "Side projects stacked behind the day job."],
              ["Designers and makers", "Half finished concepts and prototypes."],
              ["Small student teams", "Shared ideas that faded when the team moved on."],
            ].map(([t, b], i) => (
              <Reveal as="li" key={t} delay={i * 0.06} className="rounded-lg border border-line bg-card p-5">
                <h3 className="font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-ink-2">{b}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6" aria-labelledby="cta-h">
        <Reveal className="rounded-xl border border-ink bg-ink px-6 py-14 text-center text-paper sm:px-12">
          <h2 id="cta-h" className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Pick one project you keep thinking about.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#d9d4c8]">
            Give it two minutes. You will leave with a verdict, the reasons behind it, and the first thing to do next.
          </p>
          <Link
            href="/bury"
            className="btn mt-8 border border-paper bg-paper !px-6 !py-3 text-base text-ink hover:bg-dawn-soft"
          >
            Bury your first project
          </Link>
        </Reveal>
      </section>
    </>
  );
}
