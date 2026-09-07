/* Legal & Compliance — Workflow Rebuild career. Two lanes (Contracts;
   Compliance & Advisory), two workflow variants each, done the way they're done
   today and then rebuilt AI-native. Same shape as every other career (see
   lib/rebuild.ts): the machine drafts the work, the lawyer owns the judgment
   and the sign-off. US practice and conventions throughout. */

import type { CareerRebuild, RebuildVariant } from "@/lib/rebuild";

const contractReview: RebuildVariant = {
  slug: "legal-contract-review", title: "Review and redline a contract", field: "Contracts",
  short: "Read the counterparty's paper, mark it against the playbook, and negotiate to signature.",
  thesis: "The workflow that eats a commercial lawyer's week — read someone else's contract, find the risk, and redline it back. Here's that work today, then rebuilt AI-native.",
  steps: [
    { label: "Read the paper", today: "Read the whole agreement line by line to see what it actually says.", own: "the read", ai: "summarizes the contract and surfaces the unusual terms in minutes", you: "decide what the summary missed and what the language really means." },
    { label: "Check the playbook", today: "Compare each clause to the standard positions from memory and past deals.", own: "the deviations that matter", ai: "flags every deviation from your playbook automatically", you: "judge which deviations are dealbreakers and which you'll live with." },
    { label: "Spot the risk", today: "Hunt for the uncapped liability, the one-sided indemnity, the missing clause.", own: "the risk call", ai: "surfaces the risk clauses and the terms that aren't there", you: "own which risks are real for this counterparty and this deal." },
    { label: "Redline", today: "Draft the markup and the fallback positions by hand.", own: "the positions", ai: "drafts the redline and alternative language from your standards", you: "own the positions you'll actually defend at the table." },
    { label: "Negotiate", today: "Trade turns of the draft over days, holding the line on what matters.", own: "the trades", ai: "tracks the changes and drafts responses to their markup", you: "own the trade-offs and where you refuse to move." },
    { label: "Approve to sign", today: "Do the final read, confirm nothing shifted, clear it for signature.", own: "the sign-off", ai: "diffs the final against the agreed terms and flags any drift", you: "own the sign-off — the terms bind the client under your name." },
  ],
  delta: [{ v: "Days → hours", l: "Turnaround per contract" }, { v: "Sample → every clause", l: "Coverage of the paper" }, { v: "Reviewing → deciding", l: "Where your time goes" }],
  pull: "The reading and the markup are the machine's now — the value is the risk call and the positions you'll stand behind at the table.",
};

const contractDraft: RebuildVariant = {
  slug: "legal-contract-draft", title: "Draft an agreement", field: "Contracts",
  short: "Turn a deal term sheet into a clean, defensible agreement ready to send.",
  thesis: "The other half of contract work — not reacting to someone's paper but drafting your own. Here's how a first draft gets built today, then rebuilt AI-native.",
  steps: [
    { label: "Take the instructions", today: "Interview the business to pin down what the deal actually is.", own: "the real deal", ai: "drafts a structured term sheet from the business's notes", you: "decide what the client needs, not just what they asked for." },
    { label: "Pick the precedent", today: "Dig out the closest prior agreement and strip it back.", own: "the fit", ai: "assembles a first draft from the right template and prior deals", you: "judge whether the precedent actually fits this deal." },
    { label: "Draft the terms", today: "Write each clause and tailor the boilerplate by hand.", own: "the bespoke terms", ai: "drafts the standard clauses and fills the deal specifics", you: "own the terms that are specific to this deal and this risk." },
    { label: "Build in the protections", today: "Add the liability, indemnity, and termination positions from experience.", own: "the risk allocation", ai: "proposes the protective clauses from your standards", you: "own how the risk is allocated and where you hold firm." },
    { label: "Self-review", today: "Read it cold for gaps, internal contradictions, and defined-term slips.", own: "the completeness", ai: "checks consistency, cross-references, and missing clauses", you: "own whether it's complete and says what you meant." },
    { label: "Send it out", today: "Finalize, write the cover note, issue the draft.", own: "the strategy", ai: "drafts the cover note and the negotiation summary", you: "own the strategy behind the draft you put your name to." },
  ],
  delta: [{ v: "Days → hours", l: "Blank page to first draft" }, { v: "Template → tailored", l: "How the draft starts" }, { v: "Drafting → judgment", l: "Where the craft moves" }],
  pull: "Anyone can generate a draft agreement now — the value is the risk allocation and the bespoke terms only you can judge for this deal.",
};

