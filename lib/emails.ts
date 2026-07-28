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
  const yellow = "#FFE26A";

  const link = (url: string, label: string) =>
    `<a href="${url}" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:.04em;text-transform:uppercase;color:${pen};text-decoration:none;white-space:nowrap;">${label} &rarr;</a>`;

  const rows = items
    .map(
      (it) => `
      <tr><td style="padding:14px 0;border-bottom:1px solid ${rule};">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:17px;color:${ink};margin-bottom:6px;">${it.name}</div>
        <div>${link(it.parentUrl, "Full profile")}<span style="color:${rule};padding:0 10px;">|</span>${link(it.studentUrl, "Student version")}</div>
      </td></tr>`,
    )
    .join("");

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#FEFEFC;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FEFEFC;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid ${rule};border-radius:4px;">
        <tr><td style="padding:34px 36px 26px;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:bold;color:${ink};letter-spacing:-.01em;">Pivotum</div>
          <div style="height:7px;width:82px;background:${yellow};margin-top:-4px;border-radius:1px;"></div>

          <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:.12em;text-transform:uppercase;color:${pencil};margin:24px 0 6px;">Your profiles &middot; Fall 2026</div>
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:25px;color:${ink};margin:0 0 16px;">Your profiles are ready</div>

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
    `Your Pivotum profiles are ready — download links valid for 7 days:\n\n` +
    items
      .map(
        (it) =>
          `• ${it.name}\n    Full profile:    ${it.parentUrl}\n    Student version: ${it.studentUrl}`,
      )
      .join("\n\n") +
    `\n\nEach includes a short version written directly to the student and the technical scoring appendix. ` +
    `Your Spring 2027 updates are included — we'll email them when they publish.\n\n` +
    `Re-open your selection page any time: ${SITE.url}/claim/${token}\n\n` +
    `Pivotum — 28 careers, scored the same way.`;

  return { html, text };
}
