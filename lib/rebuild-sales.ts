/* Workflow Rebuild — Sales & Customer. Two lanes: winning the deal, and keeping
   the customer. Each variant is a today-vs-AI-native flow; the relationship, the
   read on the buyer, and the commitments made stay human. */

import type { CareerRebuild, RebuildVariant } from "@/lib/rebuild";

const qualifyPitch: RebuildVariant = {
  slug: "sales-qualify-pitch", title: "Qualify a lead and prep the pitch", field: "Selling",
  short: "Research the account, qualify the fit, and prep the first real conversation.",
  thesis: "The front of every sales cycle — decide who's worth your time and walk in ready. Here's that workflow today, then rebuilt AI-native.",
  steps: [
    { label: "Research the account", today: "Dig through the site, LinkedIn, news and the CRM — an hour a lead.", own: "the angle", ai: "assembles the account, the people and the recent signals in minutes", you: "decide the angle that makes this worth their time." },
    { label: "Qualify the fit", today: "Work the checklist from a first call, guess at budget and timing.", own: "the read", ai: "scores fit against your best deals and flags the gaps", you: "read whether there's a real deal here, or just interest." },
    { label: "Find the pain", today: "Piece together what's hurting from a discovery call and a hunch.", own: "the real problem", ai: "surfaces likely pains from the account and the segment", you: "hear the problem under the one they say out loud." },
    { label: "Map the buyers", today: "Sketch who decides and who blocks, mostly from memory.", own: "the power map", ai: "drafts the buying group and each one's likely stake", you: "own the read on who actually holds the yes." },
    { label: "Prep the pitch", today: "Build the deck and the talk track by hand the night before.", own: "the message", ai: "drafts a tailored deck and talk track from the research", you: "own the one message that lands for this buyer." },
    { label: "Set the meeting", today: "Chase the calendar, write the agenda, confirm.", own: "the reason to meet", ai: "drafts the outreach and books the time", you: "own the reason they should give you the hour." },
  ],
  delta: [{ v: "An hour → minutes", l: "Research per lead" }, { v: "Gut → scored", l: "How fit gets judged" }, { v: "Prep ↓", l: "Time before the call" }],
  pull: "The research and the prep are the machine's now — the read on the buyer, and the trust you build in the room, are yours.",
};

const buildProposal: RebuildVariant = {
  slug: "sales-proposal", title: "Build a proposal and quote", field: "Selling",
  short: "Turn a discovery into a scoped proposal, priced and ready to sign.",
  thesis: "Where interest becomes a commitment — scope it, price it, and make the case. Here's that workflow today, then rebuilt AI-native.",
  steps: [
    { label: "Scope the solution", today: "Translate the calls into a solution from experience.", own: "the fit", ai: "drafts a scope from the discovery notes and past deals", you: "own whether the solution actually solves their problem." },
    { label: "Price it", today: "Build the quote, check the price book, ask for a discount.", own: "the discount call", ai: "models the pricing options and the margin at each", you: "decide the number, and what you'll give to win." },
    { label: "Write the proposal", today: "Assemble the document from a template over hours.", own: "the case", ai: "drafts the full proposal in the template", you: "own the case for why them, why you, why now." },
    { label: "Line up approvals", today: "Chase desk and legal for sign-off by email.", own: "the exceptions", ai: "routes the approvals and flags what's non-standard", you: "own the terms you'll fight for and the ones you'll trade." },
    { label: "Build the business case", today: "Model the ROI in a spreadsheet by hand.", own: "the number you'll stand behind", ai: "builds the ROI model and the scenarios", you: "own the value you promise the buyer." },
    { label: "Present & negotiate", today: "Walk them through it, handle price live.", own: "the deal", ai: "preps the objections and the fallbacks", you: "own the negotiation and the commitment you make." },
  ],
  delta: [{ v: "Hours → minutes", l: "Proposal build" }, { v: "One price → modeled", l: "Discount decisions" }, { v: "Drafting → deciding", l: "Where your time goes" }],
  pull: "Anyone can generate a proposal now — the value is the price you set, the terms you commit to, and the trust that closes it.",
};

