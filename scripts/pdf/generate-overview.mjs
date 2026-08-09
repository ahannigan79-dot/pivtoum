import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { chromium } from "playwright-core";

/**
 * "Your Career Package" overview PDF: the short connective piece in the free
 * package. Recaps what the reader got, then names the one thing the free layer
 * leaves out (the per-field answer) and why that gap is the whole decision —
 * the hinge from free to paid. Forks by stage and voice.
 *
 *   node scripts/pdf/generate-overview.mjs <out.pdf> <planning|active> [student|parent]
 */
const DIR = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(DIR, "../..");
const CHROME = process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const EDITION = /EDITION\s*=\s*"([^"]+)"/.exec(readFileSync(join(REPO, "lib/site.ts"), "utf8"))[1];
const LOGO_SVG = readFileSync(join(REPO, "public/brand/pivotum-logo-tight.svg"), "utf8");

const STAGE = (process.argv[3] || "active").toLowerCase();
const PLAN = STAGE === "planning";
const S = (process.argv[4] || "parent").toLowerCase() === "student";
const pick = (p, s) => (S ? s : p);

const C = PLAN
  ? {
      ed: "Planning",
      title: "You can see the whole map. Now for the one road that matters.",
      intro: pick(
        "Everything your kid asked for is attached. Here&rsquo;s what each piece does &mdash; and the one thing the free package deliberately leaves for later, because that&rsquo;s where the real decision lives.",
        "Everything you asked for is attached. Here&rsquo;s what each piece does &mdash; and the one thing the free package deliberately leaves for later, because that&rsquo;s where the real decision lives."
      ),
      recap: [
        "<b>The index</b> &mdash; all 28 careers ranked, so you can see which fields even belong on the list.",
        "<b>The Planning guide</b> &mdash; the six-move framework for choosing a lane that lasts.",
        "<b>Three samplers</b> &mdash; a full read on the careers " + pick("your kid is", "you&rsquo;re") + " weighing.",
      ],
      need:
        "For the career " + pick("your kid", "you") + " actually commits to: <b>which exact track to aim at</b>, how durable that protection really is once AI keeps pushing, whether a given programme actually delivers it, and the honest downsides no admissions page will admit.",
      why: pick(
        "Your kid doesn&rsquo;t enrol in &lsquo;a field.&rsquo; They enrol in one programme and take one first job &mdash; and the entire safe-versus-exposed difference lives at <em>that</em> level, exactly where the free scores stop. Getting the field right but the track wrong is the most expensive mistake in this whole process. It&rsquo;s the one thing the free package can&rsquo;t protect you from &mdash; and the one thing the full profile is built to.",
        "You don&rsquo;t enrol in &lsquo;a field.&rsquo; You enrol in one programme and take one first job &mdash; and the entire safe-versus-exposed difference lives at <em>that</em> level, exactly where the free scores stop. Getting the field right but the track wrong is the most expensive mistake in this whole process. It&rsquo;s the one thing the free package can&rsquo;t protect you from &mdash; and the one thing the full profile is built to."
      ),
      fill:
        "<b>every track scored and the safe/exposed split</b> &middot; how durable each protection is &middot; routes in &middot; a programme checklist and the questions to ask admissions &middot; where the degree leads later.",
    }
  : {
      ed: "Active",
      title: "You&rsquo;ve got the strategy. Now for your specific route.",
      intro: pick(
        "Everything your kid asked for is attached. Here&rsquo;s what each piece does &mdash; and the one thing the free package deliberately leaves for later, because that&rsquo;s where the real move is made.",
        "Everything you asked for is attached. Here&rsquo;s what each piece does &mdash; and the one thing the free package deliberately leaves for later, because that&rsquo;s where the real move is made."
      ),
      recap: [
        "<b>The index</b> &mdash; all 28 careers ranked, reframed to find your field&rsquo;s safe lane.",
        "<b>The Active guide</b> &mdash; the six moves for protecting value from where " + pick("your kid stands", "you stand") + ".",
        "<b>Three samplers</b> &mdash; a full read on the careers that matter to " + pick("your family", "you") + ".",
      ],
      need:
        "For " + pick("your kid&rsquo;s", "your") + " field specifically: <b>the exact bridge</b> from the exposed lane " + pick("they&rsquo;re", "you&rsquo;re") + " probably in to the safe one, which adjacent fields " + pick("their", "your") + " credential actually opens, and the senior roles to start aiming at now.",
      why:
        "&lsquo;Protect your value&rsquo; is a direction, not a route. The strategy is the same for everyone; the bridge is different for every field and every starting point. That specific route &mdash; from where " + pick("your kid actually stands", "you actually stand") + " &mdash; is the difference between knowing " + pick("they", "you") + " should move and knowing " + pick("their", "your") + " next three steps. The free guide points at it. The profile draws it.",
      fill:
        "<b>every track scored and the split</b> &middot; your exposed lane &rarr; the safe lane &rarr; the steps between &middot; adjacent-field exits &middot; pre-built senior-role targets.",
    };

