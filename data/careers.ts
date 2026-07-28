/* ============================================================================
   Pivotum career data — the single source of truth for every score.
   Rule: if a number appears in prose, it must also exist here. Prose describes;
   data states. The six-month refresh is an edit to this file and nothing else.
   ============================================================================ */

export type Band =
  | "very-low"
  | "low"
  | "low-mod"
  | "moderate"
  | "mod-high"
  | "high";

export interface Track {
  name: string;
  scores: { "2023": number; "2025": number; "2026": number };
  band: Band;
}

export interface Factor {
  question: string; // reader-facing wording, not internal names
  rating: number; // 0–10 on the factor's own terms
  direction: "exposure" | "protection"; // exposure renders in --pen
}

export interface Faq {
  q: string;
  a: string; // may contain highlight markers (==, ==+, ==-, ==?)
}

export interface Career {
  slug: string;
  name: string; // "Skilled Trades" — a career, never "a trades degree"
  title: string; // SEO H1, e.g. "Are the Skilled Trades Safe From AI?"
  description: string; // meta description
  edition: string; // "Fall 2026" — data-driven so the refresh is one edit
  datePublished: string; // ISO — Article JSON-LD
  dateModified: string; // ISO — freshness signal for the six-month refresh
  quickAnswer: string; // prose w/ markers; headlineScore is rendered circled
  headlineScore: number; // the one that gets circled — exactly one per page
  headlineTrack: string; // which track the headline score refers to
  tracks: Track[];
  factors: Factor[];
  workedFactor: string; // which factor question the Worked Example expands
  faqs: Faq[];
  related: string[]; // slugs; scores rendered live from target data
  hasFullProfile: boolean;
}

