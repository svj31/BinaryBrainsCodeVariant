import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <svg width="140" height="150" viewBox="0 0 80 90" fill="none" aria-hidden="true">
        <ellipse cx="40" cy="84" rx="34" ry="5" fill="var(--stone)" opacity="0.6" />
        <path d="M14 84V36a26 26 0 0 1 52 0v48z" fill="#e6e0d4" stroke="#b8b1a3" strokeWidth="1.5" />
        <text x="40" y="52" textAnchor="middle" fontFamily="var(--font-fraunces), serif" fontSize="17" fontWeight="600" fill="#5c6660">
          404
        </text>
        <rect x="29" y="60" width="22" height="2.5" rx="1.2" fill="#a9a294" />
        <path d="M58 84c2-6 8-8 12-6-1 4-5 6-12 6z" fill="#7f9a6b" />
      </svg>
      <p className="eyebrow mt-6">Error 404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">This page was never built</h1>
      <p className="mt-3 text-ink-2">
        Or it was, and then it got buried. Either way, there is nothing at this address.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/garden" className="btn btn-primary">
          Go to the garden
        </Link>
        <Link href="/" className="btn btn-ghost">
          Home
        </Link>
      </div>
    </div>
  );
}
