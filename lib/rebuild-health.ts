/* Healthcare & Nursing — Workflow Rebuild examples. The core clinical workflows,
   done the way they're done today, then rebuilt AI-native. The machine drafts the
   documentation and coordination; the clinical judgment, the presence at the
   bedside, and the accountability stay human. Same shape as every other career
   (see lib/rebuild.ts) — adding a variant is just more data. */

import type { CareerRebuild, RebuildVariant } from "@/lib/rebuild";

const dischargeSummary: RebuildVariant = {
  slug: "health-discharge-summary", title: "Draft and sign a discharge summary", field: "Clinical documentation",
  short: "Reconcile the record, draft the summary, check it, and send the patient home safely.",
  thesis: "The document every admission ends on — done the way it's done today, then rebuilt AI-native. Watch what the machine drafts, and where the clinician's sign-off stays.",
  steps: [
    { label: "Pull the record together", today: "Read back through the admission notes, results and charts by hand.", own: "the clinical picture", ai: "assembles the whole stay into a structured summary in seconds", you: "judge whether the picture it drew is the patient you actually cared for." },
    { label: "Reconcile the medications", today: "Compare home meds, inpatient meds and new scripts line by line.", own: "the reconciliation", ai: "drafts the reconciled list and flags every change", you: "own that each change is intended and each dose is right." },
    { label: "Check interactions & allergies", today: "Cross-check new drugs against the allergy record and interactions from memory and references.", own: "the safety call", ai: "surfaces the interactions and allergy conflicts instantly", you: "decide what's a real risk for this patient and act on it." },
    { label: "Write the instructions", today: "Draft what the patient does at home, in plain language.", own: "what's actually ordered", ai: "drafts clear, readable instructions from the plan", you: "own that the instructions match the orders and go no further." },
    { label: "Set the safety-net & follow-up", today: "Add return precautions and arrange the follow-up by hand.", own: "the red flags", ai: "drafts the return advice and the follow-up plan", you: "judge the warning signs that matter for this patient." },
    { label: "Sign and hand over", today: "Read it end to end, correct it, sign, and walk the patient through it.", own: "the sign-off", ai: "formats the final summary and checks it for consistency", you: "own the sign-off and the conversation at the bedside." },
  ],
  delta: [{ v: "An hour → minutes", l: "Summary drafted" }, { v: "Memory → checked", l: "Interactions and allergies" }, { v: "Writing → reviewing", l: "Where the time goes" }],
  pull: "The machine writes the summary in seconds — but the patient goes home on what you sign, and the reconciliation and the bedside conversation stay yours.",
};

const carePlan: RebuildVariant = {
  slug: "health-care-plan", title: "Build a nursing care plan", field: "Clinical documentation",
  short: "Assess the patient, frame the problems, set goals and interventions, and own it through the shift.",
  thesis: "The plan that runs a patient's care — built the way it's built today, then rebuilt AI-native.",
  steps: [
    { label: "Assess the patient", today: "Gather the history, observations and risk scores at the bedside.", own: "the assessment", ai: "pulls the chart into a structured baseline", you: "own what you see and hear at the bedside that no chart holds." },
    { label: "Frame the problems", today: "Work out the active problems and their priority by hand.", own: "the priorities", ai: "proposes a problem list from the assessment", you: "decide what actually matters most for this patient now." },
    { label: "Set the goals", today: "Write measurable goals against each problem.", own: "the goals", ai: "drafts measurable goals from similar plans", you: "own goals that fit this patient, not the template." },
    { label: "Plan the interventions", today: "Choose interventions and PRN meds, check them against the orders.", own: "the safety call", ai: "drafts interventions and flags what needs an order", you: "check every one against the orders and the allergies." },
    { label: "Set the monitoring", today: "Decide what to watch, how often, and when to escalate.", own: "the escalation triggers", ai: "proposes the monitoring cadence and the triggers", you: "own the triggers and the call to escalate." },
    { label: "Own it through the shift", today: "Deliver the plan, adjust as the patient changes, hand it over.", own: "the judgment", ai: "keeps the plan current and flags what's changed", you: "own the plan as the patient changes, and the presence at the bedside." },
  ],
  delta: [{ v: "Blank page → draft", l: "Starting point" }, { v: "Generic → this patient", l: "The plan" }, { v: "Writing → judging", l: "Where the craft moves" }],
  pull: "A plan can be drafted in minutes now — the value is the assessment at the bedside and owning the calls the plan can't make for you.",
};

