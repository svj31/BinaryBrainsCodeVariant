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
        <MotionProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <CookieBanner />
        </MotionProvider>
        <Cursor />
        <Ripple />
        <RitualOverlay />
        <StoreHydrator />
        <Analytics />
      </body>
    </html>
  );
}
