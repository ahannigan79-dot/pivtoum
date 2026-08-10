import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { chromium } from "playwright-core";

/**
 * "Career Value Guide — Planning Edition" PDF: the field-independent framework
 * for readers still choosing a degree or career. The mirror of the Active guide
 * (six moves + a pre-decision checklist), forked parent/student by the capture
 * flag. Uses brand.css so it matches the site.
 *
 *   node scripts/pdf/generate-planning-guide.mjs <out.pdf> [student|parent]
 */
const DIR = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(DIR, "../..");
const CHROME = process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const EDITION = /EDITION\s*=\s*"([^"]+)"/.exec(readFileSync(join(REPO, "lib/site.ts"), "utf8"))[1];
const LOGO_SVG = readFileSync(join(REPO, "public/brand/pivotum-logo-tight.svg"), "utf8");

const AUD = (process.argv[3] || "parent").toLowerCase();
const S = AUD === "student";
const pick = (p, s) => (S ? s : p);
const kid = pick("your kid", "you");

const MOVES = [
  {
    t: "Chase the split, not the average.",
    b: "The instinct is to ask &lsquo;is this field safe?&rsquo; &mdash; but no field is simply safe or doomed. Every one we score runs from a protected career to an exposed one under the same job title. The headline number hides the only choice that matters. So don&rsquo;t rank fields by their average. Rank them by <em>how good their safe lane is, and how reachable it is</em> from where " + pick("your kid stands", "you stand") + ".",
  },
  {
    t: "Weight the six factors, not the vibes.",
    b: "What actually protects work is boringly consistent: it has to be done in person or with your hands; the law requires a licensed human; someone needs a person they can trust and hold responsible; the job keeps hitting genuinely new, high-stakes situations. Choose <em>toward</em> those and away from anything that reduces cleanly to a screen. A gut feeling that a field &lsquo;seems future-proof&rsquo; is worth nothing next to which of those six boxes it actually ticks.",
  },
  {
    t: "Aim at a licence where one exists.",
    b: "The single most durable moat we score is a legal one: the CPA signature, the PE stamp, the medical licence, the bar. Software can do the work, but it cannot <em>hold the licence</em> &mdash; so the licensed lane of a field is almost always its safe one. If a field has that lane, aim the whole plan at it from the first course, not as an afterthought late on.",
  },
  {
    t: "Buy optionality, not one perfect bet.",
    b: "Nothing is AI-proof forever, so don&rsquo;t choose as if one path is. Prefer a field whose safe lane is <em>wide</em> and whose skills <em>travel</em> &mdash; one that survives being wrong about the details &mdash; over a narrow bet that only pays off if the next ten years go exactly to plan. Flexibility is the hedge you buy at the moment of choosing, and it&rsquo;s cheap here and expensive later.",
  },
  {
    t: "Check the on-ramp, not just the destination.",
    b: "Some of the most exposed work in the whole index is the <em>entry rung</em> of otherwise-safe fields &mdash; the junior analyst, the first-year associate, the entry coder. A safe senior destination with an on-ramp that&rsquo;s automating out is a trap: you can see where to end up and have no way to start. Weigh how someone actually breaks in, not only where the field lands at the top.",
  },
  {
    t: pick("Choose the kid, not the trend.", "Choose the fit, not the trend."),
    b: "The best path on paper is worthless if it&rsquo;s a lane " + pick("your kid will quietly hate and quit", "you&rsquo;ll quietly hate and quit") + ". Fit compounds; forced fit doesn&rsquo;t. Match " + pick("their", "your") + " real temperament to the actual work of the safe lane &mdash; the day-to-day, not the job title &mdash; because the person who stays and gets good is the one who ends up protected.",
  },
];

const CHECK = [
  "<b>Shortlist two or three fields</b> &mdash; and for each, write down its safe lane and its exposed lane. If you can&rsquo;t name both, you don&rsquo;t know the field well enough yet.",
  "<b>Score each safe lane on the six factors.</b> Licence? Hands or in-person? Human trust and accountability? Genuinely novel, high-stakes calls? The more yeses, the sturdier the lane.",
  "<b>Trace the on-ramp.</b> How does someone actually reach that safe lane &mdash; and is the entry rung along the way automating? A destination you can&rsquo;t get to doesn&rsquo;t count.",
  "<b>Talk to someone <em>in</em> the safe lane</b> &mdash; not a recruiter, not an admissions office. Ask what the work really is, and where they think it&rsquo;s going.",
  "<b>Pick the lane that fits " + pick("the kid", "you") + ", not just the market.</b> The durable choice is the one " + pick("they&rsquo;ll", "you&rsquo;ll") + " be good at and stay in.",
];

