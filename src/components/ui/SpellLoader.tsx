/** A different little spell for every part of the garden, so no two loading screens feel the same. */
export type SpellVariant = "portal" | "dig" | "orb" | "tarot" | "crate" | "raven";

const LABELS: Record<SpellVariant, string> = {
  portal: "Opening the moon gate",
  dig: "Digging a fresh plot",
  orb: "Reading the crystal ball",
  tarot: "Turning the keeper's card",
  crate: "Prying open the salvage crate",
  raven: "Sending the raven",
};

/** Picks the spell for a destination path. */
export function spellFor(path: string): SpellVariant {
  if (path.startsWith("/garden/")) return "tarot";
  if (path.startsWith("/garden")) return "portal";
  if (path.startsWith("/bury")) return "dig";
  if (path.startsWith("/insights")) return "orb";
  if (path.startsWith("/salvage")) return "crate";
  if (path.startsWith("/contact")) return "raven";
  return "portal";
}

export function SpellLoader({ variant = "portal", label }: { variant?: SpellVariant; label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-4">
      <div className={`sw-ld sw-ld-${variant}`} aria-hidden="true">
        {variant === "portal" && (
          <>
            <i />
            <i />
            <i />
            <b />
          </>
        )}
        {variant === "orb" && (
          <>
            <b />
            <i />
          </>
        )}
        {variant === "tarot" && <b />}
        {variant === "crate" && (
          <>
            <b />
            <s />
            <i />
          </>
        )}
        {variant === "dig" && (
          <svg viewBox="0 0 120 120">
            <path d="M10 96h100" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
            <path d="M24 96c8-14 32-14 40 0" fill="#8a6f4e" />
            <circle className="sw-clod" cx="46" cy="86" r="4" fill="#8a6f4e" />
            <circle className="sw-clod" cx="52" cy="88" r="3" fill="#6b5530" />
            <circle className="sw-clod" cx="40" cy="90" r="3" fill="#a07a4c" />
            <g className="sw-shovel">
              <path d="M70 30 L56 84" stroke="#8a6f4e" strokeWidth="4" strokeLinecap="round" />
              <path d="M64 22h12" stroke="#8a6f4e" strokeWidth="4" strokeLinecap="round" />
              <path d="M50 80 L62 84 L58 100 C54 104 46 102 46 96 Z" fill="#c3cbc8" stroke="var(--ink)" strokeWidth="1.5" />
            </g>
            <path d="M84 96V60a12 12 0 0 1 24 0v36" fill="var(--stone-light)" stroke="var(--ink)" strokeWidth="2" />
          </svg>
        )}
        {variant === "raven" && (
          <svg viewBox="0 0 120 120">
            <g className="sw-bird">
              <path className="sw-wing" d="M60 60 C46 40 30 40 22 46 C34 50 44 56 60 62 Z" fill="#1b2a35" />
              <path className="sw-wing" d="M60 60 C74 40 90 40 98 46 C86 50 76 56 60 62 Z" fill="#2c4252" />
              <ellipse cx="60" cy="62" rx="12" ry="7" fill="#0d1820" />
              <circle cx="70" cy="58" r="5" fill="#0d1820" />
              <path d="M74 58l7 2-7 2z" fill="var(--dawn)" />
              <circle cx="71" cy="57" r="1.2" fill="var(--dawn)" />
              <rect x="52" y="70" width="16" height="11" rx="1.5" fill="#f4f1e6" stroke="var(--dawn)" />
              <path d="M52 70l8 6 8-6" stroke="var(--dawn)" fill="none" />
            </g>
          </svg>
        )}
      </div>
      <span className="font-mono text-xs uppercase tracking-[0.16em] text-ink-2">{label ?? LABELS[variant]}</span>
    </div>
  );
}

/** Full-height wrapper used by the route-level loading files. */
export function RouteSpell({ variant }: { variant: SpellVariant }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <SpellLoader variant={variant} />
    </div>
  );
}
