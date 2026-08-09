import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { chromium } from "playwright-core";

/**
 * "Career Value Guide — Active Edition" PDF: the field-independent strategy
 * spine for readers who are already in the degree or early in a career. Sits
 * alongside the per-field profiles; the profile supplies the field-specific
 * "bridge" that Move 4 points at. Uses brand.css so it matches the site.
 *
 *   node scripts/pdf/generate-active-guide.mjs <out.pdf>
 */
const DIR = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(DIR, "../..");
const CHROME = process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const EDITION = /EDITION\s*=\s*"([^"]+)"/.exec(readFileSync(join(REPO, "lib/site.ts"), "utf8"))[1];
const LOGO_SVG = readFileSync(join(REPO, "public/brand/pivotum-logo-tight.svg"), "utf8");

// The six moves — field-independent. Field-specific detail (the exposed lane,
// the safe lane, the bridge) is delivered by the per-field profile, not here.
const MOVES = [
  {
    t: "Protect the value they&rsquo;re already building.",
    b: "Point every choice toward the work AI can&rsquo;t hold: judgment someone has to trust, a decision someone has to pin on a <em>human</em>, work that happens in the room and in the unpredictable moment. On a r&eacute;sum&eacute;, the line AI can&rsquo;t reproduce is the only line that&rsquo;s appreciating. So when there&rsquo;s a choice between the clean, repeatable project and the messy one that forces real judgment &mdash; take the messy one. The clean one is the one being automated.",
  },
  {
    t: "Buy flexibility &mdash; don&rsquo;t specialize into a corner.",
    b: "Under pressure the instinct is to niche down hard to land the first job. Be careful <em>which</em> niche. A niche that&rsquo;s a deep human skill is a moat. A niche that&rsquo;s a screen-reducible task is a trap that&rsquo;s expensive to climb out of. Build the barbell: one genuinely hard human capability, plus real fluency with the tools. Skills that travel across lanes beat skills that only work in one.",
  },
  {
    t: "Get the AI-native edge &mdash; be the operator, not the operated-on.",
    b: "In every field the split is coming down to who <em>wields</em> the tools versus who competes with them. Your kid doesn&rsquo;t need to become an engineer. They need to be the obvious person in their field who&rsquo;s faster and sharper because they use AI well &mdash; the one supervising the machine&rsquo;s output with expert judgment. That person doesn&rsquo;t get automated; they get leverage. Start now, before anyone requires it.",
  },
  {
    t: "Steer toward the protected adjacent track.",
    b: "This is where the scores earn their keep. Their field has a safe lane &mdash; usually the licensed, in-person, senior-judgment, novel-stakes corner &mdash; and from where they stand there&rsquo;s a bridge to it. Accounting: from bookkeeping toward the CPA signature. Law: from document review toward the courtroom. Computer science: from the entry rung toward senior judgment and systems. The move isn&rsquo;t dramatic. It&rsquo;s a series of small choices all pointed the same way.",
    note: "The profile for your specific field names the likely exposed lane, the safe lane to aim at, and the exact bridge between them.",
  },
  {
    t: "Know when the safe track is one field over.",
    b: "Sometimes the honest answer is that the safe lane in their field is narrow &mdash; and the adjacent safe work sits one field to the side, reachable because their credential or skills transfer. That isn&rsquo;t failure or starting over. It&rsquo;s using what they&rsquo;ve already built as a bridge. Look for the neighboring field where their training is an asset <em>and</em> the work is more human-accountable.",
  },
  {
    t: "Bank the relationships &mdash; the one asset AI can&rsquo;t reach.",
    b: "AI can do the task, but it can&rsquo;t be <em>trusted</em>. It has no reputation, it can&rsquo;t be mentored, nobody refers it. The most protected career capital your kid can build isn&rsquo;t a skill at all &mdash; it&rsquo;s the set of people who know their work and would vouch for it. Mentors who open doors. Practitioners who tell them where the field is really heading. A reputation that walks into the room ahead of them. As the tasks get cheaper, the person people <em>choose</em> to work with gets more valuable, not less. This isn&rsquo;t schmoozing &mdash; it&rsquo;s the moat.",
  },
];

const CHECK = [
  "<b>Pull up five job ads for <em>senior</em> roles in the field</b> &mdash; the protected kind, not entry. Write down what they actually ask for. That list <em>is</em> the safe lane&rsquo;s requirements, and it&rsquo;s the target.",
  "<b>Find the one requirement you can start on now.</b> You don&rsquo;t need fifteen years &mdash; you need the <em>first</em> credible unit of it. What&rsquo;s the smallest real version you could have on the record inside six months?",
  "<b>Ask a professor the specific question:</b> <em>where is the hands-on, human-accountable part of this field, and how do I get reps in it while I&rsquo;m here?</em> Not &ldquo;what should I do&rdquo; &mdash; the pointed version.",
  "<b>Talk to one practitioner five to ten years ahead.</b> Ask where they think the safe work is going, and what they&rsquo;d do at your stage now. Fifteen minutes &mdash; most people say yes.",
  "<b>Learn one AI tool the field actually uses</b> &mdash; well enough to <em>show</em> it, not just name it.",
  "<b>Bank one un-automatable experience this term</b> &mdash; the project, rotation, client or shift that forces real judgment, over the clean repeatable one.",
];

