export type Errors = Record<string, string>;

export function isHttpUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

export function lengthError(label: string, v: string, min: number, max: number): string | undefined {
  const t = v.trim();
  if (!t) return `${label} is required.`;
  if (t.length < min) return `${label} needs at least ${min} characters.`;
  if (t.length > max) return `${label} must be ${max} characters or fewer.`;
  return undefined;
}

/**
 * Lightweight bot check for forms without a backend: a hidden honeypot field
 * plus a minimum time between first render and submit.
 */
export function looksLikeBot(honeypot: string, startedAt: number, minMs = 2500): boolean {
  return honeypot.trim().length > 0 || Date.now() - startedAt < minMs;
}

export function stripTags(v: string): string {
  return v.replace(/<[^>]*>/g, "");
}
