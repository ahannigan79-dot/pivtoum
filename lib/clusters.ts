/**
 * The 6 career clusters — the routing taxonomy for the Winning in the Age of AI
 * community. Cluster is a routing/positioning concern, not scored data, so it
 * lives here rather than on the generated Career model. Every one of the 28
 * career slugs belongs to exactly one cluster.
 *
 * On /map we no longer ask people to pick a cluster — their career selections
 * define it. `derivePrimaryCluster()` turns a set of picks into the one cluster
 * we route them to (most-picked wins; ties break toward the first pick).
 */

export interface Cluster {
  id: string;
  label: string;
  /** One-line orientation, safest→exposed, used in emails / the welcome guide. */
  blurb: string;
  slugs: string[];
}

export const CLUSTERS: Cluster[] = [
  {
    id: "health-clinical",
    label: "Health & Clinical Care",
    blurb: "Licensed, hands-on, human-accountable — the most structurally protected corner of the board.",
    slugs: ["medicine", "nursing", "dentistry", "veterinary", "pharmacy", "allied-health"],
  },
  {
    id: "care-mind-education",
    label: "Care, Mind & Education",
    blurb: "Protected by human judgment and relationship — a softer moat, and the widest promise-vs-reality gaps.",
    slugs: ["psychology", "social-work", "teaching"],
  },
  {
    id: "physical",
    label: "The Physical & In-Person World",
    blurb: "Work that happens in the real world, on site, with your hands — hard for a screen to reach.",
    slugs: ["trades", "construction", "engineering", "architecture", "agriculture", "transport", "hospitality"],
  },
  {
    id: "business-finance-law",
    label: "Business, Finance & Law",
    blurb: "The widest splits of any group — the same title routinely holds both a safe career and an exposed one.",
    slugs: ["business", "finance", "accounting", "law"],
  },
  {
    id: "tech-data-science",
    label: "Tech, Data & Science",
    blurb: "Building the change — which means both the sharpest exposure and the clearest openings.",
    slugs: ["computer-science", "data-science", "cybersecurity", "life-sciences"],
  },
  {
    id: "creative-media",
    label: "Creative, Media & Communication",
    blurb: "Where generative AI landed first — the exposed end is real, and so is the elevated one.",
    slugs: ["design", "journalism", "translation", "marketing"],
  },
];

/** slug → cluster id, built once from the taxonomy. */
const SLUG_TO_CLUSTER: Record<string, string> = Object.fromEntries(
  CLUSTERS.flatMap((c) => c.slugs.map((s) => [s, c.id])),
);

export function clusterOf(slug: string): string | null {
  return SLUG_TO_CLUSTER[slug] ?? null;
}

export function getCluster(id: string | null | undefined): Cluster | null {
  if (!id) return null;
  return CLUSTERS.find((c) => c.id === id) ?? null;
}

/**
 * Derive the cluster to route a signup to from their career picks. Most-picked
 * cluster wins; a tie breaks toward the cluster of the first pick (which is the
 * pre-selected career when they arrived from a specific career page). Returns
 * `{ primary, touched }` — primary is the routing key, touched is every cluster
 * their picks spanned (kept for later use). Null primary if no picks resolve.
 */
export function derivePrimaryCluster(slugs: string[]): {
  primary: string | null;
  touched: string[];
} {
  const counts = new Map<string, number>();
  const order: string[] = [];
  for (const slug of slugs) {
    const id = clusterOf(slug);
    if (!id) continue;
    if (!counts.has(id)) order.push(id);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  if (order.length === 0) return { primary: null, touched: [] };
  // Highest count wins; on a tie keep the earliest-seen (first pick's) cluster.
  let primary = order[0];
  for (const id of order) {
    if ((counts.get(id) ?? 0) > (counts.get(primary) ?? 0)) primary = id;
  }
  return { primary, touched: order };
}
