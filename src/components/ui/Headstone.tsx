/** Flat headstone used in 2D views. Glow strength follows revival potential. */
export function Headstone({
  score,
  archived = false,
  sprout = false,
  className = "",
}: {
  score: number;
  archived?: boolean;
  sprout?: boolean;
  className?: string;
}) {
  const glow = archived ? 0 : 0.15 + (score / 100) * 0.55;
  return (
    <svg viewBox="0 0 80 90" className={className} aria-hidden="true">
      <ellipse cx="40" cy="84" rx="34" ry="5" fill="var(--dawn)" opacity={glow} />
      <path
        d="M14 84V36a26 26 0 0 1 52 0v48z"
        fill={archived ? "#d2ccbf" : "#e6e0d4"}
        stroke={archived ? "#a49e92" : "#b8b1a3"}
        strokeWidth="1.5"
      />
      <rect x="27" y="44" width="26" height="3" rx="1.5" fill="#a9a294" />
      <rect x="31" y="52" width="18" height="3" rx="1.5" fill="#a9a294" />
      {sprout && (
        <g>
          <path d="M40 12c0-4 0-6 0-9" stroke="var(--moss)" strokeWidth="2" strokeLinecap="round" />
          <path d="M40 8c-1-3.5-3.6-5-6.6-4.6.4 3.2 2.8 5.1 6.6 4.6z" fill="var(--moss)" />
          <path d="M40 6c.7-3.8 3.6-5.6 7-5.3-.3 3.5-3 5.7-7 5.3z" fill="var(--dawn)" />
        </g>
      )}
      {archived && <path d="M50 84c2-6 8-8 12-6-1 4-5 6-12 6z" fill="#7f9a6b" />}
    </svg>
  );
}
