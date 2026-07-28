import { ImageResponse } from "next/og";
import { getCareer } from "@/data/careers";
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

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FEFEFC",
          color: "#211E1B",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, color: "#8C857A", fontWeight: 600 }}>
          PIVOTUM · AI EXPOSURE · FALL 2026
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 620 }}>
            <div style={{ fontSize: 34, color: "#57534D", marginBottom: 10 }}>Is</div>
            <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>{name}</div>
            <div style={{ fontSize: 34, color: "#57534D", marginTop: 10 }}>safe from AI?</div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 240,
              height: 240,
              borderRadius: "50%",
              border: "8px solid #AC3A34",
              transform: "rotate(-4deg)",
              fontSize: 110,
              fontWeight: 700,
            }}
          >
            {score}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 26, color: "#8C857A" }}>
          Scored on six factors · 10 = most exposed · Re-scored every six months
        </div>
      </div>
    ),
    size,
  );
}
