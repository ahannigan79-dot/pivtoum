/* People & HR — a Workflow Rebuild career. Two lanes (Talent & Hiring, People
   Operations), two workflow variants each, every one a today-vs-AI-native flow.
   Same shape as every other career (see lib/rebuild.ts). The machine drafts the
   posting, sifts the pile, writes the policy — the judgment on people stays human. */

import type { CareerRebuild, RebuildVariant } from "@/lib/rebuild";

const screenCandidates: RebuildVariant = {
  slug: "hr-screen", title: "Screen and shortlist candidates", field: "Talent & hiring",
  short: "Take a pile of applicants down to a fair, defensible shortlist.",
  thesis: "The workflow that eats a recruiter's week — turning hundreds of applicants into a shortlist worth interviewing. Here's that flow today, then rebuilt AI-native.",
  steps: [
    { label: "Define the bar", today: "Argue the must-haves with the hiring manager, write a scorecard by hand.", own: "the real must-haves", ai: "drafts a scorecard from the role and the manager's notes", you: "decide what actually predicts success in this seat, not the wish list." },
    { label: "Sift the pile", today: "Read every resume, sort into maybe/no over days.", own: "the calls on the edge cases", ai: "ranks the whole pile against the scorecard in minutes", you: "audit the ranking for bias and pull the edge cases back in." },
    { label: "Screen calls", today: "Phone-screen a long list one by one.", own: "the read on the person", ai: "drafts the screen questions and summarizes the notes", you: "judge motivation and fit no transcript captures." },
    { label: "Compare fairly", today: "Hold ten candidates in your head, compare from memory.", own: "the comparison", ai: "builds a like-for-like comparison against the same criteria", you: "own the trade-offs between different kinds of strong." },
    { label: "Check the process", today: "Hope the funnel was consistent; rarely check.", own: "the fairness", ai: "flags where the screen may have adverse impact", you: "own that the process is fair and defensible." },
    { label: "Shortlist & brief", today: "Write up the shortlist and the reasons by hand.", own: "the recommendation", ai: "drafts the shortlist rationale for the manager", you: "own who advances and the reason you'd defend." },
  ],
  delta: [{ v: "Days → hours", l: "Pile to shortlist" }, { v: "Sample → all", l: "Applicants actually read" }, { v: "Gut → evidenced", l: "How the call is made" }],
  pull: "The machine reads every resume now — your value is the fair bar, the read on the person, and standing behind who advances.",
};

const writeJD: RebuildVariant = {
  slug: "hr-jd", title: "Write a job description and hiring plan", field: "Talent & hiring",
  short: "Turn a headcount request into a compliant posting and a plan to fill it.",
  thesis: "Before a role goes live, someone scopes it, prices it, and plans the funnel. Here's that workflow today, then rebuilt AI-native.",
  steps: [
    { label: "Scope the role", today: "Interview the manager, work out what the job really is.", own: "the real job", ai: "drafts responsibilities and requirements from the request", you: "decide what the role actually needs vs. the manager's wish list." },
    { label: "Draft the posting", today: "Write the JD from a template, wordsmith for hours.", own: "the language", ai: "writes the posting in minutes", you: "strip the coded language and keep every requirement job-related." },
    { label: "Level & price it", today: "Pull comp data, argue the band by hand.", own: "the band", ai: "assembles market data and proposes a range", you: "own the level and the band you'll defend on equity." },
    { label: "Plan the funnel", today: "Guess the sourcing mix and the timeline.", own: "the plan", ai: "models the funnel and the channels from similar roles", you: "own the sourcing bets and the realistic timeline." },
    { label: "Build the interview kit", today: "Assemble questions and a rubric by hand.", own: "the rubric", ai: "drafts structured questions and a scorecard", you: "own what the interviews actually test for." },
    { label: "Launch & track", today: "Post it, watch the applications trickle in.", own: "the read", ai: "posts, tracks the funnel, and flags where it's stalling", you: "own the call to adjust the role, the band, or the channels." },
  ],
  delta: [{ v: "Days → hours", l: "Request to live posting" }, { v: "Template → tailored", l: "The JD per role" }, { v: "Writing → judging", l: "Where your time goes" }],
  pull: "Anyone can generate a posting now — the value is a compliant, honest one and the plan to fill the seat with the right person.",
};