async function main() {
  const [outPdf] = process.argv.slice(2);
  if (!outPdf) { console.error("usage: generate-planning-guide.mjs <out.pdf> [student|parent]"); process.exit(1); }

  const styles = `
    .brandmark{ margin:0 0 .7cm; width:5cm; }
    .gkick{ font-family:var(--sans); font-size:8.5pt; font-weight:600; letter-spacing:.16em; text-transform:uppercase; color:var(--pen); margin:0 0 .12cm; }
    .gtag{ font-family:var(--serif); font-style:italic; font-size:10pt; color:var(--pencil); margin:0 0 .32cm; }
    .gtitle{ font-family:var(--serif); font-weight:600; font-size:25pt; line-height:1.1; letter-spacing:-.012em; margin:.1cm 0 .4cm; }
    .gintro{ font-size:11pt; color:var(--ink-soft); line-height:1.55; max-width:17cm; margin:0 0 .35cm; }
    .gintro em{ font-style:italic; color:var(--ink); }
    .glead{ font-family:var(--sans); font-size:9pt; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--ink); margin:.65cm 0 .15cm; padding-top:.5cm; border-top:1.4px solid var(--ink); }
    .mv{ display:flex; gap:.5cm; align-items:flex-start; padding:.42cm 0; border-bottom:1px solid var(--rule); break-inside:avoid; }
    .mv-n{ flex:0 0 auto; width:.85cm; height:.85cm; border-radius:50%; background:var(--ink); color:#FBF9F3; font-family:var(--sans); font-weight:700; font-size:12pt; line-height:.85cm; text-align:center; }
    .mv-t{ font-family:var(--serif); font-weight:700; font-size:12.5pt; color:var(--ink); margin:.06cm 0 .12cm; }
    .mv-b p{ margin:0; color:var(--ink-soft); font-size:10.6pt; line-height:1.5; }
    .mv-b em{ color:var(--ink); font-style:italic; }
    .ck{ break-inside:avoid; margin:.7cm 0 0; padding:.55cm .65cm .6cm; background:#FBF9F3; border:1px solid var(--rule); border-radius:9px; }
    .ck-t{ font-family:var(--serif); font-weight:600; font-size:14pt; color:var(--ink); margin:0 0 .08cm; }
    .ck-sub{ font-family:var(--serif); font-size:9.5pt; color:var(--ink-soft); line-height:1.45; margin:0 0 .35cm; }
    .ck-i{ display:flex; gap:.35cm; align-items:flex-start; padding:.16cm 0; }
    .ck-box{ flex:0 0 auto; width:.42cm; height:.42cm; border:1.5px solid var(--pencil); border-radius:3px; margin-top:.06cm; }
    .ck-x{ font-family:var(--serif); font-size:10pt; color:var(--ink-soft); line-height:1.45; }
    .ck-x b{ color:var(--ink); font-weight:700; }
    .ck-x em{ font-style:italic; color:var(--ink); }
    .gclose{ break-inside:avoid; font-family:var(--serif); font-size:11.5pt; color:var(--ink); line-height:1.5; margin:.7cm 0 0; max-width:16cm; }
    .gfactors{ break-inside:avoid; margin:.15cm 0 0; padding:.5cm .6cm; background:#FBF9F3; border:1px solid var(--rule); border-radius:9px; }
    .gfactors .h{ font-family:var(--sans); font-size:8pt; font-weight:700; letter-spacing:.09em; text-transform:uppercase; color:var(--ink); margin:0 0 .25cm; }
    .gfactors .cols{ display:flex; gap:.7cm; }
    .gfactors .col{ flex:1; }
    .gfactors .cap{ font-family:var(--sans); font-size:8pt; font-weight:700; letter-spacing:.05em; text-transform:uppercase; margin:0 0 .14cm; }
    .gfactors .cap.ex{ color:var(--pen); }
    .gfactors .cap.pr{ color:var(--pen-safe); }
    .gfactors ol{ margin:0; padding-left:.55cm; }
    .gfactors li{ font-family:var(--serif); font-size:9.8pt; color:var(--ink-soft); line-height:1.4; margin:0 0 .12cm; }
    .gcta{ break-inside:avoid; margin:.5cm 0 0; padding:.5cm .65cm; background:var(--ink); color:#EDE7DA; border-radius:9px; font-family:var(--serif); font-size:11pt; line-height:1.5; }
    .gcta b{ color:#fff; }
    .gcta .a{ display:block; font-family:var(--sans); font-size:9pt; font-weight:700; letter-spacing:.02em; margin-top:.22cm; color:#fff; }`;

  const movesHtml = MOVES.map((m, i) => `
    <div class="mv">
      <span class="mv-n">${i + 1}</span>
      <div class="mv-b">
        <div class="mv-t">${m.t}</div>
        <p>${m.b}</p>
      </div>
    </div>`).join("");

  const checkHtml = CHECK.map((c) => `
    <div class="ck-i"><span class="ck-box"></span><div class="ck-x">${c}</div></div>`).join("");

  const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="file://${join(DIR, "brand.css")}"><style>${styles}</style></head>
<body>
  <div class="brandmark">${LOGO_SVG}</div>
  <div class="gkick">The Career Map &middot; Your Playbook${pick("", " &middot; For the student")} &middot; ${EDITION}</div>
  <div class="gtag">Careers, mapped for the age of AI.</div>
  <h1 class="gtitle">Still choosing a degree or career? Here&rsquo;s how to pick one that lasts.</h1>
  <p class="gintro">${pick("If your kid is still choosing, you&rsquo;re holding the most valuable thing in this whole process: the decision itself, still unmade.", "If you&rsquo;re still choosing, you&rsquo;re holding the most valuable thing in this whole process: the decision itself, still unmade.")}</p>
  <p class="gintro">The instinct is to ask <em>which field is safe?</em> It&rsquo;s the wrong question. No field is safe or doomed &mdash; every one we score holds a protected career and an exposed one under the same title. The real choice was never the field. It&rsquo;s the lane inside it, and whether you can reach it.</p>
  <p class="gintro">${pick("So don&rsquo;t pick a major. Pick a <em>destination</em> &mdash; the safe lane of a field, chosen on purpose &mdash; and a path your kid can actually walk to it. Here&rsquo;s how to tell the sturdy ones from the rest.", "So don&rsquo;t just pick a major. Pick a <em>destination</em> &mdash; the safe lane of a field, chosen on purpose &mdash; and a path you can actually walk to it. Here&rsquo;s how to tell the sturdy ones from the rest.")}</p>
  <div class="gfactors">
    <div class="h">What we score &mdash; the six factors</div>
    <div class="cols">
      <div class="col">
        <div class="cap ex">Three that raise the risk</div>
        <ol>
          <li>How much of the day-to-day work can AI already do?</li>
          <li>Is the way <em>in</em> &mdash; the junior rung &mdash; automating away?</li>
          <li>How exposed is the high-value work as AI keeps improving?</li>
        </ol>
      </div>
      <div class="col">
        <div class="cap pr">Three that lower it</div>
        <ol start="4">
          <li>Must it be done in person, with your hands?</li>
          <li>Does someone need a human to trust and hold responsible?</li>
          <li>Does the law require a licensed human &mdash; and does the work hit genuinely new, high-stakes calls?</li>
        </ol>
      </div>
    </div>
  </div>
  <div class="glead">Six moves for choosing well</div>
  ${movesHtml}
  <div class="ck">
    <div class="ck-t">Before you commit</div>
    <div class="ck-sub">${pick("Six moves are the mindset. Here&rsquo;s the shortlist to run before your kid signs up for anything.", "Six moves are the mindset. Here&rsquo;s the shortlist to run before you sign up for anything.")}</div>
    ${checkHtml}
  </div>
  <p class="gclose">The scores get you to the right shortlist. They can&rsquo;t make the final call &mdash; that turns on <em>which</em> exact track, how durable its protection really is, and whether the specific programme actually delivers it. That&rsquo;s what the <b>Career Value Guide</b> is for. But choose at the level of the lane, not the label, and you&rsquo;ve already dodged the most expensive mistake there is.</p>
  <div class="gcta">Get the <b>Career Value Guide &mdash; Planning Edition</b> for the one or two careers that matter most: every track scored, the safe-versus-exposed split, the routes in, a programme checklist, and the questions to ask admissions. <span class="a">1 career $49 &middot; 3 for $69 &middot; unlimited $99 &mdash; start at pivotum.ai</span></div>
</body></html>`;

  const htmlPath = join(tmpdir(), `pivotum_planning_guide.html`);
  writeFileSync(htmlPath, html);

  const footer = `<div style="font-family:'Archivo',Arial,sans-serif;font-size:8px;color:#8a8178;width:100%;padding:0 1.4cm;display:flex;justify-content:space-between;">
    <span>The Career Map &middot; Your Playbook &middot; Pivotum ${EDITION}</span><span class="pageNumber"></span></div>`;

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
