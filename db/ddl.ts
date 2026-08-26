// AUTO-GENERATED from db/migrations/0000_init.sql. Do not edit by hand.
// Full DDL as an ordered statement list so it can run through the app's own
// Vercel-Postgres connection (see app/api/admin/migrate/route.ts).

export const RESET_STATEMENTS: string[] = [
  `DROP SCHEMA IF EXISTS public CASCADE`,
  `CREATE SCHEMA public`,
  `GRANT ALL ON SCHEMA public TO public`,
];

/* Additive, idempotent schema patches — run via /api/admin/migrate?patch=1.
 * NEVER drops or rewrites data. Safe to run repeatedly. Append new ALTERs here
 * as the schema evolves so we never need a destructive reset again. */
export const PATCH_STATEMENTS: string[] = [
  `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "title" text`,
  `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "topic" text`,
  `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "pinned" boolean DEFAULT false NOT NULL`,
  `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "pinned_at" timestamp with time zone`,
  `ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "career_stage" text`,
  `ALTER TABLE "pod_members" ADD COLUMN IF NOT EXISTS "auto" boolean DEFAULT false NOT NULL`,
  `CREATE TABLE IF NOT EXISTS "post_reports" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "post_id" uuid NOT NULL REFERENCES "posts"("id") ON DELETE cascade,
     "reporter_id" text NOT NULL REFERENCES "profiles"("clerk_user_id") ON DELETE cascade,
     "reason" text,
     "created_at" timestamp with time zone DEFAULT now() NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS "post_reports_post_idx" ON "post_reports" ("post_id")`,
  `CREATE TABLE IF NOT EXISTS "pod_threads" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "pod_id" uuid NOT NULL REFERENCES "pods"("id") ON DELETE cascade,
     "name" text NOT NULL,
     "emoji" text,
     "slug" text NOT NULL,
     "sort_order" integer DEFAULT 100 NOT NULL,
     "is_core" boolean DEFAULT false NOT NULL,
     "created_at" timestamp with time zone DEFAULT now() NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS "pod_threads_pod_slug_idx" ON "pod_threads" ("pod_id","slug")`,
  `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "thread_id" uuid REFERENCES "pod_threads"("id") ON DELETE cascade`,
  `CREATE TABLE IF NOT EXISTS "post_attachments" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "post_id" uuid NOT NULL REFERENCES "posts"("id") ON DELETE cascade,
     "url" text NOT NULL,
     "name" text,
     "content_type" text,
     "kind" text DEFAULT 'file' NOT NULL,
     "created_at" timestamp with time zone DEFAULT now() NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS "post_attachments_post_idx" ON "post_attachments" ("post_id")`,
  `ALTER TABLE "pods" ADD COLUMN IF NOT EXISTS "goal" text`,
  `ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "last_seen_at" timestamp with time zone`,
  `ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "streak_days" integer DEFAULT 0 NOT NULL`,
  `ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "visit_days" integer DEFAULT 0 NOT NULL`,
  `ALTER TABLE "commitments" ADD COLUMN IF NOT EXISTS "proof" text`,
  // Expanded milestone credentials.
  `INSERT INTO "badges" ("key","name","icon","description") VALUES
     ('evolving','Evolving','🔄','Re-scored your Map for the first time'),
     ('steadfast','Steadfast','🧭','Re-scored 3 times — keeping pace with the field'),
     ('sharpened','Sharpened','🥊','Logged Build reps across 3 tools'),
     ('sharp-operator','Sharp Operator','🎯','Trained across every Build tool'),
     ('momentum','Momentum','🚀','Shipped 5 moves'),
     ('relentless','Relentless','🔥','Shipped 10 moves'),
     ('grounded','Grounded','📚','Studied your six levers in Learn'),
     ('in-the-room','In the Room','💬','Posted in the community'),
     ('engaged','Engaged','🙌','Reacted and replied — being part of it'),
     ('regular','Regular','⭐','Showed up 7 days')
   ON CONFLICT ("key") DO NOTHING`,
  // Starter Together Pods — controlled naming, major fields. Idempotent by slug.
  `INSERT INTO "pods" ("name","slug","description") VALUES
     ('Marketing & Brand','marketing-brand','Marketers, brand and growth people rebuilding the function AI-native.'),
     ('Software & Engineering','software-engineering','Engineers and builders navigating AI-native development.'),
     ('Healthcare & Nursing','healthcare-nursing','Clinical and care roles — where judgment and presence still win.'),
     ('Finance & Accounting','finance-accounting','Finance, accounting and audit pros steering through automation.'),
     ('Legal & Compliance','legal-compliance','Lawyers, paralegals and compliance staff facing AI head-on.'),
     ('Design & Creative','design-creative','Designers, writers and creatives deepening what AI can''t take.'),
     ('Data & Analytics','data-analytics','Analysts and data people turning AI into leverage.'),
     ('Sales & Customer','sales-customer','Sales, success and support — owning the relationships that matter.'),
     ('People & HR','people-hr','HR, recruiting and people teams reshaping how work gets done.'),
     ('Operations & Admin','operations-admin','Ops, project and admin roles rebuilding the back office.'),
     ('Education & Training','education-training','Teachers, trainers and L&D adapting to AI in the room.'),
     ('Students & Early Career','students-early-career','Just starting out — going AI-native from day one.')
   ON CONFLICT ("slug") DO NOTHING`,
  // Web push subscriptions for the PWA (lock-screen notifications).
  `CREATE TABLE IF NOT EXISTS "push_subscriptions" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "member_id" text NOT NULL,
     "endpoint" text NOT NULL UNIQUE,
     "p256dh" text NOT NULL,
     "auth" text NOT NULL,
     "created_at" timestamp with time zone DEFAULT now() NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS "push_subs_member_idx" ON "push_subscriptions" ("member_id")`,
  // Weekly ritual — the community heartbeat prompt (founder-set).
  `CREATE TABLE IF NOT EXISTS "weekly_prompts" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "title" text NOT NULL,
     "body" text NOT NULL,
     "created_at" timestamp with time zone DEFAULT now() NOT NULL
   )`,
  // Looking-glass highlights — founder-curated proof-of-life for non-members.
  `CREATE TABLE IF NOT EXISTS "glass_highlights" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "title" text NOT NULL,
     "body" text NOT NULL,
     "attribution" text,
     "created_at" timestamp with time zone DEFAULT now() NOT NULL
   )`,
  // Email lifecycle preferences (default on) + digest bookkeeping.
  `ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "email_instant" boolean DEFAULT true NOT NULL`,
  `ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "email_digest" boolean DEFAULT true NOT NULL`,
  `ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "digest_sent_at" timestamp with time zone`,
  // Trust & safety: DM/map privacy, member blocks, and report resolution.
  `ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "dm_privacy" text DEFAULT 'all' NOT NULL`,
  `ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "show_map" boolean DEFAULT true NOT NULL`,
  `CREATE TABLE IF NOT EXISTS "member_blocks" (
     "blocker_id" text NOT NULL,
     "blocked_id" text NOT NULL,
     "created_at" timestamp with time zone DEFAULT now() NOT NULL,
     CONSTRAINT "member_blocks_pk" PRIMARY KEY("blocker_id","blocked_id")
   )`,
  `ALTER TABLE "post_reports" ADD COLUMN IF NOT EXISTS "resolved_at" timestamp with time zone`,
  `ALTER TABLE "post_reports" ADD COLUMN IF NOT EXISTS "resolved_by" text`,
  // Membership billing — link members to their Stripe subscription.
  `ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "stripe_customer_id" text`,
  `ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "sub_status" text`,
  `ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "sub_renews_at" timestamp with time zone`,
  `ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "sub_plan" text`,
  // Badge catalog — credentials for real milestones. Idempotent.
  // Claude-generated Map reading — grounded in the saved `computed`, cached per snapshot.
  `ALTER TABLE "map_states" ADD COLUMN IF NOT EXISTS "narrative" text`,
  // Self-framed career Deep Dives — Claude, grounded in career scores, shared/cached per career.
  `CREATE TABLE IF NOT EXISTS "career_deepdives" (
     "career_slug" text PRIMARY KEY NOT NULL,
     "content" jsonb NOT NULL,
     "created_at" timestamp with time zone DEFAULT now() NOT NULL
   )`,
  // Weekly brief can highlight an article — the thinking behind the week's prompt.
  `ALTER TABLE "weekly_prompts" ADD COLUMN IF NOT EXISTS "article_slug" text`,
  // ...or an external (scouted) article, handed straight from the article scout.
  `ALTER TABLE "weekly_prompts" ADD COLUMN IF NOT EXISTS "article_url" text`,
  `ALTER TABLE "weekly_prompts" ADD COLUMN IF NOT EXISTS "article_title" text`,
  `ALTER TABLE "weekly_prompts" ADD COLUMN IF NOT EXISTS "article_summary" text`,
  // Weekly article-scout reports — Claude + web search, founder-facing newsletter prep.
  `CREATE TABLE IF NOT EXISTS "scout_reports" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "report" jsonb NOT NULL,
     "created_at" timestamp with time zone DEFAULT now() NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS "scout_reports_when_idx" ON "scout_reports" ("created_at")`,
  // Per-member "why this article matters to your lane" — Claude, cached per (member, article).
  `CREATE TABLE IF NOT EXISTS "article_relevance" (
     "member_id" text NOT NULL REFERENCES "profiles"("clerk_user_id") ON DELETE cascade,
     "article_slug" text NOT NULL,
     "note" text NOT NULL,
     "created_at" timestamp with time zone DEFAULT now() NOT NULL,
     CONSTRAINT "article_relevance_pk" PRIMARY KEY("member_id","article_slug")
   )`,
  // Claude-generated Judgment Gym reps — fresh scenarios per career/lane.
  `CREATE TABLE IF NOT EXISTS "gym_generated" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "member_id" text REFERENCES "profiles"("clerk_user_id") ON DELETE set null,
     "lane" text NOT NULL,
     "career" text NOT NULL,
     "scenario" jsonb NOT NULL,
     "created_at" timestamp with time zone DEFAULT now() NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS "gym_generated_lane_idx" ON "gym_generated" ("lane","created_at")`,
  // Claude-generated Workflow Rebuilds — fresh workflows for any lane.
  `CREATE TABLE IF NOT EXISTS "rebuild_generated" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "member_id" text REFERENCES "profiles"("clerk_user_id") ON DELETE set null,
     "lane" text NOT NULL,
     "career" text NOT NULL,
     "variant" jsonb NOT NULL,
     "created_at" timestamp with time zone DEFAULT now() NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS "rebuild_generated_lane_idx" ON "rebuild_generated" ("lane","created_at")`,
  // Founder-set market baselines per lane — a Pivotum re-score moves these, and
  // every member in the lane moves with it (earned improvement carries forward).
  `CREATE TABLE IF NOT EXISTS "lane_baselines" (
     "career_slug" text NOT NULL,
     "lane" text NOT NULL,
     "baseline" integer NOT NULL,
     "note" text,
     "updated_by" text,
     "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
     CONSTRAINT "lane_baselines_pk" PRIMARY KEY("career_slug","lane")
   )`,
  // Member workflow transformations — Claude-generated, capped 1/member/month.
  `CREATE TABLE IF NOT EXISTS "workflow_transforms" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "member_id" text NOT NULL REFERENCES "profiles"("clerk_user_id") ON DELETE cascade,
     "workflow" text NOT NULL,
     "inputs" jsonb NOT NULL,
     "doc" jsonb NOT NULL,
     "created_at" timestamp with time zone DEFAULT now() NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS "workflow_transforms_member_idx" ON "workflow_transforms" ("member_id","created_at")`,
  `INSERT INTO "badges" ("key","name","icon","description") VALUES
     ('welcomed','Welcomed','🤝','Booked your 1:1 welcome with Adam'),
     ('mapped','Mapped','🧭','Built your first Winning Map'),
     ('cohort','In a Pod','👥','Joined your accountability pod'),
     ('committed','In Motion','◆','Committed your first move'),
     ('shipped','First Ship','🚀','Shipped your first move'),
     ('operator','Operator','🎯','Logged your first Build rep')
   ON CONFLICT ("key") DO NOTHING`,
];

