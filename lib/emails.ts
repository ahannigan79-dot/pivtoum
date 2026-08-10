import { SITE } from "@/lib/site";

/**
 * Branded purchase-delivery email. Table-based, inline styles, web-safe fonts
 * (Georgia for reading, Arial for labels) to survive email clients. Returns both
 * an HTML and a plain-text part.
 */
export function purchaseEmail(
  items: { name: string; parentUrl: string; studentUrl: string }[],
  token: string,
) {
  const ink = "#211E1B";
  const inkSoft = "#57534D";
  const pencil = "#8C857A";
  const rule = "#E7E4DC";
  const pen = "#AC3A34";

  const link = (url: string, label: string) =>
    `<a href="${url}" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:.04em;text-transform:uppercase;color:${pen};text-decoration:none;white-space:nowrap;">${label} &rarr;</a>`;

  const rows = items
    .map(
      (it) => `
      <tr><td style="padding:14px 0;border-bottom:1px solid ${rule};">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:17px;color:${ink};margin-bottom:6px;">${it.name}</div>
        <div>${link(it.parentUrl, "Full guide")}<span style="color:${rule};padding:0 10px;">|</span>${link(it.studentUrl, "Student version")}</div>
      </td></tr>`,
    )
    .join("");

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#FEFEFC;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FEFEFC;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid ${rule};border-radius:4px;">
        <tr><td style="padding:34px 36px 26px;">
          <img src="${SITE.url}/brand/wordmark.png" alt="Pivotum" width="150" style="display:block;border:0;height:auto;outline:none;text-decoration:none;" />
          <span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Pivotum</span>

          <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:.12em;text-transform:uppercase;color:${pencil};margin:24px 0 6px;">Your Career Value Guides &middot; Fall 2026</div>
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:25px;color:${ink};margin:0 0 16px;">Your Career Value Guides are ready</div>

          <p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:${ink};margin:0 0 18px;">Thanks for your purchase. Your download links are valid for <strong>7 days</strong>.</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1.5px solid ${ink};margin:0 0 20px;">
            ${rows}
          </table>

          <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;line-height:1.6;color:${inkSoft};margin:0 0 12px;">Each includes a short version written directly to the student and the technical scoring appendix. Your <strong>Spring 2027</strong> updates are included &mdash; we&rsquo;ll email them when they publish.</p>
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
      .map(
        (it) =>
          `• ${it.name}\n    Full guide:      ${it.parentUrl}\n    Student version: ${it.studentUrl}`,
      )
      .join("\n\n") +
    `\n\nEach includes a short version written directly to the student and the technical scoring appendix. ` +
    `Your Spring 2027 updates are included — we'll email them when they publish.\n\n` +
    `Re-open your selection page any time: ${SITE.url}/claim/${token}\n\n` +
    `Pivotum — 28 careers, scored the same way.`;

  return { html, text };
}

