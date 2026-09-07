/* Education & Training — Workflow Rebuild examples. Two lanes, two variants each:
   the everyday teaching and learning-design workflows, done the way they're done
   today, then rebuilt AI-native. Same shape as every other career (see lib/rebuild.ts).
   The ladder and the five moves are shared framework content rendered alongside each. */

import type { CareerRebuild, RebuildVariant } from "@/lib/rebuild";

const buildLesson: RebuildVariant = {
  slug: "edu-build-lesson", title: "Build a lesson", field: "Instruction",
  short: "Turn a standard into a ready-to-teach lesson — objective, materials, checks.",
  thesis: "The daily workflow of every teacher and trainer — done the way it's done today, then rebuilt AI-native. Watch what the machine takes, and where the human moves up.",
  steps: [
    { label: "Set the objective", today: "Read the standard, decide what students should walk out able to do.", own: "the target", ai: "drafts objectives mapped to the standard and its level", you: "decide what mastery actually looks like for this class." },
    { label: "Plan the arc", today: "Sequence the hook, the teaching, the practice by hand.", own: "the pacing", ai: "proposes a lesson structure with timing", you: "own the flow and where the real learning happens." },
    { label: "Build the materials", today: "Write the slides, the handout, the worked examples.", own: "the examples", ai: "generates slides, examples and handouts in minutes", you: "pick the examples that make it land for your students." },
    { label: "Differentiate", today: "Adapt for the range of learners, one version at a time.", own: "the access", ai: "drafts scaffolds and extensions for every level", you: "own who needs what to reach the same bar." },
    { label: "Check for understanding", today: "Write the questions and the exit ticket.", own: "the evidence", ai: "drafts checks aligned to the objective", you: "decide what proof of learning you'll accept." },
    { label: "Teach & adjust", today: "Deliver it, read the room, adapt on the fly.", own: "the room", ai: "flags where students struggled from the exit data", you: "own the teaching and the calls you make live." },
  ],
  delta: [{ v: "Hours → minutes", l: "Prep per lesson" }, { v: "One version → every level", l: "Differentiation built in" }, { v: "Prepping → teaching", l: "Where your time goes" }],
  pull: "Prep stops eating your evenings — the value moves to the objective, the examples, and the teaching itself.",
};

const buildAssessment: RebuildVariant = {
  slug: "edu-build-assessment", title: "Build an assessment", field: "Instruction",
  short: "Write a quiz or test that measures the right thing — items, key, scoring.",
  thesis: "The workflow that decides what a grade actually means — done today, then rebuilt AI-native.",
  steps: [
    { label: "Define what to measure", today: "Decide which objectives this assessment has to test.", own: "the construct", ai: "maps candidate items to the objectives and standards", you: "decide what a correct answer actually proves." },
    { label: "Write the items", today: "Draft each question and its distractors by hand.", own: "the rigor", ai: "generates items at the right level with plausible distractors", you: "own that each item tests the skill, not the reading." },
    { label: "Build the key", today: "Work every problem, then write the answer key.", own: "the key", ai: "solves each item and drafts the key and rubric", you: "re-work the ones that matter — the key is yours to trust." },
    { label: "Check alignment & bias", today: "Review coverage, fairness and reading level by hand.", own: "the fairness", ai: "flags coverage gaps, bias, and reading-level issues", you: "decide what's fair to every student in the room." },
    { label: "Set the scoring", today: "Weight the items and build the rubric.", own: "the standard", ai: "proposes weighting and a scoring rubric", you: "own where the bar sits and what earns each score." },
    { label: "Score & analyze", today: "Grade, then eyeball which items worked.", own: "the read", ai: "scores and surfaces the item statistics", you: "decide what the results mean for what to reteach." },
  ],
  delta: [{ v: "Days → hours", l: "To a ready assessment" }, { v: "Spot-check → every item", l: "Validity and bias review" }, { v: "Writing → validating", l: "Where the craft moves" }],
  pull: "Anyone can generate a quiz now — the value is whether it measures what you meant, and whether the key is actually right.",
};

