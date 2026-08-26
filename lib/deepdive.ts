import "server-only";
import { readFile } from "fs/promises";
import path from "path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import remarkHighlight from "@/lib/remark-highlight";
import { careers, type Career } from "@/data/careers";

/**
 * Evidence links in the deep dives point out to BLS, WEF, academic sources etc.
 * Open them in a new tab so a member never loses their place in the guide, and
 * mark them so the prose CSS can flag an outbound source.
 */
function rehypeExternalLinks() {
  return (tree: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visit(tree as any, "element", (node: any) => {
      if (node.tagName !== "a") return;
      const href: string = node.properties?.href ?? "";
      if (/^https?:\/\//i.test(href)) {
        node.properties.target = "_blank";
        node.properties.rel = "noopener noreferrer";
        node.properties.className = [...(node.properties.className ?? []), "dd-ext"];
      }
    });
  };
}

/**
 * Career Deep Dives — served from the content we already produced. The
 * `active` and `planning` profile write-ups in content/profiles-md are already
 * self-framed ("for all"), so the Deep Dive renders those directly (no model, no
 * cost): the `active` guide for people already in a field, `planning` for those
 * still choosing. The short student version is the Free Sample.
 */

export type Stage = "active" | "planning";
export type DeepDive = { deepHtml: string; sampleHtml: string | null; stage: Stage };

export function resolveCareer(slugOrName: string | null | undefined): Career | null {
  if (!slugOrName) return null;
  const key = slugOrName.trim().toLowerCase();
  if (!key) return null;
  return (
    careers.find((c) => c.slug.toLowerCase() === key) ||
    careers.find((c) => c.name.toLowerCase() === key) ||
    careers.find((c) => c.name.toLowerCase().includes(key) || key.includes(c.name.toLowerCase())) ||
    null
  );
}

export const CAREER_OPTIONS = [...careers]
  .map((c) => ({ slug: c.slug, name: c.name }))
  .sort((a, b) => a.name.localeCompare(b.name));

/** Map a member's stored stage to which guide fits: planning vs already-in. */
export function stageFor(careerStage: string | null | undefined): Stage {
  const s = (careerStage ?? "").toLowerCase();
  return /plan|student|study|choos|school|deciding|considering/.test(s) ? "planning" : "active";
}

async function read(rel: string): Promise<string | null> {
  try {
    return await readFile(path.join(process.cwd(), rel), "utf8");
  } catch {
    return null;
  }
}

async function firstThatExists(rels: string[]): Promise<string | null> {
  for (const rel of rels) {
    const md = await read(rel);
    if (md && md.trim()) return md;
  }
  return null;
}

async function toHtml(md: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkHighlight)
    .use(remarkRehype)
    .use(rehypeExternalLinks)
    .use(rehypeStringify)
    .process(md);
  return String(file);
}

const DIR = "content/profiles-md";

/** The rendered Deep Dive + Free Sample for a career, in the member's stage. Null if no content. */
export async function getDeepDive(slug: string, stage: Stage): Promise<DeepDive | null> {
  const preferred = `${DIR}/${slug}-${stage}.md`;
  const other = `${DIR}/${slug}-${stage === "active" ? "planning" : "active"}.md`;
  const deepMd = await firstThatExists([preferred, other, `content/full/${slug}.mdx`]);
  if (!deepMd) return null;

  const sampleMd = await firstThatExists([`${DIR}/${slug}-02-short-version-for-student.md`, `content/full/${slug}-student.mdx`]);

  return {
    deepHtml: await toHtml(deepMd),
    sampleHtml: sampleMd ? await toHtml(sampleMd) : null,
    stage,
  };
}

/** Which stages actually have a file — so the page can offer the toggle only when real. */
export async function availableStages(slug: string): Promise<Stage[]> {
  const out: Stage[] = [];
  if (await read(`${DIR}/${slug}-active.md`)) out.push("active");
  if (await read(`${DIR}/${slug}-planning.md`)) out.push("planning");
  return out;
}
