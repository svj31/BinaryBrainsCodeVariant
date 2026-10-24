"use client";

import Script from "next/script";
import { useConsent } from "@/lib/consent";

/**
 * Privacy-first analytics. Only loads after the visitor opts in, and only when
 * NEXT_PUBLIC_ANALYTICS_DOMAIN is configured. No keys live in the frontend.
 */
export function Analytics() {
  const consent = useConsent();
  const domain = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN;
  if (consent !== "granted" || !domain) return null;
  return (
    <>
      <Script
        defer
        data-domain={domain}
        src={process.env.NEXT_PUBLIC_ANALYTICS_SRC ?? "https://plausible.io/js/script.tagged-events.js"}
        strategy="afterInteractive"
      />
      <Script id="plausible-queue" strategy="afterInteractive">
        {`window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`}
      </Script>
    </>
  );
}
