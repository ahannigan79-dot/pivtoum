# Profile PDF pipeline

Generates the paid career-profile PDFs (a parent full profile + a student short
version per career) from markdown, styled with the Pivotum design system.

## How it works

- `generate.mjs` — renders one markdown file to one PDF via headless Chromium.
  Fonts (Literata + Archivo) are embedded from `brandfonts-embed.css`; the cover
  score and its green/red circle are read from `data/careers.ts`, so a PDF can
  never disagree with the site. The four highlight marks (`==`, `==+`, `==-`,
  `==?`) map to the finding / protection / exposure / method colours.
- `build-all.mjs` — batch-runs `generate.mjs` over a directory of markdown into
  `profiles-src/`.
- `brand.css` / `brandfonts-embed.css` — the print stylesheet and the base64
  font faces.

## Usage

```sh
# one file
node scripts/pdf/generate.mjs finance parent path/to/finance-01-...-parents.md profiles-src/finance-parent.pdf

# a whole set (dir of <slug>-01-...-parents.md + <slug>-02-...-student.md)
node scripts/pdf/build-all.mjs "path/to/MD Extraction"
```

Chromium binary: defaults to the sandbox path; override with `PW_CHROMIUM=/path/to/chrome`.

## Loading into the store

1. Build PDFs into `profiles-src/` (committed to the repo).
2. In `scripts/gen-content.mjs`, add each new slug to the `hasFullProfile` list
   so it becomes sellable, then `node scripts/gen-content.mjs`.
3. Deploy, then hit `GET /api/upload-profiles?key=<DOWNLOAD_SIGNING_SECRET>` once
   to push `profiles-src/*` to Blob as `profiles/<slug>-parent.pdf` /
   `profiles/<slug>-student.pdf`.

Naming convention in `profiles-src/`: `<slug>-parent.pdf`, `<slug>-student.pdf`.
`computer-science` is intentionally excluded — it's the free web profile.
