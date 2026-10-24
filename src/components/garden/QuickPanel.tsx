"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Assessed } from "@/lib/store";
import { VERDICTS, CAUSES } from "@/lib/verdicts";
import { ago } from "@/lib/format";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { FactorBars } from "@/components/ui/FactorBars";
import { StatusTag, VerdictBadge } from "@/components/ui/VerdictBadge";

export function QuickPanel({ item, onClose }: { item: Assessed; onClose?: () => void }) {
  const { project: p, a } = item;
  const v = VERDICTS[a.verdict];
  return (
    <motion.article
      key={p.id}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col rounded-xl border border-line bg-card p-5 shadow-[0_18px_50px_-30px_rgba(30,39,33,0.45)]"
      aria-labelledby={`qp-${p.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id={`qp-${p.id}`} className="font-display text-2xl font-semibold leading-tight">
            {p.name}
          </h2>
          <p className="mt-1 text-sm text-ink-3">
            Buried {ago(p.buriedOn)} · {p.causes.map((c) => CAUSES[c].label.toLowerCase()).join(", ")}
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-md p-1.5 text-ink-3 hover:bg-paper hover:text-ink" aria-label="Close details">
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-2">{p.pitch}</p>

      <div className="mt-5 flex items-center gap-4">
        <ScoreRing score={a.score} size={96} color={v.color} />
        <div className="space-y-2">
          <VerdictBadge verdict={a.verdict} size="lg" />
          <p className="text-sm font-medium">{v.path}</p>
          <StatusTag status={p.status} />
        </div>
      </div>

      <div className="mt-5">
        <FactorBars factors={a.factors} compact />
      </div>

      <p className="mt-4 font-display text-[0.95rem] italic text-ink-2">&ldquo;{p.epitaph}&rdquo;</p>

      <div className="mt-auto flex flex-col gap-2 pt-5">
        <Link href={`/garden/${p.id}`} className="btn btn-primary w-full">
          Open full verdict
        </Link>
        {a.mergeWith && (
          <Link href={`/garden/${p.id}#merge`} className="text-center text-sm font-medium text-moss hover:underline">
            Overlaps with {a.mergeWith.name}
          </Link>
        )}
      </div>
    </motion.article>
  );
}
