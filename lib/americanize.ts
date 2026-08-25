/**
 * UK → US English, deterministic and free (no Claude API). Fixes the spelling,
 * currency and a few vocabulary tells that make generated reps read British.
 *
 * Deliberately conservative on numbers: currency is a *symbol* swap (£8,000 →
 * $8,000) that keeps the figure, so the arithmetic puzzles baked into a rep
 * ("70% of £8,000 is £5,600") still hold. Metric measures are left alone for the
 * same reason — converting them would break the numbers a rep asks you to check.
 */

// Words where "-ise" is correct in American English too — never convert.
const BLOCK = new Set([
  "advertise", "advise", "apprise", "arise", "chastise", "circumcise", "comprise", "compromise", "demise",
  "despise", "devise", "disguise", "enterprise", "excise", "exercise", "franchise", "improvise", "incise",
  "merchandise", "premise", "prise", "promise", "reprise", "revise", "rise", "supervise", "surmise", "surprise",
  "televise", "wise", "likewise", "otherwise", "precise", "concise", "paradise", "expertise", "guise", "treatise",
  "noise", "poise", "tortoise", "turquoise", "mortise", "clockwise", "crosswise", "lengthwise",
  "raise", "cruise", "bruise", "malaise", "liaise", "chaise", "valise", "anise", "mayonnaise", "praise", "braise",
]);

function iseFix(text: string): string {
  return text.replace(/\b([A-Za-z]+?)(isations|isation|isability|isable|isers|iser|ising|ised|ise)\b/g,
    (m, stem: string, suf: string) => {
      const lemma = (stem + "ise").toLowerCase();
      for (const b of BLOCK) if (lemma === b || lemma.endsWith(b)) return m;
      return stem + suf.replace("is", "iz");
    });
}

