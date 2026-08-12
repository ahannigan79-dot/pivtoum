import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { execFileSync } from "node:child_process";

/**
 * Batch-build every profile PDF from a directory of markdown into profiles-src/.
 *
 *   node scripts/pdf/build-all.mjs <markdown-dir>
 *
 * Expects files named <slug>-planning.md and <slug>-active.md — the two
 * audience-neutral, stage-forked Career Value Guides per career. Any career
 * without a planning file is skipped (e.g. computer-science, the free web
 * sample). After running, hit /api/upload-profiles to push the results to Blob.
 */
const DIR = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(DIR, "../..");
const GEN = join(DIR, "generate.mjs");
const OUT = join(REPO, "profiles-src");

const mdDir = process.argv[2];
if (!mdDir) {
  console.error("usage: build-all.mjs <markdown-dir>");
  process.exit(1);
}

const files = readdirSync(mdDir);
const slugs = [
  ...new Set(
    files
      .map((f) => /^(.*)-planning\.md$/.exec(f)?.[1])
      .filter(Boolean),
  ),
];

let ok = 0;
for (const slug of slugs) {
  const planning = join(mdDir, `${slug}-planning.md`);
  const active = join(mdDir, `${slug}-active.md`);
  try {
    execFileSync("node", [GEN, slug, "planning", planning, join(OUT, `${slug}-planning.pdf`)], { stdio: "inherit" });
    execFileSync("node", [GEN, slug, "active", active, join(OUT, `${slug}-active.pdf`)], { stdio: "inherit" });
    ok++;
  } catch {
    console.error(`FAILED ${slug}`);
  }
}
console.log(`\nBuilt ${ok}/${slugs.length} careers into profiles-src/`);