async function main() {
  const [outPdf] = process.argv.slice(2);
  if (!outPdf) { console.error("usage: generate-overview.mjs <out.pdf> <planning|active> [student|parent]"); process.exit(1); }

  const styles = `
    .brandmark{ margin:0 0 .7cm; width:5cm; }
    .gkick{ font-family:var(--sans); font-size:8.5pt; font-weight:600; letter-spacing:.16em; text-transform:uppercase; color:var(--pen); margin:0 0 .12cm; }
    .gtag{ font-family:var(--serif); font-style:italic; font-size:10pt; color:var(--pencil); margin:0 0 .32cm; }
    .gtitle{ font-family:var(--serif); font-weight:600; font-size:24pt; line-height:1.12; letter-spacing:-.012em; margin:.1cm 0 .35cm; max-width:18cm; }
    .gintro{ font-size:11pt; color:var(--ink-soft); line-height:1.55; max-width:17cm; margin:0 0 .2cm; }
    .glead{ font-family:var(--sans); font-size:9pt; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--ink); margin:.6cm 0 .2cm; padding-top:.45cm; border-top:1.4px solid var(--ink); }
    .recap{ display:flex; flex-direction:column; gap:.22cm; margin:.1cm 0 0; }
    .recap-i{ display:flex; gap:.35cm; font-size:10.6pt; color:var(--ink-soft); line-height:1.45; align-items:baseline; }
    .recap-i .dot{ color:var(--pen-safe); font-weight:700; flex:0 0 auto; }
    .recap-i b{ color:var(--ink); }
    .need{ break-inside:avoid; margin:.1cm 0 .35cm; padding:.5cm .6cm; background:rgba(172,58,52,.06); border:1px solid var(--rule); border-radius:9px; }
    .need .h{ font-family:var(--sans); font-size:8pt; font-weight:700; letter-spacing:.09em; text-transform:uppercase; color:var(--pen); margin:0 0 .16cm; }
    .need p{ margin:0; font-size:10.6pt; line-height:1.5; color:var(--ink-soft); }
    .need b{ color:var(--ink); }
    .why{ break-inside:avoid; margin:0 0 .35cm; padding:.55cm .7cm; border-left:3px solid var(--pen); background:#FBF9F3; border-radius:0 9px 9px 0; }
    .why p{ margin:0; font-family:var(--serif); font-size:11.5pt; line-height:1.5; color:var(--ink); }
    .why em{ font-style:italic; }
    .fill{ font-size:10.4pt; color:var(--ink-soft); line-height:1.5; margin:.1cm 0 0; }
    .fill b{ color:var(--ink); }
    .ov-cta{ break-inside:avoid; margin:.55cm 0 0; padding:.5cm .65cm; background:var(--ink); color:#EDE7DA; border-radius:9px; font-family:var(--serif); font-size:11pt; line-height:1.5; }
    .ov-cta b{ color:#fff; }`;

  const recapHtml = C.recap.map((r) => `<div class="recap-i"><span class="dot">&#10003;</span><span>${r}</span></div>`).join("");

  const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="file://${join(DIR, "brand.css")}"><style>${styles}</style></head>
<body>
  <div class="brandmark">${LOGO_SVG}</div>
  <div class="gkick">The AI Career Map &middot; ${C.ed} &middot; ${EDITION}</div>
  <div class="gtag">Career value in the age of AI.</div>
  <h1 class="gtitle">${C.title}</h1>
  <p class="gintro">${C.intro}</p>

  <div class="glead">What&rsquo;s in your package</div>
  <div class="recap">${recapHtml}</div>

  <div class="glead">What you still need &mdash; and why it decides everything</div>
  <div class="need"><div class="h">The one thing the free package leaves out</div><p>${C.need}</p></div>
  <div class="why"><p>${C.why}</p></div>

  <div class="glead">How the full profile closes it</div>
  <p class="fill">The ${C.ed} Edition of the Career Value Guide, for the careers that matter most: ${C.fill}</p>
  <div class="ov-cta">For the one or two ${pick("your kid is", "you&rsquo;re")} serious about, that&rsquo;s <b>$19&ndash;39 and an afternoon</b> &mdash; against a decision worth years and tens of thousands. Start any career at <b>pivotum.ai</b>.</div>
</body></html>`;

  const htmlPath = join(tmpdir(), `pivotum_overview.html`);
  writeFileSync(htmlPath, html);

  const footer = `<div style="font-family:'Archivo',Arial,sans-serif;font-size:8px;color:#8a8178;width:100%;padding:0 1.4cm;display:flex;justify-content:space-between;">
    <span>Your Career Package &middot; ${C.ed} &middot; Pivotum ${EDITION}</span><span class="pageNumber"></span></div>`;

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
