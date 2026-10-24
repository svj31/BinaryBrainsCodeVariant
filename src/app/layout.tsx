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
import { SoundLayer } from "@/components/layout/SoundLayer";
import { Tour } from "@/components/layout/Tour";
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
          <div className="sw-sky">
            <div className="sw-moon" />
            <div className="sw-flight">
              <div className="sw-trail" />
              <svg className="sw-witch" viewBox="0 0 120 60">
                {/* silhouette: broom, cape, hat */}
                <path d="M4 44 L92 34" stroke="#05090d" strokeWidth="2.6" strokeLinecap="round" />
                <path d="M88 31 L116 26 L117 42 L90 39 Z" fill="#05090d" />
                <path d="M46 20 C38 30 32 40 22 46 L66 40 C60 32 56 26 54 20 Z" fill="#05090d" />
                <circle cx="51" cy="17" r="5.5" fill="#05090d" />
                <path d="M40 14 L64 12 L56 9 L49 -6 L46 11 Z" fill="#05090d" />
                <path d="M55 26 L74 18 L82 9" stroke="#05090d" strokeWidth="2.4" strokeLinecap="round" fill="none" />
              </svg>
            </div>
          </div>
          <div className="sw-curtain sw-curtain-l" />
          <div className="sw-curtain sw-curtain-r" />
          <div className="sw-title">
            <b>SecondWind</b>
            <span>Where unfinished projects rest</span>
            <i />
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
        <SoundLayer />
        <Tour />
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
