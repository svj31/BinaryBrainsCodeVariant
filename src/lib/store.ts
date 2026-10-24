"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { assess } from "./score";
import { createJSONStorage, persist } from "zustand/middleware";
import { SEED } from "./seed";
import type { Project, Status, Verdict } from "./types";

export type DraftAutopsy = Record<string, unknown>;

interface GraveyardState {
  projects: Project[];
  draft: DraftAutopsy | null;
  hydrated: boolean;
  add: (p: Project) => void;
  update: (id: string, patch: Partial<Project>) => void;
  choosePath: (id: string, path: Verdict) => void;
  setStatus: (id: string, status: Status, note: string) => void;
  toggleSprintDay: (id: string, day: number) => void;
  remove: (id: string) => void;
  saveDraft: (d: DraftAutopsy | null) => void;
  resetDemo: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export const useGraveyard = create<GraveyardState>()(
  persist(
    (set) => ({
      projects: SEED,
      draft: null,
      hydrated: false,
      add: (p) => set((s) => ({ projects: [p, ...s.projects], draft: null })),
      update: (id, patch) =>
        set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      choosePath: (id, path) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id
              ? {
                  ...p,
                  chosenPath: path,
                  status: path === "archive" ? "archived" : path === "revive" ? "reviving" : p.status,
                  sprintProgress: path === "revive" ? p.sprintProgress ?? Array(7).fill(false) : p.sprintProgress,
                }
              : p,
          ),
        })),
      setStatus: (id, status, note) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id
              ? { ...p, status, timeline: [...p.timeline, { date: today(), kind: "afterlife", note }] }
              : p,
          ),
        })),
      toggleSprintDay: (id, day) =>
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== id) return p;
            const prog = [...(p.sprintProgress ?? Array(7).fill(false))];
            prog[day] = !prog[day];
            const finished = prog.every(Boolean);
            return {
              ...p,
              sprintProgress: prog,
              status: finished ? "alive" : p.status === "alive" ? "reviving" : p.status,
              timeline:
                finished && p.status !== "alive"
                  ? [...p.timeline, { date: today(), kind: "afterlife", note: "Finished the 7-day sprint. Alive again." }]
                  : p.timeline,
            };
          }),
        })),
      remove: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
      saveDraft: (draft) => set({ draft }),
      resetDemo: () => set({ projects: SEED, draft: null }),
    }),
    {
      name: "secondwind-graveyard-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ projects: s.projects, draft: s.draft }),
      skipHydration: true,
      onRehydrateStorage: () => () => {
        useGraveyard.setState({ hydrated: true });
      },
    },
  ),
);

export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${base || "project"}-${Math.random().toString(36).slice(2, 6)}`;
}

export function useAssessed() {
  const projects = useGraveyard((s) => s.projects);
  return useMemo(() => projects.map((p) => ({ project: p, a: assess(p, projects) })), [projects]);
}

export type Assessed = ReturnType<typeof useAssessed>[number];
