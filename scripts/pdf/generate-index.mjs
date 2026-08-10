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

// A one-line read per career — the safe end vs the exposed end — so this PDF is
// worth more than the bare ranked list on the homepage. Keyed by the career name.
const INSIGHTS = {
  "Medicine": "Surgery and the bedside are the safest work we score; radiology, read off a screen, is the exposed edge.",
  "Dentistry": "Hands in a mouth stay safe — it's the dental lab bench that quietly automated a decade ago.",
  "Nursing": "The protection lives at the bedside, not the qualification; telehealth triage scores nearly double.",
  "Veterinary Medicine": "A patient that can't describe anything keeps clinical work safe; lab and diagnostic roles are the exposed corner.",
  "Skilled Trades": "The moat was never 'working with your hands' — it was working somewhere unpredictable. A production line isn't.",
  "Allied Health": "Bodies, trust, licensure and unpredictability at once; the screen-based corner scores far higher.",
  "Teaching": "A classroom isn't an information-delivery problem; teaching through a screen is a different trajectory entirely.",
  "Social Work": "Protected by something rarer than a license — statutory authority over a person's life; case coordination is the exposed part.",
  "Construction": "On the site, one of the safest jobs there is; in the office attached to it, one of the most exposed.",
  "Psychology": "A license makes it one of the safest careers; the bare degree lands in ordinary graduate exposure — the widest promise-vs-reality gap we score.",
  "Engineering": "Point technical aptitude at the physical world (a PE and a site) and it's safe; point it at a CAD desk and it isn't.",
  "Agriculture": "Hands-on farm management holds; the tech-forward 'precision ag' version is the more exposed one.",
  "Hospitality": "Human presence substantially is the product; only the back-office booking desk is heavily exposed.",
  "Transport": "The office job coordinating the vehicles scores higher than anyone actually driving one.",
  "Translation": "Court and medical interpreting stays safe; general document translation is the single most-exposed job in the index.",
  "Pharmacy": "The surprise of healthcare — fully licensed and clinical, yet the most exposed health profession bar radiology.",
  "Law": "The widest split of any licensed profession — the trial litigator is safe, the document-review associate isn't. Both are lawyers.",
  "Finance": "It protects the person in the room with the client, and offers almost nothing to the analyst preparing the materials.",
  "Architecture": "The stamp and the site are real protection; the drafting years that used to lead there are automating out from under it.",
  "Computer science": "Not dying — its entrance is. Safe at the senior end on judgment; the entry rung is the second-highest score in the index.",
  "Business & Management": "The most-taken degree points at the exposed end; the protected destinations exist, but the route runs through the jobs being automated.",
  "Life Sciences": "The terminal is more exposed than the bench — the computational branch and the bare degree score highest.",
  "Cybersecurity": "Safer than most of tech because the adversary keeps changing — but 'safer than software' isn't 'safe.' Tier-one work is exposed.",
  "Journalism": "Original reporting is barely touched; desk aggregation sits near the top — though the industry's real problem predates AI.",
  "Accounting": "It all turns on the license — the CPA signature is a legal monopoly; the bookkeeping beneath it is among the most automatable work we score.",
  "Marketing": "No license, no physical requirement, no structural moat — every bit of protection sits at the senior end and has to be earned.",
  "Graphic Design": "The one field where AI took the craft itself — production design is the single most-exposed job; only direction holds.",
  "Data Science": "Closest to the technology, and it didn't protect it — entry analysis is among the most exposed work in the index.",
};

function rowHtml(c) {
  const lo = (c.safest / 10) * 100;
  const hi = (c.exposed / 10) * 100;
  const safeCol = c.safest <= 4 ? "var(--pen-safe)" : "var(--ink)";
  const expCol = c.exposed >= 6.5 ? "var(--pen)" : "var(--ink)";
  const note = INSIGHTS[c.name] ? `<div class="ixnote">${esc(INSIGHTS[c.name])}</div>` : "";
  return `<div class="ixitem">
    <div class="ixtop">
      <span class="ixname">${esc(c.name)}</span>
      <span class="ixbar"><span class="track"><span class="fill" style="left:${lo}%;width:${hi - lo}%"></span></span></span>
      <span class="ixnum"><b style="color:${safeCol}">${c.safest.toFixed(1)}</b><span class="dash">–</span><b style="color:${expCol}">${c.exposed.toFixed(1)}</b></span>
    </div>${note}
  </div>`;
}

