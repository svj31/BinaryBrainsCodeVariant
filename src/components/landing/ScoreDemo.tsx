"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { assess } from "@/lib/score";
import { CAUSES, CAUSE_KEYS, VERDICTS } from "@/lib/verdicts";
import type { Cause, Project, ScoreInputs } from "@/lib/types";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { FactorBars } from "@/components/ui/FactorBars";
import { VerdictBadge } from "@/components/ui/VerdictBadge";

const SLIDERS: { key: keyof ScoreInputs; label: string; min: number; max: number; low: string; high: string }[] = [
  { key: "ideaStrength", label: "How strong is the idea today?", min: 1, max: 5, low: "Weak", high: "Strong" },
  { key: "completion", label: "How much did you build?", min: 0, max: 100, low: "0%", high: "100%" },
  { key: "effortLeft", label: "How much work is left?", min: 1, max: 5, low: "A little", high: "A mountain" },
  { key: "relevance", label: "Does the problem still exist?", min: 1, max: 5, low: "Gone", high: "Very much" },
  { key: "interest", label: "Do you want to work on it now?", min: 1, max: 5, low: "Not really", high: "Badly" },
];

const base: Project = {
  id: "demo",
  name: "Your project",
  pitch: "",
  goal: "",
  done: ["Part one", "Part two"],
  left: ["Part three", "Part four", "Part five"],
  causes: ["scope-creep"],
  causeNote: "",
  tags: [],
  stack: [],
  startedOn: "2026-01-01",
  buriedOn: "2026-03-01",
  status: "resting",
  epitaph: "",
  inputs: { ideaStrength: 4, completion: 45, effortLeft: 3, relevance: 4, interest: 4 },
  timeline: [],
  organs: [],
};

export function ScoreDemo() {
  const [inputs, setInputs] = useState<ScoreInputs>(base.inputs);
  const [cause, setCause] = useState<Cause>("scope-creep");
  const a = useMemo(() => assess({ ...base, inputs, causes: [cause] }), [inputs, cause]);
  const v = VERDICTS[a.verdict];

  return (
    <div className="grid gap-6 rounded-xl border border-line bg-card p-5 sm:p-8 lg:grid-cols-[1.1fr_1fr]">
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()} aria-label="Try the Resurrection Score">
        {SLIDERS.map((s) => (
          <div key={s.key}>
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor={`demo-${s.key}`} className="text-sm font-medium text-ink">
                {s.label}
              </label>
              <output htmlFor={`demo-${s.key}`} className="font-mono text-xs text-ink-2">
                {inputs[s.key]}
                {s.key === "completion" ? "%" : ` / ${s.max}`}
              </output>
            </div>
            <input
              id={`demo-${s.key}`}
              type="range"
              min={s.min}
              max={s.max}
              step={s.key === "completion" ? 5 : 1}
              value={inputs[s.key]}
              onChange={(e) => setInputs((p) => ({ ...p, [s.key]: Number(e.target.value) }))}
              className="mt-2 w-full accent-[var(--moss)]"
            />
            <div className="flex justify-between text-[11px] text-ink-3" aria-hidden="true">
              <span>{s.low}</span>
              <span>{s.high}</span>
            </div>
          </div>
        ))}
        <div>
          <label htmlFor="demo-cause" className="text-sm font-medium text-ink">
            Why did it stop?
          </label>
          <select
            id="demo-cause"
            className="field mt-2"
            value={cause}
            onChange={(e) => setCause(e.target.value as Cause)}
          >
            {CAUSE_KEYS.map((c) => (
              <option key={c} value={c}>
                {CAUSES[c].label}
              </option>
            ))}
          </select>
        </div>
      </form>

      <div className="flex flex-col rounded-lg border border-line-2 bg-paper p-5" aria-live="polite">
        <div className="flex items-center gap-5">
          <ScoreRing score={a.score} color={v.color} size={112} />
          <div>
            <p className="eyebrow">Verdict</p>
            <AnimatePresence mode="wait">
              <motion.div
                key={a.verdict}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mt-1.5">
                  <VerdictBadge verdict={a.verdict} size="lg" />
                </div>
                <p className="mt-2 text-sm font-medium text-ink">{v.path}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="mt-6">
          <FactorBars factors={a.factors} compact />
        </div>
        <p className="mt-5 border-t border-line-2 pt-4 text-sm leading-relaxed text-ink-2">{a.reasons[a.reasons.length - 1]}</p>
      </div>
    </div>
  );
}
