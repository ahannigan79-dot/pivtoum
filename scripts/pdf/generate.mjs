import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { chromium } from "playwright-core";

/**
 * Pivotum profile PDF generator.
 *
 *   node scripts/pdf/generate.mjs <slug> <parent|student> <markdown-path> <out.pdf>
 *
 * Renders a profile markdown file through the Pivotum design system (Literata +
 * Archivo embedded, the four highlight colors, the hand-drawn score circle) to
 * a print-ready PDF. The cover score and its green/red circle are read straight
 * from data/careers.ts, so a PDF can never disagree with the site.
 *
 * Chromium: set PW_CHROMIUM to a Chromium binary, or rely on the default below.
 */
const DIR = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(DIR, "../..");
const CHROME = process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

// ---- headline score + title from careers.ts (source of truth) ----
function careerMeta(slug) {
  const src = readFileSync(join(REPO, "data/careers.ts"), "utf8");
  const at = src.indexOf(`"slug": "${slug}"`);
  if (at < 0) throw new Error(`slug ${slug} not found in data/careers.ts`);
  const block = src.slice(at, at + 5000);
  const fStart = block.indexOf('"factors"');
  const fSeg = block.slice(fStart, block.indexOf("]", fStart) + 1);
  const factors = [...fSeg.matchAll(
    /"question":\s*"([^"]+)"[\s\S]*?"rating":\s*([\d.]+)[\s\S]*?"direction":\s*"([^"]+)"/g,
  )].map((m) => ({ question: m[1], rating: Number(m[2]), direction: m[3] }));
  return {
    title: /"title":\s*"([^"]+)"/.exec(block)[1],
    name: /"name":\s*"([^"]+)"/.exec(block)[1],
    score: Number(/"headlineScore":\s*([\d.]+)/.exec(block)[1]),
    track: /"headlineTrack":\s*"([^"]+)"/.exec(block)[1],
    factors,
  };
}

// A compact visual of the six factor ratings (0–10), colored by direction.
// Injected into the parent profile right after the "six factors" heading.
function factorBars(meta) {
  if (!meta.factors.length) return "";
  const rows = meta.factors
    .map((f) => {
      const dir = f.direction === "exposure" ? "exp" : "prot";
      return `<div class="fbar"><span class="fq">${esc(f.question)}</span><span class="ftrack"><span class="ffill ${dir}" style="width:${f.rating * 10}%"></span></span><span class="fval">${f.rating.toFixed(1)}</span></div>`;
    })
    .join("");
  return `<div class="fbars">${rows}<div class="flegend"><span><i class="exp"></i>Exposure raises the score</span><span><i class="prot"></i>Protection lowers it</span></div></div>`;
}

// The technical scoring appendix (audit trail) is authored in
// content/appendices/<slug>-03-scoring-appendix.md and rendered as the last
// section of the parent PDF. Returns "" if there's no appendix for this slug.
function appendix(slug) {
  const p = join(REPO, "content/appendices", `${slug}-03-scoring-appendix.md`);
  let md;
  try {
    md = readFileSync(p, "utf8");
  } catch {
    return "";
  }
  return `<section class="sheet appendix">${mdToHtml(md)}</section>`;
}
const EDITION = /EDITION\s*=\s*"([^"]+)"/.exec(readFileSync(join(REPO, "lib/site.ts"), "utf8"))[1];