async function main() {
  const [outPdf] = process.argv.slice(2);
  if (!outPdf) { console.error("usage: generate-index.mjs <out.pdf>"); process.exit(1); }

  const styles = `
    .brandmark{ margin:0 0 .7cm; width:5cm; }
    .ixtag{ font-family:var(--serif); font-style:italic; font-size:10.5pt; color:var(--pencil); margin:.1cm 0 0; }
    .ixtitle{ font-family:var(--serif); font-weight:600; font-size:26pt; line-height:1.1; letter-spacing:-.01em; margin:.1cm 0 .35cm; }
    .ixintro{ font-size:10.5pt; color:var(--ink-soft); line-height:1.5; max-width:17cm; margin:0 0 .55cm; }
    .ixintro p{ margin:0 0 .35cm; }
    .ixintro b{ color:var(--ink); }
    .ixhead{ display:flex; gap:12px; align-items:baseline; font-family:var(--sans); font-size:8pt; letter-spacing:.06em; text-transform:uppercase; color:var(--pencil); padding:0 0 6px; border-bottom:1.5px solid var(--ink); }
    .ixhead .hn{ flex:0 0 33%; } .ixhead .hb{ flex:1 1 auto; text-align:center; } .ixhead .hr{ flex:0 0 15%; text-align:right; }
    .ixband{ break-inside:avoid; break-after:avoid; margin:.55cm 0 .05cm; }
    .ixband-t{ font-family:var(--sans); font-weight:700; font-size:9.5pt; letter-spacing:.05em; text-transform:uppercase; }
    .ixband-n{ font-family:var(--serif); font-size:9pt; color:var(--ink-soft); line-height:1.45; margin:2px 0 0; max-width:16cm; }
    .ixitem{ break-inside:avoid; padding:11px 0 12px; border-bottom:1px solid var(--rule); }
    .ixtop{ display:flex; gap:12px; align-items:center; }
    .ixname{ flex:0 0 33%; font-family:var(--serif); font-size:11pt; color:var(--ink); }
    .ixbar{ flex:1 1 auto; }
    .ixbar .track{ position:relative; display:block; height:9px; border-radius:5px; background:#EFEDE6; }
    .ixbar .fill{ position:absolute; top:0; height:9px; border-radius:5px; background:rgba(255,226,110,.92); }
    .ixnum{ flex:0 0 15%; text-align:right; font-family:var(--sans); font-size:10.5pt; font-variant-numeric:tabular-nums; white-space:nowrap; }
    .ixnum .dash{ color:var(--pencil); padding:0 3px; }
    .ixnote{ font-family:var(--serif); font-size:9pt; color:var(--ink-soft); line-height:1.42; margin:3px 0 0; padding-right:8%; }
    .ixlegend{ font-size:8.5pt; color:var(--pencil); line-height:1.5; margin:.4cm 0 0; }
    .ixclose{ break-inside:avoid; margin:.7cm 0 0; padding:.55cm .65cm .6cm; background:#FBF9F3; border:1px solid var(--rule); border-radius:9px; }
    .ixclose-t{ font-family:var(--serif); font-weight:600; font-size:14.5pt; color:var(--ink); margin:0 0 .12cm; }
    .ixclose-sub{ font-family:var(--serif); font-size:9.5pt; color:var(--ink-soft); line-height:1.45; margin:0 0 .4cm; }
    .ixsteps{ display:flex; flex-direction:column; gap:.3cm; }
    .ixstep{ display:flex; gap:11px; align-items:flex-start; }
    .ixstep-n{ flex:0 0 auto; width:21px; height:21px; border-radius:50%; background:var(--ink); color:#FBF9F3; font-family:var(--sans); font-weight:700; font-size:9.5pt; line-height:21px; text-align:center; }
    .ixstep-b{ font-family:var(--serif); font-size:10pt; color:var(--ink-soft); line-height:1.48; }
    .ixstep-b b{ color:var(--ink); }
    .ixclose-cta{ font-family:var(--sans); font-weight:700; font-size:10.5pt; color:var(--pen); margin:.45cm 0 0; text-align:center; letter-spacing:.01em; }`;

  // Group the 28 into three tiers by how protected even their safest role is —
  // so the page reads as a story in three chunks, not a wall of 28 rows.
  const BANDS = [
    {
      color: "var(--pen-safe)",
      title: "A safe path is there for the taking",
      note: "Even the most protected role in these fields scores low. The exposure only shows up if your kid drifts toward the screen-based corner of the work.",
      test: (c) => c.safest <= 3.5,
    },
    {
      color: "var(--ink)",
      title: "Safe or exposed — the path decides, not the field",
      note: "Each of these holds a protected career and a doomed one under the same job title. Which one your kid ends up in comes down to the track they choose.",
      test: (c) => c.safest > 3.5 && c.safest < 5.0,
    },
    {
      color: "var(--pen)",
      title: "Exposed even at its most protected",
      note: "The whole field skews exposed and the safe corner is narrow. Not off-limits — but go in clear-eyed about where the value has already moved.",
      test: (c) => c.safest >= 5.0,
    },
  ];
  const all = careers();
  const bandsHtml = BANDS.map((band) => {
    const rows = all.filter(band.test).map(rowHtml).join("");
    if (!rows) return "";
    return `<div class="ixband"><div class="ixband-t" style="color:${band.color}">${band.title}</div><div class="ixband-n">${band.note}</div></div>${rows}`;
  }).join("");

  const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="file://${join(DIR, "brand.css")}"><style>${styles}</style></head>
<body>
  <div class="brandmark">${LOGO_SVG}</div>
  <div class="kicker">The Career Index · ${EDITION} Edition</div>
  <div class="ixtag">AI exposure, scored for every career.</div>
  <h1 class="ixtitle">Every career, scored</h1>
  <div class="ixintro">
    <p><b>How we score.</b> Every career is rated 1–10 for AI exposure, where 10 is most at risk — the same six factors and the same weights applied to all 28, so a vet and a paralegal are measured the same way. The score reflects exposure to what AI can already do, not how much any employer has chosen to deploy.</p>
    <p><b>What the bar shows.</b> Each runs from a field's most protected role to its most exposed, because the biggest risk isn't picking the wrong field — it's picking the wrong path inside it. The same job title routinely holds both a safe career and a doomed one. As a rule, the safe end is unpredictable, hands-on and human-accountable; the exposed end is whatever can be reduced to a screen.</p>
  </div>
  <div class="ixhead"><span class="hn">Career</span><span class="hb">Safest 0 &nbsp;·····&nbsp; 10 Most exposed</span><span class="hr">Range</span></div>
  ${bandsHtml}
  <p class="ixlegend">Green marks a genuinely low-exposure entry (≤4.0); red, one that's highly exposed (≥6.5). Re-scored every six months — we publish where we might be wrong.</p>
  <div class="ixclose">
    <div class="ixclose-t">Where to go from here</div>
    <div class="ixclose-sub">Twenty-eight fields is a shortlist, not a verdict. Three steps, and each one narrows the map for your family.</div>
    <div class="ixsteps">
      <div class="ixstep"><span class="ixstep-n">1</span><div class="ixstep-b"><b>This index is the lay of the land.</b> Every field scored the same way — enough good directions here to start the conversation about which paths are worth walking, and which begin in a hole.</div></div>
      <div class="ixstep"><span class="ixstep-n">2</span><div class="ixstep-b"><b>The free read is the signpost.</b> Pick the career your kid keeps circling back to and read its free breakdown — a first look at where the safe and exposed tracks sit, and the six factors that decide which is which.</div></div>
      <div class="ixstep"><span class="ixstep-n">3</span><div class="ixstep-b"><b>The Career Value Guide is the map that gets you there.</b> Every track in one career scored and ranked, with the specific degrees and first jobs that land on the safe side — and the ones to steer around. The map you actually travel with.</div></div>
    </div>
    <div class="ixclose-cta">Start any career free at pivotum.ai</div>
  </div>
</body></html>`;

  const htmlPath = join(tmpdir(), `pivotum_index.html`);
  writeFileSync(htmlPath, html);

  const footer = `<div style="font-family:'Archivo',Arial,sans-serif;font-size:8px;color:#8a8178;width:100%;padding:0 1.4cm;display:flex;justify-content:space-between;">
    <span>The Career Index · Pivotum ${EDITION}</span><span class="pageNumber"></span></div>`;

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