const complianceAssess: RebuildVariant = {
  slug: "legal-compliance-assess", title: "Run a compliance assessment", field: "Compliance & advisory",
  short: "Take a business plan, test it against the rules, and say whether it flies.",
  thesis: "The core compliance loop — a business wants to do something, and you assess whether the rules allow it. Here's that workflow today, then rebuilt AI-native.",
  steps: [
    { label: "Scope the activity", today: "Interview the business to understand exactly what they plan to do.", own: "the real activity", ai: "drafts a structured description of the activity and the data involved", you: "pin down what's actually being done, not the sanitized version." },
    { label: "Find the rules", today: "Research the statutes, regulations, and guidance that apply — for days.", own: "the applicable law", ai: "surfaces the relevant rules and recent changes in minutes", you: "decide which rules actually govern and which are noise." },
    { label: "Map to requirements", today: "Work through each obligation against the plan by hand.", own: "the gaps", ai: "maps the activity to each requirement and flags the gaps", you: "judge which gaps are real exposure and which are theoretical." },
    { label: "Assess the risk", today: "Weigh likelihood and severity of each gap from experience.", own: "the risk calls", ai: "proposes a risk rating from enforcement patterns and precedent", you: "own the call on how much risk the business can take here." },
    { label: "Recommend controls", today: "Design the fixes — disclosures, consents, contracts, process.", own: "the remediation", ai: "drafts the control recommendations and the required disclosures", you: "own which controls are proportionate and actually work." },
    { label: "Deliver the verdict", today: "Write the assessment and give the go / no-go.", own: "the conclusion", ai: "drafts the assessment and the summary of positions", you: "own the go / no-go the business will build on." },
  ],
  delta: [{ v: "Weeks → days", l: "Assessment cycle" }, { v: "Sample → every requirement", l: "Rules tested" }, { v: "Researching → judging", l: "Where you add value" }],
  pull: "The research and the mapping are the machine's now — the value is the risk call and the go / no-go the business relies on.",
};

const adviceMemo: RebuildVariant = {
  slug: "legal-advice-memo", title: "Draft a regulatory advice memo", field: "Compliance & advisory",
  short: "Answer a hard legal question in writing — the analysis, the position, and the caveats.",
  thesis: "The written advice a regulatory lawyer lives on — a question in, a defensible memo out. Here's how that memo gets built today, then rebuilt AI-native.",
  steps: [
    { label: "Frame the question", today: "Interrogate the ask until it's a question the law can answer.", own: "the real question", ai: "proposes sharper versions of the question from the request", you: "own what's actually being decided, not just what was asked." },
    { label: "Research the law", today: "Work through statutes, regulations, and cases for days.", own: "the interpretation", ai: "surfaces the authorities and the recent developments fast", you: "interpret where the law is unsettled or arguable." },
    { label: "Verify the authorities", today: "Read each cited case and rule to confirm it says what you think.", own: "the accuracy", ai: "pulls the sources and flags where a citation is thin or stale", you: "own that every citation is real, current, and on point." },
    { label: "Build the analysis", today: "Apply the law to the facts and reason to a conclusion.", own: "the reasoning", ai: "drafts the analysis from the authorities and the facts", you: "own the reasoning and where the argument is weakest." },
    { label: "Land the position", today: "State the advice, caveat it honestly, note the risk.", own: "the recommendation", ai: "drafts the recommendation and the caveats", you: "own the position you'll put your name to." },
    { label: "Issue the memo", today: "Finalize, format, and send to the client.", own: "the advice", ai: "assembles the final memo and the client summary", you: "own the advice the client will act on." },
  ],
  delta: [{ v: "Days → hours", l: "Question to memo" }, { v: "Manual → verified", l: "Every citation checked" }, { v: "Drafting → judgment", l: "Where your value sits" }],
  pull: "The research and the first draft are the machine's now — the value is the interpretation, the verified citations, and the position you'll defend.",
};

export const legalCareer: CareerRebuild = {
  slug: "legal", career: "Legal & Compliance",
  blurb: "Contracts and compliance — where the analysis is fast and the judgment is the product.",
  lanes: [
    { slug: "contracts", name: "Contracts", variants: [contractReview, contractDraft] },
    { slug: "compliance", name: "Compliance & Advisory", variants: [complianceAssess, adviceMemo] },
  ],
};
