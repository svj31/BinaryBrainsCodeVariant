import { VERDICTS } from "@/lib/verdicts";
import type { Verdict } from "@/lib/types";

export function VerdictBadge({ verdict, size = "md" }: { verdict: Verdict; size?: "sm" | "md" | "lg" }) {
  const v = VERDICTS[verdict];
  const cls =
    size === "lg" ? "px-3 py-1.5 text-sm" : size === "sm" ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[4px] font-mono font-medium uppercase tracking-wider ${cls}`}
      style={{ background: v.soft, color: v.color }}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: v.color }} aria-hidden="true" />
      {v.label}
    </span>
  );
}

const STATUS = {
  resting: { label: "Resting", cls: "bg-stone-light text-ink-2" },
  reviving: { label: "Reviving", cls: "bg-dawn-soft text-[#7a4a0b]" },
  alive: { label: "Alive again", cls: "bg-moss-soft text-moss" },
  archived: { label: "Archived", cls: "bg-[var(--c-archive-soft)] text-[var(--c-archive)]" },
} as const;

export function StatusTag({ status }: { status: keyof typeof STATUS }) {
  const s = STATUS[status];
  return <span className={`inline-flex rounded-[4px] px-2 py-0.5 text-xs font-medium ${s.cls}`}>{s.label}</span>;
}
