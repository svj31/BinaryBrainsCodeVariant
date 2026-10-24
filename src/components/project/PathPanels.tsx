"use client";

import Link from "next/link";
import { Tick } from "@/components/ui/Tick";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sprintPlan, assess } from "@/lib/score";
import { useGraveyard } from "@/lib/store";
import type { Assessment, Organ, Project } from "@/lib/types";
import { VERDICTS } from "@/lib/verdicts";
import { track } from "@/lib/consent";

const ease = [0.22, 1, 0.36, 1] as const;

export function SprintPanel({ project }: { project: Project }) {
  const toggle = useGraveyard((s) => s.toggleSprintDay);
  const plan = sprintPlan(project);
  const progress = project.sprintProgress ?? Array(7).fill(false);
  const done = progress.filter(Boolean).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold">7-day sprint</h3>
          <p className="text-sm text-ink-2">Shrunk to the core loop. Three milestones. Tick a day when it is done.</p>
        </div>
        <p className="font-mono text-sm text-ink-2" aria-live="polite">
          {done}/7 days
        </p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-[2px] bg-stone-light" aria-hidden="true">
        <motion.div className="h-full bg-moss" animate={{ width: `${(done / 7) * 100}%` }} transition={{ duration: 0.5, ease }} />
      </div>
      <AnimatePresence>
        {project.status === "alive" && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 rounded-md border border-moss bg-moss-soft px-4 py-3 text-sm font-medium text-moss"
          >
            Alive again. {project.name} has left the graveyard. It stays in your garden as a reminder that it came back.
          </motion.p>
        )}
      </AnimatePresence>
      <ol className="mt-5 grid gap-3 md:grid-cols-2">
        {plan.map((d, i) => (
          <li key={d.day}>
            <label
              className={`flex h-full cursor-pointer gap-3 rounded-lg border p-4 transition-colors ${
                progress[i] ? "border-moss bg-moss-soft/60" : "border-line bg-card hover:border-ink-3"
              }`}
            >
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--moss)]"
                checked={!!progress[i]}
                onChange={() => {
                  toggle(project.id, i);
                  track("sprint_day", { day: d.day });
                }}
              />
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-ink-3">Day {d.day}</span>
                  <span className="font-semibold">{d.title}</span>
                  {d.milestone && (
                    <span className="rounded-[4px] bg-dawn-soft px-1.5 py-0.5 text-[11px] font-medium text-[#7a4a0b]">
                      Milestone: {d.milestone}
                    </span>
                  )}
                </span>
                <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-sm text-ink-2">
                  {d.tasks.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </span>
            </label>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function PivotPanel({ project }: { project: Project }) {
  const update = useGraveyard((s) => s.update);
  const [note, setNote] = useState("");
  const audiences = ["a different audience", "a smaller, sharper use case", "an internal tool for yourself"];
  return (
    <div>
      <h3 className="font-display text-xl font-semibold">Pivot sketch</h3>
      <p className="text-sm text-ink-2">Keep what works, change what it is for. Fill one line per box.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-line bg-card p-4">
          <p className="eyebrow">Keep</p>
          <ul className="mt-2 space-y-1 text-sm">
            {project.done.map((d) => (
              <li key={d} className="flex gap-2">
                <Tick />
                {d}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-line bg-card p-4">
          <p className="eyebrow">Drop</p>
          <ul className="mt-2 space-y-1 text-sm text-ink-2">
            {project.left.slice(Math.ceil(project.left.length / 2)).map((d) => (
              <li key={d} className="line-through decoration-ink-3">
                {d}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-line bg-card p-4">
          <p className="eyebrow">Aim it at</p>
          <ul className="mt-2 space-y-1 text-sm">
            {audiences.map((a) => (
              <li key={a}>
                {project.tags[0] ? `${project.tags[0]} for ` : ""}
                {a}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <form
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!note.trim()) return;
          update(project.id, {
            pitch: note.trim(),
            timeline: [...project.timeline, { date: new Date().toISOString().slice(0, 10), kind: "afterlife", note: `Pivoted: ${note.trim()}` }],
          });
          setNote("");
        }}
      >
        <label htmlFor="pivot-note" className="text-sm font-medium">
          The new one-line pitch
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="pivot-note"
            className="field"
            maxLength={140}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={`e.g. ${project.name} for club organisers instead of students`}
          />
          <button className="btn btn-primary" disabled={!note.trim()}>
            Save pivot
          </button>
        </div>
      </form>
    </div>
  );
}

export function SalvagePanel({ project }: { project: Project }) {
  const update = useGraveyard((s) => s.update);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<Organ["kind"]>("component");
  const [err, setErr] = useState("");

  return (
    <div>
      <h3 className="font-display text-xl font-semibold">Parts worth keeping</h3>
      <p className="text-sm text-ink-2">
        Everything here shows up in the{" "}
        <Link href="/salvage" className="font-medium text-moss underline underline-offset-2">
          Salvage Yard
        </Link>{" "}
        so future projects can borrow it.
      </p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        <AnimatePresence initial={false}>
          {project.organs.map((o) => (
            <motion.li
              key={o.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="flex items-start justify-between gap-3 rounded-lg border border-line bg-card p-3"
            >
              <div>
                <p className="font-medium">{o.name}</p>
                <p className="text-xs text-ink-3">
                  {o.kind}
                  {o.note ? ` · ${o.note}` : ""}
                </p>
              </div>
              <button
                className="text-xs text-ink-3 hover:text-clay"
                aria-label={`Remove ${o.name}`}
                onClick={() => update(project.id, { organs: project.organs.filter((x) => x.id !== o.id) })}
              >
                Remove
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
        {project.organs.length === 0 && <li className="text-sm text-ink-3">No parts saved yet.</li>}
      </ul>
      <form
        noValidate
        className="mt-4 grid gap-2 sm:grid-cols-[1fr_160px_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          const n = name.trim();
          if (n.length < 3) return setErr("Give the part a name of at least 3 characters.");
          if (project.organs.some((o) => o.name.toLowerCase() === n.toLowerCase())) return setErr("That part is already saved.");
          update(project.id, { organs: [...project.organs, { id: `${project.id}-${Date.now()}`, name: n, kind, note: "" }] });
          setName("");
          setErr("");
          track("organ_saved");
        }}
      >
        <div>
          <label htmlFor="organ-name" className="sr-only">
            Part name
          </label>
          <input
            id="organ-name"
            className="field"
            placeholder="e.g. Login form with validation"
            value={name}
            maxLength={80}
            aria-invalid={!!err}
            aria-describedby={err ? "organ-err" : undefined}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="organ-kind" className="sr-only">
            Part type
          </label>
          <select id="organ-kind" className="field" value={kind} onChange={(e) => setKind(e.target.value as Organ["kind"])}>
            {(["component", "api", "design", "dataset", "script", "research"] as const).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary">Save part</button>
        {err && (
          <p id="organ-err" role="alert" className="text-sm text-clay sm:col-span-3">
            {err}
          </p>
        )}
      </form>
    </div>
  );
}

export function MergePanel({ project, a }: { project: Project; a: Assessment }) {
  const projects = useGraveyard((s) => s.projects);
  const add = useGraveyard((s) => s.add);
  const choose = useGraveyard((s) => s.choosePath);
  const [created, setCreated] = useState<string | null>(null);
  const other = a.mergeWith ? projects.find((p) => p.id === a.mergeWith!.id) : undefined;

  if (!other || !a.mergeWith) {
    return (
      <div>
        <h3 className="font-display text-xl font-semibold">Frankenstein mode</h3>
        <p className="mt-1 text-sm text-ink-2">
          No buried project shares enough tags or stack with this one yet. Merges are suggested when two projects share
          at least three.
        </p>
      </div>
    );
  }

  const combined: Project = {
    ...project,
    id: `${project.id}-x-${other.id}`.slice(0, 60),
    name: `${project.name} × ${other.name}`,
    pitch: `${project.pitch} Combined with ${other.name}: ${other.pitch.charAt(0).toLowerCase()}${other.pitch.slice(1)}`,
    goal: `One product that does both: ${project.goal} ${other.goal}`,
    done: [...project.done, ...other.done],
    left: [...project.left.slice(0, 2), ...other.left.slice(0, 2)],
    tags: Array.from(new Set([...project.tags, ...other.tags])),
    stack: Array.from(new Set([...project.stack, ...other.stack])),
    organs: [...project.organs, ...other.organs],
    status: "reviving",
    chosenPath: "revive",
    sprintProgress: Array(7).fill(false),
    epitaph: "Two half lives make one whole.",
    inputs: {
      ideaStrength: Math.max(project.inputs.ideaStrength, other.inputs.ideaStrength),
      completion: Math.min(90, Math.round((project.inputs.completion + other.inputs.completion) / 1.6)),
      effortLeft: Math.max(1, Math.min(project.inputs.effortLeft, other.inputs.effortLeft)),
      relevance: Math.max(project.inputs.relevance, other.inputs.relevance),
      interest: Math.min(5, Math.max(project.inputs.interest, other.inputs.interest) + 1),
    },
    startedOn: new Date().toISOString().slice(0, 10),
    buriedOn: new Date().toISOString().slice(0, 10),
    timeline: [{ date: new Date().toISOString().slice(0, 10), kind: "born", note: `Stitched from ${project.name} and ${other.name}` }],
  };
  const newScore = assess(combined, projects).score;

  return (
    <div id="merge" className="scroll-mt-24">
      <h3 className="font-display text-xl font-semibold">Frankenstein mode</h3>
      <p className="text-sm text-ink-2">
        Both share <strong className="font-semibold text-ink">{a.mergeWith.overlap.join(", ")}</strong>. Here is what a
        stitched build would look like.
      </p>
      <div className="mt-4 grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {[project, other].map((p, i) => (
          <MergeCard key={p.id} p={p} sep={i === 0} />
        ))}
        <div className="flex items-center justify-center font-mono text-ink-3" aria-hidden="true">
          =
        </div>
        <div className="rounded-lg border-2 border-moss bg-moss-soft/50 p-4">
          <p className="eyebrow">Combined</p>
          <p className="mt-1 font-display text-lg font-semibold">{combined.name}</p>
          <p className="mt-1 text-sm text-ink-2">
            {combined.done.length} finished parts, {combined.left.length} left. Estimated score{" "}
            <strong className="font-mono text-moss">{newScore}</strong>.
          </p>
        </div>
      </div>
      {created ? (
        <p className="mt-4 text-sm">
          Created.{" "}
          <Link href={`/garden/${created}`} className="font-semibold text-moss underline underline-offset-2">
            Open the combined project
          </Link>
        </p>
      ) : (
        <button
          className="btn btn-primary mt-4"
          onClick={() => {
            const exists = projects.some((p) => p.id === combined.id);
            if (!exists) add(combined);
            choose(project.id, "merge");
            choose(other.id, "merge");
            setCreated(combined.id);
            track("merge_created");
          }}
        >
          Stitch them together
        </button>
      )}
    </div>
  );
}

function MergeCard({ p, sep }: { p: Project; sep: boolean }) {
  return (
    <>
      <div className="rounded-lg border border-line bg-card p-4">
        <p className="font-display text-lg font-semibold">{p.name}</p>
        <p className="mt-1 line-clamp-3 text-sm text-ink-2">{p.pitch}</p>
        <p className="mt-2 font-mono text-xs text-ink-3">{p.stack.join(" · ")}</p>
      </div>
      <div className="flex items-center justify-center font-mono text-ink-3" aria-hidden="true">
        {sep ? "+" : ""}
      </div>
    </>
  );
}

export function ArchivePanel({ project }: { project: Project }) {
  const update = useGraveyard((s) => s.update);
  const setStatus = useGraveyard((s) => s.setStatus);
  const [epitaph, setEpitaph] = useState(project.epitaph);
  const [lesson, setLesson] = useState("");
  const [err, setErr] = useState("");
  const archived = project.status === "archived";

  return (
    <div>
      <h3 className="font-display text-xl font-semibold">Lay it to rest</h3>
      <p className="text-sm text-ink-2">An epitaph and one lesson. Then the folder can close without guilt.</p>
      <form
        noValidate
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (epitaph.trim().length < 4) return setErr("Write an epitaph of at least 4 characters.");
          setErr("");
          update(project.id, { epitaph: epitaph.trim() });
          setStatus(project.id, "archived", lesson.trim() ? `Archived. Lesson: ${lesson.trim()}` : "Archived with an epitaph");
          track("archived");
        }}
      >
        <div>
          <label htmlFor="epitaph" className="text-sm font-medium">
            Epitaph
          </label>
          <input
            id="epitaph"
            className="field mt-1 font-display italic"
            value={epitaph}
            maxLength={90}
            aria-invalid={!!err}
            aria-describedby={err ? "epitaph-err" : "epitaph-hint"}
            onChange={(e) => setEpitaph(e.target.value)}
          />
          <p id="epitaph-hint" className="mt-1 text-xs text-ink-3">
            {epitaph.length}/90
          </p>
          {err && (
            <p id="epitaph-err" role="alert" className="text-sm text-clay">
              {err}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="lesson" className="text-sm font-medium">
            What did it teach you? <span className="font-normal text-ink-3">(optional)</span>
          </label>
          <input
            id="lesson"
            className="field mt-1"
            value={lesson}
            maxLength={140}
            onChange={(e) => setLesson(e.target.value)}
            placeholder="e.g. Ship the core before adding social features"
          />
        </div>
        <button className="btn btn-primary" disabled={archived}>
          {archived ? "Archived" : "Archive with this epitaph"}
        </button>
      </form>
    </div>
  );
}

export function PathBody({ project, a }: { project: Project; a: Assessment }) {
  const path = project.chosenPath ?? a.verdict;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={path}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease }}
        aria-label={`${VERDICTS[path].label} plan`}
        role="region"
      >
        {path === "revive" && <SprintPanel project={project} />}
        {path === "pivot" && <PivotPanel project={project} />}
        {path === "salvage" && <SalvagePanel project={project} />}
        {path === "merge" && <MergePanel project={project} a={a} />}
        {path === "archive" && <ArchivePanel project={project} />}
      </motion.div>
    </AnimatePresence>
  );
}
