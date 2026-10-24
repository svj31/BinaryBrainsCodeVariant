export type Cause =
  | "scope-creep"
  | "no-time"
  | "lost-interest"
  | "tech-blocker"
  | "team-left"
  | "better-idea"
  | "market-gone"
  | "burnout";

export type Verdict = "revive" | "pivot" | "salvage" | "merge" | "archive";

export type Status = "resting" | "reviving" | "alive" | "archived";

export interface ScoreInputs {
  /** 1 to 5, how strong the idea still feels */
  ideaStrength: number;
  /** 0 to 100, rough share of the original plan that got built */
  completion: number;
  /** 1 to 5, how much effort is left (5 = a mountain) */
  effortLeft: number;
  /** 1 to 5, how relevant the problem still is today */
  relevance: number;
  /** 1 to 5, how much the owner wants to work on it now */
  interest: number;
}

export interface TimelineEvent {
  date: string; // ISO date
  kind: "born" | "peak" | "stall" | "buried" | "afterlife";
  note: string;
}

export interface Organ {
  id: string;
  name: string;
  kind: "component" | "api" | "design" | "dataset" | "script" | "research";
  note: string;
}

export interface Project {
  id: string;
  name: string;
  pitch: string; // what it was
  goal: string; // what you wanted to build
  done: string[]; // what you finished
  left: string[]; // what is left
  causes: Cause[];
  causeNote: string;
  tags: string[];
  stack: string[];
  repoUrl?: string;
  startedOn: string;
  buriedOn: string;
  status: Status;
  epitaph: string;
  inputs: ScoreInputs;
  timeline: TimelineEvent[];
  organs: Organ[];
  chosenPath?: Verdict;
  sprintProgress?: boolean[];
  remindOn?: string;
}

export interface ScoreFactor {
  key: keyof ScoreInputs | "fixable";
  label: string;
  value: number; // 0..1
  weight: number;
}

export interface Assessment {
  score: number;
  verdict: Verdict;
  factors: ScoreFactor[];
  reasons: string[];
  mergeWith?: { id: string; name: string; overlap: string[] };
}
