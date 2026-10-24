"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { slugify, useGraveyard } from "@/lib/store";
import { assess } from "@/lib/score";
import { CAUSES, CAUSE_KEYS, VERDICTS } from "@/lib/verdicts";
import type { Cause, Project } from "@/lib/types";
import { isHttpUrl, lengthError, looksLikeBot, stripTags, type Errors } from "@/lib/validate";
import { track } from "@/lib/consent";
import { Field, Honeypot } from "@/components/ui/Field";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { VerdictBadge } from "@/components/ui/VerdictBadge";
import { GraveLoader } from "@/components/ui/GraveLoader";
import { useRitual } from "@/components/magic/Ritual";
import { Burst } from "@/components/magic/Burst";

interface Form {
  name: string;
  pitch: string;
  goal: string;
  repoUrl: string;
  stack: string;
  tags: string;
  startedOn: string;
  buriedOn: string;
  done: string[];
  left: string[];
  completion: number;
  effortLeft: number;
  causes: Cause[];
  causeNote: string;
  ideaStrength: number;
  relevance: number;
  interest: number;
  epitaph: string;
}

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY: Form = {
  name: "",
  pitch: "",
  goal: "",
  repoUrl: "",
  stack: "",
  tags: "",
  startedOn: "",
  buriedOn: "",
  done: [],
  left: [],
  completion: 40,
  effortLeft: 3,
  causes: [],
  causeNote: "",
  ideaStrength: 3,
  relevance: 3,
  interest: 3,
  epitaph: "",
};

/** Pre-filled example so visitors can try the full flow in seconds. */
const SAMPLE: Form = {
  ...EMPTY,
  name: "Lecture Lens",
  pitch: "Turns recorded lectures into searchable notes with timestamps",
  goal: "Upload a lecture video, get chapters, a summary and a search box that jumps to the right minute",
  stack: "React, Python, Whisper",
  tags: "students, education, ai",
  startedOn: "2025-11-02",
  buriedOn: "2026-02-20",
  done: ["Video upload", "Transcription pipeline", "Timestamp search"],
  left: ["Chapter detection", "Summary view", "Mobile layout"],
  completion: 50,
  effortLeft: 3,
  causes: ["no-time", "scope-creep"],
  causeNote: "Exams arrived just as I started adding flashcards.",
  ideaStrength: 4,
  relevance: 5,
  interest: 4,
  epitaph: "Heard every lecture, finished none of them.",
};

const STEPS = ["What it was", "Done and left", "Why it stopped"] as const;

function validateStep(step: number, f: Form): Errors {
  const e: Errors = {};
  const set = (k: string, m?: string) => m && (e[k] = m);
  if (step === 0) {
    set("name", lengthError("Project name", f.name, 2, 60));
    set("pitch", lengthError("The one-line description", f.pitch, 10, 200));
    set("goal", lengthError("What you wanted to build", f.goal, 10, 300));
    if (f.repoUrl.trim() && !isHttpUrl(f.repoUrl.trim())) e.repoUrl = "Enter a full link starting with https://";
    if (!f.startedOn) e.startedOn = "Pick roughly when you started.";
    if (!f.buriedOn) e.buriedOn = "Pick roughly when you stopped.";
    if (f.startedOn && f.startedOn > today()) e.startedOn = "The start date cannot be in the future.";
    if (f.buriedOn && f.buriedOn > today()) e.buriedOn = "The stop date cannot be in the future.";
    if (f.startedOn && f.buriedOn && f.buriedOn < f.startedOn) e.buriedOn = "It cannot stop before it started.";
  }
  if (step === 1) {
    if (f.done.length === 0) e.done = "Add at least one thing you finished. Even a setup counts.";
    if (f.left.length === 0) e.left = "Add at least one thing that is still unfinished.";
  }
  if (step === 2) {
    if (f.causes.length === 0) e.causes = "Pick at least one reason.";
    if (f.causeNote.length > 400) e.causeNote = "Keep it under 400 characters.";
    if (f.epitaph.length > 90) e.epitaph = "Keep the epitaph under 90 characters.";
  }
  return e;
}

