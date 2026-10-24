import type { Cause, Verdict } from "./types";

export const VERDICTS: Record<
  Verdict,
  { label: string; path: string; blurb: string; action: string; color: string; soft: string }
> = {
  revive: {
    label: "Revive",
    path: "Restart or continue",
    blurb: "The idea holds up and the reason it stopped can be fixed. Pick it back up with a smaller scope.",
    action: "Start the 7-day sprint",
    color: "var(--c-revive)",
    soft: "var(--c-revive-soft)",
  },
  pivot: {
    label: "Pivot",
    path: "Change the idea",
    blurb: "The work is useful but the original target moved. Keep the engine, aim it at a new problem.",
    action: "Sketch the pivot",
    color: "var(--c-pivot)",
    soft: "var(--c-pivot-soft)",
  },
  salvage: {
    label: "Salvage",
    path: "Repurpose the parts",
    blurb: "You probably won't finish this one, but pieces of it are worth keeping. Move them to the Salvage Yard.",
    action: "Send parts to the yard",
    color: "var(--c-salvage)",
    soft: "var(--c-salvage-soft)",
  },
  merge: {
    label: "Merge",
    path: "Combine with a sibling",
    blurb: "Another buried project overlaps with this one. Together they make one stronger build.",
    action: "Open Frankenstein mode",
    color: "var(--c-merge)",
    soft: "var(--c-merge-soft)",
  },
  archive: {
    label: "Archive",
    path: "Rest with an epitaph",
    blurb: "Letting go is a valid outcome. Write down what it taught you and close the folder with a clear head.",
    action: "Write the epitaph",
    color: "var(--c-archive)",
    soft: "var(--c-archive-soft)",
  },
};

export const VERDICT_ORDER: Verdict[] = ["revive", "pivot", "salvage", "merge", "archive"];

export const CAUSES: Record<Cause, { label: string; fixable: number; hint: string }> = {
  "scope-creep": { label: "Scope creep", fixable: 0.85, hint: "Cut it down to one core loop and it usually comes back to life." },
  "no-time": { label: "Ran out of time", fixable: 0.75, hint: "Time comes back. A short sprint fits into most weeks." },
  "tech-blocker": { label: "Hit a technical wall", fixable: 0.7, hint: "Tools have moved on since. The wall may be lower now." },
  burnout: { label: "Burnout", fixable: 0.6, hint: "Fixable, but only at a gentle pace." },
  "team-left": { label: "Team moved on", fixable: 0.55, hint: "Solo is possible if the scope shrinks to match one person." },
  "lost-interest": { label: "Lost interest", fixable: 0.4, hint: "Interest rarely returns by force. Check how you feel today." },
  "better-idea": { label: "A better idea came along", fixable: 0.35, hint: "Its parts might feed the idea that replaced it." },
  "market-gone": { label: "Problem went away", fixable: 0.2, hint: "The original need faded. A pivot is the honest route." },
};

export const CAUSE_KEYS = Object.keys(CAUSES) as Cause[];
