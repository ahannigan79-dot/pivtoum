/* Curated feed topics. Deliberately few and serious — this is a professional
 * space about people's careers, not a social wall. Keep the set tight. */

export type Topic = {
  slug: string;
  label: string;
  hint: string; // shown in the composer picker
  founderOnly?: boolean; // only founders/mods can post here
};

export const TOPICS: Topic[] = [
  { slug: "announcements", label: "Announcements", hint: "Official updates from Adam", founderOnly: true },
  { slug: "introductions", label: "Introductions", hint: "Introduce yourself — where you are, where you're headed" },
  { slug: "wins", label: "Wins & milestones", hint: "A move you shipped, a result you earned" },
  { slug: "ask", label: "Ask the room", hint: "A question for people on the same path" },
  { slug: "rebuilds", label: "Workflow rebuilds", hint: "How you're rebuilding your work AI-native" },
  { slug: "signals", label: "Field signals", hint: "What's shifting in your industry" },
  { slug: "member-article", label: "Member articles", hint: "Longer pieces from members — published after review", founderOnly: true },
];

export const TOPIC_BY_SLUG: Record<string, Topic> = Object.fromEntries(TOPICS.map((t) => [t.slug, t]));

export function topicLabel(slug: string | null | undefined): string | null {
  return slug ? TOPIC_BY_SLUG[slug]?.label ?? null : null;
}

/** Topics a given member may post into. */
export function postableTopics(isFounder: boolean): Topic[] {
  return TOPICS.filter((t) => isFounder || !t.founderOnly);
}
