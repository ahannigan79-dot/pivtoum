/* Operations & Admin — Workflow Rebuild career. Two lanes, two workflow variants
   each: the recurring process and the schedule under Process & Coordination; the
   vendor and the operational report under Vendors & Admin. Each variant is a
   today-vs-AI-native flow in the same shape as every other career (see
   lib/rebuild.ts). The ladder and the five moves are shared framework content. */

import type { CareerRebuild, RebuildVariant } from "@/lib/rebuild";

const runProcess: RebuildVariant = {
  slug: "ops-run-process", title: "Run a recurring operational process", field: "Process & coordination",
  short: "Intake to close on a recurring workflow — capture, route, execute, check, report.",
  thesis: "The backbone of an ops function — a process that runs the same way every cycle, done the way it's done today, then rebuilt AI-native. Watch what the machine takes, and where the human moves up.",
  steps: [
    { label: "Capture & log", today: "Watch the inbox and the queue, log each request by hand, no standard format.", own: "the exceptions", ai: "captures every request from the channels and logs it structured", you: "decide what's urgent and what's an exception the process can't handle." },
    { label: "Route & assign", today: "Work out who owns it and hand it off manually.", own: "the priorities", ai: "routes each item to the right owner by rule", you: "own the edge cases and the priority calls." },
    { label: "Run the steps", today: "Work the checklist, step by step, chasing each handoff.", own: "the judgment steps", ai: "runs the standard steps and moves the item along", you: "handle the steps that need a human call." },
    { label: "Clear blockers", today: "Chase stuck items over email and escalate by hand.", own: "the unblock", ai: "flags what's stuck and drafts the chase", you: "own the calls that actually clear the blocker." },
    { label: "Quality-check", today: "Spot-check a sample before it goes out.", own: "the bar", ai: "validates every item against the rules", you: "decide what “good enough to ship” means here." },
    { label: "Close & report", today: "Mark it done, tally the cycle in a spreadsheet.", own: "the read", ai: "closes the cycle and reports the numbers", you: "own what the numbers mean and what to fix next cycle." },
  ],
  delta: [{ v: "Days → hours", l: "Cycle time per request" }, { v: "Sample → 100%", l: "Items quality-checked" }, { v: "Queue-watching → exceptions", l: "Where your time goes" }],
  pull: "The routine runs itself now — your value is the exceptions and the judgment on when to break the process, not keep it.",
};

const buildSchedule: RebuildVariant = {
  slug: "ops-build-schedule", title: "Build and manage the schedule", field: "Process & coordination",
  short: "Demand to published roster — gather needs, draft, rule-check, balance, publish, adjust.",
  thesis: "The weekly workflow that keeps a floor staffed — done the way it's done today, then rebuilt AI-native.",
  steps: [
    { label: "Gather the needs", today: "Collect demand, availability and time-off requests by hand.", own: "the coverage call", ai: "assembles the demand forecast and everyone's availability", you: "judge what coverage the week actually needs." },
    { label: "Draft the roster", today: "Build the grid shift by shift, name by name.", own: "the trade-offs", ai: "drafts a schedule that meets the coverage and hours rules", you: "own the trade-offs the rules can't see." },
    { label: "Check the rules", today: "Eyeball for over-hours, gaps, missing keyholders, conflicts.", own: "the exceptions", ai: "validates hours, coverage, keyholders and conflicts", you: "decide which exceptions are worth making." },
    { label: "Balance fairness & cost", today: "Juggle who gets which shifts, watch the labor budget.", own: "the people calls", ai: "models the labor cost and flags imbalance", you: "own the fairness and the morale calls." },
    { label: "Publish & swap", today: "Send it out, field swap requests one by one.", own: "the swaps that break a rule", ai: "publishes and auto-resolves swaps that stay within the rules", you: "approve the swaps that would break one." },
    { label: "Adjust live", today: "Scramble to fill a call-out on the day.", own: "the call under pressure", ai: "proposes cover from who's available and willing", you: "own the call when the floor is short and someone's out." },
  ],
  delta: [{ v: "Hours → minutes", l: "To a published roster" }, { v: "Manual → rule-checked", l: "Every shift validated" }, { v: "Filling → deciding", l: "Where your value sits" }],
  pull: "The grid builds itself now — the value is the coverage call and the people judgment the rules can't make.",
};

