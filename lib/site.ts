/** Site-wide constants. Domain can be overridden via NEXT_PUBLIC_SITE_URL. */
export const SITE = {
  name: "Pivotum",
  /** The founder — emails go out in his voice to sound human, not corporate. */
  founder: "Adam",
  tagline: "Help your kid choose a career that lasts.",
  /** The trust line — who we are and why we care. Shown site-wide (parent framing). */
  creed: "We build AI for a living, and we’re figuring out our own teenagers’ futures alongside yours.",
  /** The same trust line, framed for the worried-adult (your-career) audience. */
  creedWorker: "We build AI for a living, and we’re worried about our own careers too — right alongside you.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://pivotum.ai",
  /** The Winning in the Age of AI community, hosted on Mighty Networks. */
  community: process.env.NEXT_PUBLIC_COMMUNITY_URL ?? "https://community.pivotum.ai",
  /** Where "join / start your free trial" sends people. Defaults to the new hub
   *  (sign in → looking glass → trial). Point NEXT_PUBLIC_JOIN_URL elsewhere to
   *  control the cutover from Mighty Networks. */
  join: process.env.NEXT_PUBLIC_JOIN_URL ?? "/hub",
  /** The community's name — the paid membership people join. */
  communityName: "Winning in the Age of AI",
} as const;

/** The current edition. Bump this when a new edition publishes. */
export const EDITION = "Fall 2026";
