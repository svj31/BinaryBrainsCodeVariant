import { NextResponse, type NextRequest } from "next/server";

/** Force HTTPS behind proxies that terminate TLS (Vercel, Netlify, Render, etc.). */
export function middleware(req: NextRequest) {
  const proto = req.headers.get("x-forwarded-proto");
  const host = req.headers.get("host") ?? "";
  const local = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  if (proto === "http" && !local) {
    const url = req.nextUrl.clone();
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.svg|logo.svg).*)"],
};
