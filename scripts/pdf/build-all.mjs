import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { execFileSync } from "node:child_process";

/**
 * Batch-build every profile PDF from a directory of markdown into profiles-src/.
 *
 *   node scripts/pdf/build-all.mjs <markdown-dir>
 *
 * Expects files named <slug>-01-full-profile-for-parents.md and
 * <slug>-02-short-version-for-student.md. computer-science is skipped (it's the
 * free web profile, not sold). After running, hit /api/upload-profiles to push
 * the results to Blob.
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
      .map((f) => /^(.*)-01-full-profile-for-parents\.md$/.exec(f)?.[1])
      .filter(Boolean),
  ),
];

let ok = 0;
for (const slug of slugs) {
  if (slug === "computer-science") { console.log(`skip ${slug} (free web profile)`); continue; }
  const parent = join(mdDir, `${slug}-01-full-profile-for-parents.md`);
  const student = join(mdDir, `${slug}-02-short-version-for-student.md`);
  try {
    execFileSync("node", [GEN, slug, "parent", parent, join(OUT, `${slug}-parent.pdf`)], { stdio: "inherit" });
    execFileSync("node", [GEN, slug, "student", student, join(OUT, `${slug}-student.pdf`)], { stdio: "inherit" });
    ok++;
  } catch {
    console.error(`FAILED ${slug}`);
  }
}
console.log(`\nBuilt ${ok}/${slugs.filter((s) => s !== "computer-science").length} careers into profiles-src/`);