const onboardCustomer: RebuildVariant = {
  slug: "sales-onboard", title: "Onboard a new customer", field: "Customer Success",
  short: "Take a signed deal to a live, using, valuable customer.",
  thesis: "The handoff that decides whether the deal was worth it — get them live and getting value. Here's that workflow today, then rebuilt AI-native.",
  steps: [
    { label: "Take the handoff", today: "Read the deal notes, chase sales for the real story.", own: "the promises", ai: "summarises the deal, the buyers and what was sold", you: "own the read on what was actually promised." },
    { label: "Plan the onboarding", today: "Build the plan and the timeline from a template.", own: "the milestones", ai: "drafts a tailored plan from the account and the goals", you: "own the milestones that mean this landed." },
    { label: "Kick off", today: "Run the call, set expectations, meet the team.", own: "the relationship", ai: "preps the deck, the agenda and the intros", you: "own the first relationship with the people who'll stay." },
    { label: "Configure & integrate", today: "Set up the account, chase IT for access.", own: "the judgement calls", ai: "handles the standard setup and flags the blockers", you: "own the calls where their world doesn't fit the default." },
    { label: "Drive first value", today: "Nudge them to the first real use, watch adoption.", own: "the outcome", ai: "tracks usage and flags where they're stuck", you: "own getting them to the moment it clicks." },
    { label: "Hand to steady state", today: "Write the recap, set the cadence, warm the CSM.", own: "the trust", ai: "drafts the recap and the success plan", you: "own the trust that carries into the relationship." },
  ],
  delta: [{ v: "Weeks → days", l: "Signed to live" }, { v: "Reactive → tracked", l: "How adoption is watched" }, { v: "Admin ↓", l: "On setup" }],
  pull: "The setup and the tracking run themselves now — getting them to real value, and owning the relationship, is the human job.",
};

const renewalQbr: RebuildVariant = {
  slug: "sales-renewal-qbr", title: "Run a renewal and QBR", field: "Customer Success",
  short: "Read the account's health, make the case for value, and secure the renewal.",
  thesis: "Where the relationship pays off or walks — prove the value and earn the next year. Here's that workflow today, then rebuilt AI-native.",
  steps: [
    { label: "Read the health", today: "Pull usage, tickets and sentiment into a picture by hand.", own: "the real risk", ai: "assembles a health score from usage, support and signals", you: "read whether this account is actually at risk." },
    { label: "Prove the value", today: "Build the value story from whatever data you can find.", own: "the story", ai: "quantifies the outcomes delivered against the goals", you: "own the story of what they got for the money." },
    { label: "Spot the growth", today: "Guess at expansion from gut and a few conversations.", own: "the read", ai: "surfaces the expansion signals and the fit", you: "read where there's real appetite to grow." },
    { label: "Build the QBR", today: "Assemble the deck the night before the meeting.", own: "the message", ai: "drafts the QBR deck from the health and the value", you: "own what you want them to walk away believing." },
    { label: "Run the room", today: "Present, handle the pushback, read the mood.", own: "the room", ai: "preps the likely objections and the answers", you: "read the room and own the relationship live." },
    { label: "Close the renewal", today: "Negotiate terms, chase the signature.", own: "the commitment", ai: "drafts the terms and tracks the paperwork", you: "own the number and the promise you make for next year." },
  ],
  delta: [{ v: "Days → hours", l: "QBR prep" }, { v: "Gut → scored", l: "How risk is read" }, { v: "Prep → relationship", l: "Where your time goes" }],
  pull: "The health read and the deck build themselves now — the value is the relationship, and the commitment you make to keep them.",
};

export const salesCareer: CareerRebuild = {
  slug: "sales",
  career: "Sales & Customer",
  blurb: "Winning the deal and keeping the customer — where the relationship is the product.",
  lanes: [
    { slug: "selling", name: "Selling", variants: [qualifyPitch, buildProposal] },
    { slug: "customer-success", name: "Customer Success", variants: [onboardCustomer, renewalQbr] },
  ],
};
