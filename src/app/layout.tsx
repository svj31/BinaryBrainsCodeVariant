import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { Analytics } from "@/components/layout/Analytics";
import { StoreHydrator } from "@/components/layout/StoreHydrator";
import { Cursor } from "@/components/layout/Cursor";
import { Ripple } from "@/components/layout/Ripple";
import { RitualOverlay } from "@/components/magic/Ritual";
import { DndLayer } from "@/components/canvas/dnd";
import { BootDone, RouteProgress } from "@/components/layout/Loaders";
import { MotionProvider } from "@/components/layout/MotionProvider";
import { SITE } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", axes: ["opsz"] });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: "%s | SecondWind" },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: ["unfinished projects", "side projects", "project graveyard", "hackathon projects", "revive project"],
  authors: [{ name: "Team Binary Brains" }],
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    url: SITE.url,
  },
  twitter: { card: "summary_large_image", title: SITE.title, description: SITE.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f5f0e6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${body.variable} ${mono.variable}`}>
      <body className="min-h-dvh overflow-x-clip">
        <div id="sw-boot" aria-hidden="true">
          <div className="sw-boot-moon" />
          <svg width="64" height="64" viewBox="0 0 48 48" fill="none">
            <path d="M6 42.5h36" stroke="#d9dce4" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M12.5 42.5V21a11.5 11.5 0 0 1 23 0v21.5" stroke="#d9dce4" strokeWidth="2.6" />
            <path d="M24 42.5v-15" stroke="#6dbf86" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M24 31.5c-1-4.6-4.4-6.6-8.4-6.2.5 4.1 3.6 6.7 8.4 6.2z" fill="#6dbf86" />
            <path d="M24 28c.8-5 4.6-7.4 9.2-7-.4 4.6-3.9 7.5-9.2 7z" fill="#f2b34a" />
          </svg>
          <p>Waking the garden</p>
          <div className="sw-boot-bar">
            <i />
          </div>
        </div>
        <MotionProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <CookieBanner />
        </MotionProvider>
        <Cursor />
        <Ripple />
        <RitualOverlay />
        <DndLayer />
        <RouteProgress />
        <BootDone />
        <StoreHydrator />
        <Analytics />
      </body>
    </html>
  );
}