async function main() {
  const [outPdf] = process.argv.slice(2);
  if (!outPdf) { console.error("usage: generate-active-guide.mjs <out.pdf>"); process.exit(1); }

  const styles = `
    .brandmark{ margin:0 0 .7cm; width:5cm; }
    .gkick{ font-family:var(--sans); font-size:8.5pt; font-weight:600; letter-spacing:.16em; text-transform:uppercase; color:var(--pen); margin:0 0 .3cm; }
    .gtitle{ font-family:var(--serif); font-weight:600; font-size:25pt; line-height:1.1; letter-spacing:-.012em; margin:.1cm 0 .4cm; }
    .gintro{ font-size:11pt; color:var(--ink-soft); line-height:1.55; max-width:17cm; margin:0 0 .35cm; }
    .gintro strong{ color:var(--ink); }
    .gintro em{ font-style:italic; }
    .glead{ font-family:var(--sans); font-size:9pt; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--ink); margin:.65cm 0 .15cm; padding-top:.5cm; border-top:1.4px solid var(--ink); }
    .mv{ display:flex; gap:.5cm; align-items:flex-start; padding:.42cm 0; border-bottom:1px solid var(--rule); break-inside:avoid; }
    .mv-n{ flex:0 0 auto; width:.85cm; height:.85cm; border-radius:50%; background:var(--ink); color:#FBF9F3; font-family:var(--sans); font-weight:700; font-size:12pt; line-height:.85cm; text-align:center; }
    .mv-t{ font-family:var(--serif); font-weight:700; font-size:12.5pt; color:var(--ink); margin:.06cm 0 .12cm; }
    .mv-b p{ margin:0; color:var(--ink-soft); font-size:10.6pt; line-height:1.5; }
    .mv-b em{ color:var(--ink); font-style:italic; }
    .mv-note{ font-family:var(--sans); font-size:8.8pt; color:var(--pencil); line-height:1.45; margin:.22cm 0 0; padding-left:.5cm; border-left:2px solid var(--hl-find); }
    .ck{ break-inside:avoid; margin:.7cm 0 0; padding:.55cm .65cm .6cm; background:#FBF9F3; border:1px solid var(--rule); border-radius:9px; }
    .ck-t{ font-family:var(--serif); font-weight:600; font-size:14pt; color:var(--ink); margin:0 0 .08cm; }
    .ck-sub{ font-family:var(--serif); font-size:9.5pt; color:var(--ink-soft); line-height:1.45; margin:0 0 .35cm; }
    .ck-i{ display:flex; gap:.35cm; align-items:flex-start; padding:.16cm 0; }
    .ck-box{ flex:0 0 auto; width:.42cm; height:.42cm; border:1.5px solid var(--pencil); border-radius:3px; margin-top:.06cm; }
    .ck-x{ font-family:var(--serif); font-size:10pt; color:var(--ink-soft); line-height:1.45; }
    .ck-x b{ color:var(--ink); font-weight:700; }
    .ck-x em{ font-style:italic; color:var(--ink); }
    .gclose{ break-inside:avoid; font-family:var(--serif); font-size:11.5pt; color:var(--ink); line-height:1.5; margin:.7cm 0 0; max-width:16cm; }`;

  const movesHtml = MOVES.map((m, i) => `
    <div class="mv">
      <span class="mv-n">${i + 1}</span>
      <div class="mv-b">
        <div class="mv-t">${m.t}</div>
        <p>${m.b}</p>
        ${m.note ? `<div class="mv-note">${m.note}</div>` : ""}
      </div>
    </div>`).join("");

  const checkHtml = CHECK.map((c) => `
    <div class="ck-i"><span class="ck-box"></span><div class="ck-x">${c}</div></div>`).join("");

  const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="file://${join(DIR, "brand.css")}"><style>${styles}</style></head>
<body>
  <div class="brandmark">${LOGO_SVG}</div>
  <div class="gkick">Career Value Guide &middot; Active Edition &middot; ${EDITION}</div>
  <h1 class="gtitle">Already in it? Here&rsquo;s how to protect the value.</h1>
  <p class="gintro">If your kid is already in the degree &mdash; or already out and looking &mdash; you didn&rsquo;t miss the window. You&rsquo;re standing at a different one.</p>
  <p class="gintro">The planning question was <em>which field.</em> That decision is behind you, and there&rsquo;s no use relitigating a bet you&rsquo;ve already placed. But the bet was never really the field. It was the lane inside it &mdash; and the lane is still wide open.</p>
  <p class="gintro">Every field we score holds a protected career and an exposed one under the same job title. Nobody assigns your kid to one or the other. They steer there &mdash; through what they specialize in, the experience they stack, the first jobs they take, the tools they learn to wield. Someone already in has fewer choices left than a planner. But the ones they have left are the ones that actually decide it.</p>
  <div class="glead">Six moves, all pointing the same direction</div>
  ${movesHtml}
  <div class="ck">
    <div class="ck-t">What to do this term</div>
    <div class="ck-sub">Six moves are the strategy. Here&rsquo;s the month-one version anyone can start &mdash; in the degree or already out.</div>
    ${checkHtml}
  </div>
  <p class="gclose">You&rsquo;re not behind. You&rsquo;re in the part of the story where the choices get smaller &mdash; and count for more. Point them all the same way, and the value compounds.</p>
</body></html>`;

  const htmlPath = join(tmpdir(), `pivotum_active_guide.html`);
  writeFileSync(htmlPath, html);

  const footer = `<div style="font-family:'Archivo',Arial,sans-serif;font-size:8px;color:#8a8178;width:100%;padding:0 1.4cm;display:flex;justify-content:space-between;">
    <span>Career Value Guide &middot; Active Edition &middot; Pivotum ${EDITION}</span><span class="pageNumber"></span></div>`;

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
