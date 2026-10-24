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
import { CommandBox } from "@/components/layout/CommandBox";
import { ScrollWisp } from "@/components/motion/Scroll3D";
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
    <html lang="en" className={`${fraunces.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("sw-theme");if(t)document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-dvh overflow-x-clip">
        <div id="sw-boot" aria-hidden="true">
          <div className="sw-stage">
            <div className="sw-stage-stars" />
            <div className="sw-boot-moon" />
            <div className="sw-runes" />
            <div className="sw-cast" />
            <div className="sw-witch">
              <svg viewBox="0 0 160 120">
                {/* broom */}
                <path d="M10 82 L118 64" stroke="#8a6f4e" strokeWidth="4" strokeLinecap="round" />
                <path d="M114 58 L150 50 L152 74 L116 70 Z" fill="#c99a52" stroke="#8a6f4e" strokeWidth="1.5" />
                <path d="M122 60l26-4M122 66l28 0M120 70l26 4" stroke="#8a6f4e" strokeWidth="1" />
                {/* cape */}
                <path className="sw-cape" d="M66 40 C50 56 46 72 38 86 L96 78 C88 64 82 52 78 40 Z" fill="#1b2a35" stroke="#2c4252" strokeWidth="1.5" />
                {/* head and hat */}
                <circle cx="72" cy="36" r="9" fill="#0d1820" />
                <circle cx="69" cy="35" r="1.6" fill="#f2b34a" />
                <circle cx="75" cy="35" r="1.6" fill="#f2b34a" />
                <path d="M56 30 L90 28 L80 24 L70 2 L64 26 Z" fill="#1b2a35" stroke="#2c4252" strokeWidth="1.5" />
                <path d="M64 26 L80 24" stroke="#f2b34a" strokeWidth="2" />
                {/* wand arm */}
                <path d="M78 52 L102 40" stroke="#2c4252" strokeWidth="5" strokeLinecap="round" />
                <path d="M102 40 L118 26" stroke="#e6e0d4" strokeWidth="2" strokeLinecap="round" />
                <circle className="sw-wandtip" cx="119" cy="25" r="4" fill="#ffe2a8" />
              </svg>
            </div>
            <div className="sw-valance" />
            <div className="sw-curtain sw-curtain-l" />
            <div className="sw-curtain sw-curtain-r" />
          </div>
          <div className="sw-boot-copy">
            <b>SecondWind</b>
            <p>The keeper is waking the garden</p>
            <div className="sw-boot-bar">
              <i />
            </div>
          </div>
        </div>
        <MotionProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <CookieBanner />
        </MotionProvider>
        <ScrollWisp />
        <CommandBox />
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
