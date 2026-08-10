import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { chromium } from "playwright-core";

/**
 * Active Edition "field bridge" — the paid per-field deliverable that plugs into
 * Move 4 of the Active guide. Generic over career slug: the scored tracks are
 * read from data/careers.ts; the field-specific prose (lanes, steps, timeline,
 * traps, exits, targets) lives in FIELDS below. Forks parent/student.
 *
 *   node scripts/pdf/generate-bridge.mjs <out.pdf> <slug> [student|parent]
 */
const DIR = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(DIR, "../..");
const CHROME = process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const EDITION = /EDITION\s*=\s*"([^"]+)"/.exec(readFileSync(join(REPO, "lib/site.ts"), "utf8"))[1];
const LOGO_SVG = readFileSync(join(REPO, "public/brand/pivotum-logo-tight.svg"), "utf8");

const SLUG = (process.argv[3] || "").toLowerCase();
const S = (process.argv[4] || "parent").toLowerCase() === "student";
const pick = (p, s) => (S ? s : p);
// Site legend: low exposure (<=4.0) green, high (>=6.5) red, moderate ink.
const col = (v) => (v <= 4.0 ? "var(--pen-safe)" : v >= 6.5 ? "var(--pen)" : "var(--ink)");

function tracksFor(slug) {
  const src = readFileSync(join(REPO, "data/careers.ts"), "utf8");
  const i = src.indexOf(`"slug": "${slug}"`);
  if (i < 0) throw new Error(`slug not found: ${slug}`);
  const ti = src.indexOf('"tracks":', i);
  const end = src.indexOf('"factors":', ti);
  const seg = src.slice(ti, end);
  return [...seg.matchAll(/"name":\s*"([^"]+)"[\s\S]*?"2026":\s*([\d.]+)/g)]
    .map((m) => ({ n: m[1], s: Number(m[2]) }))
    .sort((a, b) => a.s - b.s);
}

