import type { Metadata } from "next";
import { Literata, Archivo } from "next/font/google";
import { SITE } from "@/lib/site";
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${literata.variable} ${archivo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
