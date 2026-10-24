import { useId } from "react";

interface MarkProps {
  size?: number;
  animated?: boolean;
  className?: string;
  title?: string;
}

/**
 * SecondWind mark: an arched headstone with a sprout growing inside it,
 * and a gust of wind passing over. Rest on the left, new life on the right.
 */
export function LogoMark({ size = 36, animated = true, className = "", title = "SecondWind" }: MarkProps) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      {...(title ? { role: "img", "aria-labelledby": `${id}-t` } : { "aria-hidden": true })}
      className={`sw-logo ${animated ? "" : "sw-static"} ${className}`}
      fill="none"
    >
      {title && <title id={`${id}-t`}>{title}</title>}
      <path d="M6 42.5h36" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" />
      <path
        className="sw-stone"
        pathLength={1}
        d="M12.5 42.5V21a11.5 11.5 0 0 1 23 0v21.5"
        stroke="var(--ink)"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        className="sw-stem"
        pathLength={1}
        d="M24 42.5c0-5 0-9.5 0-15"
        stroke="var(--moss)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path className="sw-leaf sw-leaf-l" d="M24 31.5c-1-4.6-4.4-6.6-8.4-6.2 .5 4.1 3.6 6.7 8.4 6.2z" fill="var(--moss)" />
      <path className="sw-leaf sw-leaf-r" d="M24 28c.8-5 4.6-7.4 9.2-7-.4 4.6-3.9 7.5-9.2 7z" fill="var(--dawn)" />
      <path
        className="sw-gust"
        pathLength={1}
        d="M31 8.5c3.5-2.6 8.6-2.3 10 .6 1.1 2.4-1.4 4.3-3.6 3"
        stroke="var(--dawn)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display text-[1.35rem] font-semibold tracking-tight text-ink ${className}`}>
      Second<span className="text-moss">Wind</span>
    </span>
  );
}

export function Logo({ size = 34, animated = true }: { size?: number; animated?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark size={size} animated={animated} title="" />
      <Wordmark />
    </span>
  );
}
