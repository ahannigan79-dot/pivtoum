import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.POSTGRES_URL! },
  // The marketing site's `orders` table etc. are managed elsewhere — only touch our tables.
  tablesFilter: [
    "profiles", "map_states", "badges", "member_badges", "lesson_progress",
    "pods", "pod_members", "posts", "comments", "reactions",
    "events", "event_rsvps", "dm_threads", "dm_thread_members", "dm_messages",
    "notifications", "commitments",
  ],
} satisfies Config;
