/* Workflow Rebuild — Data & Analytics. Career → Lane → workflow variants, each a
   today-vs-AI-native flow. Two lanes, two variants each. Same shape as every other
   career (see lib/rebuild.ts); the ladder and the five moves are shared framework
   content rendered alongside every one. */

import type { CareerRebuild, RebuildVariant } from "@/lib/rebuild";

const answerQuestion: RebuildVariant = {
  slug: "data-answer-question", title: "Answer a business question with data", field: "Analytics & Insight",
  short: "Turn a fuzzy business question into an analysis and a recommendation.",
  thesis: "The analyst's core loop — a stakeholder's question turned into a decision. Here's that workflow today, then rebuilt AI-native.",
  steps: [
    { label: "Frame the question", today: "Go back and forth with the stakeholder until the ask is actually answerable.", own: "the real question", ai: "proposes sharper, testable versions of the ask", you: "decide what's actually being decided, not just what was asked." },
    { label: "Find the data", today: "Hunt for the right tables, work out the joins, judge what's trustworthy.", own: "the sources", ai: "locates the tables and drafts the joins", you: "judge whether it's the right data, and where it lies." },
    { label: "Query & analyze", today: "Write the SQL, slice the data, test each cut by hand.", own: "the hypotheses", ai: "writes the queries and runs the cuts instantly", you: "decide which cuts actually answer the question." },
    { label: "Sanity-check", today: "Reconcile to a known number, hunt for the join fan-out and the double-count.", own: "the rigor", ai: "flags anomalies and numbers that don't tie", you: "own whether the result is real before it leaves your desk." },
    { label: "Tell the story", today: "Build the charts, write the narrative, cut what doesn't matter.", own: "the message", ai: "drafts the visuals and the write-up", you: "own the message and the one number that matters." },
    { label: "Recommend", today: "Turn the finding into a call the business can act on.", own: "the recommendation", ai: "proposes actions from the finding", you: "own the recommendation and the risk in it." },
  ],
  delta: [{ v: "Days → hours", l: "Question to answer" }, { v: "One cut → many", l: "Hypotheses tested" }, { v: "Querying → judging", l: "Where your time goes" }],
  pull: "Anyone can generate an analysis now — the value is framing the right question and standing behind the answer.",
};

const buildDashboard: RebuildVariant = {
  slug: "data-build-dashboard", title: "Build a dashboard", field: "Analytics & Insight",
  short: "Turn a reporting need into a dashboard people actually trust.",
  thesis: "The reporting workflow every analytics team lives in — a metric request turned into something the business runs on. Here's how it's built today, then rebuilt AI-native.",
  steps: [
    { label: "Define the metrics", today: "Chase down what each metric should mean and how it's counted.", own: "the definitions", ai: "drafts metric definitions from the request and the schema", you: "own what each number means, and its denominator." },
    { label: "Model the data", today: "Build the aggregation tables and the joins behind the tiles.", own: "the grain", ai: "proposes the models and the aggregation logic", you: "own the grain, and where a join could fan out." },
    { label: "Build the views", today: "Lay out the charts and tiles, wire them to the data by hand.", own: "the layout", ai: "assembles the tiles and picks the chart types", you: "decide what leads, and what to leave off." },
    { label: "Validate the numbers", today: "Reconcile every tile to a source of truth before anyone sees it.", own: "the trust", ai: "cross-checks tiles against the warehouse and flags breaks", you: "own whether the dashboard can be trusted." },
    { label: "Ship & document", today: "Publish it, write the definitions, field the “what does this mean” questions.", own: "the definitions people rely on", ai: "drafts the docs and the tooltips", you: "own the definitions the business will hold you to." },
    { label: "Maintain", today: "Fix broken tiles, catch stale data, adapt to source changes.", own: "the freshness", ai: "monitors refreshes and flags stale or broken tiles", you: "own the call on what's trustworthy enough to stay live." },
  ],
  delta: [{ v: "Days → hours", l: "Request to live dashboard" }, { v: "Spot-check → every tile", l: "Numbers validated" }, { v: "Building → owning", l: "Where your value sits" }],
  pull: "The dashboard builds itself now — the value is the definitions, the grain, and the trust that the numbers are right.",
};