const FIELDS = {
  "computer-science": {
    label: "Computer Science",
    headline: "Computer science: the entrance is exposed. The work isn&rsquo;t.",
    intro: "The Active guide told " + pick("your kid", "you") + " to steer toward the protected adjacent track. Here it is, for computer science &mdash; and the exact bridge to it from where " + pick("they", "you") + " probably stand today.",
    fromLabel: "Where " + pick("they&rsquo;re", "you&rsquo;re") + " probably starting",
    toLabel: "Where to aim",
    scoredNote: "The same job title, <b>3.4 points apart</b>. The entry-level rung is the second-most-exposed job in the entire index; the safe lane sits with the work that&rsquo;s physical, security-critical, or carries senior judgment.",
    niches: "The safe lane, concretely: <b>formal verification, security engineering, embedded and robotics, ML infrastructure with real domain judgment, distributed systems at scale</b> &mdash; work where correctness is load-bearing and a human is on the hook for it.",
    steps: [
      "<b>Own a system, not a queue of tickets.</b> Accountability is protection: the engineer a team trusts to be responsible for something in production is doing work no model can hold. Get your name on one service, end to end.",
      "<b>Move toward decisions that are expensive to get wrong.</b> The safe lane is where a mistake costs money, safety or a breach &mdash; embedded, security, infrastructure at scale. That&rsquo;s exactly the work a business will not hand to an unsupervised model.",
      "<b>Be the operator of the tools, not the competition for them.</b> Use AI to ship faster and review its output with judgment. The engineer who supervises generated code is leverage; the one who writes the boilerplate it replaces is the 8.1.",
      "<b>Skip the disappearing rung on purpose.</b> Don&rsquo;t spend three years on CRUD hoping to be promoted out of it &mdash; the rung is automating under you. Aim at judgment work deliberately, from the first job you take.",
    ],
    timeline: [
      { w: "This year", b: "One project " + pick("your kid designs", "you design") + " and <b>owns</b>, not another CRUD app. A safe-niche elective &mdash; security, systems, or embedded. An internship or role <b>near production</b>. And real fluency with the AI tools." },
      { w: "First job", b: "Optimise for <b>ownership and consequence</b>, not brand or starting salary. A team where " + pick("they&rsquo;re", "you&rsquo;re") + " responsible for something live beats a prestigious one with forty juniors writing tickets. Say yes to on-call." },
      { w: "Years 2&ndash;3", b: "Bank the r&eacute;sum&eacute; line no model can reproduce: a security review " + pick("they led", "you led") + ", a system " + pick("they own", "you own") + ", an incident " + pick("they handled", "you handled") + " end to end." },
    ],
    traps: [
      "<b>Grinding tickets and CRUD</b> hoping to be promoted out &mdash; the rung is automating under you, not lifting you.",
      "<b>Chasing the hottest framework</b> instead of the durable fundamentals: systems, security, judgment.",
      "<b>Treating leetcode as the destination.</b> It&rsquo;s the door, not the room.",
      "<b>Optimising the first job for brand or salary</b> over ownership and consequence.",
      "<b>Being the fastest code-typer</b> rather than the one who supervises the machine&rsquo;s output. Speed at boilerplate <em>is</em> the 8.1.",
    ],
    exits: [
      "<b>Cybersecurity</b> &mdash; the adversary keeps changing, so the work resists automation better than most of software. Your CS base transfers directly.",
      "<b>SRE / production reliability</b> &mdash; paid for accountability under pressure, which is precisely what a model can&rsquo;t be.",
      "<b>Embedded &amp; hardware-adjacent</b> &mdash; safety-critical, physical-world, and the lowest-scoring corner of the field.",
      "<b>ML engineering with real domain judgment</b> &mdash; not model plumbing, but knowing what to build and when it&rsquo;s wrong.",
      "<b>Technical roles in regulated industries</b> &mdash; where a human has to sign off, the human keeps the job.",
    ],
    targets: [
      "<b>They ask for &lsquo;system design &amp; ownership.&rsquo;</b> First credible unit: write the design doc for one component and get it reviewed by a senior.",
      "<b>They ask for &lsquo;production experience, on-call.&rsquo;</b> First unit: get onto a rotation and handle one incident start to finish.",
      "<b>They ask for &lsquo;works through ambiguity, cross-team.&rsquo;</b> First unit: lead one small thing that touches another team.",
      "<b>They ask for a &lsquo;security / correctness mindset.&rsquo;</b> First unit: ship one feature that goes through a real security review.",
      "<b>They ask for &lsquo;mentorship, leverage.&rsquo;</b> First unit: onboard one junior, or own the runbook nobody wants to write.",
    ],
    close: "The field isn&rsquo;t the bet &mdash; this bridge is. Point every choice from here at the safe lane, and the 8.1 " + pick("your kid", "you") + " might have walked into becomes a 5.4 " + pick("they", "you") + " chose on purpose.",
  },

  "nursing": {
    label: "Nursing",
    headline: "Nursing: the protection is real. It lives at the bedside, not on the badge.",
    intro: "The Active guide told " + pick("your kid", "you") + " to steer toward the protected adjacent track. In nursing the safe lane is wide &mdash; but it&rsquo;s conditional, and it&rsquo;s not where the workforce is being pushed. Here&rsquo;s how to stay in it.",
    fromLabel: "The exposed edge &mdash; don&rsquo;t drift here",
    toLabel: "Where the protection is",
    scoredNote: "The same license, <b>3 points apart</b>. Hands-on clinical work is among the safest we score; the value drops the moment the role moves to a screen.",
    niches: "The safe lane, concretely: <b>specialist clinical (ICU, ER, perioperative), bedside acute care, community and home health, and nurse-practitioner / advanced practice</b> &mdash; work that is physical, high-stakes, and tied to a licensed human at the point of care.",
    steps: [
      "<b>Stay where the hands and the stakes are.</b> The protection isn&rsquo;t the RN license &mdash; it&rsquo;s being physically present for high-stakes, unpredictable care. Specialize into acute, critical or procedural work and the moat deepens.",
      "<b>Treat &lsquo;remote&rsquo; and &lsquo;review&rsquo; roles as the exposed edge.</b> Telehealth triage and utilisation review pay well and sound modern &mdash; and they score nearly double, because a screen-based protocol job is what software does best. Go there with eyes open, not by default.",
      "<b>Climb toward advanced practice.</b> Nurse practitioner and advanced practice add diagnostic authority and autonomy &mdash; more license, more judgment, more protection. It&rsquo;s the clearest upward safe lane.",
      "<b>Be the nurse who wields the AI, not the one it routes around.</b> Charting, triage support and documentation are automating; the nurse who uses those tools to spend more time in judgment and care gets leverage, not replacement.",
    ],
    timeline: [
      { w: "In training", b: "Choose clinical placements in acute, critical or procedural settings, not admin-adjacent ones. Get comfortable where the stakes are highest &mdash; that&rsquo;s where the protection concentrates." },
      { w: "First role", b: "Take the bedside or specialist post over the tempting remote/triage job. The early hands-on reps are what compound into a protected career." },
      { w: "Years 2&ndash;3", b: "Specialize or move toward advanced practice &mdash; an ICU/ER/perioperative certification, or the NP track. Each step adds licensed judgment a model can&rsquo;t hold." },
    ],
    traps: [
      "<b>Chasing the remote triage job</b> because it&rsquo;s comfortable &mdash; it&rsquo;s the most exposed nursing work there is.",
      "<b>Treating the RN license as the protection.</b> The license gets you in; the <em>bedside</em> keeps you safe.",
      "<b>Drifting into pure documentation or utilisation review</b> as a career, not a rotation.",
      "<b>Avoiding the hardest clinical settings</b> &mdash; they&rsquo;re exactly the protected ones.",
      "<b>Ignoring the AI charting tools</b> instead of becoming the person who uses them best.",
    ],
    exits: [
      "<b>Nurse practitioner / advanced practice</b> &mdash; more autonomy, diagnostic authority and protection.",
      "<b>Nurse anaesthesia (CRNA)</b> &mdash; among the most protected, highest-stakes clinical work.",
      "<b>Perioperative &amp; procedural specialties</b> &mdash; physical, in-person, hard to automate.",
      "<b>Public health &amp; community-care leadership</b> &mdash; human coordination and trust.",
      "<b>Clinical educator</b> &mdash; teaching judgment to the next cohort.",
    ],
    targets: [
      "<b>They ask for a clinical specialty certification.</b> First credible unit: start the hours toward one (ICU / ER / OR) now.",
      "<b>They ask for acute / critical-care experience.</b> First unit: request a rotation into the highest-acuity unit you can.",
      "<b>They ask for &lsquo;works autonomously under pressure.&rsquo;</b> First unit: take a charge-nurse or preceptor shift once.",
      "<b>They ask for advanced-practice readiness.</b> First unit: map the NP prerequisites and knock out one.",
      "<b>They ask for AI-tool fluency in charting / triage.</b> First unit: become the unit&rsquo;s go-to on the new system.",
    ],
    close: "The field isn&rsquo;t the bet &mdash; the bedside is. Stay where the care is physical and the stakes are real, and nursing stays one of the safest careers " + pick("your kid", "you") + " could choose.",
  },

  "law": {
    label: "Law",
    headline: "Law: the widest split of any licensed profession. Pick the right side of it.",
    intro: "The Active guide told " + pick("your kid", "you") + " to steer toward the protected adjacent track. In law the gap between the safe lane and the exposed one is the widest we score &mdash; and the exposed one is the traditional way in. Here&rsquo;s the bridge across it.",
    fromLabel: "The collapsing on-ramp",
    toLabel: "Where to aim",
    scoredNote: "Same bar exam, <b>3.4 points apart</b>. The courtroom and the client relationship are protected; document review and routine drafting &mdash; the traditional on-ramp &mdash; are the most exposed work in the profession.",
    niches: "The safe lane, concretely: <b>trial litigation and advocacy, regulatory and compliance counsel, in-house counsel close to the business, and any practice built on judgment, negotiation, and a client who needs a human to trust</b>.",
    steps: [
      "<b>Get in front of people, fast.</b> The protected lawyer is the one in the room &mdash; advocating, negotiating, advising a client who needs a human to trust. Every step toward the courtroom or the client is a step into the safe lane.",
      "<b>The document-review on-ramp is collapsing &mdash; don&rsquo;t bank a career on it.</b> It&rsquo;s the highest-scoring legal work because it&rsquo;s exactly what AI does well. Use it to learn, not to stay.",
      "<b>Specialize where the stakes and the ambiguity are high.</b> Regulatory, litigation and complex advisory work resist automation because the cost of being wrong is enormous and the situations are genuinely novel.",
      "<b>Direct the AI research, don&rsquo;t compete with it.</b> Supervising and judging AI-drafted work with expertise is leverage; producing the first draft it now writes is the 7.9.",
    ],
    timeline: [
      { w: "Law school", b: "Chase advocacy: moot court, clinics, trial ad, a litigation or regulatory clerkship. Build the in-person, judgment muscles early." },
      { w: "First years", b: "Optimise for a seat with client contact and courtroom exposure over a pure back-office doc-review role, even at a big name." },
      { w: "Years 2&ndash;3", b: "Specialize into a high-stakes, high-ambiguity area &mdash; litigation, regulatory, in-house &mdash; and build the client relationships no model can hold." },
    ],
    traps: [
      "<b>Settling into document review or due diligence</b> as a career, not a training rung.",
      "<b>Choosing prestige over client contact.</b> Forty-associate back-office teams are the exposed lane.",
      "<b>Assuming the bar license alone protects you.</b> It protects the courtroom, not the back office.",
      "<b>Competing with AI on drafting speed</b> instead of directing it with judgment.",
      "<b>Avoiding the courtroom</b> because advocacy is harder than research.",
    ],
    exits: [
      "<b>Litigation &amp; trial advocacy</b> &mdash; the most protected legal work there is.",
      "<b>Regulatory &amp; compliance counsel</b> &mdash; judgment where being wrong is expensive.",
      "<b>In-house counsel</b> &mdash; embedded in the business, trusted, human-accountable.",
      "<b>Mediation &amp; negotiation</b> &mdash; pure human-in-the-room work.",
      "<b>Policy &amp; government affairs</b> &mdash; relationships and judgment over documents.",
    ],
    targets: [
      "<b>They ask for &lsquo;first-chair / courtroom experience.&rsquo;</b> First credible unit: get a small matter or clinic case you argue yourself.",
      "<b>They ask for client-facing judgment.</b> First unit: own one client relationship end to end.",
      "<b>They ask for a regulatory specialty.</b> First unit: take the one filing or matter nobody else understands.",
      "<b>They ask for negotiation.</b> First unit: lead one deal or settlement conversation.",
      "<b>They ask for AI-assisted practice fluency.</b> First unit: run one matter using the firm&rsquo;s AI tools and supervise the output.",
    ],
    close: "The field isn&rsquo;t the bet &mdash; which side of the split " + pick("your kid lands on", "you land on") + " is. Aim at the room, the client and the hard call, and law stays a profession AI can&rsquo;t hollow out.",
  },

  "accounting": {
    label: "Accounting",
    headline: "Accounting: it all turns on the license. Get to the side of it software can&rsquo;t hold.",
    intro: "The Active guide told " + pick("your kid", "you") + " to steer toward the protected adjacent track. In accounting the split is stark: the CPA signature is a legal monopoly no software can hold, and everything below it is among the most automatable work we score. Here&rsquo;s the bridge to the license.",
    fromLabel: "The automatable base",
    toLabel: "Where to aim",
    scoredNote: "Same field, <b>2.7 points apart</b>. Bookkeeping and routine preparation are among the most automatable work in the index; audit and CPA advisory sit behind a signature the law reserves for a licensed human.",
    niches: "The safe lane, concretely: <b>audit and CPA advisory, complex tax advisory, and controller / management roles that own judgment and sign-off</b> &mdash; work where a licensed human is legally on the hook and the situations aren&rsquo;t routine.",
    steps: [
      "<b>Get the license, and get it early.</b> The CPA is the whole moat &mdash; a legal monopoly on the signature. Everything about the safe lane starts with being the person allowed to sign.",
      "<b>Move off transactional work as fast as you can.</b> Bookkeeping and routine tax prep score near the top because they&rsquo;re exactly what software automates. They&rsquo;re a starting rung, not a destination.",
      "<b>Own judgment and sign-off, not data entry.</b> Advisory, audit opinions and controller decisions are protected because a human is accountable for a call that isn&rsquo;t routine.",
      "<b>Be the accountant who runs the automation.</b> The one who uses AI to clear the routine work and spends the time on advice and judgment gets leverage; the one doing it by hand is the 7.9.",
    ],
    timeline: [
      { w: "Study &amp; exam", b: "Point everything at the CPA &mdash; the coursework, the hours, the exam. The license is the single highest-return move in the whole field." },
      { w: "First role", b: "Choose audit or advisory over a pure bookkeeping seat. Get close to sign-off and judgment early, even if the transactional job pays similarly now." },
      { w: "Years 2&ndash;3", b: "Build toward the signature and a specialty &mdash; complex tax, a tricky industry, controller responsibility. Own decisions, not just records." },
    ],
    traps: [
      "<b>Delaying or skipping the CPA.</b> Without the signature you&rsquo;re in the automatable base by default.",
      "<b>Building a career in bookkeeping or routine prep</b> &mdash; the most exposed work in the field.",
      "<b>Staying in data entry</b> because it&rsquo;s steady, as the tooling eats it.",
      "<b>Competing with software on speed and volume</b> instead of moving to judgment.",
      "<b>Treating AI tools as a threat</b> rather than becoming the person who runs them.",
    ],
    exits: [
      "<b>Audit &amp; assurance</b> &mdash; the licensed opinion a business is legally required to get from a human.",
      "<b>Complex tax advisory</b> &mdash; judgment-heavy, high-stakes, non-routine.",
      "<b>Controller / CFO track</b> &mdash; owning the numbers and the decisions.",
      "<b>Forensic accounting</b> &mdash; investigation and testimony, deeply human.",
      "<b>Advisory / consulting</b> &mdash; trusted counsel to a specific business.",
    ],
    targets: [
      "<b>They ask for the CPA (or progress toward it).</b> First credible unit: sit the next exam section on the calendar.",
      "<b>They ask for audit experience.</b> First unit: get onto one real audit engagement.",
      "<b>They ask for advisory / judgment work.</b> First unit: own one client&rsquo;s advisory question end to end.",
      "<b>They ask for an industry specialty.</b> First unit: become the go-to on one tricky sector&rsquo;s rules.",
      "<b>They ask for automation fluency.</b> First unit: automate one routine close task and show the time saved.",
    ],
    close: "The field isn&rsquo;t the bet &mdash; the signature is. Get licensed, get to judgment, and accounting turns from one of the most automatable fields into one a business legally needs a human for.",
  },

  "business": {
    label: "Business &amp; Management",
    headline: "Business: the most-taken degree points at the exposed end. Aim it somewhere else.",
    intro: "The Active guide told " + pick("your kid", "you") + " to steer toward the protected adjacent track. Business is the most popular degree and it points, by default, at the coordinating jobs being automated. The protected destinations are real &mdash; but " + pick("they have", "you have") + " to aim at them. Here&rsquo;s how.",
    fromLabel: "Where the degree points by default",
    toLabel: "Where to aim",
    scoredNote: "Same degree, <b>2.7 points apart</b>. Analyst and coordinator roles &mdash; the default first jobs &mdash; are heavily exposed; roles that own a P&amp;L, lead people, or run physical operations are protected because someone has to be accountable.",
    niches: "The safe lane, concretely: <b>general management with real P&amp;L ownership, supply chain and operations, and people leadership</b> &mdash; work where a human is accountable for an outcome, leads other humans, or runs something physical.",
    steps: [
      "<b>Own an outcome, not a slide deck.</b> The protected manager is accountable for a number &mdash; a P&amp;L, a team, a plant. Analyst and coordinator roles that just move information are exactly what&rsquo;s automating.",
      "<b>Get responsibility for people or physical operations.</b> Leading humans and running real-world operations resist automation because judgment, trust and accountability can&rsquo;t be handed to a model.",
      "<b>Treat the analyst / coordinator job as a rung, not a home.</b> It&rsquo;s a fine way in and a bad place to stay &mdash; it&rsquo;s the most exposed work in the field.",
      "<b>Be the manager who wields the tools.</b> Use AI to do the analysis and coordination, and spend your time on the decisions and the people. Being the human spreadsheet is the 7.6.",
    ],
    timeline: [
      { w: "In the degree", b: "Get real responsibility early &mdash; run a team, a project, a real budget in a club, job or internship. Choose operations or leadership experience over pure analysis." },
      { w: "First job", b: "Take the role with ownership and people over the prestigious analyst seat. A small P&amp;L or team beats a big-name coordinating job." },
      { w: "Years 2&ndash;3", b: "Move toward general management, operations or a leadership track &mdash; somewhere you&rsquo;re accountable for an outcome, not just preparing the materials." },
    ],
    traps: [
      "<b>Settling into an analyst or coordinator role</b> as a career &mdash; it&rsquo;s the exposed end of the field.",
      "<b>Chasing the prestigious brand</b> over actual ownership and responsibility.",
      "<b>Mistaking making slides for making decisions.</b>",
      "<b>Avoiding people-management</b> because it&rsquo;s harder than analysis &mdash; it&rsquo;s also protected.",
      "<b>Being the human spreadsheet</b> instead of the person who runs the tools.",
    ],
    exits: [
      "<b>General management / P&amp;L ownership</b> &mdash; accountable for an outcome.",
      "<b>Supply chain &amp; operations</b> &mdash; running something physical and real.",
      "<b>People / HR leadership</b> &mdash; human trust and judgment.",
      "<b>Sales leadership</b> &mdash; relationships and accountability for a number.",
      "<b>Entrepreneurship / GM of a small unit</b> &mdash; owning the whole thing.",
    ],
    targets: [
      "<b>They ask for P&amp;L or budget ownership.</b> First credible unit: own one real budget or revenue line, however small.",
      "<b>They ask for people leadership.</b> First unit: manage one person or lead one team.",
      "<b>They ask for operations experience.</b> First unit: run one real-world process end to end.",
      "<b>They ask for &lsquo;drives outcomes, not analysis.&rsquo;</b> First unit: own one result you&rsquo;re measured on.",
      "<b>They ask for tool fluency.</b> First unit: automate one reporting task your team does by hand.",
    ],
    close: "The field isn&rsquo;t the bet &mdash; where " + pick("they aim", "you aim") + " the degree is. Point it at ownership, people and operations, and &lsquo;business&rsquo; becomes one of the safer bets instead of the default exposed one.",
  },
};