const draftPolicy: RebuildVariant = {
  slug: "hr-policy", title: "Draft and roll out a people policy", field: "People operations",
  short: "Take a policy gap to a compliant, communicated handbook section.",
  thesis: "The backbone of a people function — writing the rules everyone works under. Here's how a policy gets built today, then rebuilt AI-native.",
  steps: [
    { label: "Spot the need", today: "Notice the gap from an incident or a manager's question.", own: "the real problem", ai: "scans the handbook and flags gaps and conflicts", you: "decide which gap is worth a policy and which isn't." },
    { label: "Research the law", today: "Read statutes and multi-state rules for days.", own: "the interpretation", ai: "surfaces the relevant law by jurisdiction in minutes", you: "own the read where the states disagree or the law is unsettled." },
    { label: "Draft it", today: "Write the policy from scratch or an old template.", own: "the accuracy", ai: "drafts the policy in plain language", you: "own that every stated entitlement matches the actual law." },
    { label: "Review & align", today: "Route to legal and leaders, chase comments.", own: "the calls", ai: "assembles the redlines and flags the open questions", you: "own the judgment calls legal leaves to you." },
    { label: "Communicate", today: "Write the announcement, brief the managers.", own: "the message", ai: "drafts the rollout comms and a manager FAQ", you: "own how the change lands and what managers must not get wrong." },
    { label: "Maintain", today: "Hope to catch it when the law changes.", own: "the currency", ai: "monitors legal changes and flags what's now stale", you: "own the call on when a policy has to be rewritten." },
  ],
  delta: [{ v: "Weeks → days", l: "Gap to live policy" }, { v: "Single-state → multi-state", l: "Coverage checked" }, { v: "Static → monitored", l: "How it stays current" }],
  pull: "The machine drafts a clean policy fast — the value is the legal judgment underneath it and owning the rule the whole company will apply.",
};

const runCycle: RebuildVariant = {
  slug: "hr-cycle", title: "Run the performance and comp cycle", field: "People operations",
  short: "Take the review cycle from calendar to calibrated ratings, pay, and conversations.",
  thesis: "The heaviest recurring lift in people ops — running performance and pay across the whole company. Here's that workflow today, then rebuilt AI-native.",
  steps: [
    { label: "Set the cycle", today: "Build the calendar, chase goals into the tool.", own: "the design", ai: "drafts the timeline, templates, and reminders", you: "own how the cycle is designed to be fair." },
    { label: "Gather feedback", today: "Collect self, peer, and manager reviews; chase the stragglers.", own: "the signal", ai: "collates the inputs and summarizes the themes", you: "judge which feedback is signal and which is noise." },
    { label: "Calibrate ratings", today: "Run long calibration meetings to level managers.", own: "the fairness", ai: "flags rating inflation, inconsistency, and outliers", you: "own the calibration calls across teams." },
    { label: "Decide pay", today: "Model raises and bonuses against the budget in a spreadsheet.", own: "the equity", ai: "models the pay scenarios and flags pay-equity gaps", you: "own the raise, the bonus, and the equity story you'll defend." },
    { label: "Deliver the conversations", today: "Prep managers, hope the messages land.", own: "the message", ai: "drafts tailored talking points per employee", you: "own the hard conversations and the manager coaching." },
    { label: "Close & learn", today: "Wrap up, rarely analyze what the cycle revealed.", own: "the read", ai: "analyzes outcomes for attrition risk and bias", you: "own what the cycle tells you about retention and where to act." },
  ],
  delta: [{ v: "Weeks → days", l: "Cycle admin time" }, { v: "Spot-check → full", l: "Pay equity reviewed" }, { v: "Running it → reading it", l: "Where your value sits" }],
  pull: "The admin and the modeling are the machine's now — your value is the fairness of the calls and the conversations only a human can hold.",
};

export const hrCareer: CareerRebuild = {
  slug: "people-hr", career: "People & HR",
  blurb: "Hiring and the people function — where the judgment is about people, not paperwork.",
  lanes: [
    { slug: "talent", name: "Talent & Hiring", variants: [screenCandidates, writeJD] },
    { slug: "people-ops", name: "People Operations", variants: [draftPolicy, runCycle] },
  ],
};
