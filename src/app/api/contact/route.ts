import { NextResponse } from "next/server";
import { isEmail, stripTags } from "@/lib/validate";

// Simple per-instance rate limit. Good enough for a demo, swap for a shared store in production.
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    return NextResponse.json({ ok: false, error: "Too many messages. Try again in a few minutes." }, { status: 429 });
  }
  hits.set(ip, [...recent, now]);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const name = stripTags(String(body.name ?? "")).trim();
  const email = String(body.email ?? "").trim();
  const message = stripTags(String(body.message ?? "")).trim();
  const website = String(body.website ?? "");
  const elapsed = Number(body.elapsed ?? 0);

  // Bots: pretend success so they do not retry.
  if (website || elapsed < 2500) return NextResponse.json({ ok: true });

  if (name.length < 2 || name.length > 80 || !isEmail(email) || message.length < 10 || message.length > 2000) {
    return NextResponse.json({ ok: false, error: "Please check the form and try again." }, { status: 422 });
  }

  // The webhook URL is a server-only secret. It never reaches the browser.
  const hook = process.env.CONTACT_WEBHOOK_URL;
  if (hook) {
    try {
      await fetch(hook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, at: new Date().toISOString() }),
      });
    } catch {
      return NextResponse.json({ ok: false, error: "Could not deliver the message. Try again later." }, { status: 502 });
    }
  }
  return NextResponse.json({ ok: true });
}