// ---- markdown → html (tuned to the profile docs) ----
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function inline(s) {
  s = esc(s);
  s = s.replace(/==\+(.+?)==/g, '<mark class="prot">$1</mark>');
  s = s.replace(/==-(.+?)==/g, '<mark class="expo">$1</mark>');
  s = s.replace(/==\?(.+?)==/g, '<mark class="meth">$1</mark>');
  s = s.replace(/==(.+?)==/g, '<mark class="find">$1</mark>');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
  return s;
}
function h3split(t) {
  const m = /^(.*?)\s*\*?\(([^)]*)\)\*?\s*$/.exec(t);
  return m ? `${inline(m[1].trim())} <span class="w">(${inline(m[2])})</span>` : inline(t);
}
function mdToHtml(md) {
  const lines = md.replace(/\r/g, "").split("\n");
  const out = [];
  let i = 0;
  const flushPara = (buf) => { if (buf.length) out.push(`<p>${inline(buf.join(" "))}</p>`); };
  while (i < lines.length) {
    const ln = lines[i];
    if (/^\s*$/.test(ln)) { i++; continue; }
    if (/^---+\s*$/.test(ln)) { out.push("<hr>"); i++; continue; }
    if (/^```/.test(ln)) {
      i++;
      const code = [];
      while (i < lines.length && !/^```/.test(lines[i])) { code.push(lines[i]); i++; }
      i++; // closing fence
      out.push(`<pre><code>${esc(code.join("\n"))}</code></pre>`);
      continue;
    }
    let m;
    if ((m = /^###\s+(.*)$/.exec(ln))) { out.push(`<h3>${h3split(m[1])}</h3>`); i++; continue; }
    if ((m = /^##\s+(.*)$/.exec(ln))) { out.push(`<h2>${inline(m[1])}</h2>`); i++; continue; }
    if ((m = /^#\s+(.*)$/.exec(ln))) { out.push(`<h1>${inline(m[1])}</h1>`); i++; continue; }
    if (/^\|.*\|\s*$/.test(ln) && i + 1 < lines.length && /^\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      const cells = (r) => r.replace(/^\||\|\s*$/g, "").split("|").map((c) => c.trim());
      const head = cells(ln);
      i += 2;
      const rows = [];
      while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) { rows.push(cells(lines[i])); i++; }
      const isNum = head.map((_, c) =>
        rows.every((r) => /^[+\-]?[\d.,%\s–]*$/.test((r[c] || "").replace(/\*\*/g, "")) && r[c]));
      const th = head.map((h, c) => `<th class="${isNum[c] ? "num" : ""}">${inline(h)}</th>`).join("");
      const trs = rows
        .map((r) => "<tr>" + r.map((c, ci) => `<td class="${isNum[ci] ? "num" : ""}">${inline(c)}</td>`).join("") + "</tr>")
        .join("");
      out.push(`<table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`);
      continue;
    }
    if (/^[-*]\s+/.test(ln)) {
      const items = [];
      while (i < lines.length && (/^[-*]\s+/.test(lines[i]) || /^\s+\S/.test(lines[i]))) {
        if (/^[-*]\s+/.test(lines[i])) items.push(lines[i].replace(/^[-*]\s+/, ""));
        else if (items.length) items[items.length - 1] += " " + lines[i].trim();
        i++;
      }
      out.push("<ul>" + items.map((t) => `<li>${inline(t)}</li>`).join("") + "</ul>");
      continue;
    }
    if (/^>\s?/.test(ln) || /^ {2,}\S/.test(ln)) {
      const buf = [];
      while (i < lines.length && (/^>\s?/.test(lines[i]) || /^ {2,}\S/.test(lines[i]) || /^\s*$/.test(lines[i]))) {
        if (/^\s*$/.test(lines[i])) { if (buf.length && buf[buf.length - 1] !== "") buf.push(""); i++; continue; }
        buf.push(lines[i].replace(/^>\s?/, "").trim());
        i++;
      }
      const paras = buf.join("\n").split(/\n\s*\n/).filter((s) => s.trim());
      out.push("<blockquote>" + paras.map((p) => `<p>${inline(p.replace(/\n/g, " "))}</p>`).join("") + "</blockquote>");
      continue;
    }
    const buf = [];
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,3}\s|[-*]\s|\||>|---)/.test(lines[i]) && !/^ {2,}\S/.test(lines[i])) {
      buf.push(lines[i].trim()); i++;
    }
    flushPara(buf);
  }
  return out.join("\n");
}
function stripTitleBlock(md) {
  const idx = md.replace(/\r/g, "").indexOf("\n---");
  return idx >= 0 ? md.slice(md.indexOf("\n", idx + 1) + 1) : md;
}

// ---- brand marks ----
const CIRCLE = `<svg viewBox="0 0 120 62" preserveAspectRatio="none"><path d="M96 12C78 3 40 4 22 16 4 28 9 47 30 55c21 8 60 4 74-9 12-11 6-27-16-35-10-4-25-4-34-1" fill="none" stroke-width="2.4" stroke-linecap="round"/></svg>`;
// The committed brand logo (bright hand-drawn wordmark), inlined so the PDF
// cover uses the exact same mark as the site header and email.
const LOGO_SVG = readFileSync(join(REPO, "public/brand/pivotum-logo-tight.svg"), "utf8");
const WORDMARK = `<div class="brandmark">${LOGO_SVG}</div>`;

function coverParent(meta) {
  const col = meta.score < 6.5 ? "var(--pen-safe)" : "var(--pen)";
  return `<section class="cover">
    ${WORDMARK}
    <div class="kicker">The Degree Risk Index · ${EDITION} Edition</div>
    <h1>${meta.title}</h1>
    <p class="sub">The complete profile — the full scores by track, the six factors behind them, the honest downsides, and what to ask before you commit.</p>
    <div class="score">
      <div class="circle" style="color:${col}">
        <span class="num" style="color:var(--ink)">${meta.score.toFixed(1)}</span>
        ${CIRCLE.replace("<path", `<path style="stroke:${col}"`)}
      </div>
      <div class="lab"><span class="k">AI exposure · ${esc(meta.track)}</span><span class="d">where 10 is most at risk</span></div>
    </div>
    <p class="lede">Read this one first; send the student version to them.</p>
  </section>`;
}
function coverStudent(title) {
  return `<section class="cover">
    ${WORDMARK}
    <div class="kicker">The Degree Risk Index · ${EDITION} Edition</div>
    <h1>${inline(title)}</h1>
    <p class="sub">The short version — written for you, not about you.</p>
    <p class="lede">Everything that matters, none of the bits written for your parents.</p>
  </section>`;
}
const LEGEND = `<div class="legend"><p style="font-family:var(--sans);font-size:8.5pt;letter-spacing:.06em;text-transform:uppercase;color:var(--pencil);margin:0">Highlighting is color-coded</p>
  <div class="row">
    <span class="item"><span class="sw" style="background:var(--hl-find)"></span>The finding</span>
    <span class="item"><span class="sw" style="background:var(--hl-expo)"></span>Exposure</span>
    <span class="item"><span class="sw" style="background:var(--hl-prot)"></span>Protection</span>
    <span class="item"><span class="sw" style="background:var(--hl-meth)"></span>Method &amp; honesty</span>
  </div></div>`;

async function main() {
  const [slug, kind, mdPath, outPdf] = process.argv.slice(2);
  if (!slug || !kind || !mdPath || !outPdf) {
    console.error("usage: generate.mjs <slug> <parent|student> <markdown> <out.pdf>");
    process.exit(1);
  }
  const meta = careerMeta(slug);
  const raw = readFileSync(mdPath, "utf8");
  const firstH1 = /^#\s+(.*)$/m.exec(raw)?.[1] ?? meta.name;
  let body = mdToHtml(stripTitleBlock(raw));
  // Parent only: drop the factor-rating visual in right after the six-factors heading.
  if (kind !== "student") {
    const bars = factorBars(meta);
    if (bars) body = body.replace(/(<h[12]>[^<]*six factors[^<]*<\/h[12]>)/i, `$1${bars}`);
  }
  const cover = kind === "student" ? coverStudent(firstH1) : coverParent(meta);
  const legend = kind === "student" ? "" : `<section>${LEGEND}<hr></section>`;
  const appx = kind === "student" ? "" : appendix(slug);

  const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="file://${join(DIR, "brand.css")}"></head>
<body>${cover}${legend}<section class="sheet">${body}</section>${appx}</body></html>`;
  const htmlPath = join(tmpdir(), `pivotum_${slug}_${kind}.html`);
  writeFileSync(htmlPath, html);

  const footer = `<div style="font-family:'Archivo',Arial,sans-serif;font-size:8px;color:#8a8178;width:100%;padding:0 1.4cm;display:flex;justify-content:space-between;">
    <span>${esc(meta.name)} · Pivotum ${EDITION} Edition</span><span class="pageNumber"></span></div>`;

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
  console.log(`wrote ${outPdf}  (${meta.score.toFixed(1)} ${meta.score < 6.5 ? "green" : "red"})`);
}
main();
