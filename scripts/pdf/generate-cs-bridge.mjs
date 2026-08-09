import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { chromium } from "playwright-core";

/**
 * WORKED EXAMPLE — the Active Edition "field bridge" for one career (Computer
 * science), the paid deliverable that plugs into Move 4 of the Active guide.
 * Proves the format: the scored tracks (shared base) → the exposed→safe bridge
 * → adjacent-field exits → senior-role targets. The real build parametrises this
 * by slug from data/careers.ts; here the CS numbers mirror that profile.
 *
 *   node scripts/pdf/generate-cs-bridge.mjs <out.pdf> [student|parent]
 */
const DIR = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(DIR, "../..");
const CHROME = process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const EDITION = /EDITION\s*=\s*"([^"]+)"/.exec(readFileSync(join(REPO, "lib/site.ts"), "utf8"))[1];
const LOGO_SVG = readFileSync(join(REPO, "public/brand/pivotum-logo-tight.svg"), "utf8");

const S = (process.argv[3] || "parent").toLowerCase() === "student";
const pick = (p, s) => (S ? s : p);

// CS tracks, safest-first — mirrors the computer-science profile in data/careers.ts.
const TRACKS = [
  { n: "Embedded / safety-critical", s: 4.7 },
  { n: "Security engineering", s: 5.3 },
  { n: "Senior engineer / architect", s: 5.4 },
  { n: "ML / AI engineering", s: 6.0 },
  { n: "Backend / infrastructure", s: 6.8 },
  { n: "Frontend / application dev", s: 7.6 },
  { n: "Entry-level developer", s: 8.1 },
];
const col = (s) => (s <= 5.5 ? "var(--pen-safe)" : s >= 6.8 ? "var(--pen)" : "var(--ink)");

const STEPS = [
  "<b>Own a system, not a queue of tickets.</b> Accountability is protection: the engineer a team trusts to be responsible for something in production is doing work no model can hold. Get your name on one service, end to end.",
  "<b>Move toward decisions that are expensive to get wrong.</b> The safe lane is where a mistake costs money, safety or a breach &mdash; embedded, security, infrastructure at scale. That&rsquo;s exactly the work a business will not hand to an unsupervised model.",
  "<b>Be the operator of the tools, not the competition for them.</b> Use AI to ship faster and review its output with judgment. The engineer who supervises generated code is leverage; the one who writes the boilerplate it replaces is the 8.1.",
  "<b>Skip the disappearing rung on purpose.</b> Don&rsquo;t spend three years on CRUD hoping to be promoted out of it &mdash; the rung is automating under you. Aim at judgment work deliberately, from the first job you take.",
];

const EXITS = [
  "<b>Cybersecurity</b> &mdash; the adversary keeps changing, so the work resists automation better than most of software. Your CS base transfers directly.",
  "<b>SRE / production reliability</b> &mdash; paid for accountability under pressure, which is precisely what a model can&rsquo;t be.",
  "<b>Embedded &amp; hardware-adjacent</b> &mdash; safety-critical, physical-world, and the lowest-scoring corner of the field.",
  "<b>ML engineering with real domain judgment</b> &mdash; not model plumbing, but knowing what to build and when it&rsquo;s wrong.",
  "<b>Technical roles in regulated industries</b> &mdash; where a human has to sign off, the human keeps the job.",
];

const TARGETS = [
  "<b>They ask for &lsquo;system design &amp; ownership.&rsquo;</b> First credible unit: write the design doc for one component and get it reviewed by a senior.",
  "<b>They ask for &lsquo;production experience, on-call.&rsquo;</b> First unit: get onto a rotation and handle one incident start to finish.",
  "<b>They ask for &lsquo;works through ambiguity, cross-team.&rsquo;</b> First unit: lead one small thing that touches another team.",
  "<b>They ask for a &lsquo;security / correctness mindset.&rsquo;</b> First unit: ship one feature that goes through a real security review.",
  "<b>They ask for &lsquo;mentorship, leverage.&rsquo;</b> First unit: onboard one junior, or own the runbook nobody wants to write.",
];

