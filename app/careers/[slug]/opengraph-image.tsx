import { ImageResponse } from "next/og";
import { getCareer } from "@/data/careers";
import { headlineFlag } from "@/lib/tier";
import { samplerSlugs } from "@/content/careers/registry";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return samplerSlugs.map((slug) => ({ slug }));
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const career = getCareer(slug);
  const score = career ? career.headlineScore.toFixed(1) : "—";
  const name = career?.name ?? "Pivotum";
  // Single-tone brand: the score carries the meaning in the exposure palette —
  // protected green if low, exposed coral if high. No circle.
  const scoreColor = career && headlineFlag(career.headlineScore) === "safe" ? "#2E7D55" : "#B4442F";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FBFAF6",
          color: "#1C1A16",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, color: "#10605E", fontWeight: 700 }}>
          PIVOTUM · AI EXPOSURE · FALL 2026
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 620 }}>
            <div style={{ fontSize: 34, color: "#6B655B", marginBottom: 10 }}>Is</div>
            <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>{name}</div>
            <div style={{ fontSize: 34, color: "#6B655B", marginTop: 10 }}>safe from AI?</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", fontSize: 190, fontWeight: 700, lineHeight: 1, color: scoreColor }}>
              {score}
            </div>
            <div style={{ display: "flex", fontSize: 28, letterSpacing: 2, color: "#948D80", fontWeight: 600, marginTop: 4 }}>
              / 10
            </div>
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 26, color: "#948D80" }}>
          Scored on six factors · 10 = most exposed · Re-scored every six months
        </div>
      </div>
    ),
    size,
  );
}
