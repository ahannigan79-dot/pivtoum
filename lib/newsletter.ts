import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { newsletterIssues, profiles } from "@/db/schema";
import { complete, parseJSON, aiConfigured } from "@/lib/ai";
import { VOICE } from "@/lib/voice";
import { monthlyRollup } from "@/lib/article-scout";
import { newsletterEmail } from "@/lib/community-emails";
import { sendMail, mailConfigured } from "@/lib/mailer";

/* The monthly newsletter send loop. Claude drafts an issue from the month's
 * article-scout roll-up (in-voice, member-facing), the founder edits it, and it
 * sends to members who accept community email — saved as a sent issue for history.
 * One editable draft at a time; sending marks it sent and starts a fresh draft. */

export type NewsletterIssue = {
  id: string; subject: string; body: string; status: "draft" | "sent";
  recipientCount: number; sentAt: Date | null; createdAt: Date;
};

const SYSTEM = `${VOICE}

## What you are writing
A short MONTHLY email newsletter to the members of "Winning in the Age of AI", built from the month's best AI articles (given below). It is a warm, useful round-up — the signal from the month's noise — not a hard sell.

Rules:
- 250–400 words. Open with one or two sentences on the month's throughline, then walk the 3–5 most useful pieces, each as its own short paragraph that says why it matters to a working professional and links to it.
- Group with "## " subheadings only if it genuinely helps (e.g. "## The big shift", "## Worth your time"). Don't force sections.
- Link every article you mention with markdown: [the article's title](its url). Use the real URLs provided; never invent one.
- Plain, direct, in-voice. No hype, no emoji, no preamble like "In this issue". End with a short forward-looking line, not a slogan.
- Second person, addressed to the reader.

## Output — STRICT
Return ONLY a JSON object, no markdown fence:
{ "subject": "a specific, non-clickbait subject line (≤ 70 chars)", "body": "the newsletter body in the markdown-ish form above" }`;

/** Draft an issue from the month's roll-up (does not persist). Null if unable. */
export async function generateNewsletterDraft(): Promise<{ subject: string; body: string } | null> {
  if (!aiConfigured()) return null;
  const rollup = await monthlyRollup();
  if (!rollup || !rollup.picks.length) return null;

  const picks = rollup.picks.slice(0, 8)
    .map((p, i) => `${i + 1}. "${p.title}" — ${p.source}${p.date ? `, ${p.date}` : ""} [lane: ${p.lane}]\n   ${p.summary}\n   URL: ${p.url}`)
    .join("\n");
  const cp = rollup.counterpoints[0];
  const content =
    `THE MONTH'S ARTICLES (from ${rollup.weeks} weekly scans, newest week ${rollup.latestWeekOf}):\n${picks}\n\n` +
    (cp ? `A COUNTERPOINT worth engaging: "${cp.title}" — ${cp.source} [${cp.url}]\n   Their case: ${cp.why}\n   Our angle: ${cp.ourAngle}\n\n` : "") +
    `Write this month's newsletter as strict JSON per the format.`;

  const raw = await complete({ system: SYSTEM, maxTokens: 1600, messages: [{ role: "user", content }] });
  const parsed = parseJSON<{ subject?: unknown; body?: unknown }>(raw ?? "");
  const subject = typeof parsed?.subject === "string" ? parsed.subject.trim().slice(0, 120) : "";
  const body = typeof parsed?.body === "string" ? parsed.body.trim() : "";
  if (!subject || !body) return null;
  return { subject, body };
}

const rowToIssue = (r: typeof newsletterIssues.$inferSelect): NewsletterIssue => ({
  id: r.id, subject: r.subject, body: r.body, status: r.status as "draft" | "sent",
  recipientCount: r.recipientCount, sentAt: r.sentAt, createdAt: r.createdAt,
});

/** The current editable draft (latest issue still in draft), or null. */
export async function getDraftIssue(): Promise<NewsletterIssue | null> {
  const rows = await db.select().from(newsletterIssues)
    .where(eq(newsletterIssues.status, "draft")).orderBy(desc(newsletterIssues.createdAt)).limit(1);
  return rows[0] ? rowToIssue(rows[0]) : null;
}

/** Past issues (sent + the working draft), newest first. */
export async function listIssues(limit = 12): Promise<NewsletterIssue[]> {
  const rows = await db.select().from(newsletterIssues).orderBy(desc(newsletterIssues.createdAt)).limit(limit);
  return rows.map(rowToIssue);
}

/** Save the working draft — updates the open draft, or creates one. Returns its id. */
export async function saveDraftIssue(founderId: string, subject: string, body: string): Promise<string> {
  const existing = await getDraftIssue();
  if (existing) {
    await db.update(newsletterIssues).set({ subject, body }).where(eq(newsletterIssues.id, existing.id));
    return existing.id;
  }
  const ins = await db.insert(newsletterIssues)
    .values({ subject, body, status: "draft", createdBy: founderId }).returning({ id: newsletterIssues.id });
  return ins[0].id;
}

/** Recipients: members who accept community email and have an address. */
async function recipients(): Promise<{ id: string; email: string; name: string | null }[]> {
  return db.select({ id: profiles.clerkUserId, email: profiles.email, name: profiles.displayName })
    .from(profiles).where(and(eq(profiles.emailDigest, true), sql`${profiles.email} is not null`));
}

export type SendResult = { ok: boolean; reason?: string; sent?: number; recipients?: number };

/** Send a draft issue to all opted-in members, then mark it sent. Founder-gated upstream. */
export async function sendIssue(id: string): Promise<SendResult> {
  if (!mailConfigured()) return { ok: false, reason: "email-not-configured" };
  const rows = await db.select().from(newsletterIssues).where(eq(newsletterIssues.id, id)).limit(1);
  const issue = rows[0];
  if (!issue) return { ok: false, reason: "not-found" };
  if (issue.status === "sent") return { ok: false, reason: "already-sent" };

  const list = await recipients();
  let sent = 0;
  for (const m of list) {
    const { subject, html, text } = newsletterEmail({ name: m.name ?? m.email.split("@")[0], subject: issue.subject, body: issue.body });
    if (await sendMail({ to: m.email, subject, html, text })) sent++;
  }
  await db.update(newsletterIssues)
    .set({ status: "sent", sentAt: new Date(), recipientCount: sent })
    .where(eq(newsletterIssues.id, id));
  return { ok: true, sent, recipients: list.length };
}