async function main() {
  const [outPdf] = process.argv.slice(2);
  if (!outPdf) { console.error("usage: generate-cs-bridge.mjs <out.pdf> [student|parent]"); process.exit(1); }

  const styles = `
    .brandmark{ margin:0 0 .7cm; width:5cm; }
    .gkick{ font-family:var(--sans); font-size:8.5pt; font-weight:600; letter-spacing:.16em; text-transform:uppercase; color:var(--pen); margin:0 0 .3cm; }
    .gtitle{ font-family:var(--serif); font-weight:600; font-size:24pt; line-height:1.12; letter-spacing:-.012em; margin:.1cm 0 .35cm; max-width:18cm; }
    .gintro{ font-size:10.8pt; color:var(--ink-soft); line-height:1.55; max-width:17cm; margin:0 0 .2cm; }
    .gintro em{ font-style:italic; color:var(--ink); }
    .glead{ font-family:var(--sans); font-size:9pt; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--ink); margin:.6cm 0 .2cm; padding-top:.45cm; border-top:1.4px solid var(--ink); }
    .tkt{ width:100%; border-collapse:collapse; margin:.1cm 0 0; }
    .tkt td{ padding:.14cm 0; border-bottom:1px solid var(--rule); vertical-align:middle; }
    .tkt .nm{ font-family:var(--serif); font-size:10.2pt; color:var(--ink); width:6cm; }
    .tkt .ba{ padding:0 .5cm; }
    .tkt .track{ position:relative; height:8px; border-radius:5px; background:#EFEDE6; }
    .tkt .fill{ position:absolute; top:0; left:0; height:8px; border-radius:5px; }
    .tkt .sc{ text-align:right; font-family:var(--sans); font-variant-numeric:tabular-nums; font-weight:700; font-size:10.5pt; width:1.2cm; }
    .lanes{ display:grid; grid-template-columns:1fr .7fr 1fr; gap:.35cm; align-items:center; margin:.2cm 0 .4cm; break-inside:avoid; }
    .lane{ padding:.45cm .5cm; border-radius:9px; border:1px solid var(--rule); }
    .lane.from{ background:rgba(172,58,52,.06); } .lane.to{ background:rgba(62,156,110,.08); }
    .lane .h{ font-family:var(--sans); font-size:7.6pt; font-weight:700; letter-spacing:.08em; text-transform:uppercase; margin:0 0 .2cm; }
    .lane.from .h{ color:var(--pen); } .lane.to .h{ color:var(--pen-safe); }
    .lane .r{ font-family:var(--serif); font-size:10pt; color:var(--ink); display:flex; justify-content:space-between; gap:.3cm; padding:.07cm 0; }
    .lane .r .s{ font-family:var(--sans); font-weight:700; font-variant-numeric:tabular-nums; }
    .arrow{ text-align:center; font-size:20pt; color:var(--pencil); }
    .mv{ display:flex; gap:.45cm; align-items:flex-start; padding:.34cm 0; border-bottom:1px solid var(--rule); break-inside:avoid; }
    .mv-n{ flex:0 0 auto; width:.75cm; height:.75cm; border-radius:50%; background:var(--ink); color:#FBF9F3; font-family:var(--sans); font-weight:700; font-size:10.5pt; line-height:.75cm; text-align:center; }
    .mv-b{ font-size:10.3pt; color:var(--ink-soft); line-height:1.5; }
    .mv-b b{ color:var(--ink); } .mv-b em{ font-style:italic; color:var(--ink); }
    .lst{ display:flex; flex-direction:column; gap:.26cm; margin:.1cm 0 0; }
    .lst-i{ display:flex; gap:.35cm; font-size:10.2pt; color:var(--ink-soft); line-height:1.45; align-items:baseline; }
    .lst-i .m{ color:var(--pen-safe); font-weight:700; flex:0 0 auto; }
    .lst-i b{ color:var(--ink); }
    .ck{ break-inside:avoid; margin:.15cm 0 0; padding:.5cm .6cm .55cm; background:#FBF9F3; border:1px solid var(--rule); border-radius:9px; }
    .ck-sub{ font-family:var(--serif); font-size:9.5pt; color:var(--ink-soft); line-height:1.45; margin:0 0 .3cm; }
    .ck-i{ display:flex; gap:.35cm; align-items:flex-start; padding:.15cm 0; }
    .ck-box{ flex:0 0 auto; width:.4cm; height:.4cm; border:1.5px solid var(--pencil); border-radius:3px; margin-top:.05cm; }
    .ck-x{ font-family:var(--serif); font-size:9.8pt; color:var(--ink-soft); line-height:1.42; }
    .ck-x b{ color:var(--ink); font-weight:700; }
    .gclose{ break-inside:avoid; font-family:var(--serif); font-size:11pt; color:var(--ink); line-height:1.5; margin:.55cm 0 0; max-width:16cm; }`;

  const tracksHtml = TRACKS.map((t) => `<tr>
    <td class="nm">${t.n}</td>
    <td class="ba"><div class="track"><div class="fill" style="width:${(t.s / 10) * 100}%;background:${col(t.s)}"></div></div></td>
    <td class="sc" style="color:${col(t.s)}">${t.s.toFixed(1)}</td></tr>`).join("");

  const stepsHtml = STEPS.map((s, i) => `<div class="mv"><span class="mv-n">${i + 1}</span><div class="mv-b">${s}</div></div>`).join("");
  const exitsHtml = EXITS.map((e) => `<div class="lst-i"><span class="m">&rarr;</span><span>${e}</span></div>`).join("");
  const targetsHtml = TARGETS.map((t) => `<div class="ck-i"><span class="ck-box"></span><div class="ck-x">${t}</div></div>`).join("");

  const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="file://${join(DIR, "brand.css")}"><style>${styles}</style></head>
<body>
  <div class="brandmark">${LOGO_SVG}</div>
  <div class="gkick">Career Value Guide &middot; Active Edition &middot; Computer Science &middot; ${EDITION}</div>
  <h1 class="gtitle">Computer science: the entrance is exposed. The work isn&rsquo;t.</h1>
  <p class="gintro">The Active guide told ${pick("your kid", "you")} to steer toward the protected adjacent track. Here it is, for computer science &mdash; and the exact bridge to it from where ${pick("they", "you")} probably stand today.</p>

  <div class="glead">The field, scored &mdash; safest to most exposed</div>
  <table class="tkt">${tracksHtml}</table>
  <p class="gintro" style="margin-top:.2cm">The same job title, <b>3.4 points apart</b>. The entry-level rung is the second-most-exposed job in the entire index; the safe lane sits with the work that&rsquo;s physical, security-critical, or carries senior judgment.</p>

  <div class="glead">Your bridge &mdash; from the exposed lane to the safe one</div>
  <div class="lanes">
    <div class="lane from">
      <div class="h">Where ${pick("they&rsquo;re", "you&rsquo;re")} probably starting</div>
      <div class="r"><span>Entry-level developer</span><span class="s" style="color:var(--pen)">8.1</span></div>
      <div class="r"><span>Frontend / application dev</span><span class="s" style="color:var(--pen)">7.6</span></div>
    </div>
    <div class="arrow">&rarr;</div>
    <div class="lane to">
      <div class="h">Where to aim</div>
      <div class="r"><span>Senior engineer / architect</span><span class="s" style="color:var(--pen-safe)">5.4</span></div>
      <div class="r"><span>Security engineering</span><span class="s" style="color:var(--pen-safe)">5.3</span></div>
      <div class="r"><span>Embedded / safety-critical</span><span class="s" style="color:var(--pen-safe)">4.7</span></div>
    </div>
  </div>
  ${stepsHtml}

  <div class="glead">If the safe lane&rsquo;s too narrow &mdash; adjacent exits</div>
  <div class="lst">${exitsHtml}</div>

  <div class="glead">Senior-role targets &mdash; what to start acquiring now</div>
  <div class="ck">
    <div class="ck-sub">Pulled from what senior and staff engineering roles actually ask for. Each has a first credible unit ${pick("your kid", "you")} can start on without fifteen years.</div>
    ${targetsHtml}
  </div>

  <p class="gclose">The field isn&rsquo;t the bet &mdash; this bridge is. Point every choice from here at the safe lane, and the 8.1 ${pick("your kid", "you")} might have walked into becomes a 5.4 ${pick("they", "you")} chose on purpose.</p>
</body></html>`;

  const htmlPath = join(tmpdir(), `pivotum_cs_bridge.html`);
  writeFileSync(htmlPath, html);

  const footer = `<div style="font-family:'Archivo',Arial,sans-serif;font-size:8px;color:#8a8178;width:100%;padding:0 1.4cm;display:flex;justify-content:space-between;">
    <span>Career Value Guide &middot; Active Edition &middot; Computer Science &middot; Pivotum ${EDITION}</span><span class="pageNumber"></span></div>`;

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