const procureVendor: RebuildVariant = {
  slug: "ops-procure-vendor", title: "Procure and manage a vendor", field: "Vendors & admin",
  short: "Need to renewal — spec, source, check, scope, onboard, and manage the vendor.",
  thesis: "How outside work gets bought and run — done the way it's done today, then rebuilt AI-native. Watch what the machine takes, and where the human moves up.",
  steps: [
    { label: "Define the need", today: "Gather requirements and write the spec, chasing stakeholders.", own: "the real requirement", ai: "drafts the requirement and the RFQ from the request", you: "decide what you actually need, not just what was asked." },
    { label: "Source & compare", today: "Chase quotes and build a comparison by hand.", own: "the trust call", ai: "gathers the quotes and normalizes them side by side", you: "judge which vendor you'd actually trust to deliver." },
    { label: "Check the numbers", today: "Re-add each quote, verify the terms line by line.", own: "the number you commit to", ai: "validates the line math, the terms and the total", you: "own the figure and the commitment you sign." },
    { label: "Scope & negotiate", today: "Draft the SOW, redline the risky terms.", own: "the terms you sign", ai: "drafts the SOW and flags the terms that aren't in your favor", you: "own the terms that ship under your name." },
    { label: "Onboard & pay", today: "Set the vendor up, three-way-match invoices manually.", own: "the exceptions", ai: "sets up the vendor and matches invoices to POs and receipts", you: "approve the exceptions and smell the fraud flags." },
    { label: "Manage performance", today: "Track SLAs from memory, react when it slips.", own: "the relationship", ai: "tracks the SLAs and flags the misses", you: "own the relationship and the renewal or exit call." },
  ],
  delta: [{ v: "Weeks → days", l: "Request to PO" }, { v: "Manual → validated", l: "Quotes and terms checked" }, { v: "Processing → deciding", l: "Where your time goes" }],
  pull: "The sourcing and the paperwork are the machine's now — the trust call on a vendor, and the terms you sign, are yours.",
};

const opsReport: RebuildVariant = {
  slug: "ops-report", title: "Build the operations report", field: "Vendors & admin",
  short: "Data to decision — pull, reconcile, find the story, explain, report, act.",
  thesis: "The recurring reporting workflow that tells the business how operations are running — done today, then rebuilt AI-native.",
  steps: [
    { label: "Pull the data", today: "Export from every system and stitch it in a spreadsheet.", own: "the definitions", ai: "aggregates every source automatically", you: "own what each metric actually means." },
    { label: "Reconcile", today: "Tie the numbers out across systems by hand.", own: "the breaks", ai: "reconciles the sources and flags the breaks", you: "judge which breaks actually matter." },
    { label: "Find the story", today: "Eyeball the trends, hunt for what moved.", own: "the insight", ai: "surfaces the significant movements", you: "decide which movement is the real story." },
    { label: "Explain it", today: "Reason about causes from memory of the period.", own: "the causation", ai: "correlates the changes to operational events", you: "judge cause from coincidence." },
    { label: "Build the report", today: "Format the dashboard and the commentary for hours.", own: "the narrative", ai: "drafts the report and the commentary", you: "own the narrative and what to lead with." },
    { label: "Recommend & act", today: "Decide what to change from the results.", own: "the recommendation", ai: "proposes actions from the numbers", you: "own the recommendation and the follow-through." },
  ],
  delta: [{ v: "A day → minutes", l: "Report assembly time" }, { v: "Description → insight", l: "What the report delivers" }, { v: "Reporting → advising", l: "Your role in the room" }],
  pull: "Assembling the report stops being the job — reading it, and owning what changes because of it, becomes it.",
};

export const opsCareer: CareerRebuild = {
  slug: "operations", career: "Operations & Admin",
  blurb: "The engine room — the processes, schedules, vendors and reporting that keep the business running.",
  lanes: [
    { slug: "process", name: "Process & Coordination", variants: [runProcess, buildSchedule] },
    { slug: "vendors", name: "Vendors & Admin", variants: [procureVendor, opsReport] },
  ],
};