const designCourse: RebuildVariant = {
  slug: "edu-design-course", title: "Design a course", field: "Learning Design",
  short: "Build a curriculum end to end — outcomes, sequence, assessments, materials.",
  thesis: "The workflow behind a whole course or program — done the way it's done today, then rebuilt AI-native.",
  steps: [
    { label: "Define the outcomes", today: "Decide what learners can do by the end.", own: "the outcomes", ai: "drafts outcomes from the goal and the standards", you: "own what the course is really for." },
    { label: "Map the sequence", today: "Order the units so each one builds on the last.", own: "the progression", ai: "proposes a scope-and-sequence", you: "own the learning progression and the prerequisites." },
    { label: "Design the assessments", today: "Decide how mastery gets measured across the course.", own: "the evidence of mastery", ai: "aligns assessments to each outcome", you: "decide what evidence proves the course worked." },
    { label: "Build the materials", today: "Write the lessons, readings and activities over weeks.", own: "the coherence", ai: "generates the materials for every unit", you: "own the through-line that ties it together." },
    { label: "Design for access", today: "Adapt the whole course for the range of learners.", own: "the access", ai: "drafts UDL scaffolds and alternates across the course", you: "own that every learner can reach the outcomes." },
    { label: "Pilot & revise", today: "Run it, gather feedback, revise over a term.", own: "the judgment", ai: "analyzes outcomes and flags what underperformed", you: "decide what to change and what to keep." },
  ],
  delta: [{ v: "Months → weeks", l: "To a built course" }, { v: "Unit by unit → whole course", l: "Coherence by design" }, { v: "Building → designing", l: "Where your value sits" }],
  pull: "The machine builds the materials in days — the value is the outcomes, the progression, and the judgment on whether it actually works.",
};

const gradeFeedback: RebuildVariant = {
  slug: "edu-grade-feedback", title: "Grade and give feedback at scale", field: "Learning Design",
  short: "Score a full set of work and return feedback that actually moves the learner.",
  thesis: "The workflow that eats an educator's evenings — grading and feedback — done today, then rebuilt AI-native.",
  steps: [
    { label: "Set the rubric", today: "Write the criteria and the level descriptors.", own: "the standard", ai: "drafts a rubric from the assignment", you: "own what each level actually means." },
    { label: "Calibrate", today: "Grade a few, align your judgment to the rubric.", own: "the calibration", ai: "scores a sample and shows its reasoning", you: "decide where the machine's read is off." },
    { label: "Score at scale", today: "Grade every submission by hand, for hours.", own: "the exceptions", ai: "scores the whole set against the rubric", you: "review the borderline and the surprising ones." },
    { label: "Draft the feedback", today: "Write personal comments on every piece of work.", own: "the specificity", ai: "drafts rubric-anchored feedback per learner", you: "own that the feedback is true and actionable." },
    { label: "Catch what matters", today: "Notice patterns across the group from memory.", own: "the patterns", ai: "surfaces group-wide gaps and misconceptions", you: "decide what to reteach, and to whom." },
    { label: "Return & follow up", today: "Hand it back and hope it lands.", own: "the growth", ai: "drafts next steps and tracks the progress", you: "own the conversation that moves the learner." },
  ],
  delta: [{ v: "Hours → minutes", l: "Grading a full set" }, { v: "Generic → rubric-anchored", l: "Every comment" }, { v: "Marking → coaching", l: "Where your time goes" }],
  pull: "Grading stops being the bottleneck — the value is the calibration, the truth of the feedback, and the coaching only you can give.",
};

export const eduCareer: CareerRebuild = {
  slug: "education", career: "Education & Training",
  blurb: "Teaching and learning design — from the lesson in the room to the course behind it.",
  lanes: [
    { slug: "instruction", name: "Instruction", variants: [buildLesson, buildAssessment] },
    { slug: "learning-design", name: "Learning Design", variants: [designCourse, gradeFeedback] },
  ],
};