function toProject(f: Form): Project {
  const split = (s: string) =>
    Array.from(new Set(s.split(",").map((x) => stripTags(x).trim()).filter(Boolean))).slice(0, 12);
  const clean = (s: string) => stripTags(s).trim();
  const timeline: Project["timeline"] = [
    { date: f.startedOn, kind: "born", note: "First commit" },
    { date: f.buriedOn, kind: "buried", note: `Stopped: ${CAUSES[f.causes[0]].label.toLowerCase()}` },
  ];
  return {
    id: slugify(f.name),
    name: clean(f.name),
    pitch: clean(f.pitch),
    goal: clean(f.goal),
    done: f.done.map(clean),
    left: f.left.map(clean),
    causes: f.causes,
    causeNote: clean(f.causeNote),
    tags: split(f.tags).map((t) => t.toLowerCase()),
    stack: split(f.stack),
    repoUrl: f.repoUrl.trim() || undefined,
    startedOn: f.startedOn,
    buriedOn: f.buriedOn,
    status: "resting",
    epitaph: clean(f.epitaph) || `Here lies ${clean(f.name)}. ${f.done.length} parts built, ${f.left.length} left to dream.`,
    inputs: {
      ideaStrength: f.ideaStrength,
      completion: f.completion,
      effortLeft: f.effortLeft,
      relevance: f.relevance,
      interest: f.interest,
    },
    timeline,
    organs: [],
  };
}

