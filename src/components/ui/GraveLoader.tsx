/** Themed loader: soil heaves, a sprout pushes up beside the stone, leaves open, wind passes. */
export function GraveLoader({ label = "Digging it up" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-3">
      <svg width="92" height="92" viewBox="0 0 92 92" fill="none" aria-hidden="true">
        <path
          d="M18 72V40a18 18 0 0 1 36 0v32"
          fill="#e6e0d4"
          stroke="var(--ink)"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <rect x="28" y="44" width="16" height="2.6" rx="1.3" fill="#a9a294" />
        <rect x="31" y="51" width="10" height="2.6" rx="1.3" fill="#a9a294" />
        <g style={{ transformOrigin: "68px 72px", animation: "sw-sprout 2.4s cubic-bezier(.45,0,.2,1) infinite" }}>
          <path d="M68 72V50" stroke="var(--moss)" strokeWidth="2.6" strokeLinecap="round" />
        </g>
        <g
          style={{
            transformOrigin: "68px 54px",
            animation: "sw-open 2.4s cubic-bezier(.45,0,.2,1) infinite",
          }}
        >
          <path d="M68 56c-1.2-5.5-5.3-7.9-10-7.4.6 4.9 4.3 8 10 7.4z" fill="var(--moss)" />
          <path d="M68 52c1-6 5.5-8.9 11-8.4-.5 5.5-4.7 9-11 8.4z" fill="var(--dawn)" />
        </g>
        <path
          d="M56 22c4.5-3.4 11.2-3 13 .8 1.4 3.1-1.8 5.6-4.7 3.9"
          stroke="var(--dawn)"
          strokeWidth="2.4"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          style={{ animation: "sw-gust 2.4s ease-in-out infinite" }}
        />
        <g style={{ animation: "sw-soil 2.4s ease-in-out infinite" }}>
          <path d="M8 72.5h76" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M60 72c2.5-3 13.5-3 16 0" stroke="#8a6f4e" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      </svg>
      <span className="font-mono text-xs uppercase tracking-[0.14em] text-ink-2">{label}</span>
    </div>
  );
}
