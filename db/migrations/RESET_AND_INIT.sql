-- Pivotum: clean reset + full schema install.
-- Safe to run: there is no data yet (tables were never created).
-- Run this whole script once in the Neon SQL editor.

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public;

CREATE TYPE "public"."event_type" AS ENUM('welcome_1to1', 'deep_dive', 'rescore', 'clinic', 'social');
CREATE TYPE "public"."member_role" AS ENUM('member', 'moderator', 'founder');
CREATE TABLE "badges" (
	"key" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text
);

CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"author_id" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "commitments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" text NOT NULL,
	"lever" text NOT NULL,
	"title" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"due_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "dm_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" uuid NOT NULL,
	"sender_id" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "dm_thread_members" (
	"thread_id" uuid NOT NULL,
	"member_id" text NOT NULL,
	"last_read_at" timestamp with time zone,
	CONSTRAINT "dm_thread_members_thread_id_member_id_pk" PRIMARY KEY("thread_id","member_id")
);

CREATE TABLE "dm_threads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "event_rsvps" (
	"event_id" uuid NOT NULL,
	"member_id" text NOT NULL,
	"status" text DEFAULT 'going' NOT NULL,
	CONSTRAINT "event_rsvps_event_id_member_id_pk" PRIMARY KEY("event_id","member_id")
);

CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"type" "event_type" DEFAULT 'deep_dive' NOT NULL,
	"description" text,
	"starts_at" timestamp with time zone NOT NULL,
	"duration_mins" integer DEFAULT 60,
	"join_url" text,
	"recording_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "lesson_progress" (
	"member_id" text NOT NULL,
	"lesson_key" text NOT NULL,
	"status" text DEFAULT 'started' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_progress_member_id_lesson_key_pk" PRIMARY KEY("member_id","lesson_key")
);

CREATE TABLE "map_states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" text NOT NULL,
	"edition" text DEFAULT 'Fall 2026' NOT NULL,
	"answers" jsonb NOT NULL,
	"computed" jsonb NOT NULL,
	"overall" real,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "member_badges" (
	"member_id" text NOT NULL,
	"badge_key" text NOT NULL,
	"earned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "member_badges_member_id_badge_key_pk" PRIMARY KEY("member_id","badge_key")
);

CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" text NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "pod_members" (
	"pod_id" uuid NOT NULL,
	"member_id" text NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pod_members_pod_id_member_id_pk" PRIMARY KEY("pod_id","member_id")
);

CREATE TABLE "pods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pods_slug_unique" UNIQUE("slug")
);

CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" text NOT NULL,
	"pod_id" uuid,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "profiles" (
	"clerk_user_id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"handle" text,
	"display_name" text,
	"avatar_url" text,
	"bio" text,
	"role" "member_role" DEFAULT 'member' NOT NULL,
	"career_slug" text,
	"current_lane" text,
	"onboarded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_handle_unique" UNIQUE("handle")
);

CREATE TABLE "reactions" (
	"post_id" uuid NOT NULL,
	"member_id" text NOT NULL,
	"emoji" text DEFAULT '👍' NOT NULL,
	CONSTRAINT "reactions_post_id_member_id_emoji_pk" PRIMARY KEY("post_id","member_id","emoji")
);

ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_profiles_clerk_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("clerk_user_id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "commitments" ADD CONSTRAINT "commitments_member_id_profiles_clerk_user_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."profiles"("clerk_user_id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "dm_messages" ADD CONSTRAINT "dm_messages_thread_id_dm_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."dm_threads"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "dm_messages" ADD CONSTRAINT "dm_messages_sender_id_profiles_clerk_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("clerk_user_id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "dm_thread_members" ADD CONSTRAINT "dm_thread_members_thread_id_dm_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."dm_threads"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "dm_thread_members" ADD CONSTRAINT "dm_thread_members_member_id_profiles_clerk_user_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."profiles"("clerk_user_id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_member_id_profiles_clerk_user_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."profiles"("clerk_user_id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_member_id_profiles_clerk_user_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."profiles"("clerk_user_id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "map_states" ADD CONSTRAINT "map_states_member_id_profiles_clerk_user_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."profiles"("clerk_user_id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "member_badges" ADD CONSTRAINT "member_badges_member_id_profiles_clerk_user_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."profiles"("clerk_user_id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "member_badges" ADD CONSTRAINT "member_badges_badge_key_badges_key_fk" FOREIGN KEY ("badge_key") REFERENCES "public"."badges"("key") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_member_id_profiles_clerk_user_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."profiles"("clerk_user_id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pod_members" ADD CONSTRAINT "pod_members_pod_id_pods_id_fk" FOREIGN KEY ("pod_id") REFERENCES "public"."pods"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pod_members" ADD CONSTRAINT "pod_members_member_id_profiles_clerk_user_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."profiles"("clerk_user_id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_profiles_clerk_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("clerk_user_id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "posts" ADD CONSTRAINT "posts_pod_id_pods_id_fk" FOREIGN KEY ("pod_id") REFERENCES "public"."pods"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_member_id_profiles_clerk_user_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."profiles"("clerk_user_id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "comments_post_idx" ON "comments" USING btree ("post_id","created_at");
CREATE INDEX "commitments_member_idx" ON "commitments" USING btree ("member_id","status");
CREATE INDEX "dm_messages_thread_idx" ON "dm_messages" USING btree ("thread_id","created_at");
CREATE INDEX "events_when_idx" ON "events" USING btree ("starts_at");
CREATE INDEX "map_states_member_idx" ON "map_states" USING btree ("member_id","created_at");
CREATE INDEX "notifications_member_idx" ON "notifications" USING btree ("member_id","created_at");
CREATE INDEX "posts_feed_idx" ON "posts" USING btree ("pod_id","created_at");