export function BuryWizard() {
  const hydrated = useGraveyard((s) => s.hydrated);
  const draft = useGraveyard((s) => s.draft);
  const saveDraft = useGraveyard((s) => s.saveDraft);
  const add = useGraveyard((s) => s.add);
  const projects = useGraveyard((s) => s.projects);

  const [form, setForm] = useState<Form>(EMPTY);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [errors, setErrors] = useState<Errors>({});
  const [restored, setRestored] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [phase, setPhase] = useState<"form" | "digging" | "done">("form");
  const [result, setResult] = useState<Project | null>(null);
  const [botMsg, setBotMsg] = useState("");
  const startedAt = useRef(Date.now());
  const restoredOnce = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Restore an unfinished autopsy once storage has loaded.
  useEffect(() => {
    if (!hydrated || restoredOnce.current) return;
    restoredOnce.current = true;
    if (draft && (draft as unknown as Form).name !== undefined) {
      const { step: s, ...rest } = draft as unknown as Form & { step?: number };
      setForm({ ...EMPTY, ...rest });
      setStep(s ?? 0);
      setRestored(true);
      startedAt.current = 0; // restored work was typed earlier, so skip the speed check
    } else if (new URLSearchParams(window.location.search).get("sample")) {
      setForm(SAMPLE);
      setStep(0);
      setRestored(true);
      startedAt.current = 0;
    }
  }, [hydrated, draft]);

  // Autosave every change.
  useEffect(() => {
    if (!hydrated || !restoredOnce.current || phase !== "form") return;
    const t = setTimeout(() => {
      const touched = JSON.stringify(form) !== JSON.stringify(EMPTY);
      saveDraft(touched ? { ...form, step } : null);
    }, 350);
    return () => clearTimeout(t);
  }, [form, step, hydrated, phase, saveDraft]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as string]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const next = () => {
    const e = validateStep(step, form);
    setErrors(e);
    if (Object.keys(e).length) {
      const first = document.querySelector<HTMLElement>('[aria-invalid="true"]');
      first?.focus();
      return;
    }
    if (step < 2) return go(step + 1);
    submit();
  };

  const submit = () => {
    if (looksLikeBot(honeypot, startedAt.current)) {
      if (honeypot) return; // silently drop bots
      setBotMsg("That was very fast. Take a second to check your answers, then submit again.");
      startedAt.current = Date.now() - 1500;
      return;
    }
    const p = toProject(form);
    setResult(p);
    setPhase("digging");
    track("project_buried");
    useRitual.getState().cast("verdict", p.name, 2600).then(() => {
      add(p);
      setPhase("done");
    });
  };

  const reset = () => {
    setForm(EMPTY);
    setStep(0);
    setErrors({});
    setRestored(false);
    saveDraft(null);
    setPhase("form");
    setResult(null);
    startedAt.current = Date.now();
  };

  if (phase !== "form" && result) {
    const a = assess(result, projects);
    const v = VERDICTS[a.verdict];
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-12">
        <AnimatePresence mode="wait">
          {phase === "digging" ? (
            <motion.div key="dig" className="mx-auto" exit={{ opacity: 0, scale: 0.96 }}>
              <GraveLoader label="Reading the stone" />
            </motion.div>
          ) : (
            <motion.section
              key="done"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full overflow-hidden rounded-xl border border-line bg-card p-6 text-center sm:p-8"
              aria-live="polite"
            >
              <p className="eyebrow">Verdict for</p>
              <h1 className="mt-2 font-display text-3xl font-semibold">{result.name}</h1>
              <div className="mt-10 mb-4 flex justify-center">
                <Burst color={v.color}>
                  <ScoreRing score={a.score} color={v.color} size={140} />
                </Burst>
              </div>
              <div className="mt-5 flex justify-center">
                <VerdictBadge verdict={a.verdict} size="lg" />
              </div>
              <p className="mt-2 font-medium">{v.path}</p>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-2">{a.reasons[a.reasons.length - 1]}</p>
              <div className="mt-7 flex flex-col items-center gap-3">
                <Link href={`/garden/${result.id}`} className="btn btn-primary w-full sm:w-auto">
                  {v.action}
                </Link>
                <button onClick={reset} className="text-sm font-medium text-moss hover:underline">
                  Bury another project
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 pb-10 sm:px-6">
      <p className="eyebrow">Autopsy</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Bury a project</h1>
      <p className="mt-2 text-ink-2">Three short steps. Every answer is saved as you type, so you can leave and come back.</p>

      <AnimatePresence>
        {restored && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line bg-dawn-soft/60 px-4 py-2.5 text-sm">
              <span>We restored the autopsy you started earlier.</span>
              <button className="font-medium text-moss hover:underline" onClick={reset}>
                Start fresh
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      <ol className="mt-8 grid grid-cols-3 gap-2" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button
              type="button"
              disabled={i > step}
              onClick={() => i < step && go(i)}
              aria-current={i === step ? "step" : undefined}
              className="w-full text-left disabled:cursor-default"
            >
              <div className="h-1 overflow-hidden rounded-[2px] bg-stone-light">
                <motion.div className="h-full bg-moss" initial={false} animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.4 }} />
              </div>
              <span className={`mt-2 block text-xs sm:text-sm ${i === step ? "font-semibold text-ink" : "text-ink-3"}`}>
                <span className="font-mono">{i + 1}.</span> {s}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <form
        noValidate
        className="relative mt-8"
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
      >
        <Honeypot value={honeypot} onChange={setHoneypot} />
        <div className="overflow-hidden rounded-xl border border-line bg-card">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.fieldset
              key={step}
              custom={dir}
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5 p-5 sm:p-7"
            >
              <legend className="sr-only">{STEPS[step]}</legend>
              <h2 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-semibold outline-none">
                {STEPS[step]}
              </h2>

              {step === 0 && (
                <>
                  <Field label="Project name" error={errors.name}>
                    {(p) => <input {...p} className="field" value={form.name} maxLength={60} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Pocket Planner" autoComplete="off" />}
                  </Field>
                  <Field label="What was it, in one line?" error={errors.pitch} hint={`${form.pitch.length}/200`}>
                    {(p) => <input {...p} className="field" value={form.pitch} maxLength={200} onChange={(e) => set("pitch", e.target.value)} placeholder="A weekly planner that turns a syllabus into a calendar" />}
                  </Field>
                  <Field label="What did you want it to become?" error={errors.goal} hint={`${form.goal.length}/300`}>
                    {(p) => <textarea {...p} rows={3} className="field resize-y" value={form.goal} maxLength={300} onChange={(e) => set("goal", e.target.value)} placeholder="Upload a syllabus, get every deadline with reminders a week before" />}
                  </Field>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Started around" error={errors.startedOn}>
                      {(p) => <input {...p} type="date" max={today()} className="field" value={form.startedOn} onChange={(e) => set("startedOn", e.target.value)} />}
                    </Field>
                    <Field label="Stopped around" error={errors.buriedOn}>
                      {(p) => <input {...p} type="date" max={today()} className="field" value={form.buriedOn} onChange={(e) => set("buriedOn", e.target.value)} />}
                    </Field>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Stack" optional hint="Comma separated, e.g. React, Node">
                      {(p) => <input {...p} className="field" value={form.stack} maxLength={160} onChange={(e) => set("stack", e.target.value)} />}
                    </Field>
                    <Field label="Tags" optional hint="Comma separated, e.g. students, calendar">
                      {(p) => <input {...p} className="field" value={form.tags} maxLength={160} onChange={(e) => set("tags", e.target.value)} />}
                    </Field>
                  </div>
                  <Field label="Repository link" optional error={errors.repoUrl}>
                    {(p) => <input {...p} type="url" inputMode="url" className="field" value={form.repoUrl} maxLength={200} onChange={(e) => set("repoUrl", e.target.value)} placeholder="https://github.com/you/project" />}
                  </Field>
                </>
              )}

              {step === 1 && (
                <>
                  <ListInput label="What did you finish?" placeholder="e.g. Login and signup" items={form.done} onChange={(v) => set("done", v)} error={errors.done} />
                  <ListInput label="What is still unfinished?" placeholder="e.g. Reminder notifications" items={form.left} onChange={(v) => set("left", v)} error={errors.left} />
                  <Slider label="Roughly how much of the plan did you build?" value={form.completion} min={0} max={100} step={5} suffix="%" onChange={(v) => set("completion", v)} />
                  <Slider label="How much work is left?" value={form.effortLeft} min={1} max={5} low="A little" high="A mountain" onChange={(v) => set("effortLeft", v)} />
                </>
              )}

              {step === 2 && (
                <>
                  <fieldset>
                    <legend className="text-sm font-medium">Why did you stop? Pick all that apply.</legend>
                    <div className="mt-2 flex flex-wrap gap-2" aria-describedby={errors.causes ? "causes-err" : undefined}>
                      {CAUSE_KEYS.map((c) => {
                        const on = form.causes.includes(c);
                        return (
                          <label
                            key={c}
                            className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-moss ${
                              on ? "border-ink bg-ink text-paper" : "border-line bg-card text-ink-2 hover:border-ink-3"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={on}
                              aria-invalid={!!errors.causes}
                              onChange={() => set("causes", on ? form.causes.filter((x) => x !== c) : [...form.causes, c])}
                            />
                            {CAUSES[c].label}
                          </label>
                        );
                      })}
                    </div>
                    {errors.causes && (
                      <p id="causes-err" role="alert" className="mt-1 text-sm text-clay">
                        {errors.causes}
                      </p>
                    )}
                  </fieldset>
                  <Field label="Anything else about why?" optional error={errors.causeNote} hint={`${form.causeNote.length}/400`}>
                    {(p) => <textarea {...p} rows={2} className="field resize-y" value={form.causeNote} maxLength={400} onChange={(e) => set("causeNote", e.target.value)} placeholder="Kept adding features before the core worked" />}
                  </Field>
                  <Slider label="How strong does the idea feel today?" value={form.ideaStrength} min={1} max={5} low="Weak" high="Strong" onChange={(v) => set("ideaStrength", v)} />
                  <Slider label="Does the problem it solves still exist?" value={form.relevance} min={1} max={5} low="Gone" high="Very much" onChange={(v) => set("relevance", v)} />
                  <Slider label="How much do you want to work on it now?" value={form.interest} min={1} max={5} low="Not really" high="Badly" onChange={(v) => set("interest", v)} />
                  <Field label="Epitaph" optional error={errors.epitaph} hint="One line it will be remembered by. We will write one if you skip it.">
                    {(p) => <input {...p} className="field font-display italic" value={form.epitaph} maxLength={90} onChange={(e) => set("epitaph", e.target.value)} placeholder="Tried to plan everything, finished planning nothing." />}
                  </Field>
                </>
              )}
            </motion.fieldset>
          </AnimatePresence>
        </div>

        {botMsg && (
          <p role="alert" className="mt-3 text-sm text-clay">
            {botMsg}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          {step > 0 ? (
            <button type="button" className="btn btn-ghost" onClick={() => go(step - 1)}>
              Back
            </button>
          ) : (
            <span />
          )}
          <button type="submit" className="btn btn-primary !px-5">
            {step < 2 ? "Continue" : "Get the verdict"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ListInput({
  label,
  placeholder,
  items,
  onChange,
  error,
}: {
  label: string;
  placeholder: string;
  items: string[];
  onChange: (v: string[]) => void;
  error?: string;
}) {
  const [val, setVal] = useState("");
  const [local, setLocal] = useState("");
  const addItem = () => {
    const v = val.trim();
    if (!v) return;
    if (v.length > 120) return setLocal("Keep each item under 120 characters.");
    if (items.some((i) => i.toLowerCase() === v.toLowerCase())) return setLocal("Already on the list.");
    if (items.length >= 15) return setLocal("15 items is plenty. Group the rest.");
    onChange([...items, v]);
    setVal("");
    setLocal("");
  };
  const msg = local || error;
  return (
    <Field label={label} error={msg} hint="Press Enter or Add after each item">
      {(p) => (
        <div>
          <div className="flex gap-2">
            <input
              {...p}
              className="field"
              value={val}
              placeholder={placeholder}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addItem();
                }
              }}
            />
            <button type="button" className="btn btn-ghost" onClick={addItem}>
              Add
            </button>
          </div>
          <ul className="mt-2 flex flex-wrap gap-2">
            <AnimatePresence initial={false}>
              {items.map((it) => (
                <motion.li
                  key={it}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="inline-flex items-center gap-1.5 rounded-[4px] border border-line bg-paper py-1 pr-1 pl-2.5 text-sm"
                >
                  {it}
                  <button
                    type="button"
                    className="rounded px-1 text-ink-3 hover:text-clay"
                    aria-label={`Remove ${it}`}
                    onClick={() => onChange(items.filter((x) => x !== it))}
                  >
                    ×
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </Field>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  low,
  high,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  low?: string;
  high?: string;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={label}>
      {(p) => (
        <div>
          <div className="flex items-center gap-3">
            <input
              {...p}
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-full accent-[var(--moss)]"
            />
            <output className="w-12 text-right font-mono text-sm">
              {value}
              {suffix ?? `/${max}`}
            </output>
          </div>
          {low && high && (
            <div className="flex justify-between pr-14 text-[11px] text-ink-3" aria-hidden="true">
              <span>{low}</span>
              <span>{high}</span>
            </div>
          )}
        </div>
      )}
    </Field>
  );
}