const triageHandoff: RebuildVariant = {
  slug: "health-triage-handoff", title: "Triage and hand over a patient", field: "Care coordination",
  short: "Take the story, set the acuity, read the warning signs, and hand over cleanly.",
  thesis: "The judgment call at the front door and the handover at the end of the shift — done today, then rebuilt AI-native.",
  steps: [
    { label: "Gather the story", today: "Take the history and presenting complaint at the bedside.", own: "the real story", ai: "structures the presentation and the vitals into a summary", you: "own what the patient tells you, and what they don't." },
    { label: "Set the priority", today: "Assign an acuity from the observations, the history and experience.", own: "the acuity call", ai: "proposes an acuity from the presentation and the scores", you: "decide how sick this patient actually is." },
    { label: "Read the warning signs", today: "Weigh the observations against the picture, decide what's concerning.", own: "the concern", ai: "flags the values and trends outside range", you: "judge which signals are the real danger, not just out of range." },
    { label: "Build the SBAR", today: "Write the handover note, structuring the situation and background.", own: "the assessment", ai: "drafts the SBAR from the chart", you: "own the assessment line — the part only judgment writes." },
    { label: "Make the recommendation", today: "Decide what you're asking of the next clinician.", own: "the ask", ai: "drafts the recommendation and the escalation trigger", you: "own the ask and what you'll escalate for." },
    { label: "Hand over in person", today: "Talk the oncoming clinician through it and answer the questions.", own: "the handover", ai: "prepares the note and the likely questions", you: "own the conversation and the accountability for what's passed on." },
  ],
  delta: [{ v: "Minutes → seconds", l: "Note assembled" }, { v: "Free-text → structured", l: "The handover" }, { v: "Writing → judging", l: "Where your time goes" }],
  pull: "The note writes itself now — the acuity call, the warning sign you read, and the face-to-face handover stay with you.",
};

const patientEducation: RebuildVariant = {
  slug: "health-patient-education", title: "Communicate and educate the patient", field: "Care coordination",
  short: "Work out what the patient needs, pitch it right, deliver it, and check it landed.",
  thesis: "The part of care that decides whether the plan survives contact with real life — done today, then rebuilt AI-native.",
  steps: [
    { label: "Understand the need", today: "Work out what the patient needs to understand and can take in.", own: "the real need", ai: "drafts the teaching points from the diagnosis and plan", you: "judge what this patient actually needs to hear, and how." },
    { label: "Pitch it right", today: "Translate the clinical plan into plain language by hand.", own: "the level", ai: "drafts plain-language explanations at the right reading level", you: "own the language, the level, and what to leave out." },
    { label: "Check it's accurate", today: "Make sure the explanation matches the actual plan and orders.", own: "what's true", ai: "drafts from the record and flags what to verify", you: "own that every word matches the orders and goes no further." },
    { label: "Deliver it", today: "Sit with the patient, explain, read the room.", own: "the presence", ai: "prepares the materials and the prompts", you: "own the conversation — the presence AI can't stand in for." },
    { label: "Check understanding", today: "Teach back, gauge what landed, re-explain.", own: "the teach-back", ai: "suggests teach-back questions", you: "judge what actually landed and what to go over again." },
    { label: "Leave them equipped", today: "Write the take-home information and the who-to-call.", own: "the safety-net", ai: "drafts the take-home summary and the contacts", you: "own the red flags and that they know when to call." },
  ],
  delta: [{ v: "Hand-written → drafted", l: "Patient materials" }, { v: "Generic → this patient", l: "The explanation" }, { v: "Producing → connecting", l: "Where your value sits" }],
  pull: "Anyone can generate a leaflet now — the value is reading the person in front of you and being the human who makes sure it landed.",
};

export const healthCareer: CareerRebuild = {
  slug: "healthcare", career: "Healthcare & Nursing",
  blurb: "Clinical documentation and care coordination — the work AI drafts and the clinician signs.",
  lanes: [
    { slug: "documentation", name: "Clinical Documentation", variants: [dischargeSummary, carePlan] },
    { slug: "coordination", name: "Care Coordination", variants: [triageHandoff, patientEducation] },
  ],
};
