/* Design & Creative — Workflow Rebuild examples. Two lanes, two variants each:
   the way the work runs today, then rebuilt AI-native. Same shape as every other
   career (see lib/rebuild.ts) — the ladder and the five moves render alongside. */

import type { CareerRebuild, RebuildVariant } from "@/lib/rebuild";

const writeCampaign: RebuildVariant = {
  slug: "design-write-campaign", title: "Write a campaign", field: "Content & copy",
  short: "Find the angle, write the copy, and ship it on-brand.",
  thesis: "The core copy workflow — done the way it's done today, then rebuilt AI-native. Watch what the machine takes, and where the human moves up.",
  steps: [
    { label: "Brief & angle", today: "Read the brief, dig through references for the angle — the better part of a day.", own: "the angle", ai: "synthesises the brief and references into angle options in minutes", you: "choose the angle only this brand would take." },
    { label: "Draft the copy", today: "Write headlines and body, draft after draft, over hours.", own: "the voice", ai: "drafts dozens of on-brief variants instantly", you: "rewrite for the voice and the truth the brand can stand behind." },
    { label: "Check the claims", today: "Chase down whether each claim is true and cleared.", own: "the substantiation", ai: "flags every claim that needs a source", you: "own what the brand can actually back." },
    { label: "Design the layout", today: "Mock it up, set type and hierarchy by hand.", own: "the craft", ai: "generates on-brand layout options", you: "own the hierarchy and the taste." },
    { label: "Accessibility & rights", today: "Check contrast, alt text and asset licences manually.", own: "the clearances", ai: "audits contrast and flags unlicensed assets", you: "own what's accessible and cleared to ship." },
    { label: "Ship & iterate", today: "Hand off, publish, tweak from the results.", own: "the call", ai: "assembles the variants and drafts the tests", you: "own which version represents the brand." },
  ],
  delta: [{ v: "Days → hours", l: "Brief to first draft" }, { v: "Writing → directing", l: "Where the craft moves" }, { v: "~10×", l: "Variants explored" }],
  pull: "Anyone can generate copy now — the value is the angle, the voice, and the taste that makes it feel like this brand and no one else.",
};

const contentSet: RebuildVariant = {
  slug: "design-content-set", title: "Produce a content set", field: "Content & copy",
  short: "Plan, produce, clear and ship a full set of content.",
  thesis: "The recurring workflow that fills the calendar — done today, then rebuilt AI-native.",
  steps: [
    { label: "Plan the set", today: "Map the calendar and the pieces by hand.", own: "the throughline", ai: "proposes a set and a calendar from the brief", you: "own the idea that ties the whole set together." },
    { label: "Produce the assets", today: "Design each post and write each caption one at a time.", own: "the consistency", ai: "generates the posts, captions and variants at once", you: "curate for brand truth and kill the off-brand." },
    { label: "Clear the rights", today: "Track down every font, photo and music licence.", own: "the clearances", ai: "flags each asset's licence status", you: "own that everything is cleared for commercial use." },
    { label: "Claims & disclosure", today: "Verify claims and add the paid-partnership labels.", own: "the compliance", ai: "flags claims to substantiate and posts needing #ad", you: "own what's true and what must be disclosed." },
    { label: "Make it accessible", today: "Add alt text and captions to every asset.", own: "the reach", ai: "drafts alt text and captions for each piece", you: "own that the whole set is usable by everyone." },
    { label: "Schedule & learn", today: "Schedule it, watch it, adjust.", own: "the read", ai: "schedules and surfaces what's landing", you: "decide what the results mean for the next set." },
  ],
  delta: [{ v: "A week → a day", l: "Set produced" }, { v: "Making → curating", l: "Where your time goes" }, { v: "Volume unlocked", l: "Pieces you can ship" }],
  pull: "Filling the calendar stops being the job — the taste to curate it, and the judgment on what's true and cleared, becomes it.",
};

