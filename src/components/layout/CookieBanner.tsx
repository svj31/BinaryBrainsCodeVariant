"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { setConsent, useConsent } from "@/lib/consent";

export function CookieBanner() {
  const consent = useConsent();
  const open = consent === null;

  return (
    <AnimatePresence>
      {open && (
        <motion.section
          role="region"
          aria-label="Cookie preferences"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl rounded-lg border border-line bg-card p-4 shadow-[0_12px_40px_-12px_rgba(30,39,33,0.35)] sm:inset-x-auto sm:right-5 sm:bottom-5"
        >
          <p className="text-sm leading-relaxed text-ink-2">
            Your projects are saved in this browser only. We would also like to count page visits with
            cookie-free, anonymous analytics. Nothing runs until you choose.{" "}
            <Link href="/privacy#cookies" className="font-medium text-moss underline underline-offset-2">
              Read the privacy policy
            </Link>
            .
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn btn-primary !py-2 text-sm" onClick={() => setConsent("granted")}>
              Allow analytics
            </button>
            <button className="btn btn-ghost !py-2 text-sm" onClick={() => setConsent("denied")}>
              Essential only
            </button>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
