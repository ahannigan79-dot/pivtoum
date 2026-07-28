/**
 * Content generator. Parses _source/samplers/*.md (fixed, uniform template) into
 *   - data/careers.ts   (all scores; the single source of truth)
 *   - content/careers/<slug>.mdx  (prose; tables/FAQ/related/buy become components)
 *   - content/careers/registry.ts (static import map)
 *
 * Scores are extracted deterministically — never hand-transcribed. Re-run after
 * editing a sampler. Warnings print for anything the parser can't resolve.
 *
 *   node scripts/gen-content.mjs
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "_source/samplers");
const MDX_DIR = join(ROOT, "content/careers");

const warnings = [];
const warn = (slug, msg) => warnings.push(`  [${slug}] ${msg}`);

/* ---- Canonical names + related-link alias resolution ---------------------- */

const NAMES = {
  accounting: "Accounting", agriculture: "Agriculture", "allied-health": "Allied Health",
  architecture: "Architecture", business: "Business & Management", construction: "Construction",
  cybersecurity: "Cybersecurity", "data-science": "Data Science", dentistry: "Dentistry",
  design: "Graphic Design", engineering: "Engineering", finance: "Finance",
  hospitality: "Hospitality", journalism: "Journalism", law: "Law",
  "life-sciences": "Life Sciences", marketing: "Marketing", medicine: "Medicine",
  nursing: "Nursing", pharmacy: "Pharmacy", psychology: "Psychology",
  "social-work": "Social Work", teaching: "Teaching", trades: "Skilled Trades",
  translation: "Translation", transport: "Transport", veterinary: "Veterinary Medicine",
  "computer-science": "Computer science",
};

const norm = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z]/g, "");

// explicit alias → slug (normalised)
const ALIAS = {};
const addAlias = (slug, ...aliases) => aliases.forEach((a) => (ALIAS[norm(a)] = slug));
addAlias("computer-science", "Computer science");
addAlias("business", "Business and management", "Business & management", "Business");
addAlias("trades", "Skilled trades", "Trades");
addAlias("data-science", "Data science & analytics", "Data science and analytics", "Data science");
addAlias("construction", "Construction & project management", "Construction and project management", "Construction");
addAlias("marketing", "Marketing & communications", "Marketing and communications", "Marketing");
addAlias("veterinary", "Veterinary medicine", "Veterinary");
addAlias("design", "Graphic & visual design", "Graphic and visual design", "Graphic design", "Design");
addAlias("allied-health", "Physical therapy & allied health", "Physical therapy and allied health", "Allied health", "Physical therapy");
addAlias("journalism", "Journalism & media", "Journalism and media", "Journalism");
addAlias("transport", "Transport, aviation & logistics", "Transport aviation and logistics", "Transport");
addAlias("agriculture", "Agriculture, environment & conservation", "Agriculture environment and conservation", "Agriculture");
addAlias("social-work", "Social work");
addAlias("life-sciences", "Life sciences");
// self-aliases for the simple ones
for (const slug of Object.keys(NAMES)) addAlias(slug, NAMES[slug], slug.replace(/-/g, " "));

function resolveRelated(displayName) {
  const n = norm(displayName);
  if (ALIAS[n]) return ALIAS[n];
  // fallback: a slug whose normalised name is a prefix of the alias
  for (const slug of Object.keys(NAMES)) {
    if (n.startsWith(norm(NAMES[slug])) || norm(NAMES[slug]).startsWith(n)) return slug;
  }
  return null;
}

const BANDS = {
  "very low": "very-low", low: "low", "low-mod": "low-mod", "low-moderate": "low-mod",
  moderate: "moderate", "mod-high": "mod-high", "moderate-high": "mod-high",
  high: "high", "very high": "high",
};
const band = (s, slug) => {
  const raw = strip(s).toLowerCase();
  if (/highest/.test(raw)) return "high";
  if (/lowest/.test(raw)) return "very-low";
  const key = raw.replace(/[–—]/g, "-").replace(/\s*-\s*/g, "-");
  return BANDS[key] || (warn(slug, `unknown band "${s}"`), "moderate");
};

