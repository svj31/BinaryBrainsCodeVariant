"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { resetConsent } from "@/lib/consent";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { Reveal } from "@/components/ui/Reveal";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-paper-2">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <Reveal from="right">
          <Logo animated={false} size={30} />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-2">
            A place for unfinished projects to rest, and a clear way to decide which ones deserve another go.
          </p>
          <StatusIndicator className="mt-4" />
        </Reveal>
        <FooterCol
          title="Product"
          links={[
            ["/garden", "Garden"],
            ["/bury", "Bury a project"],
            ["/salvage", "Salvage Yard"],
            ["/insights", "Death Report"],
          ]}
        />
        <FooterCol
          title="Help"
          links={[
            ["/#how", "How it works"],
            ["/#verdicts", "The five verdicts"],
            ["/contact", "Contact"],
          ]}
        />
        <div>
          <h2 className="eyebrow">Legal</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link className="text-ink-2 hover:text-ink" href="/privacy">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link className="text-ink-2 hover:text-ink" href="/terms">
                Terms and conditions
              </Link>
            </li>
            <li>
              <button className="text-left text-ink-2 hover:text-ink" onClick={resetConsent}>
                Cookie settings
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-ink-3 sm:px-6">
          © 2026 SecondWind by Team Binary Brains. Built for Code Variant Build 01.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <Reveal from="up" delay={0.08}>
      <h2 className="eyebrow">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map(([href, label]) => (
          <li key={href}>
            <Link className="text-ink-2 hover:text-ink" href={href}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