/**
 * The AI Career Map package email — delivered from the /map capture. Lists the
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
}) {
  const { items, code, discountLabel, expiresDays, buyUrl } = opts;
  const forChild = opts.audience === "child";
  const introLine = forChild
    ? "Thanks for building your kid&rsquo;s map. Everything you picked is below &mdash; the full 28-career index, a short guide written for exactly where they are, and the breakdowns on the careers you chose. Go through it together; the guide ties it together."
    : "Thanks for building your map. Everything you picked is below &mdash; the full 28-career index, a short guide written for exactly where you are, and the breakdowns on the careers you chose. Work through them in order; the guide ties it together.";
  const introText = forChild
    ? "Thanks for building your kid's map. Everything you picked is below — the 28-career index, a short guide written for exactly where they are, and the breakdowns on the careers you chose."
    : "Thanks for building your map. Everything you picked is below — the 28-career index, a short guide written for exactly where you are, and the breakdowns on the careers you chose.";
  const ink = "#211E1B";
  const inkSoft = "#57534D";
  const pencil = "#8C857A";
  const rule = "#E7E4DC";
  const pen = "#AC3A34";
  const hl = "#FFE26E";

  const link = (url: string, label: string) =>
    `<a href="${url}" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:.04em;text-transform:uppercase;color:${pen};text-decoration:none;white-space:nowrap;">${label} &rarr;</a>`;
  const button = (url: string, label: string, bg: string) =>
    `<a href="${url}" style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;letter-spacing:.04em;text-transform:uppercase;color:#ffffff;background:${bg};text-decoration:none;padding:13px 26px;border-radius:3px;">${label}</a>`;

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

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#FEFEFC;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FEFEFC;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid ${rule};border-radius:4px;">
        <tr><td style="padding:34px 36px 26px;">
          <img src="${SITE.url}/brand/wordmark.png" alt="Pivotum" width="150" style="display:block;border:0;height:auto;outline:none;text-decoration:none;" />
          <span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Your AI Career Map, plus ${discountLabel} for subscribers.</span>

          <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:.12em;text-transform:uppercase;color:${pencil};margin:24px 0 6px;">The AI Career Map &middot; Fall 2026</div>
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;color:${ink};margin:0 0 16px;">Your AI Career Map is here</div>

          <p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:${ink};margin:0 0 6px;">${introLine}</p>
          <p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:${ink};margin:0 0 20px;">Because you signed up, I&rsquo;ve also tucked <strong>${discountLabel} the Career Value Guide</strong> in below.</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1.5px solid ${ink};margin:0 0 22px;">
            ${rows}
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${hl};border-radius:4px;margin:4px 0 4px;"><tr><td style="padding:18px 20px;">
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:.1em;text-transform:uppercase;color:${ink};margin:0 0 6px;">Your subscriber offer</div>
            <p style="font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.5;color:${ink};margin:0 0 14px;"><strong>${discountLabel}</strong> any pack with code <strong>${code}</strong>. Expires in ${expiresDays} days.</p>
            <p style="margin:0;">${button(buyUrl, "See the Career Value Guide", pen)}</p>
          </td></tr></table>

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

  const text =
    `Your AI Career Map is here.\n\n` +
    `${introText}\n\n` +
    items.map((it) => `• ${it.name}\n    ${it.url}`).join("\n\n") +
    `\n\nYOUR SUBSCRIBER OFFER: ${discountLabel} any pack with code ${code}. Expires in ${expiresDays} days.\n${buyUrl}\n\n` +
    `I hope the map helps. Reply any time — I read every one.\n— ${SITE.founder}, founder, Pivotum`;

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
  const ink = "#211E1B";
  const inkSoft = "#57534D";
  const pencil = "#8C857A";
  const rule = "#E7E4DC";
  const pen = "#AC3A34";
  const hl = "#FFE26E";

  const button = (url: string, label: string, bg: string) =>
    `<a href="${url}" style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;letter-spacing:.04em;text-transform:uppercase;color:#ffffff;background:${bg};text-decoration:none;padding:13px 26px;border-radius:3px;">${label}</a>`;

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#FEFEFC;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FEFEFC;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid ${rule};border-radius:4px;">
        <tr><td style="padding:34px 36px 26px;">
          <img src="${SITE.url}/brand/wordmark.png" alt="Pivotum" width="150" style="display:block;border:0;height:auto;outline:none;text-decoration:none;" />
          <span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Your free Pivotum PDF, plus ${discountLabel} for subscribers.</span>

          <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:.12em;text-transform:uppercase;color:${pencil};margin:24px 0 6px;">Your free PDF &middot; Fall 2026</div>
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;color:${ink};margin:0 0 16px;">Hi &mdash; I&rsquo;m ${SITE.founder}, I built Pivotum</div>

          <p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:${ink};margin:0 0 14px;">Thanks for signing up. Here&rsquo;s the <strong>${pdfLabel}</strong> you asked for &mdash; and because you did, I&rsquo;ve tucked <strong>${discountLabel} the Career Value Guide</strong> in below (your code&rsquo;s at the bottom, good for ${expiresDays} days).</p>

          <p style="margin:0 0 24px;">${button(pdfUrl, "Download your PDF", ink)}</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${rule};"><tr><td style="padding-top:22px;">
            <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.6;color:${ink};margin:0 0 12px;">I started Pivotum because I work in AI for a living and I&rsquo;m figuring out my own kid&rsquo;s future alongside you. The sampler tells you where a career stands. The <strong>Career Value Guide</strong> is how you act on it &mdash; whether your kid is still choosing a path or already on one: all six factors scored and explained, the sub-tracks that split a field in two (the specialty that&rsquo;s safe versus the one that isn&rsquo;t), the three-year trend, every source, and a version written directly to the student. It&rsquo;s how you make one of your family&rsquo;s biggest bets on evidence, not a hunch.</p>
          </td></tr></table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${hl};border-radius:4px;margin:8px 0 4px;"><tr><td style="padding:18px 20px;">
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:.1em;text-transform:uppercase;color:${ink};margin:0 0 6px;">Your subscriber offer</div>
            <p style="font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.5;color:${ink};margin:0 0 14px;"><strong>${discountLabel}</strong> any pack with code <strong>${code}</strong>. Expires in ${expiresDays} days.</p>
            <p style="margin:0;">${button(buyUrl, "Get the Career Value Guide", pen)}</p>
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