const cells = (line) => line.split("|").slice(1, -1).map((c) => c.trim());
const strip = (s) => s.replace(/\*\*/g, "").trim();
const num = (s) => parseFloat(strip(s));

/* ---- Parse one sampler ---------------------------------------------------- */

function parseSampler(slug, md) {
  const lines = md.split("\n");
  const name = NAMES[slug] || slug;

  const h1 = (lines.find((l) => l.startsWith("# ")) || "").slice(2).trim();
  const title = h1.replace(/\s*The\s+2026\b.*$/i, "").trim() || `Is ${name} Safe From AI?`;

  // quick answer (may span consecutive "> " lines)
  const qi = lines.findIndex((l) => /^>\s*\*\*Quick answer/i.test(l));
  let quickAnswer = "";
  if (qi >= 0) {
    let j = qi;
    const parts = [];
    while (j < lines.length && lines[j].startsWith(">")) {
      parts.push(lines[j].replace(/^>\s?/, ""));
      j++;
    }
    quickAnswer = parts.join(" ").replace(/\*\*Quick answer:?\*\*\s*/i, "").trim();
    quickAnswer = quickAnswer.replace(/\bthirty\b(?=\s+(careers|degrees|professions|jobs))/gi, "{n}");
  } else warn(slug, "no quick answer found");

  const headMatch = quickAnswer.match(/(\d+(?:\.\d)?)/);
  const headlineScore = headMatch ? parseFloat(headMatch[1]) : 0;
  if (!headMatch) warn(slug, "no headline score in quick answer");

  // score table (header has 2023 & 2025)
  const si = lines.findIndex((l) => /^\|.*\b2023\b.*\b2025\b/.test(l));
  const tracks = [];
  if (si >= 0) {
    for (let j = si + 2; j < lines.length && lines[j].trim().startsWith("|"); j++) {
      const c = cells(lines[j]);
      if (c.length < 6) continue;
      tracks.push({
        name: strip(c[0]),
        scores: { "2023": num(c[1]), "2025": num(c[2]), "2026": num(c[3]) },
        band: band(c[5], slug),
      });
    }
  }
  if (!tracks.length) warn(slug, "no score-table tracks parsed");

  const headlineTrack =
    tracks.find((t) => t.scores["2026"] === headlineScore)?.name || tracks[0]?.name || "";

  // factor table
  const fi = lines.findIndex((l) => /^\|\s*Factor\s*\|\s*Rating/i.test(l));
  const factors = [];
  if (fi >= 0) {
    for (let j = fi + 2; j < lines.length && lines[j].trim().startsWith("|"); j++) {
      const c = cells(lines[j]);
      if (c.length < 3) continue;
      const effect = c[2].toLowerCase();
      const direction = /↑|exposure|increase/.test(effect) ? "exposure" : "protection";
      factors.push({ question: strip(c[0]), rating: num(c[1]), direction });
    }
  }
  if (factors.length !== 6) warn(slug, `expected 6 factors, got ${factors.length}`);

  // worked factor — the first bold heading (ending in "?") after the worked marker.
  // Some samplers write "<question> — rated X", others "<question> — <commentary>".
  const wi = lines.findIndex((l) => /worked through in full/i.test(l));
  let workedFactor = "";
  if (wi >= 0) {
    for (let j = wi + 1; j < Math.min(wi + 8, lines.length); j++) {
      const m = lines[j].trim().match(/^\*\*(.+?)\*\*/);
      if (m && m[1].includes("?")) {
        const q = m[1].split(/\s+[—–-]+\s+/)[0].trim();
        const hit = factors.find(
          (f) => f.question === q || f.question.startsWith(q) || q.startsWith(f.question),
        );
        workedFactor = hit ? hit.question : q;
        break;
      }
    }
  }
  if (!workedFactor) {
    workedFactor = factors.find((f) => f.direction === "protection")?.question || factors[0]?.question || "";
    warn(slug, "worked factor not found in prose; fell back to a factor");
  }

  // FAQ
  const faqs = [];
  const cqi = lines.findIndex((l) => /^##\s+Common questions/i.test(l));
  if (cqi >= 0) {
    let j = cqi + 1;
    let cur = null;
    for (; j < lines.length; j++) {
      const t = lines[j].trim();
      if (/^---$/.test(t) || /^##\s/.test(t)) break;
      const qm = t.match(/^\*\*(.+\?)\*\*\s*(.*)$/);
      if (qm) {
        if (cur) faqs.push(cur);
        cur = { q: qm[1].trim(), a: qm[2].trim() };
      } else if (cur && t) {
        cur.a = (cur.a ? cur.a + " " : "") + t;
      }
    }
    if (cur) faqs.push(cur);
  }
  if (!faqs.length) warn(slug, "no FAQs parsed");

  // related
  const related = [];
  const ri = lines.findIndex((l) => /^##\s+Related profiles/i.test(l));
  if (ri >= 0) {
    for (let j = ri + 1; j < lines.length; j++) {
      const t = lines[j].trim();
      if (/^---$/.test(t) || /^##\s/.test(t)) break;
      const m = t.match(/^\-\s*\*\*\[([^\]]+)\]/);
      if (m) {
        const s = resolveRelated(m[1]);
        if (s && s !== slug && !related.includes(s)) related.push(s);
        else if (!s) warn(slug, `unresolved related "${m[1]}"`);
      }
    }
  }

  return {
    slug, name, title,
    description: `${name} AI exposure score, Fall 2026 edition. Scored on six factors with a three-year trend.`,
    edition: "Fall 2026", datePublished: "2026-07-01", dateModified: "2026-07-28",
    quickAnswer, headlineScore, headlineTrack, tracks, factors, workedFactor, faqs, related,
    hasFullProfile: [
      // Careers with real parent + student PDFs loaded (sellable). Add a slug
      // here as its PDFs go live; keep in sync with profiles-src/.
      "nursing", "medicine", "law", "business", "psychology",
      "accounting", "architecture", "design", "engineering", "finance",
      "journalism", "marketing", "teaching", "trades",
    ].includes(slug),
  };
}

/* ---- Generate MDX body ---------------------------------------------------- */

const skipTable = (lines, i) => {
  let j = i;
  while (j < lines.length && lines[j].trim().startsWith("|")) j++;
  return j;
};
const skipToBreak = (lines, i) => {
  let j = i;
  while (j < lines.length && !/^---$/.test(lines[j].trim()) && !/^#{2,3}\s/.test(lines[j].trim())) j++;
  return j;
};
const countRepl = (s) => s.replace(/\bthirty\b(?=\s+(careers|degrees|professions|jobs))/gi, "<CareerCount />");

function generateMdx(slug, md) {
  const lines = md.split("\n");
  const qi = lines.findIndex((l) => /^>\s*\*\*Quick answer/i.test(l));
  let i = qi;
  while (i < lines.length && lines[i].startsWith(">")) i++; // past quick answer
  while (i < lines.length && (lines[i].trim() === "" || lines[i].trim() === "---")) i++; // past separators

  const out = [];
  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();

    if (/^#{2,3}\s+Get the full profiles/i.test(t)) { out.push("", "<BuyBlock />"); break; }

    if (/^\|.*\b2023\b.*\b2025\b/.test(t)) { out.push("<ScoreTable />"); i = skipTable(lines, i); continue; }
    if (/^\|\s*Factor\s*\|\s*Rating/i.test(t)) { out.push("<FactorList />"); i = skipTable(lines, i); continue; }
    if (/^\|\s*AI is taking\s*\|/i.test(t)) {
      const taking = [], untouched = [];
      for (let j = i + 2; j < lines.length && lines[j].trim().startsWith("|"); j++) {
        const c = cells(lines[j]);
        if (c.length >= 2) { taking.push(c[0]); untouched.push(c[1]); }
      }
      out.push(
        "<VersusGrid",
        `  taking={${JSON.stringify(taking)}}`,
        `  untouched={${JSON.stringify(untouched)}}`,
        "/>",
      );
      i = skipTable(lines, i);
      continue;
    }
    if (/^\|\s*\|\s*Sampler\s*\|/i.test(t)) { out.push("<FullProfileTable />"); i = skipTable(lines, i); continue; }

    if (/^\*\*How that compares:?\*\*/i.test(t)) {
      const rest = t.replace(/^\*\*How that compares:?\*\*\s*/i, "");
      out.push(`<MarginNote label="For scale">${rest}</MarginNote>`);
      i++; continue;
    }
    if (/^##\s+Common questions/i.test(t)) { out.push("## Common questions", "", "<FaqList />"); i = skipToBreak(lines, i + 1); continue; }
    if (/^##\s+Related profiles/i.test(t)) { out.push("## Related profiles", "", "<RelatedCareers />"); i = skipToBreak(lines, i + 1); continue; }

    if (/worked through in full/i.test(t)) {
      i++;
      const body = [];
      while (i < lines.length && !/^---$/.test(lines[i].trim()) && !/^##\s/.test(lines[i].trim())) {
        const b = lines[i].trim();
        const isFine = /^\*.*\*$/.test(b) && /so you can see/i.test(b);
        const isRated = /^\*\*.*\s*[—-]+\s*rated/i.test(b);
        if (!isFine && !isRated) body.push(lines[i]);
        i++;
      }
      while (body.length && body[0].trim() === "") body.shift();
      while (body.length && body[body.length - 1].trim() === "") body.pop();
      out.push("<WorkedExample>", "", ...body.map(countRepl), "", "</WorkedExample>");
      continue;
    }

    out.push(countRepl(line));
    i++;
  }
  // guarantee blank lines around thematic breaks, then collapse extra blanks
  let s = out.join("\n");
  s = s.replace(/\n-{3}\n/g, "\n\n---\n\n").replace(/\n{3,}/g, "\n\n");
  return s.trim() + "\n";
}

/* ---- Run ------------------------------------------------------------------ */

const files = readdirSync(SRC).filter((f) => f.endsWith("-sampler-free.md"));
const parsed = [];
mkdirSync(MDX_DIR, { recursive: true });

for (const file of files) {
  const slug = file.replace("-sampler-free.md", "");
  const md = readFileSync(join(SRC, file), "utf8");
  parsed.push(parseSampler(slug, md));
  writeFileSync(join(MDX_DIR, `${slug}.mdx`), generateMdx(slug, md));
}
parsed.sort((a, b) => a.slug.localeCompare(b.slug));

// Computer science — the free full profile. Scores from its long-form profile;
// no sampler MDX (its page uses a separate template).
const CS = {
  slug: "computer-science", name: "Computer science",
  title: "Is a Computer Science Degree Still Worth It?",
  description: "Computer science AI exposure score, Fall 2026 edition. The entry rung is the second-highest score in the index; senior work is protected.",
  edition: "Fall 2026", datePublished: "2026-07-01", dateModified: "2026-07-28",
  quickAnswer: "Computer science is not dying — its entrance is. An entry-level developer scores **8.1** for AI exposure, the second-highest of the {n} careers we track, while a senior engineer scores **5.4** and embedded, safety-critical work **4.7**. ==-Nothing in software scores below 4.7, and the entry rung is the second-highest score in the entire index.== The field is protected at the top by judgment and accountability, and at the bottom by nothing at all.",
  headlineScore: 8.1, headlineTrack: "Entry-level developer",
  tracks: [
    { name: "Embedded / safety-critical systems", scores: { "2023": 4.0, "2025": 4.3, "2026": 4.7 }, band: "moderate" },
    { name: "Security engineering", scores: { "2023": 4.6, "2025": 5.0, "2026": 5.3 }, band: "moderate" },
    { name: "Senior engineer / architect", scores: { "2023": 4.6, "2025": 5.0, "2026": 5.4 }, band: "moderate" },
    { name: "ML / AI engineering", scores: { "2023": 5.0, "2025": 5.5, "2026": 6.0 }, band: "moderate" },
    { name: "Backend / infrastructure", scores: { "2023": 5.8, "2025": 6.4, "2026": 6.8 }, band: "mod-high" },
    { name: "Frontend / application development", scores: { "2023": 6.5, "2025": 7.1, "2026": 7.6 }, band: "high" },
    { name: "Entry-level developer", scores: { "2023": 6.3, "2025": 7.4, "2026": 8.1 }, band: "high" },
  ],
  factors: [], workedFactor: "", faqs: [],
  related: ["data-science", "cybersecurity", "engineering", "nursing"], hasFullProfile: true,
};

const all = [...parsed, CS];

/* ---- Emit data/careers.ts ------------------------------------------------- */

const HEADER = `/* ============================================================================
   Pivotum career data — the single source of truth for every score.
   GENERATED by scripts/gen-content.mjs from _source/samplers. Re-run after
   editing a sampler. Computer science is appended by hand (free full profile).
   Rule: if a number appears in prose, it must also exist here.
   ============================================================================ */

export type Band =
  | "very-low" | "low" | "low-mod" | "moderate" | "mod-high" | "high";

export interface Track {
  name: string;
  scores: { "2023": number; "2025": number; "2026": number };
  band: Band;
}
export interface Factor {
  question: string;
  rating: number;
  direction: "exposure" | "protection";
}
export interface Faq { q: string; a: string; }
export interface Career {
  slug: string; name: string; title: string; description: string;
  edition: string; datePublished: string; dateModified: string;
  quickAnswer: string; headlineScore: number; headlineTrack: string;
  tracks: Track[]; factors: Factor[]; workedFactor: string;
  faqs: Faq[]; related: string[]; hasFullProfile: boolean;
}
`;

const FOOTER = `
const bySlug = new Map(careers.map((c) => [c.slug, c]));
export function getCareer(slug: string): Career | undefined { return bySlug.get(slug); }
export function allSlugs(): string[] { return careers.map((c) => c.slug); }
export const careerCount = careers.length;
export function nowScore(t: Track): number { return t.scores["2026"]; }
export function careerRange(c: Career): { safest: number; exposed: number } {
  const scores = c.tracks.map(nowScore);
  return { safest: Math.min(...scores), exposed: Math.max(...scores) };
}
`;

const body = `\nexport const careers: Career[] = ${JSON.stringify(all, null, 2)};\n`;
writeFileSync(join(ROOT, "data/careers.ts"), HEADER + body + FOOTER);

/* ---- Emit registry -------------------------------------------------------- */

const reg = `import type { FC } from "react";
import type { MDXComponents } from "mdx/types";

type MDXModule = { default: FC<{ components?: MDXComponents }> };

/** slug → sampler MDX body. GENERATED by scripts/gen-content.mjs. */
export const careerMdx: Record<string, () => Promise<MDXModule>> = {
${parsed.map((c) => `  "${c.slug}": () => import("./${c.slug}.mdx"),`).join("\n")}
};

export const samplerSlugs = Object.keys(careerMdx);
export function hasSamplerPage(slug: string): boolean { return slug in careerMdx; }
`;
writeFileSync(join(MDX_DIR, "registry.ts"), reg);

/* ---- Report --------------------------------------------------------------- */

console.log(`Parsed ${parsed.length} samplers + computer science.`);
console.log(`Careers: ${all.length}. MDX files: ${parsed.length}.`);
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  console.log(warnings.join("\n"));
} else {
  console.log("No warnings.");
}
