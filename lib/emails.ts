import { SITE } from "@/lib/site";

/**
 * Branded purchase-delivery email. Table-based, inline styles, web-safe fonts
 * (Georgia for reading, Arial for labels) to survive email clients. Returns both
 * an HTML and a plain-text part.
 */
export function purchaseEmail(
  items: { name: string; url: string }[],
  token: string,
  expert?: { bookingUrl?: string },
) {
  const ink = "#1C1A16";
  const inkSoft = "#6B655B";
  const pencil = "#948D80";
  const rule = "#E7E2D8";
  const accent = "#10605E"; // petrol — chrome accent for links
  const pen = "#B4442F";
  const hl = "#E4EDEC"; // petrol accent-wash — the highlighter yellow is retired

  const expertBlock = expert
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${hl};border-radius:4px;margin:0 0 20px;"><tr><td style="padding:18px 20px;">
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:.1em;text-transform:uppercase;color:${ink};margin:0 0 6px;">Your Expert Meeting</div>
        <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.55;color:${ink};margin:0 0 ${expert.bookingUrl ? "14px" : "0"};">You added two 1-hour sessions with me to talk through your family&rsquo;s shortlist, live.${expert.bookingUrl ? "" : " I&rsquo;ll email you within a day to find times that work."}</p>
        ${expert.bookingUrl ? `<p style="margin:0;"><a href="${expert.bookingUrl}" style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;letter-spacing:.04em;text-transform:uppercase;color:#ffffff;background:${ink};text-decoration:none;padding:13px 26px;border-radius:3px;">Book your sessions &rarr;</a></p>` : ""}
      </td></tr></table>`
    : "";

  const link = (url: string, label: string) =>
    `<a href="${url}" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:.04em;text-transform:uppercase;color:${accent};text-decoration:none;white-space:nowrap;">${label} &rarr;</a>`;

  const rows = items
    .map(
      (it) => `
      <tr><td style="padding:14px 0;border-bottom:1px solid ${rule};">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:17px;color:${ink};margin-bottom:6px;">${it.name}</div>
        <div>${link(it.url, "Download your guide")}</div>
      </td></tr>`,
    )
    .join("");

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#F4F1EA;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F1EA;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FBFAF6;border:1px solid ${rule};border-radius:8px;">
        <tr><td style="padding:34px 36px 26px;">
          <img src="${SITE.url}/brand/wordmark-plain.png" alt="Pivotum" width="150" style="display:block;border:0;height:auto;outline:none;text-decoration:none;" />
          <span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Pivotum</span>

          <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:.12em;text-transform:uppercase;color:${pencil};margin:24px 0 6px;">Your Career Value Guides &middot; Fall 2026</div>
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:25px;color:${ink};margin:0 0 16px;">Your Career Value Guides are ready</div>

          <p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:${ink};margin:0 0 18px;">Thanks for your purchase. Your download links are valid for <strong>7 days</strong>.</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1.5px solid ${ink};margin:0 0 20px;">
            ${rows}
          </table>

          <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;line-height:1.6;color:${inkSoft};margin:0 0 16px;">Each guide is written for exactly where you are, reads whether you&rsquo;re the parent or the student, and includes the technical scoring appendix. <strong>This edition and the next are included</strong> &mdash; we re-score every six months, so your guide stays current for a full year.</p>
          ${expertBlock}
          <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;line-height:1.6;color:${inkSoft};margin:0;">You can re-open your selection page any time at <a href="${SITE.url}/claim/${token}" style="color:${pen};">your claim link</a>.</p>
        </td></tr>
        <tr><td style="padding:18px 36px 26px;border-top:1px solid ${rule};">
          <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.7;color:${pencil};margin:0;">28 careers, scored the same way. Scores measure exposure to what AI can already do &mdash; not how much any employer has deployed. Re-scored every six months. We publish where we might be wrong.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
  </body></html>`;

  const text =
    `Your Pivotum Career Value Guides are ready — download links valid for 7 days:\n\n` +
    items
      .map((it) => `• ${it.name}\n    ${it.url}`)
      .join("\n\n") +
    `\n\nEach guide is written for exactly where you are, reads whether you're the parent or the student, and includes the technical scoring appendix. ` +
    `This edition and the next are included — we re-score every six months, so your guide stays current for a full year.\n\n` +
    (expert
      ? `YOUR EXPERT MEETING: You added two 1-hour sessions with the founder. ${expert.bookingUrl ? `Book them here: ${expert.bookingUrl}` : "We'll email you within a day to find times."}\n\n`
      : "") +
    `Re-open your selection page any time: ${SITE.url}/claim/${token}\n\n` +
    `Pivotum — 28 careers, scored the same way.`;

  return { html, text };
}