const buildPipeline: RebuildVariant = {
  slug: "data-build-pipeline", title: "Build a data pipeline", field: "Data Engineering",
  short: "Ingest, transform, validate and serve data reliably.",
  thesis: "The plumbing behind every dashboard and model — a source turned into trustworthy data. Here's that workflow today, then rebuilt AI-native.",
  steps: [
    { label: "Understand the need", today: "Work out what data, for whom, and at what freshness.", own: "the requirement", ai: "drafts the spec from the request", you: "judge what's really needed versus what was asked for." },
    { label: "Model the data", today: "Design the schema and the transforms by hand.", own: "the model", ai: "proposes a schema and the transform logic", you: "own the data model and its trade-offs." },
    { label: "Build it", today: "Write the ingestion and transform code.", own: "the review", ai: "generates the pipeline code", you: "review it for correctness, cost, and the silent fan-out." },
    { label: "Validate", today: "Write data-quality checks, hunt for bad rows.", own: "the trust", ai: "generates the quality tests and profiles the data", you: "decide what “trustworthy” means for this data." },
    { label: "Deploy & schedule", today: "Wire up orchestration, alerts and backfills.", own: "the reliability", ai: "configures scheduling and monitoring", you: "own the reliability the business depends on." },
    { label: "Operate", today: "Fix breakages, adapt to source changes, answer for the outage.", own: "the judgment", ai: "flags breakages and proposes fixes", you: "own the call on what to fix, and how fast." },
  ],
  delta: [{ v: "Weeks → days", l: "Idea to live pipeline" }, { v: "Spot-checks → full validation", l: "Data-quality coverage" }, { v: "Building → owning", l: "Where your value sits" }],
  pull: "The code is the fast part now — the value is the model, the trust in the data, and the reliability you stand behind.",
};

const qualityCheck: RebuildVariant = {
  slug: "data-quality-check", title: "Run a data-quality check", field: "Data Engineering",
  short: "Find out whether the data can be trusted before anyone builds on it.",
  thesis: "The workflow that decides whether every downstream number is safe — auditing the data itself. Here's how it's done today, then rebuilt AI-native.",
  steps: [
    { label: "Profile the data", today: "Pull distributions, null rates and ranges by hand to see what's there.", own: "the picture", ai: "profiles every column and surfaces the outliers", you: "read what the profile actually says about the data." },
    { label: "Define the rules", today: "Decide what “valid” means — uniqueness, ranges, referential integrity.", own: "the rules", ai: "proposes checks from the schema and the profile", you: "own which rules actually matter here." },
    { label: "Find the breaks", today: "Hunt for duplicates, orphaned keys, and the fan-out that inflates totals.", own: "the diagnosis", ai: "runs the checks and lists every failure", you: "separate the real breaks from the noise." },
    { label: "Trace the cause", today: "Follow a bad number back through the joins to where it went wrong.", own: "the root cause", ai: "traces the lineage and proposes the likely source", you: "confirm the real cause, not the plausible one." },
    { label: "Decide the bar", today: "Judge whether the data is good enough to ship on.", own: "the call", ai: "quantifies the impact of each issue", you: "own the call on whether this is safe to build on." },
    { label: "Set the guardrails", today: "Write the tests that stop the same break reaching production again.", own: "the standard", ai: "drafts the tests and the alerts", you: "own the standard the data has to clear." },
  ],
  delta: [{ v: "Sample → full population", l: "Rows checked" }, { v: "Firefighting → prevented", l: "How breaks are caught" }, { v: "Checking → judging", l: "Where your value sits" }],
  pull: "The checks run themselves now — the value is the judgment on what “good enough” means, and standing behind the data others build on.",
};

export const dataCareer: CareerRebuild = {
  slug: "data-analytics", career: "Data & Analytics",
  blurb: "Turning data into decisions, and building the pipelines behind them — the core analytics and engineering workflows.",
  lanes: [
    { slug: "insight", name: "Analytics & Insight", variants: [answerQuestion, buildDashboard] },
    { slug: "engineering", name: "Data Engineering", variants: [buildPipeline, qualityCheck] },
  ],
};