export const DDL_STATEMENTS: string[] = [
  "CREATE TYPE \"public\".\"event_type\" AS ENUM('welcome_1to1', 'deep_dive', 'rescore', 'clinic', 'social')",
  "CREATE TYPE \"public\".\"member_role\" AS ENUM('member', 'moderator', 'founder')",
  "CREATE TABLE \"badges\" (\n\t\"key\" text PRIMARY KEY NOT NULL,\n\t\"name\" text NOT NULL,\n\t\"description\" text,\n\t\"icon\" text\n)",
  "CREATE TABLE \"comments\" (\n\t\"id\" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,\n\t\"post_id\" uuid NOT NULL,\n\t\"author_id\" text NOT NULL,\n\t\"body\" text NOT NULL,\n\t\"created_at\" timestamp with time zone DEFAULT now() NOT NULL\n)",
  "CREATE TABLE \"commitments\" (\n\t\"id\" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,\n\t\"member_id\" text NOT NULL,\n\t\"lever\" text NOT NULL,\n\t\"title\" text NOT NULL,\n\t\"status\" text DEFAULT 'active' NOT NULL,\n\t\"due_at\" timestamp with time zone,\n\t\"completed_at\" timestamp with time zone,\n\t\"created_at\" timestamp with time zone DEFAULT now() NOT NULL\n)",
  "CREATE TABLE \"dm_messages\" (\n\t\"id\" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,\n\t\"thread_id\" uuid NOT NULL,\n\t\"sender_id\" text NOT NULL,\n\t\"body\" text NOT NULL,\n\t\"created_at\" timestamp with time zone DEFAULT now() NOT NULL\n)",
  "CREATE TABLE \"dm_thread_members\" (\n\t\"thread_id\" uuid NOT NULL,\n\t\"member_id\" text NOT NULL,\n\t\"last_read_at\" timestamp with time zone,\n\tCONSTRAINT \"dm_thread_members_thread_id_member_id_pk\" PRIMARY KEY(\"thread_id\",\"member_id\")\n)",
  "CREATE TABLE \"dm_threads\" (\n\t\"id\" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,\n\t\"created_at\" timestamp with time zone DEFAULT now() NOT NULL\n)",
  "CREATE TABLE \"event_rsvps\" (\n\t\"event_id\" uuid NOT NULL,\n\t\"member_id\" text NOT NULL,\n\t\"status\" text DEFAULT 'going' NOT NULL,\n\tCONSTRAINT \"event_rsvps_event_id_member_id_pk\" PRIMARY KEY(\"event_id\",\"member_id\")\n)",
  "CREATE TABLE \"events\" (\n\t\"id\" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,\n\t\"title\" text NOT NULL,\n\t\"type\" \"event_type\" DEFAULT 'deep_dive' NOT NULL,\n\t\"description\" text,\n\t\"starts_at\" timestamp with time zone NOT NULL,\n\t\"duration_mins\" integer DEFAULT 60,\n\t\"join_url\" text,\n\t\"recording_url\" text,\n\t\"created_at\" timestamp with time zone DEFAULT now() NOT NULL\n)",
  "CREATE TABLE \"lesson_progress\" (\n\t\"member_id\" text NOT NULL,\n\t\"lesson_key\" text NOT NULL,\n\t\"status\" text DEFAULT 'started' NOT NULL,\n\t\"updated_at\" timestamp with time zone DEFAULT now() NOT NULL,\n\tCONSTRAINT \"lesson_progress_member_id_lesson_key_pk\" PRIMARY KEY(\"member_id\",\"lesson_key\")\n)",
  "CREATE TABLE \"map_states\" (\n\t\"id\" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,\n\t\"member_id\" text NOT NULL,\n\t\"edition\" text DEFAULT 'Fall 2026' NOT NULL,\n\t\"answers\" jsonb NOT NULL,\n\t\"computed\" jsonb NOT NULL,\n\t\"overall\" real,\n\t\"created_at\" timestamp with time zone DEFAULT now() NOT NULL\n)",
  "CREATE TABLE \"member_badges\" (\n\t\"member_id\" text NOT NULL,\n\t\"badge_key\" text NOT NULL,\n\t\"earned_at\" timestamp with time zone DEFAULT now() NOT NULL,\n\tCONSTRAINT \"member_badges_member_id_badge_key_pk\" PRIMARY KEY(\"member_id\",\"badge_key\")\n)",
  "CREATE TABLE \"notifications\" (\n\t\"id\" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,\n\t\"member_id\" text NOT NULL,\n\t\"type\" text NOT NULL,\n\t\"payload\" jsonb,\n\t\"read_at\" timestamp with time zone,\n\t\"created_at\" timestamp with time zone DEFAULT now() NOT NULL\n)",
  "CREATE TABLE \"pod_members\" (\n\t\"pod_id\" uuid NOT NULL,\n\t\"member_id\" text NOT NULL,\n\t\"joined_at\" timestamp with time zone DEFAULT now() NOT NULL,\n\tCONSTRAINT \"pod_members_pod_id_member_id_pk\" PRIMARY KEY(\"pod_id\",\"member_id\")\n)",
  "CREATE TABLE \"pods\" (\n\t\"id\" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,\n\t\"name\" text NOT NULL,\n\t\"slug\" text NOT NULL,\n\t\"description\" text,\n\t\"created_at\" timestamp with time zone DEFAULT now() NOT NULL,\n\tCONSTRAINT \"pods_slug_unique\" UNIQUE(\"slug\")\n)",
  "CREATE TABLE \"posts\" (\n\t\"id\" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,\n\t\"author_id\" text NOT NULL,\n\t\"pod_id\" uuid,\n\t\"body\" text NOT NULL,\n\t\"created_at\" timestamp with time zone DEFAULT now() NOT NULL\n)",
  "CREATE TABLE \"profiles\" (\n\t\"clerk_user_id\" text PRIMARY KEY NOT NULL,\n\t\"email\" text NOT NULL,\n\t\"handle\" text,\n\t\"display_name\" text,\n\t\"avatar_url\" text,\n\t\"bio\" text,\n\t\"role\" \"member_role\" DEFAULT 'member' NOT NULL,\n\t\"career_slug\" text,\n\t\"current_lane\" text,\n\t\"onboarded_at\" timestamp with time zone,\n\t\"created_at\" timestamp with time zone DEFAULT now() NOT NULL,\n\tCONSTRAINT \"profiles_handle_unique\" UNIQUE(\"handle\")\n)",
  "CREATE TABLE \"reactions\" (\n\t\"post_id\" uuid NOT NULL,\n\t\"member_id\" text NOT NULL,\n\t\"emoji\" text DEFAULT '👍' NOT NULL,\n\tCONSTRAINT \"reactions_post_id_member_id_emoji_pk\" PRIMARY KEY(\"post_id\",\"member_id\",\"emoji\")\n)",
  "ALTER TABLE \"comments\" ADD CONSTRAINT \"comments_post_id_posts_id_fk\" FOREIGN KEY (\"post_id\") REFERENCES \"public\".\"posts\"(\"id\") ON DELETE cascade ON UPDATE no action",
  "ALTER TABLE \"comments\" ADD CONSTRAINT \"comments_author_id_profiles_clerk_user_id_fk\" FOREIGN KEY (\"author_id\") REFERENCES \"public\".\"profiles\"(\"clerk_user_id\") ON DELETE cascade ON UPDATE no action",
  "ALTER TABLE \"commitments\" ADD CONSTRAINT \"commitments_member_id_profiles_clerk_user_id_fk\" FOREIGN KEY (\"member_id\") REFERENCES \"public\".\"profiles\"(\"clerk_user_id\") ON DELETE cascade ON UPDATE no action",
  "ALTER TABLE \"dm_messages\" ADD CONSTRAINT \"dm_messages_thread_id_dm_threads_id_fk\" FOREIGN KEY (\"thread_id\") REFERENCES \"public\".\"dm_threads\"(\"id\") ON DELETE cascade ON UPDATE no action",
  "ALTER TABLE \"dm_messages\" ADD CONSTRAINT \"dm_messages_sender_id_profiles_clerk_user_id_fk\" FOREIGN KEY (\"sender_id\") REFERENCES \"public\".\"profiles\"(\"clerk_user_id\") ON DELETE cascade ON UPDATE no action",
  "ALTER TABLE \"dm_thread_members\" ADD CONSTRAINT \"dm_thread_members_thread_id_dm_threads_id_fk\" FOREIGN KEY (\"thread_id\") REFERENCES \"public\".\"dm_threads\"(\"id\") ON DELETE cascade ON UPDATE no action",
  "ALTER TABLE \"dm_thread_members\" ADD CONSTRAINT \"dm_thread_members_member_id_profiles_clerk_user_id_fk\" FOREIGN KEY (\"member_id\") REFERENCES \"public\".\"profiles\"(\"clerk_user_id\") ON DELETE cascade ON UPDATE no action",
  "ALTER TABLE \"event_rsvps\" ADD CONSTRAINT \"event_rsvps_event_id_events_id_fk\" FOREIGN KEY (\"event_id\") REFERENCES \"public\".\"events\"(\"id\") ON DELETE cascade ON UPDATE no action",
  "ALTER TABLE \"event_rsvps\" ADD CONSTRAINT \"event_rsvps_member_id_profiles_clerk_user_id_fk\" FOREIGN KEY (\"member_id\") REFERENCES \"public\".\"profiles\"(\"clerk_user_id\") ON DELETE cascade ON UPDATE no action",
  "ALTER TABLE \"lesson_progress\" ADD CONSTRAINT \"lesson_progress_member_id_profiles_clerk_user_id_fk\" FOREIGN KEY (\"member_id\") REFERENCES \"public\".\"profiles\"(\"clerk_user_id\") ON DELETE cascade ON UPDATE no action",
  "ALTER TABLE \"map_states\" ADD CONSTRAINT \"map_states_member_id_profiles_clerk_user_id_fk\" FOREIGN KEY (\"member_id\") REFERENCES \"public\".\"profiles\"(\"clerk_user_id\") ON DELETE cascade ON UPDATE no action",
  "ALTER TABLE \"member_badges\" ADD CONSTRAINT \"member_badges_member_id_profiles_clerk_user_id_fk\" FOREIGN KEY (\"member_id\") REFERENCES \"public\".\"profiles\"(\"clerk_user_id\") ON DELETE cascade ON UPDATE no action",
  "ALTER TABLE \"member_badges\" ADD CONSTRAINT \"member_badges_badge_key_badges_key_fk\" FOREIGN KEY (\"badge_key\") REFERENCES \"public\".\"badges\"(\"key\") ON DELETE cascade ON UPDATE no action",
  "ALTER TABLE \"notifications\" ADD CONSTRAINT \"notifications_member_id_profiles_clerk_user_id_fk\" FOREIGN KEY (\"member_id\") REFERENCES \"public\".\"profiles\"(\"clerk_user_id\") ON DELETE cascade ON UPDATE no action",
  "ALTER TABLE \"pod_members\" ADD CONSTRAINT \"pod_members_pod_id_pods_id_fk\" FOREIGN KEY (\"pod_id\") REFERENCES \"public\".\"pods\"(\"id\") ON DELETE cascade ON UPDATE no action",
  "ALTER TABLE \"pod_members\" ADD CONSTRAINT \"pod_members_member_id_profiles_clerk_user_id_fk\" FOREIGN KEY (\"member_id\") REFERENCES \"public\".\"profiles\"(\"clerk_user_id\") ON DELETE cascade ON UPDATE no action",
  "ALTER TABLE \"posts\" ADD CONSTRAINT \"posts_author_id_profiles_clerk_user_id_fk\" FOREIGN KEY (\"author_id\") REFERENCES \"public\".\"profiles\"(\"clerk_user_id\") ON DELETE cascade ON UPDATE no action",
  "ALTER TABLE \"posts\" ADD CONSTRAINT \"posts_pod_id_pods_id_fk\" FOREIGN KEY (\"pod_id\") REFERENCES \"public\".\"pods\"(\"id\") ON DELETE cascade ON UPDATE no action",
  "ALTER TABLE \"reactions\" ADD CONSTRAINT \"reactions_post_id_posts_id_fk\" FOREIGN KEY (\"post_id\") REFERENCES \"public\".\"posts\"(\"id\") ON DELETE cascade ON UPDATE no action",
  "ALTER TABLE \"reactions\" ADD CONSTRAINT \"reactions_member_id_profiles_clerk_user_id_fk\" FOREIGN KEY (\"member_id\") REFERENCES \"public\".\"profiles\"(\"clerk_user_id\") ON DELETE cascade ON UPDATE no action",
  "CREATE INDEX \"comments_post_idx\" ON \"comments\" USING btree (\"post_id\",\"created_at\")",
  "CREATE INDEX \"commitments_member_idx\" ON \"commitments\" USING btree (\"member_id\",\"status\")",
  "CREATE INDEX \"dm_messages_thread_idx\" ON \"dm_messages\" USING btree (\"thread_id\",\"created_at\")",
  "CREATE INDEX \"events_when_idx\" ON \"events\" USING btree (\"starts_at\")",
  "CREATE INDEX \"map_states_member_idx\" ON \"map_states\" USING btree (\"member_id\",\"created_at\")",
  "CREATE INDEX \"notifications_member_idx\" ON \"notifications\" USING btree (\"member_id\",\"created_at\")",
  "CREATE INDEX \"posts_feed_idx\" ON \"posts\" USING btree (\"pod_id\",\"created_at\")"
];