/**
 * The Career Map package email — delivered from the /map capture. Lists the
 * assembled package (index + the stage/voice guide + overview + the chosen
 * career breakdowns) as a download list, then surfaces the same subscriber
 * discount. Same branded, table-based, inline-styled construction as the others.
 */
export function packageEmail(opts: {
  items: { name: string; url: string; sub?: string; cta?: string }[];
  code: string;
  discountLabel: string;
  expiresDays: number;
  buyUrl: string;
  audience?: "child" | "self"; // parent-of-child vs the reader themselves
  careerNames?: string[]; // the picked careers, to personalize the sell
  score?: number | null; // the exposure score the on-page reveal showed
  factors?: { label: string; kind: "expose" | "protect" }[]; // the 4 drivers
  careerName?: string | null; // the role the score is for
  communityUrl?: string; // link to the Community guide (/community)
}) {
  const { items, code, discountLabel, expiresDays } = opts;
  const introLine = "Thanks for running your Exposure Check. Your score and the four factors behind it are below, along with the full 28-career index &mdash; and the look inside the community, where you turn that number into your opening.";
  const introText = "Thanks for running your Exposure Check. Your score and the four factors behind it are below, along with the full 28-career index — and the look inside the community, where you turn that number into your opening.";
  // Brand tokens (light) — exact hex from the design system.
  const ink = "#1C1A16";
  const inkSoft = "#6B655B";
  const pencil = "#948D80";
  const rule = "#E7E2D8";
  const accent = "#10605E";   // petrol — the single chrome accent (links, labels, rules)
  const pen = "#B4442F";      // exposed coral — DATA only (high score, exposing factors)
  const prot = "#2E7D55";     // protected green — DATA only (low score, protecting factors)
  const amber = "#B8873A";    // moderate — DATA only

  const link = (url: string, label: string) =>
    `<a href="${url}" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:.04em;text-transform:uppercase;color:${accent};text-decoration:none;white-space:nowrap;">${label} &rarr;</a>`;
  const button = (url: string, label: string, bg: string) =>
    `<a href="${url}" style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;letter-spacing:.04em;text-transform:uppercase;color:#ffffff;background:${bg};text-decoration:none;padding:13px 26px;border-radius:3px;">${label}</a>`;

  // The exposure score + the 4 factors the on-page reveal showed — echoed here
  // so the number they saw is theirs to keep. Higher = more exposed.
  const score = typeof opts.score === "number" ? opts.score : null;
  const factors = opts.factors ?? [];
  const scoreColor = score == null ? ink : score >= 60 ? pen : score <= 39 ? prot : amber;
  const forName = opts.careerName ? ` for <strong>${opts.careerName}</strong>` : "";
  const factorRow = (f: { label: string; kind: "expose" | "protect" }) => `
    <tr><td style="padding:7px 0;vertical-align:top;">
      <span style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;color:${f.kind === "expose" ? pen : prot};">${f.kind === "expose" ? "Exposing you" : "On your side"}</span>
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.45;color:${ink};margin-top:2px;">${f.label}</div>
    </td></tr>`;
  const scoreBlock = score == null ? "" : `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${rule};border-radius:6px;margin:0 0 22px;"><tr><td style="padding:20px 22px;">
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:.1em;text-transform:uppercase;color:${pencil};margin:0 0 4px;">Your exposure score${forName}</div>
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:46px;font-weight:bold;line-height:1;color:${scoreColor};margin:0 0 4px;">${score}<span style="font-size:20px;color:${pencil};font-weight:normal;">/100</span></div>
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${pencil};margin:0 0 14px;">Higher means more exposed to what AI can already do. Inside, you drive it down.</div>
      ${factors.length ? `<div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;color:${ink};border-top:1px solid ${rule};padding-top:12px;">The 4 factors driving it</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${factors.map(factorRow).join("")}</table>` : ""}
    </td></tr></table>`;
  const communityBlock = !opts.communityUrl ? "" : `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${rule};border-left:3px solid ${accent};border-radius:8px;background:#F4F1EA;margin:0 0 4px;"><tr><td style="padding:20px 22px;">
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:.1em;text-transform:uppercase;color:${accent};margin:0 0 6px;">You came here out of concern — here's the opportunity</div>
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:19px;color:${ink};margin:0 0 8px;">Turn that number into your opening</div>
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.6;color:${ink};margin:0 0 14px;">The shift that exposed your work is the same one opening the ground for whoever moves first. Inside <strong>Winning in the Age of AI</strong> you get your living Map, the reps that build your edge, and a pod in your exact lane — so your score comes <em>down</em> and you come out ahead. Here's the full look inside:</p>
      <p style="margin:0 0 6px;">${button(opts.communityUrl, "See everything inside", ink)}</p>
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${pencil};margin:10px 0 0;">And <strong>${discountLabel} your first purchase</strong> with code <strong>${code}</strong> — good for ${expiresDays} days.</p>
    </td></tr></table>`;

  const rows = items
    .map(
      (it) => `
      <tr><td style="padding:13px 0;border-bottom:1px solid ${rule};">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;color:${ink};margin-bottom:${it.sub ? "3px" : "7px"};">${it.name}</div>
        ${it.sub ? `<div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:${pencil};margin-bottom:8px;">${it.sub}</div>` : ""}
        <div>${link(it.url, it.cta ?? "Download PDF")}</div>
      </td></tr>`,
    )
    .join("");

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#F4F1EA;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F1EA;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FBFAF6;border:1px solid ${rule};border-radius:8px;">
        <tr><td style="padding:34px 36px 26px;">
          <img src="${SITE.url}/brand/wordmark-plain.png" alt="Pivotum" width="150" style="display:block;border:0;height:auto;outline:none;text-decoration:none;" />
          <span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Your Career Map, plus ${discountLabel} for subscribers.</span>

          <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:.12em;text-transform:uppercase;color:${pencil};margin:24px 0 4px;">The Career Map &middot; Fall 2026</div>
          <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:13px;color:${pencil};margin:0 0 12px;">Careers, mapped for the age of AI</div>
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;color:${ink};margin:0 0 16px;">Your Career Map is here</div>

          <p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:${ink};margin:0 0 6px;">${introLine}</p>
          <p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:${ink};margin:0 0 20px;">Your exposure score and the factors behind it are up top &mdash; and below, the full look inside the community, with <strong>${discountLabel} your first purchase</strong>.</p>

          ${scoreBlock}

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1.5px solid ${ink};margin:0 0 22px;">
            ${rows}
          </table>

          ${communityBlock}

          <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.6;color:${ink};margin:22px 0 2px;">I hope the map helps. Reply any time &mdash; I read every one.</p>
          <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.6;color:${inkSoft};margin:0;">&mdash; ${SITE.founder}, founder, Pivotum</p>
        </td></tr>
        <tr><td style="padding:18px 36px 26px;border-top:1px solid ${rule};">
          <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.7;color:${pencil};margin:0;">28 careers, scored the same way. Scores measure exposure to what AI can already do &mdash; not how much any employer has deployed. Re-scored every six months. We publish where we might be wrong.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
  </body></html>`;

  const scoreText = score == null ? "" :
    `YOUR EXPOSURE SCORE${opts.careerName ? ` (${opts.careerName})` : ""}: ${score}/100 — higher means more exposed to what AI can already do. Inside, you drive it down.\n` +
    (factors.length ? `The 4 factors driving it:\n${factors.map((f) => `  • [${f.kind === "expose" ? "exposing you" : "on your side"}] ${f.label}`).join("\n")}\n` : "") + `\n`;
  const communityText = !opts.communityUrl ? "" :
    `\nYOU CAME HERE OUT OF CONCERN — HERE'S THE OPPORTUNITY:\n` +
    `The shift that exposed your work is the same one opening the ground for whoever moves first. Inside Winning in the Age of AI you get your living Map, the reps that build your edge, and a pod in your exact lane — so your score comes down and you come out ahead.\n${opts.communityUrl}\n` +
    `And ${discountLabel} your first purchase with code ${code} — good for ${expiresDays} days.\n`;

  const text =
    `Your Career Map is here.\n\n` +
    scoreText +
    `${introText}\n\n` +
    items.map((it) => `• ${it.name}\n    ${it.url}`).join("\n\n") +
    communityText +
    `\nI hope the map helps. Reply any time — I read every one.\n— ${SITE.founder}, founder, Pivotum`;

  return { html, text };
}

