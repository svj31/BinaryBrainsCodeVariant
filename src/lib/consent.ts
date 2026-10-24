"use client";

import { useSyncExternalStore } from "react";

export type Consent = "granted" | "denied" | null;
const KEY = "secondwind-consent";
const listeners = new Set<() => void>();

function read(): Consent {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(v: Exclude<Consent, null>) {
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* storage blocked: choice lasts for this page view only */
  }
  listeners.forEach((l) => l());
}

export function resetConsent() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
  listeners.forEach((l) => l());
}

/** Returns "unknown" during SSR so the banner never flashes before we can read storage. */
export function useConsent(): Consent | "unknown" {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => "unknown",
  );
}

/** Fire a custom analytics event. Does nothing without consent or without a provider. */
export function track(event: string, props?: Record<string, string | number>) {
  if (typeof window === "undefined" || read() !== "granted") return;
  const w = window as unknown as { plausible?: (e: string, o?: { props?: object }) => void };
  w.plausible?.(event, props ? { props } : undefined);
}