async function main() {
  const [outPdf] = process.argv.slice(2);
  if (!outPdf || !SLUG) { console.error("usage: generate-bridge.mjs <out.pdf> <slug> [student|parent]"); process.exit(1); }
  const F = FIELDS[SLUG];
  if (!F) { console.error(`no field content for slug: ${SLUG}. Have: ${Object.keys(FIELDS).join(", ")}`); process.exit(1); }

  const tracks = tracksFor(SLUG);
  const from = tracks.slice(-2).reverse();
  const to = tracks.slice(0, 3);
  const spread = (tracks[tracks.length - 1].s - tracks[0].s).toFixed(1);

  const styles = `
    .brandmark{ margin:0 0 .7cm; width:5cm; }
    .gkick{ font-family:var(--sans); font-size:8.5pt; font-weight:600; letter-spacing:.16em; text-transform:uppercase; color:var(--pen); margin:0 0 .12cm; }
    .gtag{ font-family:var(--serif); font-style:italic; font-size:10pt; color:var(--pencil); margin:0 0 .32cm; }
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
    .lst-i .x{ color:var(--pen); font-weight:700; flex:0 0 auto; }
    .lst-i b{ color:var(--ink); } .lst-i em{ font-style:italic; color:var(--ink); }
    .cap{ font-family:var(--serif); font-size:9.6pt; color:var(--ink-soft); line-height:1.45; margin:.05cm 0 .1cm; }
    .cap b{ color:var(--ink); }
    .tl-i{ display:grid; grid-template-columns:3.2cm 1fr; gap:.5cm; padding:.3cm 0; border-bottom:1px solid var(--rule); break-inside:avoid; }
    .tl-i:last-child{ border-bottom:none; }
    .tl-w{ font-family:var(--sans); font-size:8.5pt; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:var(--pen); padding-top:.06cm; }
    .tl-b{ font-size:10.2pt; color:var(--ink-soft); line-height:1.5; }
    .tl-b b{ color:var(--ink); }
    .ck{ break-inside:avoid; margin:.15cm 0 0; padding:.5cm .6cm .55cm; background:#FBF9F3; border:1px solid var(--rule); border-radius:9px; }
    .ck-sub{ font-family:var(--serif); font-size:9.5pt; color:var(--ink-soft); line-height:1.45; margin:0 0 .3cm; }
    .ck-i{ display:flex; gap:.35cm; align-items:flex-start; padding:.15cm 0; }
    .ck-box{ flex:0 0 auto; width:.4cm; height:.4cm; border:1.5px solid var(--pencil); border-radius:3px; margin-top:.05cm; }
    .ck-x{ font-family:var(--serif); font-size:9.8pt; color:var(--ink-soft); line-height:1.42; }
    .ck-x b{ color:var(--ink); font-weight:700; }
    .gclose{ break-inside:avoid; font-family:var(--serif); font-size:11pt; color:var(--ink); line-height:1.5; margin:.55cm 0 0; max-width:16cm; }`;

  const tracksHtml = tracks.map((t) => `<tr>
    <td class="nm">${t.n}</td>
    <td class="ba"><div class="track"><div class="fill" style="width:${(t.s / 10) * 100}%;background:${col(t.s)}"></div></div></td>
    <td class="sc" style="color:${col(t.s)}">${t.s.toFixed(1)}</td></tr>`).join("");
  const laneRow = (t) => `<div class="r"><span>${t.n}</span><span class="s" style="color:${col(t.s)}">${t.s.toFixed(1)}</span></div>`;
  const stepsHtml = F.steps.map((s, i) => `<div class="mv"><span class="mv-n">${i + 1}</span><div class="mv-b">${s}</div></div>`).join("");
  const timelineHtml = F.timeline.map((t) => `<div class="tl-i"><div class="tl-w">${t.w}</div><div class="tl-b">${t.b}</div></div>`).join("");
  const trapsHtml = F.traps.map((t) => `<div class="lst-i"><span class="x">&times;</span><span>${t}</span></div>`).join("");
  const exitsHtml = F.exits.map((e) => `<div class="lst-i"><span class="m">&rarr;</span><span>${e}</span></div>`).join("");
  const targetsHtml = F.targets.map((t) => `<div class="ck-i"><span class="ck-box"></span><div class="ck-x">${t}</div></div>`).join("");

  const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="file://${join(DIR, "brand.css")}"><style>${styles}</style></head>
<body>
  <div class="brandmark">${LOGO_SVG}</div>
  <div class="gkick">Career Value Guide &middot; Active Edition &middot; ${F.label} &middot; ${EDITION}</div>
  <div class="gtag">Career value in the age of AI.</div>
  <h1 class="gtitle">${F.headline}</h1>
  <p class="gintro">${F.intro}</p>

  <div class="glead">The field, scored &mdash; safest to most exposed</div>
  <table class="tkt">${tracksHtml}</table>
  <p class="gintro" style="margin-top:.2cm">${F.scoredNote}</p>

  <div class="glead">Your bridge &mdash; from the exposed lane to the safe one</div>
  <div class="lanes">
    <div class="lane from"><div class="h">${F.fromLabel}</div>${from.map(laneRow).join("")}</div>
    <div class="arrow">&rarr;</div>
    <div class="lane to"><div class="h">${F.toLabel}</div>${to.map(laneRow).join("")}</div>
  </div>
  <p class="cap">${F.niches}</p>
  ${stepsHtml}

  <div class="glead">The bridge, sequenced</div>
  <div class="tl">${timelineHtml}</div>

  <div class="glead">Traps &mdash; what feels like progress but keeps you exposed</div>
  <div class="lst">${trapsHtml}</div>

  <div class="glead">If the safe lane&rsquo;s too narrow &mdash; adjacent exits</div>
  <div class="lst">${exitsHtml}</div>

  <div class="glead">Senior-role targets &mdash; what to start acquiring now</div>
  <div class="ck">
    <div class="ck-sub">Pulled from what the protected roles actually ask for. Each has a first credible unit ${pick("your kid", "you")} can start on without fifteen years.</div>
    ${targetsHtml}
  </div>

  <p class="gclose">${F.close}</p>
</body></html>`;

  const htmlPath = join(tmpdir(), `pivotum_bridge_${SLUG}.html`);
  writeFileSync(htmlPath, html);

  const footer = `<div style="font-family:'Archivo',Arial,sans-serif;font-size:8px;color:#8a8178;width:100%;padding:0 1.4cm;display:flex;justify-content:space-between;">
    <span>Career Value Guide &middot; Active Edition &middot; ${F.label} &middot; Pivotum ${EDITION}</span><span class="pageNumber"></span></div>`;

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
  console.log(`wrote ${outPdf} (${SLUG})`);
}
main();
