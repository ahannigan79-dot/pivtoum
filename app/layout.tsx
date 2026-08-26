import type { Metadata, Viewport } from "next";
import { Literata, Archivo } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClerkProvider } from "@clerk/nextjs";
import { SITE } from "@/lib/site";
import { SiteHeader } from "@/components/SiteHeader";
import { MetaPixel } from "@/components/MetaPixel";
import { GoogleAds } from "@/components/GoogleAds";
import { Clarity } from "@/components/Clarity";
import { ConsentBanner } from "@/components/ConsentBanner";
import { HideOnHub } from "@/components/HideOnHub";
import "./globals.css";

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
  display: "swap",
  axes: ["opsz"],
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description:
    "Pivotum scores careers on how exposed they are to AI, on a fixed published methodology, re-scored every six months. Free samplers for parents and students choosing a degree.",
  verification: {
    other: { "facebook-domain-verification": "s9vudqllxjp89v7ou91g0ssnhev02p" },
  },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Winning" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#FBFAF6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" className={`${literata.variable} ${archivo.variable}`}>
        <body>
          <HideOnHub>
            <MetaPixel />
            <GoogleAds />
            <Clarity />
            <SiteHeader />
          </HideOnHub>
          {children}
          <HideOnHub>
            <ConsentBanner />
          </HideOnHub>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