export const careers: Career[] = [
  {
    slug: "nursing",
    name: "Nursing",
    title: "Is Nursing Safe From AI?",
    description:
      "Nursing AI exposure score, Fall 2026 edition. Scored on six factors with a three-year trend.",
    edition: "Fall 2026",
    datePublished: "2026-07-01",
    dateModified: "2026-07-28",
    quickAnswer:
      "Nursing scores **2.8** for AI exposure — one of the lowest of the {n} careers we track, where 10 is most at risk. Bedside nursing is protected by physical presence, patient trust and licensure. But desk-based nursing roles like telehealth triage and case management score **5.4**, nearly double. ==The protection lives at the bedside, not in the qualification.==",
    headlineScore: 2.8,
    headlineTrack: "Bedside RN",
    tracks: [
      {
        name: "Specialist clinical (ICU, ER, perioperative)",
        scores: { "2023": 1.9, "2025": 2.1, "2026": 2.4 },
        band: "low",
      },
      {
        name: "Community / home health nursing",
        scores: { "2023": 2.2, "2025": 2.4, "2026": 2.7 },
        band: "low",
      },
      {
        name: "Bedside RN (hospital, acute care)",
        scores: { "2023": 2.1, "2025": 2.4, "2026": 2.8 },
        band: "low",
      },
      {
        name: "Nurse practitioner / advanced practice",
        scores: { "2023": 2.6, "2025": 2.9, "2026": 3.2 },
        band: "low",
      },
      {
        name: "Telehealth triage nurse",
        scores: { "2023": 4.1, "2025": 4.8, "2026": 5.2 },
        band: "moderate",
      },
      {
        name: "Utilization review / case management",
        scores: { "2023": 4.3, "2025": 5.0, "2026": 5.4 },
        band: "moderate",
      },
    ],
    factors: [
      {
        question: "How much of this job can AI already do?",
        rating: 5.5,
        direction: "exposure",
      },
      {
        question: "How hard will it be to land that first job?",
        rating: 2.0,
        direction: "protection",
      },
      {
        question: "Does it have to be done in person, with your hands?",
        rating: 9.0,
        direction: "protection",
      },
      {
        question:
          "Does someone need a human they can trust and hold responsible?",
        rating: 9.0,
        direction: "protection",
      },
      {
        question: "Does the law require a licensed human?",
        rating: 9.0,
        direction: "protection",
      },
      {
        question:
          "How often does the job hit genuinely new, high-stakes situations?",
        rating: 8.0,
        direction: "protection",
      },
    ],
    workedFactor: "How hard will it be to land that first job?",
    faqs: [
      {
        q: "Is a nursing degree worth it with AI?",
        a: "On exposure alone, yes — nursing is among the best-protected careers we score, and its entry route is legally guaranteed. The more useful question is which nursing track a graduate ends up in, since the same degree spans 2.4 to 5.4.",
      },
      {
        q: "Will AI take over nursing documentation?",
        a: "Substantially, and it already is. Ambient documentation is deployed in hospitals now. Most nurses regard this as an improvement rather than a threat, since documentation burden is a leading reason people leave.",
      },
      {
        q: "Is telehealth nursing at risk from AI?",
        a: "More than bedside nursing. Telehealth triage scores 5.2 against bedside's 2.8, because protocol-driven assessment without physical examination is much closer to what AI does well.",
      },
      {
        q: "Should my child do nursing or medicine?",
        a: "Both score well — nursing at 2.8, patient-facing medicine at 2.9. The differences that matter are training length (2–4 years versus 10+ to independence), cost, and the nature of the work.",
      },
      {
        q: "Is nursing safer than software engineering?",
        a: "On our scoring, considerably. Bedside nursing scores 2.8; entry-level software development scores 8.1. That surprises most people, and it is the most consistent finding in this index.",
      },
    ],
    related: ["medicine", "allied-health", "psychology", "teaching", "computer-science"],
    hasFullProfile: true,
  },

  {
    // Computer Science is the profile we publish free in full. Its dedicated
    // full-profile page (from the long-form MDX) is built separately; this entry
    // supplies its canonical scores so cross-links and the index resolve.
    slug: "computer-science",
    name: "Computer science",
    title: "Is a Computer Science Degree Still Worth It?",
    description:
      "Computer science AI exposure score, Fall 2026 edition. The entry rung is the second-highest score in the index; senior work is protected.",
    edition: "Fall 2026",
    datePublished: "2026-07-01",
    dateModified: "2026-07-28",
    quickAnswer:
      "Computer science is not dying — its entrance is. An entry-level developer scores **8.1** for AI exposure, the second-highest of the {n} careers we track, while a senior engineer scores **5.4** and embedded, safety-critical work **4.7**. ==-Nothing in software scores below 4.7, and the entry rung is the second-highest score in the entire index.== The field is protected at the top by judgment and accountability, and at the bottom by nothing at all.",
    headlineScore: 8.1,
    headlineTrack: "Entry-level developer",
    tracks: [
      { name: "Embedded / safety-critical systems", scores: { "2023": 4.0, "2025": 4.3, "2026": 4.7 }, band: "moderate" },
      { name: "Security engineering", scores: { "2023": 4.6, "2025": 5.0, "2026": 5.3 }, band: "moderate" },
      { name: "Senior engineer / architect", scores: { "2023": 4.6, "2025": 5.0, "2026": 5.4 }, band: "moderate" },
      { name: "ML / AI engineering", scores: { "2023": 5.0, "2025": 5.5, "2026": 6.0 }, band: "moderate" },
      { name: "Backend / infrastructure", scores: { "2023": 5.8, "2025": 6.4, "2026": 6.8 }, band: "mod-high" },
      { name: "Frontend / application development", scores: { "2023": 6.5, "2025": 7.1, "2026": 7.6 }, band: "high" },
      { name: "Entry-level developer", scores: { "2023": 6.3, "2025": 7.4, "2026": 8.1 }, band: "high" },
    ],
    // The free full profile is prose-first (weighted factors, not a 0–10 rating
    // table), so the sampler-style FactorList/WorkedExample don't apply here.
    factors: [],
    workedFactor: "",
    faqs: [],
    related: ["data-science", "cybersecurity", "engineering", "nursing"],
    hasFullProfile: true,
  },
];

/* ---- Lookups & derived helpers ------------------------------------------- */

const bySlug = new Map(careers.map((c) => [c.slug, c]));

export function getCareer(slug: string): Career | undefined {
  return bySlug.get(slug);
}

export function allSlugs(): string[] {
  return careers.map((c) => c.slug);
}

/** How many careers we publish — drives the "N careers" phrasing everywhere. */
export const careerCount = careers.length;

/** The current 'now' score for a track. */
export function nowScore(t: Track): number {
  return t.scores["2026"];
}

/** A career's protected→exposed range across its tracks (the index bar). */
export function careerRange(c: Career): { safest: number; exposed: number } {
  const scores = c.tracks.map(nowScore);
  return { safest: Math.min(...scores), exposed: Math.max(...scores) };
}