const FIXED: [RegExp, string][] = [
  // currency — symbol swap, keep the figure (so a rep's arithmetic still holds)
  [/£/g, "$"],
  [/\bpence\b/g, "cents"], [/\bPence\b/g, "Cents"],
  [/\bper cent\b/g, "percent"], [/\bPer cent\b/g, "Percent"],
  // vocabulary tells
  [/\bmaths\b/g, "math"], [/\bMaths\b/g, "Math"],
  [/\bfaff\b/g, "hassle"], [/\bFaff\b/g, "Hassle"],
  [/\bpostcode\b/g, "ZIP code"], [/\bPostcode\b/g, "ZIP code"],
  [/\bsolicitor\b/g, "lawyer"], [/\bSolicitor\b/g, "Lawyer"],
  [/\bmum\b/g, "mom"], [/\bMum\b/g, "Mom"],
  // spelling: -ise/-yse handled by iseFix; the rest are fixed forms
  [/programme/g, "program"], [/Programme/g, "Program"],
  [/licence/g, "license"], [/Licence/g, "License"],
  [/defence/g, "defense"], [/Defence/g, "Defense"],
  [/offence/g, "offense"], [/Offence/g, "Offense"], [/pretence/g, "pretense"],
  [/practising/g, "practicing"], [/practised/g, "practiced"], [/practises/g, "practices"], [/practise/g, "practice"],
  [/Practising/g, "Practicing"], [/Practised/g, "Practiced"], [/Practises/g, "Practices"], [/Practise/g, "Practice"],
  [/\benrol\b/g, "enroll"], [/\bEnrol\b/g, "Enroll"], [/enrolment/g, "enrollment"], [/Enrolment/g, "Enrollment"],
  [/\bfulfil\b/g, "fulfill"], [/fulfilment/g, "fulfillment"], [/\binstil\b/g, "instill"], [/\bdistil\b/g, "distill"],
  [/skilful/g, "skillful"], [/wilful/g, "willful"],
  [/\banalysing\b/g, "analyzing"], [/\banalysed\b/g, "analyzed"], [/\banalyse\b/g, "analyze"], [/\bAnalyse\b/g, "Analyze"],
  [/\bparalyse\b/g, "paralyze"], [/\bcatalyse\b/g, "catalyze"],
  [/colour/g, "color"], [/Colour/g, "Color"], [/behaviour/g, "behavior"], [/Behaviour/g, "Behavior"],
  [/favour/g, "favor"], [/Favour/g, "Favor"], [/honour/g, "honor"], [/Honour/g, "Honor"],
  [/labour/g, "labor"], [/Labour/g, "Labor"], [/neighbour/g, "neighbor"], [/Neighbour/g, "Neighbor"],
  [/humour/g, "humor"], [/rumour/g, "rumor"], [/vapour/g, "vapor"], [/odour/g, "odor"], [/flavour/g, "flavor"],
  [/harbour/g, "harbor"], [/valour/g, "valor"], [/vigour/g, "vigor"], [/savour/g, "savor"], [/endeavour/g, "endeavor"],
  [/splendour/g, "splendor"], [/candour/g, "candor"], [/clamour/g, "clamor"], [/fervour/g, "fervor"],
  [/parlour/g, "parlor"], [/tumour/g, "tumor"], [/saviour/g, "savior"], [/demeanour/g, "demeanor"],
  [/centred/g, "centered"], [/Centred/g, "Centered"], [/centring/g, "centering"],
  [/centre/g, "center"], [/Centre/g, "Center"], [/theatre/g, "theater"], [/Theatre/g, "Theater"],
  [/kilometre/g, "kilometer"], [/centimetre/g, "centimeter"], [/millimetre/g, "millimeter"], [/\bmetre/g, "meter"],
  [/litre/g, "liter"], [/fibre/g, "fiber"], [/calibre/g, "caliber"], [/sombre/g, "somber"],
  [/spectre/g, "specter"], [/lustre/g, "luster"], [/meagre/g, "meager"],
  [/manoeuvring/g, "maneuvering"], [/manoeuvred/g, "maneuvered"], [/manoeuvre/g, "maneuver"],
  [/travelling/g, "traveling"], [/travelled/g, "traveled"], [/traveller/g, "traveler"],
  [/labelling/g, "labeling"], [/labelled/g, "labeled"], [/modelling/g, "modeling"], [/modelled/g, "modeled"],
  [/cancelling/g, "canceling"], [/cancelled/g, "canceled"], [/counselling/g, "counseling"], [/counsellor/g, "counselor"],
  [/fuelling/g, "fueling"], [/fuelled/g, "fueled"], [/signalling/g, "signaling"], [/signalled/g, "signaled"],
  [/levelling/g, "leveling"], [/levelled/g, "leveled"], [/marvellous/g, "marvelous"], [/jewellery/g, "jewelry"],
  [/\bwhilst\b/g, "while"], [/\bamongst\b/g, "among"], [/\blearnt\b/g, "learned"],
  [/catalogued/g, "cataloged"], [/cataloguing/g, "cataloging"], [/catalogue/g, "catalog"], [/analogue/g, "analog"],
  [/\bcheque\b/g, "check"], [/sceptic/g, "skeptic"], [/Sceptic/g, "Skeptic"],
  [/\bmould/g, "mold"], [/aluminium/g, "aluminum"], [/\bgrey\b/g, "gray"],
];

/** UK → US on a single string. */
export function americanize(text: string): string {
  let t = text;
  for (const [re, rep] of FIXED) t = t.replace(re, rep);
  return iseFix(t);
}

/** Recursively americanize every string in a JSON-ish value. Returns the new
 *  value and whether anything changed (so callers can skip untouched rows). */
export function deepAmericanize<T>(value: T): { value: T; changed: boolean } {
  let changed = false;
  const walk = (v: unknown): unknown => {
    if (typeof v === "string") {
      const out = americanize(v);
      if (out !== v) changed = true;
      return out;
    }
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") {
      const o: Record<string, unknown> = {};
      for (const [k, val] of Object.entries(v)) o[k] = walk(val);
      return o;
    }
    return v;
  };
  return { value: walk(value) as T, changed };
}
