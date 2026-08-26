/* ============================================================================
   Pivotum community platform — database schema (Drizzle / Vercel Postgres).
   The member's scores link everything: Map → Learn → Build → Evolve all hang
   off the same profile, and flow into one dashboard.
   ============================================================================ */
import {
  pgTable, pgEnum, text, uuid, timestamp, jsonb, boolean, integer, real,
  primaryKey, index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const now = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const uid = () => uuid("id").primaryKey().default(sql`gen_random_uuid()`);
// member foreign key → Clerk user id (text)
const memberFk = (col = "member_id") =>
  text(col).notNull().references(() => profiles.clerkUserId, { onDelete: "cascade" });

/* ---------- Identity (mirrors Clerk; app-specific fields live here) ---------- */
export const roleEnum = pgEnum("member_role", ["member", "moderator", "founder"]);

export const profiles = pgTable("profiles", {
  clerkUserId: text("clerk_user_id").primaryKey(),
  email: text("email").notNull(),
  handle: text("handle").unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  role: roleEnum("role").notNull().default("member"),
  careerSlug: text("career_slug"),
  currentLane: text("current_lane"),
  careerStage: text("career_stage"), // Student | Early-career | Mid-career | Senior | Leader
  onboardedAt: timestamp("onboarded_at", { withTimezone: true }),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
  streakDays: integer("streak_days").notNull().default(0),
  visitDays: integer("visit_days").notNull().default(0),
  emailInstant: boolean("email_instant").notNull().default(true), // reply/DM/report emails
  emailDigest: boolean("email_digest").notNull().default(true),    // weekly digest
  digestSentAt: timestamp("digest_sent_at", { withTimezone: true }),
  dmPrivacy: text("dm_privacy").notNull().default("all"), // all | pods | none — who can DM me
  showMap: boolean("show_map").notNull().default(true),   // show my exposure/map on my profile
  stripeCustomerId: text("stripe_customer_id"),           // links this member to Stripe billing
  subStatus: text("sub_status"),                          // active | trialing | past_due | canceled | ...
  subRenewsAt: timestamp("sub_renews_at", { withTimezone: true }),
  subPlan: text("sub_plan"),                              // human plan label (price/product nickname)
  createdAt: now(),
});

/* ---------- Safety: member blocks ---------- */
export const memberBlocks = pgTable("member_blocks", {
  blockerId: memberFk("blocker_id"),
  blockedId: memberFk("blocked_id"),
  createdAt: now(),
}, (t) => ({ pk: primaryKey({ columns: [t.blockerId, t.blockedId] }) }));

/* ---------- The Loop: saved Maps over time (Evolve trajectory) ---------- */
export const mapStates = pgTable("map_states", {
  id: uid(),
  memberId: memberFk(),
  edition: text("edition").notNull().default("Fall 2026"),
  answers: jsonb("answers").notNull(),      // intake state A
  computed: jsonb("computed").notNull(),    // computeMap() snapshot
  overall: real("overall"),                 // headline exposure, for quick trajectory queries
  narrative: text("narrative"),             // Claude's in-voice reading, grounded in `computed` (lazy, cached)
  createdAt: now(),
}, (t) => ({ memberIdx: index("map_states_member_idx").on(t.memberId, t.createdAt) }));

/* ---------- Badges ---------- */
export const badges = pgTable("badges", {
  key: text("key").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
});
export const memberBadges = pgTable("member_badges", {
  memberId: memberFk(),
  badgeKey: text("badge_key").notNull().references(() => badges.key, { onDelete: "cascade" }),
  earnedAt: timestamp("earned_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({ pk: primaryKey({ columns: [t.memberId, t.badgeKey] }) }));

/* ---------- Learn: lesson progress (content in MDX; we track state) ---------- */
export const lessonProgress = pgTable("lesson_progress", {
  memberId: memberFk(),
  lessonKey: text("lesson_key").notNull(),
  status: text("status").notNull().default("started"), // started | complete
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({ pk: primaryKey({ columns: [t.memberId, t.lessonKey] }) }));

/* ---------- Pods (accountability cohorts) ---------- */
export const pods = pgTable("pods", {
  id: uid(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  goal: text("goal"), // pinned pod focus/goal
  createdAt: now(),
});
export const podMembers = pgTable("pod_members", {
  podId: uuid("pod_id").notNull().references(() => pods.id, { onDelete: "cascade" }),
  memberId: memberFk(),
  auto: boolean("auto").notNull().default(false), // founder auto-added as helper to a small pod
  leader: boolean("leader").notNull().default(false), // pod leader: runs check-ins, hosts Wins & SME sessions
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({ pk: primaryKey({ columns: [t.podId, t.memberId] }) }));

// Threads = navigable channels inside a pod. Core threads are prepopulated.
export const podThreads = pgTable("pod_threads", {
  id: uid(),
  podId: uuid("pod_id").notNull().references(() => pods.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  emoji: text("emoji"),
  slug: text("slug").notNull(),
  sortOrder: integer("sort_order").notNull().default(100),
  isCore: boolean("is_core").notNull().default(false),
  createdAt: now(),
}, (t) => ({ podSlug: index("pod_threads_pod_slug_idx").on(t.podId, t.slug) }));

/* ---------- Community feed ---------- */
export const posts = pgTable("posts", {
  id: uid(),
  authorId: memberFk("author_id"),
  podId: uuid("pod_id").references(() => pods.id, { onDelete: "cascade" }), // null = whole community
  threadId: uuid("thread_id").references(() => podThreads.id, { onDelete: "cascade" }), // null = pod root / community
  title: text("title"),
  topic: text("topic"), // curated topic slug (see lib/feed-topics.ts); null = general
  body: text("body").notNull(),
  pinned: boolean("pinned").notNull().default(false),
  pinnedAt: timestamp("pinned_at", { withTimezone: true }),
  createdAt: now(),
}, (t) => ({ feedIdx: index("posts_feed_idx").on(t.podId, t.createdAt) }));

export const comments = pgTable("comments", {
  id: uid(),
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  authorId: memberFk("author_id"),
  body: text("body").notNull(),
  createdAt: now(),
}, (t) => ({ postIdx: index("comments_post_idx").on(t.postId, t.createdAt) }));

export const reactions = pgTable("reactions", {
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  memberId: memberFk(),
  emoji: text("emoji").notNull().default("👍"),
}, (t) => ({ pk: primaryKey({ columns: [t.postId, t.memberId, t.emoji] }) }));

export const postReports = pgTable("post_reports", {
  id: uid(),
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  reporterId: memberFk("reporter_id"),
  reason: text("reason"),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  resolvedBy: text("resolved_by"),
  createdAt: now(),
}, (t) => ({ postIdx: index("post_reports_post_idx").on(t.postId) }));

export const postAttachments = pgTable("post_attachments", {
  id: uid(),
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  name: text("name"),
  contentType: text("content_type"),
  kind: text("kind").notNull().default("file"), // image | file
  createdAt: now(),
}, (t) => ({ postIdx: index("post_attachments_post_idx").on(t.postId) }));

/* ---------- Events (deep-dives, 1:1 welcome, re-score, clinics) ---------- */
export const eventTypeEnum = pgEnum("event_type", ["welcome_1to1", "deep_dive", "rescore", "clinic", "social"]);
export const events = pgTable("events", {
  id: uid(),
  title: text("title").notNull(),
  type: eventTypeEnum("type").notNull().default("deep_dive"),
  description: text("description"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  durationMins: integer("duration_mins").default(60),
  joinUrl: text("join_url"),
  recordingUrl: text("recording_url"),
  createdAt: now(),
}, (t) => ({ whenIdx: index("events_when_idx").on(t.startsAt) }));
export const eventRsvps = pgTable("event_rsvps", {
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  memberId: memberFk(),
  status: text("status").notNull().default("going"),
}, (t) => ({ pk: primaryKey({ columns: [t.eventId, t.memberId] }) }));

/* ---------- Direct messages ---------- */
export const dmThreads = pgTable("dm_threads", { id: uid(), createdAt: now() });
export const dmThreadMembers = pgTable("dm_thread_members", {
  threadId: uuid("thread_id").notNull().references(() => dmThreads.id, { onDelete: "cascade" }),
  memberId: memberFk(),
  lastReadAt: timestamp("last_read_at", { withTimezone: true }),
}, (t) => ({ pk: primaryKey({ columns: [t.threadId, t.memberId] }) }));
export const dmMessages = pgTable("dm_messages", {
  id: uid(),
  threadId: uuid("thread_id").notNull().references(() => dmThreads.id, { onDelete: "cascade" }),
  senderId: memberFk("sender_id"),
  body: text("body").notNull(),
  createdAt: now(),
}, (t) => ({ threadIdx: index("dm_messages_thread_idx").on(t.threadId, t.createdAt) }));

/* ---------- Notifications ---------- */
export const notifications = pgTable("notifications", {
  id: uid(),
  memberId: memberFk(),
  type: text("type").notNull(),
  payload: jsonb("payload"),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: now(),
}, (t) => ({ memberIdx: index("notifications_member_idx").on(t.memberId, t.createdAt) }));

/* ---------- Web push subscriptions (PWA lock-screen notifications) ---------- */
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uid(),
  memberId: memberFk(),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: now(),
}, (t) => ({ memberIdx: index("push_subs_member_idx").on(t.memberId) }));

/* ---------- Self-framed career Deep Dives (Claude, grounded in career scores) ---------- */
export const careerDeepdives = pgTable("career_deepdives", {
  careerSlug: text("career_slug").primaryKey(),
  content: jsonb("content").notNull(), // a DeepDive doc (sample + sections)
  createdAt: now(),
});

/* ---------- Weekly ritual: the community heartbeat (founder-set prompt) ---------- */
export const weeklyPrompts = pgTable("weekly_prompts", {
  id: uid(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  articleSlug: text("article_slug"),     // internal registry article this week's brief highlights
  articleUrl: text("article_url"),       // OR an external (scouted) article's URL
  articleTitle: text("article_title"),   // external article's title
  articleSummary: text("article_summary"), // external article's summary (for the personalized note)
  createdAt: now(),
});

/* ---------- Looking-glass highlights: founder-curated proof-of-life for non-members ---------- */
export const glassHighlights = pgTable("glass_highlights", {
  id: uid(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  attribution: text("attribution"),
  createdAt: now(),
});

/* ---------- Weekly article-scout reports (Claude + web search, founder-facing) ---------- */
export const scoutReports = pgTable("scout_reports", {
  id: uid(),
  report: jsonb("report").notNull(), // the full ScoutReport (picks, counterpoint, overview)
  createdAt: now(),
}, (t) => ({ whenIdx: index("scout_reports_when_idx").on(t.createdAt) }));

/* ---------- Per-member "why this article matters to your lane" (Claude, cached) ---------- */
export const articleRelevance = pgTable("article_relevance", {
  memberId: memberFk(),
  articleSlug: text("article_slug").notNull(),
  note: text("note").notNull(),
  createdAt: now(),
}, (t) => ({ pk: primaryKey({ columns: [t.memberId, t.articleSlug] }) }));

/* ---------- Claude-generated Judgment Gym reps (infinite fresh scenarios) ---------- */
export const gymGenerated = pgTable("gym_generated", {
  id: uid(),
  // Who generated it (null = seeded/shared). Not a hard member requirement.
  memberId: text("member_id").references(() => profiles.clerkUserId, { onDelete: "set null" }),
  lane: text("lane").notNull(),        // the pod/lane label it was generated for
  career: text("career").notNull(),    // display career on the rep
  scenario: jsonb("scenario").notNull(), // a full Scenario (see lib/gym.ts)
  createdAt: now(),
}, (t) => ({ laneIdx: index("gym_generated_lane_idx").on(t.lane, t.createdAt) }));

/* ---------- Claude-generated Workflow Rebuilds (any lane, on demand) ---------- */
export const rebuildGenerated = pgTable("rebuild_generated", {
  id: uid(),
  memberId: text("member_id").references(() => profiles.clerkUserId, { onDelete: "set null" }),
  lane: text("lane").notNull(),
  career: text("career").notNull(),
  variant: jsonb("variant").notNull(), // a full RebuildVariant (see lib/rebuild.ts)
  createdAt: now(),
}, (t) => ({ laneIdx: index("rebuild_generated_lane_idx").on(t.lane, t.createdAt) }));

/* ---------- Member workflow transformations: the member describes a workflow;
   Claude returns a boss-shareable AI-native transformation doc. Capped to one
   generation per member per month (the API cost is real). */
export const workflowTransforms = pgTable("workflow_transforms", {
  id: uid(),
  memberId: memberFk(),
  workflow: text("workflow").notNull(),      // the workflow name the member gave
  inputs: jsonb("inputs").notNull(),          // what they told us (steps, role, lane)
  doc: jsonb("doc").notNull(),                // the generated Transformation document
  createdAt: now(),
}, (t) => ({ memberIdx: index("workflow_transforms_member_idx").on(t.memberId, t.createdAt) }));

/* ---------- Judgment Gym: one row per rep attempt, with the score. Feeds the
   monthly Effort-Dividend gate (≥8 reps at ≥75% + active 3 of 4 weeks). */
export const gymAttempts = pgTable("gym_attempts", {
  id: uid(),
  memberId: memberFk(),
  repSlug: text("rep_slug").notNull(),   // the Scenario slug (authored) or gen id
  career: text("career").notNull(),      // the lane/career the rep belongs to
  pct: integer("pct").notNull(),         // score 0–100 (right calls / total items)
  passed: boolean("passed").notNull(),   // pct >= PASS_PCT
  createdAt: now(),
}, (t) => ({ memberIdx: index("gym_attempts_member_idx").on(t.memberId, t.createdAt) }));

/* ---------- Weekly presence: one row per member per ISO week they show up.
   The "active 3 of 4 weeks" half of the Effort-Dividend gate. */
export const memberWeeks = pgTable("member_weeks", {
  memberId: memberFk(),
  week: text("week").notNull(),          // ISO week key, e.g. "2026-W35"
  createdAt: now(),
}, (t) => ({ pk: primaryKey({ columns: [t.memberId, t.week] }) }));

/* ---------- Pivotum market baselines: founder-set exposure baseline per lane.
   Overrides the lane's baseline the Map tool computed. When it moves, every
   member in the lane moves with it — their earned improvement carries forward. */
export const laneBaselines = pgTable("lane_baselines", {
  careerSlug: text("career_slug").notNull(),
  lane: text("lane").notNull(),
  baseline: integer("baseline").notNull(),  // current market baseline, 0–100
  note: text("note"),                        // why it moved (shown to members)
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({ pk: primaryKey({ columns: [t.careerSlug, t.lane] }) }));

/* ---------- Evolve: levers a member is actively pulling ---------- */
export const commitments = pgTable("commitments", {
  id: uid(),
  memberId: memberFk(),
  lever: text("lever").notNull(),          // e.g. automatability | judgment | trust | ai-native | relocate
  title: text("title").notNull(),
  status: text("status").notNull().default("active"), // active | done | dropped
  proof: text("proof"), // what the member actually did, captured on ship
  dueAt: timestamp("due_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: now(),
}, (t) => ({ memberIdx: index("commitments_member_idx").on(t.memberId, t.status) }));