const uxFlow: RebuildVariant = {
  slug: "design-ux-flow", title: "Design a flow", field: "Product & UX",
  short: "Understand the problem, map the flow, and design the screens.",
  thesis: "The core product-design workflow — done the way it's done today, then rebuilt AI-native. Watch what the machine takes, and where the human moves up.",
  steps: [
    { label: "Understand the problem", today: "Read the brief, interview users, map the job over days.", own: "the real problem", ai: "summarises the research and the constraints", you: "decide what the user actually needs, not just what was asked." },
    { label: "Map the flow", today: "Sketch the screens and the paths by hand.", own: "the structure", ai: "proposes flow options from the patterns", you: "own the flow and the constraints it must honour." },
    { label: "Design the screens", today: "Build the mockups, set the components.", own: "the craft", ai: "generates on-system screen options", you: "own the hierarchy, the microcopy and the taste." },
    { label: "Pressure-test accessibility", today: "Check contrast, labels, focus and tap targets.", own: "the standard", ai: "audits the screens against WCAG", you: "own that everyone can use it." },
    { label: "Check the patterns", today: "Review for dark patterns and real consent by hand.", own: "the ethics", ai: "flags deceptive patterns and consent issues", you: "own the line you won't cross to lift a metric." },
    { label: "Prototype & test", today: "Build the prototype, run the sessions.", own: "the read", ai: "assembles the prototype and drafts the test plan", you: "decide what the testing actually tells you." },
  ],
  delta: [{ v: "Days → hours", l: "Brief to prototype" }, { v: "Drawing → directing", l: "Where the craft moves" }, { v: "One flow → options", l: "Explored before you commit" }],
  pull: "The screens draw themselves now — the value is the flow that honours the real constraint, and the line you hold on how users are treated.",
};

const critique: RebuildVariant = {
  slug: "design-critique", title: "Run a design critique", field: "Product & UX",
  short: "Review the work against the brief, catch the risks, and set the direction.",
  thesis: "The review workflow that decides what ships — done today, then rebuilt AI-native.",
  steps: [
    { label: "Frame the review", today: "Gather the work and the brief before the crit.", own: "the bar", ai: "assembles the work against the brief and the system", you: "set what “good” means for this piece." },
    { label: "Check against the brief", today: "Compare the design to the constraints by hand.", own: "the fit", ai: "diffs the design against the brief's constraints", you: "decide where it drifted and whether it matters." },
    { label: "Test the evidence", today: "Question the research and claims behind the decisions.", own: "the rigour", ai: "flags cited data that lacks a source", you: "own whether the rationale actually holds." },
    { label: "Audit accessibility", today: "Check contrast, labels and states manually.", own: "the standard", ai: "audits the screens for WCAG failures", you: "own the accessibility calls the audit surfaces." },
    { label: "Catch the risks", today: "Hunt for dark patterns, off-brand voice, unlicensed assets.", own: "the judgment", ai: "flags patterns, claims and rights issues", you: "decide what ships and what goes back." },
    { label: "Give the direction", today: "Write the feedback and the next steps.", own: "the direction", ai: "drafts the critique notes", you: "own the calls the team acts on." },
  ],
  delta: [{ v: "Hours → minutes", l: "To a first read" }, { v: "Spot-check → full audit", l: "Coverage of the work" }, { v: "Reviewing → directing", l: "Where your value sits" }],
  pull: "The machine can flag every issue now — but which ones matter, and the direction the team takes, are the judgment you're there for.",
};

export const designCareer: CareerRebuild = {
  slug: "design", career: "Design & Creative",
  blurb: "Copy, campaigns and product design — where taste and judgment are the work.",
  lanes: [
    { slug: "content", name: "Content & Copy", variants: [writeCampaign, contentSet] },
    { slug: "product", name: "Product & UX Design", variants: [uxFlow, critique] },
  ],
};
