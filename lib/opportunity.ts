import type { Career } from "@/data/careers";

/**
 * The exposure→opportunity flip is the payoff of every AI Exposure Report: it
 * turns the exposure finding into the reason to act. The universal frame lives
 * in <OpportunityFlip> ("starting line, not your verdict" … "win in the age of
 * AI"); this supplies the ONE career-specific middle line — where the opening
 * is for that field, and why moving first wins — in each voice.
 *
 * Lines are grounded in each career's real tracks. Anything without one falls
 * back to a universal line built from the career's name.
 */

type Opening = { career: string; studying: string };

export const OPENINGS: Record<string, Opening> = {
  "computer-science": {
    career:
      "The entry rung is the most exposed work in the whole index at 8.1 — but the same tools clearing it are raising the value of the judgment above: architecture, security, and the safety-critical systems where a wrong call costs more than code (4.7–5.4). Move toward owning the system, become the engineer who commands the machine rather than competing with it on output, and the exposure at the bottom becomes your climb.",
    studying:
      "Don't train to be the entry developer the score puts at 8.1 — train to own systems, security and architecture, the judgment tier that holds at 4.7–5.4, and go in already commanding AI as your tooling rather than racing it on throughput. The field isn't dying; its entrance is, so aim past the entrance.",
  },
  "accounting": {
    career:
      "The same shift that's automating the transactional layer is opening the licensed, judgment-heavy tier — and it's short-handed. Move toward it now, learn to run the machine on everything below it, and your exposure becomes your advantage.",
    studying:
      "The transactional tier is clearing out — but that means training straight toward the licensed, AI-native work walks you into a short-handed, high-leverage field with clear eyes, while others walk in blind. That's the opening, and it's rare.",
  },
  "agriculture": {
    career:
      "The exposure here runs backwards — it's the screen-side agtech and data work (6.2) that automates, not the hands-on farm management (4.0) where you judge soil, livestock and weather with information missing. Pull the precision tools onto your side of that line, run them from the field instead of working for them, and you expand what one operator can manage while the analyst behind the screen gets absorbed.",
    studying:
      "Train toward hands-on farm and land management (4.0), not the agtech-analyst lane (6.2) that looks more modern but sits closer to a data job — then bring the precision tools with you as the operator, and you walk into a physical, judgment-heavy field that adopts AI to do more rather than to cut people.",
  },
  "allied-health": {
    career:
      "Your core — hands on a body, reading a gait, adjusting in real time to what it does — is the most protected work in this index at 2.5; the only exposed corner is the records-and-screen tier at 6.1. Hand that documentation to the machine, become the clinician who runs AI on everything around the treatment, and you convert the paperwork others resent into more hours doing the work only you can do.",
    studying:
      "You're choosing one of the two lowest-exposure fields we score — hands-on therapy at 2.5, with only the screen-based records lane exposed at 6.1 — so the move isn't up a tier, it's arriving already fluent in the AI that handles charting and admin, so you spend your career on the body and not the keyboard while demand grows 11–14%.",
  },
  "architecture": {
    career:
      "The drafting and BIM years (7.6) that AI is clearing out were always the ladder to the stamp — but the stamp, the site and the client who trusts you don't automate (5.0, 4.7). Climb toward the license now, become the architect who drives the generative tools instead of drafting by hand, and the collapse of the production tier becomes your shortcut up it.",
    studying:
      "Production drafting is being automated out from under the path to licensure — 7.6 against 5.0 for the licensed design lead — so train straight for the stamp and the site, treat generative design as the tool you command rather than the job you fear, and you skip the years of work that are disappearing anyway.",
  },
  "business": {
    career:
      "The analyst and coordinator tier most people start in (7.6) is exactly what AI does best; the protected ground is ownership — a number you answer for, people you manage, a P&L that's yours (4.9). Move toward accountability now, be the manager who runs the machine across the reporting layer beneath you, and the automation of that layer becomes your leverage.",
    studying:
      "Business is the most-taken degree and it points straight at the exposed end — the analyst-coordinator work at 7.6 — so aim past it at the accountability roles that hold (general management at 4.9), arrive already running AI across the reporting tier, and you skip the automating rungs instead of getting stuck on them.",
  },
  "construction": {
    career:
      "The split here is a few hundred feet wide: the office work — estimating, scheduling, document coordination (up to 7.4) — automates readily, while the site itself, reading ground the survey got wrong and carrying safety accountability, barely moves at 3.3. Plant yourself on the site, run the AI that handles the paperwork from there, and you own the half of the job that can't be touched.",
    studying:
      "Train toward the site, not the preconstruction office — the superintendent scores 3.3 against 7.4 for document coordination — and come in already fluent in the tools that automate estimating and scheduling, so you command the information layer instead of competing with it for a desk job that's thinning out.",
  },
  "cybersecurity": {
    career:
      "Tier-one, playbook-driven SOC work (7.4) is being triaged away fast; what holds is adversarial judgment — deciding whether it's an incident or noise, reading what an attacker actually wants (5.0). Move toward the threat-hunting and response end, use AI as the analyst that clears the noise beneath you, and the same tools arming both sides become your edge instead of your replacement.",
    studying:
      "Cybersecurity is sold as the safe tech career, but the entry SOC tier is heavily exposed at 7.4 — so aim past it at incident response and threat hunting (5.0), where adversarial novelty is the one thing pattern-based systems can't master, and arrive running AI as your triage layer rather than being the triage layer.",
  },
  "data-science": {
    career:
      "This is the field closest to the technology and it offered no cover — entry analysis scores 8.2, among the most exposed work we track — but framing the question, knowing the data is wrong before the model does, and owning a recommendation that costs money hold better (ML engineering 6.0, senior 6.5). Move toward owning the call, build and run the models rather than producing the analysis, and proximity to the tech turns from your risk into your head start.",
    studying:
      "Don't train to produce analysis — that's the 8.2 tier AI already does — train to frame the problem and own the recommendation, the judgment end where ML engineering (6.0) and senior work (6.5) hold; go in fluent in building the models rather than running them by hand, and you enter above the floor that's collapsing.",
  },
  "dentistry": {
    career:
      "The chairside work — hands in a moving mouth, judgment when the tooth is worse than the image showed, accountability when a procedure goes wrong — is among the most protected in this index at 2.7; only the lab tier, which quietly automated a decade ago, is exposed at 5.5. Let AI run the imaging, diagnostics and practice admin, become the dentist who operates it, and you spend more of your day on the live tissue no machine will touch.",
    studying:
      "You're choosing one of the lowest-exposure careers we score — general dentistry at 2.7, oral surgery at 2.3 — so the move isn't up a tier but through the door already fluent: let the AI read the scans and run the back office while your hands and judgment stay on the patient, and you own the ground that stays human as the field's laboratory work keeps automating.",
  },
  "design": {
    career:
      "The same generation that's collapsing production design and commercial illustration is raising the premium on creative direction — the taste-and-intent tier that decides what a brand should mean and which of a thousand AI outputs is actually right. Move toward it now, become the director who runs the machine instead of racing it, and the craft AI took turns into the leverage you point.",
    studying:
      "Production and execution work is the first thing generation clears out — but that means training toward art direction and brand identity, learning to command the image tools rather than compete with them, walks you into the judgment tier with clear eyes while others still train to make assets by hand. That's the opening, and it's rare.",
  },
  "engineering": {
    career:
      "The desk-and-CAD end — drafting, standard-case calculation, simulation setup — is where the exposure sits, while the PE stamp, the site work, and accountability for a one-off system stay firmly yours. Move toward the licensed, physical tier now and learn to run generative design and simulation as tools beneath it, and you become the engineer who out-produces a whole drafting floor.",
    studying:
      "Desk-based design and analysis is where AI reaches first — but that means training toward the PE license, site commissioning, and judgment on systems with thin precedent walks you into the protected tier while you learn to command the CAD-and-simulation tools others will only be replaced by. That's the opening, and it's rare.",
  },
  "finance": {
    career:
      "The same automation gutting the entry-analyst desk and the modeling grind is widening the premium on the person in the room — the advisory, fiduciary, judgment-under-novel-risk tier no model can be accountable for, and it's short-handed. Move toward it now, run the modeling machine on everything below it, and your exposure becomes your advantage.",
    studying:
      "The analyst and research bench — modeling, comparables, deck production — is clearing out fast, but that means training straight toward the client-facing, fiduciary, regulatory-accountable tier walks you into a field where the machine does your first ten years of grunt work for you, while others still train to be replaced by it. That's the opening, and it's rare.",
  },
  "hospitality": {
    career:
      "Only the back-office edge — reservations, scheduling, stock, review responses — is really exposed; the live service, the read of a room, and the brigade under pressure are the product itself and stay yours. Put AI on the admin now, and you become the operator who runs a tighter house than anyone still buried in the paperwork.",
    studying:
      "Reservations and booking work is the one lane clearing out — but everything you'd actually train for, cooking a live service and leading a floor, is the human presence the guest is paying for, so learning to hand the admin to AI walks you in as the operator who spends all their time on the part that can't be automated. That's the opening, and it's rare.",
  },
  "journalism": {
    career:
      "The desk — aggregation, rewrite, routine production — is going first, but being in the room, working a source who trusts you, and getting the document nobody published is the reporting AI can't reach. Move toward that investigative, source-driven tier now and let AI clear the rewrite work off your desk, and you become the reporter the shrinking newsroom can't afford to lose.",
    studying:
      "Desk and aggregation work is emptying out — but that means training toward investigative and specialist reporting, the source-work and the judgment about what matters, walks you into the one tier a contracting industry still has to staff with humans, while others train for the jobs the wire and the model already do. That's the opening, and it's rare.",
  },
  "law": {
    career:
      "The same automation clearing junior-associate document review is raising the value of the courtroom, the bar card, and judgment on a genuinely novel question — the licensed, liability-bearing tier no model can hold, and demand for it is at a ten-year high. Move toward it now, run the research-and-review machine beneath you, and your exposure becomes your advantage.",
    studying:
      "The document-review floor that used to be every lawyer's first years is clearing out — but that means training straight toward advocacy, novel-question judgment, and the liability only a bar card can carry walks you past a narrowing entry into a field hiring at a ten-year high, while others train for the rung AI took. That's the opening, and it's rare.",
  },
  "life-sciences": {
    career:
      "Here the exposure runs backwards — the computational and degree-only ends score highest, while the physical bench, the fieldwork, and the judgment of whether a result is real or an artifact stay protected. Move toward the hands-on, experiment-designing tier now and put AI on the literature and the sequence analysis, and the branch everyone assumed was safest becomes your leverage.",
    studying:
      "A biology degree with nothing after it, and the purely computational track, are the exposed ends — but that means training toward the bench, experiment design, and fieldwork, learning to point AI at the literature review and the sequence work rather than be replaced by it, walks you into the protected tier most students walk right past. That's the opening, and it's rare.",
  },
  "marketing": {
    career:
      "The same generation flooding content and campaign execution is raising the premium on the only defensible tier there is — brand strategy, the judgment of what's worth measuring, and owning the number when a campaign fails. Move toward it now, run the content machine on everything below it, and your exposure becomes your advantage.",
    studying:
      "Content and social execution is the fastest-clearing lane in this index — but that means training toward brand strategy and the market judgment a model won't take a risk on, learning to command the content machine rather than compete with it, walks you toward the senior end where all the protection sits, with clear eyes and a head start. That's the opening, and it's rare.",
  },
  "medicine": {
    career:
      "Even the exposed edge here — radiology and pathology's first-pass reads — is augmentation, not replacement, and the physical exam, the procedure, and owning the outcome under real uncertainty stay untouchable. Learn to run the image-reading and triage tools now, and you become the physician who moves faster than the diagnosis instead of the one waiting on it.",
    studying:
      "Medicine is already among the best-protected fields, so the opening isn't a safer tier — it's being the doctor who reads first-pass AI, triage models, and the fast-moving imaging tools as instruments rather than threats, and taking that ground while most of your class treats the technology as somebody else's job. That's the opening, and it's rare.",
  },
  "nursing": {
    career:
      "The exposure sits in the desk lanes — telehealth triage and case management near 5.4 — while the bedside barely moves at 2.8, and the paperwork that's clearing out was never why you nursed. Take the machine that's eating the charting, run it at the bedside, and you become the nurse who does more of the human work others still bury under documentation.",
    studying:
      "Nearly every track here scores low, but the automatable paperwork is disappearing fast — so train to run the machine on the charting from day one, and you walk onto the ward doing the physical, judgment-heavy work AI can't touch while the documentation handles itself. That operator's edge is ground most nurses won't claim first.",
  },
  "pharmacy": {
    career:
      "The verification and dispensing tier — near 6.4 — is exactly what machines do well, but the clinical end holds at 4.4: therapeutic judgment, counseling the frightened patient, overruling a prescriber. The profession is already migrating there; move with it now, run the automated checking as your tool, and the license that once guarded verification becomes the credential behind real clinical work.",
    studying:
      "Dispensing and verification are the automation target at 6.4, so train straight toward the clinical tier — prescribing, medication review, complex-patient judgment at 4.4 — where the license reserves work a machine can't do. Walk in as the pharmacist who runs the checking software and spends the day on care, and you enter the lane the whole profession is racing to reach.",
  },
  "psychology": {
    career:
      "The licensed clinical work sits at 3.5 — the therapeutic relationship is the treatment, and no chatbot holds duty of care — while the unlicensed, degree-only and HR-adjacent lanes carry ordinary 7.0 exposure. Anchor to the licensed side, let AI take the notes and screening it already does well, and you spend your hours on the part that was always the point.",
    studying:
      "A psychology degree splits hard: 3.5 with a license, 7.1 without one — the biggest gap in the index. Commit to the full clinical path and you train toward protected, accountable work where the relationship itself is the treatment; the opening is choosing the licensed side with clear eyes and going all the way, while others stop at a general degree carrying general exposure.",
  },
  "social-work": {
    career:
      "Case management and assessment coordination sit up at 6.1 — information-gathering with no coercive authority — while frontline statutory work holds at 3.3, protected by the power to act on another person's life that legislation confers on a registered human. Let the machine take the case notes and chronologies that already eat your week, and you move deeper into the judgment and presence no system can hold.",
    studying:
      "The field divides on one thing: statutory authority. Coordination roles without it score 6.1; child protection and frontline practice, which carry the legal power to intervene, hold near 3.3 — the most durable protection in the index. Train toward the authority-bearing work with AI clearing the documentation that drives people out, and you walk into a short-handed field that needs you.",
  },
  "teaching": {
    career:
      "Teaching rates 7.7 on raw automatability — planning, marking, differentiation all fall to the machine — yet the classroom holds at 3.6, because holding a room of thirty children was never an information problem; only online instruction, stripped of presence, drifts up to 6.8. Take the tools eating the planning and marking, and you pour the reclaimed hours back into the human work that is the job.",
    studying:
      "The automatable layer of teaching — planning, resources, marking — is precisely the part people cite when they quit, and it's clearing out, while the classroom itself stays protected at 3.6 against the online track's 6.8. Train to run those tools from your first year and you walk into the room doing the human work with the drudgery already handled — the setting, not the subject, is the shield, so choose the one that holds.",
  },
  "trades": {
    career:
      "Service work in unpredictable places — the service electrician at 2.5, plumbing and HVAC at 2.6 — is the safest ground in the index, while the same skills on a production line or in modular prefab climb to 5.0. The office burden being automated (quoting, dispatch, invoicing) is the part you'll be glad to lose; run that machine over your book of work and you're the tradesperson who owns both the unpredictable jobs and the business.",
    studying:
      "The protection was never 'working with your hands' — it was working with your hands somewhere unpredictable: service trades score 2.5 to 2.6, factory-floor prefab hits 5.0. Train into service and repair, learn to run the AI that handles quoting and scheduling, and you enter a short-handed, licensed field doing work no robot can reach while the office grind runs itself.",
  },
  "translation": {
    career:
      "Written translation is the most exposed work in the index at 8.8 — text-to-text is the exact thing these systems were built for — but interpreting is a different career entirely: court and medical work at 4.3, protected by physical presence and legal accountability for an accurate rendering. Move from the page to the room, where a frightened patient or a defendant is trusting a specific human, and the same languages carry a 4.5-point advantage instead of a verdict.",
    studying:
      "General document translation tops the whole index at 8.8; court and medical interpreting sit at 4.3 — same languages, same training, the gap is presence and accountability. Train for the room, not the page, and you walk into the one lane the machines can't enter while classmates aiming at document work chase rates that already collapsed: ask not what you know, but where you have to be and who answers for it.",
  },
  "transport": {
    career:
      "Automation cuts deepest where the environment is controlled — long-haul trucking at 5.9, and the logistics-planning desk that coordinates it all at 7.3, higher than anyone touching a vehicle — while licensed command roles hold: pilots at 4.2, marine officers at 4.1, kept in the seat by accountability written into international law. Move toward the licensed, command-accountable, or genuinely unpredictable work, and let the routing machine you'll be running plan the route.",
    studying:
      "Transport hides its exposure in the office: logistics planning scores 7.3, above every operating role, while a pilot's or marine officer's licensed command seat holds near 4.1 on regulatory protection that has barely moved in decades. Train toward the licensed seat or the unpredictable-environment work — urban delivery outscores highway trucking on that alone — and you enter a field where a qualified human is required by law, not by habit.",
  },
  "veterinary": {
    career:
      "The clinical work is nearly untouchable — emergency at 2.4, small animal practice at 2.7 — because the patient can't describe anything and the exam itself generates the findings a machine would need; only lab and diagnostic roles drift up to 5.4. Take the admin and first-pass imaging reads AI already does well, run them as your tools, and you're the vet who spends more of the day on the physical, judgment-heavy work that was always the reason to do this.",
    studying:
      "Almost every clinical track here scores in the 2s, protected by a structural absence — there is no history, no verbal patient — so the automation lands only on records and admin. Train to run those tools from the start and you walk into one of the safest fields in the index doing hands-on diagnosis and surgery no system can generate, with the paperwork already handled. The ground is yours to take first.",
  },
};

export function opportunityOpening(career: Career, voice: "career" | "studying"): string {
  const o = OPENINGS[career.slug];
  if (o) return voice === "studying" ? o.studying : o.career;
  return voice === "studying"
    ? `The same shift you're weighing up is clearing ground in ${career.name.toLowerCase()} for whoever trains toward the work AI can't touch — and the operator's edge on the work it can. Walk in with clear eyes and that's an opening, not a warning.`
    : `The same shift exposing ${career.name.toLowerCase()} is opening ground for whoever moves first — toward the work AI can't touch, and the operator's edge on the work it can. Your exposure is the map to that opening, not a verdict on it.`;
}