/**
 * The "here's your free PDF" email — the trojan horse. Delivers the requested
 * sampler/index PDF up top (with the subscriber offer surfaced in the opening
 * line), then makes the case for the paid profiles and hands over the discount
 * code. Same branded, table-based, inline-styled construction as purchaseEmail.
 */
export function pdfWelcomeEmail(opts: {
  pdfUrl: string;
  pdfLabel: string; // e.g. "Veterinary Medicine sampler" or "all 28 scores"
  code: string; // e.g. "PARENT20"
  discountLabel: string; // e.g. "20% off"
  expiresDays: number; // e.g. 7
  buyUrl: string;
}) {
  const { pdfUrl, pdfLabel, code, discountLabel, expiresDays, buyUrl } = opts;
  const ink = "#1C1A16";
  const inkSoft = "#6B655B";
  const pencil = "#948D80";
  const rule = "#E7E2D8";
  const accent = "#10605E"; // petrol — chrome accent for links
  const pen = "#B4442F";
  const hl = "#E4EDEC"; // petrol accent-wash — the highlighter yellow is retired

  const button = (url: string, label: string, bg: string) =>
    `<a href="${url}" style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;letter-spacing:.04em;text-transform:uppercase;color:#ffffff;background:${bg};text-decoration:none;padding:13px 26px;border-radius:3px;">${label}</a>`;

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#F4F1EA;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F1EA;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FBFAF6;border:1px solid ${rule};border-radius:8px;">
        <tr><td style="padding:34px 36px 26px;">
          <img src="${SITE.url}/brand/wordmark-plain.png" alt="Pivotum" width="150" style="display:block;border:0;height:auto;outline:none;text-decoration:none;" />
          <span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Your free Pivotum PDF, plus ${discountLabel} for subscribers.</span>

          <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:.12em;text-transform:uppercase;color:${pencil};margin:24px 0 6px;">Your free PDF &middot; Fall 2026</div>
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;color:${ink};margin:0 0 16px;">Hi &mdash; I&rsquo;m ${SITE.founder}, I built Pivotum</div>

          <p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:${ink};margin:0 0 14px;">Thanks for signing up. Here&rsquo;s the <strong>${pdfLabel}</strong> you asked for &mdash; and because you did, I&rsquo;ve tucked <strong>${discountLabel} the Career Value Guide</strong> in below (your code&rsquo;s at the bottom, good for ${expiresDays} days).</p>

          <p style="margin:0 0 24px;">${button(pdfUrl, "Download your PDF", ink)}</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${rule};"><tr><td style="padding-top:22px;">
            <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.6;color:${ink};margin:0 0 12px;">I started Pivotum because I work in AI for a living and I&rsquo;m figuring out my own kid&rsquo;s future alongside you. The sampler tells you where a career stands. The <strong>Career Value Guide</strong> is how you act on it &mdash; whether your kid is still choosing a path or already on one: all six factors scored and explained, the sub-tracks that split a field in two (the specialty that&rsquo;s safe versus the one that isn&rsquo;t), the three-year trend, every source, and a version written directly to the student. It&rsquo;s how you make one of your family&rsquo;s biggest bets on evidence, not a hunch.</p>
          </td></tr></table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${hl};border-radius:4px;margin:8px 0 4px;"><tr><td style="padding:18px 20px;">
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:.1em;text-transform:uppercase;color:${ink};margin:0 0 6px;">Founding Subscriber Discount</div>
            <p style="font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.5;color:${ink};margin:0 0 14px;"><strong>${discountLabel}</strong> any pack with code <strong>${code}</strong>. Expires in ${expiresDays} days.</p>
            <p style="margin:0;">${button(buyUrl, "Get the Career Value Guide", ink)}</p>
          </td></tr></table>

          <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.6;color:${ink};margin:22px 0 2px;">Either way, I hope the PDF helps. Reply any time &mdash; I read every one.</p>
          <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.6;color:${inkSoft};margin:0;">&mdash; ${SITE.founder}, founder, Pivotum</p>
        </td></tr>
        <tr><td style="padding:18px 36px 26px;border-top:1px solid ${rule};">
          <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.7;color:${pencil};margin:0;">28 careers, scored the same way. Scores measure exposure to what AI can already do &mdash; not how much any employer has deployed. Re-scored every six months. We publish where we might be wrong.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
  </body></html>`;

  const text =
    `Hi — I'm ${SITE.founder}, I built Pivotum.\n\n` +
    `Thanks for signing up. Here's the ${pdfLabel} you asked for:\n${pdfUrl}\n\n` +
    `I started Pivotum because I work in AI for a living and I'm figuring out my own kid's future alongside you. The sampler tells you where a career stands. The Career Value Guide is how you act on it — whether your kid is still choosing a path or already on one: all six factors scored and explained, the sub-tracks that split a field in two, the three-year trend, every source, and a version written directly to the student. It's how you make one of your family's biggest bets on evidence, not a hunch.\n\n` +
    `YOUR SUBSCRIBER OFFER: ${discountLabel} any pack with code ${code}. Expires in ${expiresDays} days.\n${buyUrl}\n\n` +
    `Either way, I hope the PDF helps. Reply any time — I read every one.\n— ${SITE.founder}, founder, Pivotum`;

  return { html, text };
}
