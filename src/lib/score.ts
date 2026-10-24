import type { Assessment, Project, ScoreFactor, Verdict } from "./types";
import { CAUSES } from "./verdicts";

const scale5 = (n: number) => (Math.min(5, Math.max(1, n)) - 1) / 4;

export function fixability(project: Pick<Project, "causes">): number {
  if (project.causes.length === 0) return 0.5;
  const sum = project.causes.reduce((acc, c) => acc + CAUSES[c].fixable, 0);
  return sum / project.causes.length;
}

export function factorsFor(project: Pick<Project, "inputs" | "causes">): ScoreFactor[] {
  const i = project.inputs;
  return [
    { key: "ideaStrength", label: "Idea strength", value: scale5(i.ideaStrength), weight: 0.2 },
    { key: "completion", label: "Work completed", value: Math.min(100, Math.max(0, i.completion)) / 100, weight: 0.15 },
    { key: "effortLeft", label: "Effort remaining", value: 1 - scale5(i.effortLeft), weight: 0.15 },
    { key: "fixable", label: "Cause is fixable", value: fixability(project), weight: 0.15 },
    { key: "relevance", label: "Still relevant", value: scale5(i.relevance), weight: 0.15 },
    { key: "interest", label: "Your interest now", value: scale5(i.interest), weight: 0.2 },
  ];
}

export function overlap(a: Project, b: Project): string[] {
  const bt = new Set([...b.tags, ...b.stack].map((t) => t.toLowerCase()));
  return Array.from(new Set([...a.tags, ...a.stack].filter((t) => bt.has(t.toLowerCase()))));
}

function findMerge(project: Project, others: Project[]) {
  let best: { id: string; name: string; overlap: string[] } | undefined;
  for (const o of others) {
    if (o.id === project.id || o.status === "archived" || o.status === "alive") continue;
    const shared = overlap(project, o);
    if (shared.length >= 3 && (!best || shared.length > best.overlap.length)) {
      best = { id: o.id, name: o.name, overlap: shared };
    }
  }
  return best;
}

/**
 * Rule-based Resurrection Score. Every verdict can be traced back to the
 * inputs, which is the point: the user should be able to argue with it.
 */
export function assess(project: Project, all: Project[] = []): Assessment {
  const factors = factorsFor(project);
  const raw = factors.reduce((acc, f) => acc + f.value * f.weight, 0);
  const score = Math.round(raw * 100);
  const i = project.inputs;
  const mergeWith = findMerge(project, all);

  let verdict: Verdict;
  if (score >= 68 && i.interest >= 4) verdict = "revive";
  else if (score < 35) verdict = i.completion >= 40 ? "salvage" : "archive";
  else if (i.completion >= 45 && i.interest <= 2) verdict = "salvage";
  else if (mergeWith && score < 68) verdict = "merge";
  else if (i.relevance <= 2 || (i.ideaStrength >= 4 && i.effortLeft >= 4)) verdict = "pivot";
  else if (score >= 55) verdict = "revive";
  else if (i.completion >= 30) verdict = "salvage";
  else verdict = "pivot";

  return { score, verdict, factors, reasons: explain(project, factors, verdict, mergeWith), mergeWith };
}

function explain(
  project: Project,
  factors: ScoreFactor[],
  verdict: Verdict,
  mergeWith: Assessment["mergeWith"],
): string[] {
  const sorted = [...factors].sort((a, b) => b.value - a.value);
  const strong = sorted[0];
  const weak = sorted[sorted.length - 1];
  const reasons: string[] = [];

  reasons.push(`Strongest signal: ${strong.label.toLowerCase()} (${Math.round(strong.value * 100)}/100).`);
  reasons.push(`Weakest signal: ${weak.label.toLowerCase()} (${Math.round(weak.value * 100)}/100).`);

  if (project.causes.length) {
    const main = CAUSES[project.causes[0]];
    reasons.push(`It stopped because of ${main.label.toLowerCase()}. ${main.hint}`);
  }

  switch (verdict) {
    case "revive":
      reasons.push(`You still want to build it and ${project.left.length} open item${project.left.length === 1 ? "" : "s"} can fit a one-week sprint.`);
      break;
    case "pivot":
      reasons.push("The idea has value, but the original problem or scope no longer fits. Change the target, keep the code.");
      break;
    case "salvage":
      reasons.push(`${project.done.length} finished piece${project.done.length === 1 ? "" : "s"} could live on in other builds even if this one does not.`);
      break;
    case "merge":
      if (mergeWith) reasons.push(`It shares ${mergeWith.overlap.slice(0, 3).join(", ")} with ${mergeWith.name}. One combined build beats two stalled ones.`);
      break;
    case "archive":
      reasons.push("Low interest and low relevance together. Archiving frees the headspace without erasing the lessons.");
      break;
  }
  return reasons;
}

export interface SprintDay {
  day: number;
  title: string;
  tasks: string[];
  milestone?: string;
}

/** Turns the "what is left" list into a shrunk 7-day plan with 3 milestones. */
export function sprintPlan(project: Project): SprintDay[] {
  const left = project.left.length ? project.left : ["Define the smallest version worth shipping"];
  const core = left.slice(0, Math.max(1, Math.ceil(left.length * 0.6)));
  const cut = left.slice(core.length);
  const pick = (n: number) => core[n % core.length];

  return [
    { day: 1, title: "Dig it up", tasks: ["Clone the repo and get it running locally", "Re-read your autopsy notes", `Cut scope: park ${cut.length ? cut.map((c) => `"${c}"`).join(", ") : "anything not in the core loop"}`] },
    { day: 2, title: "Fix the blocker", tasks: [`Work on: ${pick(0)}`, "Write down the one thing that stopped you last time"], milestone: "Runs again" },
    { day: 3, title: "Core loop", tasks: [`Work on: ${pick(1)}`, "Make one full path work end to end, even if ugly"] },
    { day: 4, title: "Core loop", tasks: [`Work on: ${pick(2)}`, "Test it with one real use case"], milestone: "Core loop works" },
    { day: 5, title: "Rough edges", tasks: ["Fix the three most annoying bugs", "Add empty and error states"] },
    { day: 6, title: "Show someone", tasks: ["Deploy a preview", "Ask one person to try it and watch quietly"] },
    { day: 7, title: "Ship the small version", tasks: ["Write a short README", "Decide the next step from what you learned"], milestone: "Alive again" },
  ];
}
