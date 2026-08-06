import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { chromium } from "playwright-core";

/**
 * "All 28 scores" index PDF — the free lead magnet for the homepage CTA.
 *
 *   node scripts/pdf/generate-index.mjs <out.pdf>
 *
 * Reads every career from data/careers.ts, computes each one's protected→exposed
 * range from its track scores, and renders a branded one-page index with the
 * yellow range bars (the same "highlight breakdown" the homepage shows), sorted
 * safest first. Uses brand.css so it matches the site and the paid profiles.
 */
const DIR = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(DIR, "../..");
const CHROME = process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const EDITION = /EDITION\s*=\s*"([^"]+)"/.exec(readFileSync(join(REPO, "lib/site.ts"), "utf8"))[1];
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function careers() {
  const src = readFileSync(join(REPO, "data/careers.ts"), "utf8");
  const parts = src.split(/"slug":\s*"/).slice(1);
  return parts
    .map((p) => {
      const name = /"name":\s*"([^"]+)"/.exec(p)?.[1];
      const scores = [...p.matchAll(/"2026":\s*([\d.]+)/g)].map((m) => Number(m[1]));
      if (!name || !scores.length) return null;
      return { name, safest: Math.min(...scores), exposed: Math.max(...scores) };
    })
    .filter(Boolean)
    .sort((a, b) => a.safest - b.safest || a.exposed - b.exposed);
}

const LOGO_SVG = readFileSync(join(REPO, "public/brand/pivotum-logo-tight.svg"), "utf8");

function rowHtml(c) {
  const lo = (c.safest / 10) * 100;
  const hi = (c.exposed / 10) * 100;
  const safeCol = c.safest <= 4 ? "var(--pen-safe)" : "var(--ink)";
  const expCol = c.exposed >= 6.5 ? "var(--pen)" : "var(--ink)";
  return `<tr>
    <td class="ixname">${esc(c.name)}</td>
    <td class="ixbar"><span class="track"><span class="fill" style="left:${lo}%;width:${hi - lo}%"></span></span></td>
    <td class="ixnum"><b style="color:${safeCol}">${c.safest.toFixed(1)}</b><span class="dash">–</span><b style="color:${expCol}">${c.exposed.toFixed(1)}</b></td>
  </tr>`;
}

async function main() {
  const [outPdf] = process.argv.slice(2);
  if (!outPdf) { console.error("usage: generate-index.mjs <out.pdf>"); process.exit(1); }

  const rows = careers().map(rowHtml).join("");
  const styles = `
    .ixhead{display:flex;align-items:baseline;justify-content:space-between;font-family:var(--sans);
      font-size:8.5pt;letter-spacing:.06em;text-transform:uppercase;color:var(--pencil);margin:6px 0 2px;}
    table.index{width:100%;border-collapse:collapse;margin:.4rem 0 0;}
    table.index td{padding:7px 0;border-bottom:1px solid var(--rule);vertical-align:middle;}
    .ixname{font-family:var(--serif);font-size:11pt;color:var(--ink);width:34%;padding-right:12px;}
    .ixbar{width:46%;}
    .ixbar .track{position:relative;display:block;height:9px;border-radius:5px;background:#EFEDE6;}
    .ixbar .fill{position:absolute;top:0;height:9px;border-radius:5px;background:rgba(255,226,110,.92);}
    .ixnum{width:20%;text-align:right;font-family:var(--sans);font-size:10.5pt;font-variant-numeric:tabular-nums;white-space:nowrap;}
    .ixnum .dash{color:var(--pencil);padding:0 3px;}
    .scalerow{display:flex;justify-content:space-between;font-family:var(--sans);font-size:8pt;
      letter-spacing:.05em;text-transform:uppercase;color:var(--pencil);margin-top:6px;}`;

  const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="file://${join(DIR, "brand.css")}"><style>${styles}</style></head>
<body>
  <section class="cover" style="page-break-after:avoid">
    <div class="brandmark">${LOGO_SVG}</div>
    <div class="kicker">The Degree Risk Index · ${EDITION} Edition</div>
    <h1>Every career, scored</h1>
    <p class="sub">All 28, from safest to most exposed. Each bar runs from a field's most protected role to its most exposed one — the same six factors, the same weights, applied to every career. 1–10, where 10 is most exposed to AI.</p>
  </section>
  <section class="sheet">
    <div class="ixhead"><span>Career</span><span>Safest 0 &nbsp;·····&nbsp; 10 Most exposed</span><span>Range</span></div>
    <table class="index"><tbody>${rows}</tbody></table>
    <p class="sub" style="margin-top:14px;font-size:9.5pt">Green marks a genuinely low-exposure entry (≤4.0); red, one that's highly exposed (≥6.5). Re-scored every six months. We publish where we might be wrong — the full reasoning and sources for every career are free at pivotum.ai.</p>
  </section>
</body></html>`;

  const htmlPath = join(tmpdir(), `pivotum_index.html`);
  writeFileSync(htmlPath, html);

  const footer = `<div style="font-family:'Archivo',Arial,sans-serif;font-size:8px;color:#8a8178;width:100%;padding:0 1.4cm;display:flex;justify-content:space-between;">
    <span>The Degree Risk Index · Pivotum ${EDITION}</span><span class="pageNumber"></span></div>`;

  mkdirSync(dirname(outPdf), { recursive: true });
  const b = await chromium.launch({ executablePath: CHROME });
  const p = await b.newPage();
  await p.goto("file://" + htmlPath, { waitUntil: "networkidle" });
  await p.emulateMedia({ media: "print" });
  await p.evaluate(() => document.fonts.ready);
  await p.pdf({
    path: outPdf, format: "Letter", printBackground: true,
    displayHeaderFooter: true, headerTemplate: "<span></span>", footerTemplate: footer,
    margin: { top: "1.5cm", bottom: "1.6cm", left: "1.9cm", right: "1.9cm" },
  });
  await b.close();
  console.log(`wrote ${outPdf}`);
}
main();
