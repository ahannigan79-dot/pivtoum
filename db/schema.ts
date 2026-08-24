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
  createdAt: now(),
});

/* ---------- The Loop: saved Maps over time (Evolve trajectory) ---------- */
export const mapStates = pgTable("map_states", {
  id: uid(),
  memberId: memberFk(),
  edition: text("edition").notNull().default("Fall 2026"),
  answers: jsonb("answers").notNull(),      // intake state A
  computed: jsonb("computed").notNull(),    // computeMap() snapshot
  overall: real("overall"),                 // headline exposure, for quick trajectory queries
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

/* ---------- Weekly ritual: the community heartbeat (founder-set prompt) ---------- */
export const weeklyPrompts = pgTable("weekly_prompts", {
  id: uid(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  createdAt: now(),
});

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
