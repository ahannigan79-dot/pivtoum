import { SITE } from "@/lib/site";

/* Branded, table-based, inline-styled emails for the community lifecycle —
   built to survive email clients (Georgia for reading, Arial for labels).
   Light ground with a green accent to match "Winning in the Age of AI". */

const ink = "#1C1A15";
const inkSoft = "#57534D";
const pencil = "#8C857A";
const rule = "#E7E4DC";
const green = "#2E7D4E";
const bg = "#F6F4EE";

const abs = (href: string) => (href.startsWith("http") ? href : `${SITE.url}${href}`);
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const manageUrl = `${SITE.url}/hub/settings`;

function shell(preheader: string, inner: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:${bg};">
  <span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${esc(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bg};">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid ${rule};border-radius:6px;">
        <tr><td style="padding:30px 34px 8px;">
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:bold;letter-spacing:.16em;text-transform:uppercase;color:${green};margin:0 0 3px;">${esc(SITE.communityName)}</div>
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:${pencil};">Pivotum · Your community</div>
        </td></tr>
        <tr><td style="padding:14px 34px 26px;">${inner}</td></tr>
        <tr><td style="padding:16px 34px 24px;border-top:1px solid ${rule};">
          <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.7;color:${pencil};margin:0;">
            You're getting this because you're a member of ${esc(SITE.communityName)}.
            <a href="${manageUrl}" style="color:${pencil};text-decoration:underline;">Manage email preferences</a>.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
  </body></html>`;
}

function button(href: string, label: string): string {
  return `<a href="${abs(href)}" style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;letter-spacing:.04em;color:#ffffff;background:${green};text-decoration:none;padding:12px 24px;border-radius:4px;">${esc(label)} &rarr;</a>`;
}

/** A single high-signal event (reply / DM / report). */
export function notificationEmail(opts: {
  actorName?: string; title: string; preview?: string; href: string; cta: string;
}): { subject: string; html: string; text: string } {
  const who = opts.actorName ? `${opts.actorName} ` : "";
  const subject = `${who}${opts.title}`.trim();
  const previewBlock = opts.preview
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;"><tr><td style="padding:14px 16px;background:${bg};border-left:3px solid ${green};border-radius:0 4px 4px 0;">
        <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.55;color:${ink};margin:0;">${esc(opts.preview)}</p></td></tr></table>`
    : "";
  const inner = `
    <p style="font-family:Georgia,'Times New Roman',serif;font-size:19px;line-height:1.4;color:${ink};margin:0 0 16px;">
      ${opts.actorName ? `<strong>${esc(opts.actorName)}</strong> ` : ""}${esc(opts.title)}.
    </p>
    ${previewBlock}
    <p style="margin:6px 0 0;">${button(opts.href, opts.cta)}</p>`;
  const text = `${subject}\n\n${opts.preview ? `"${opts.preview}"\n\n` : ""}${opts.cta}: ${abs(opts.href)}\n\n— ${SITE.communityName}\nManage email preferences: ${manageUrl}`;
  return { subject, html: shell(subject, inner), text };
}

/** The weekly digest / re-engagement email. */
export function digestEmail(opts: {
  name: string;
  updates: { line: string; href: string }[];
  events: { title: string; when: string; href: string }[];
  rescoreDue: boolean;
  dormant: boolean;
  prompt?: { title: string; body: string } | null;
}): { subject: string; html: string; text: string } {
  const first = opts.name.split(" ")[0] || "there";
  const subject = opts.dormant
    ? `${first}, your community is moving — here's what you missed`
    : `Your week in ${SITE.communityName}`;

  const intro = opts.dormant
    ? `It's been a little while. Here's what's been happening while you were away — jump back in anywhere.`
    : `Here's what's waiting for you and what's coming up this week.`;

  const sect = (label: string, rowsHtml: string) => rowsHtml
    ? `<div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:.12em;text-transform:uppercase;color:${pencil};margin:22px 0 8px;">${label}</div>${rowsHtml}`
    : "";

  const updateRows = opts.updates.slice(0, 6).map((u) =>
    `<tr><td style="padding:9px 0;border-bottom:1px solid ${rule};">
      <a href="${abs(u.href)}" style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.5;color:${ink};text-decoration:none;">${esc(u.line)}</a>
    </td></tr>`).join("");
  const updatesBlock = updateRows
    ? sect("Waiting for you", `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1.5px solid ${ink};">${updateRows}</table>`)
    : "";

  const eventRows = opts.events.slice(0, 4).map((e) =>
    `<tr><td style="padding:9px 0;border-bottom:1px solid ${rule};">
      <a href="${abs(e.href)}" style="text-decoration:none;">
        <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:.04em;text-transform:uppercase;color:${green};">${esc(e.when)}</span><br/>
        <span style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:${ink};">${esc(e.title)}</span>
      </a>
    </td></tr>`).join("");
  const eventsBlock = eventRows
    ? sect("This week", `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1.5px solid ${ink};">${eventRows}</table>`)
    : "";

  const promptBlock = opts.prompt
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 0;"><tr><td style="padding:16px 18px;background:#EEF5EF;border:1px solid #D3E5D8;border-radius:6px;">
        <div style="font-family:Arial;font-size:10px;font-weight:bold;letter-spacing:.12em;text-transform:uppercase;color:${green};margin:0 0 6px;">This week's prompt</div>
        <p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.5;color:${ink};margin:0 0 6px;"><strong>${esc(opts.prompt.title)}</strong></p>
        <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;line-height:1.55;color:${inkSoft};margin:0 0 12px;">${esc(opts.prompt.body)}</p>
        ${button("/hub/community", "Share your answer")}</td></tr></table>`
    : "";

  const rescoreBlock = opts.rescoreDue
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 0;"><tr><td style="padding:16px 18px;background:${bg};border-radius:6px;">
        <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.55;color:${ink};margin:0 0 12px;"><strong>Your Map is due for a re-score.</strong> The field moves every couple of months — take two minutes to keep your exposure honest.</p>
        ${button("/hub/map", "Re-score your Map")}</td></tr></table>`
    : "";

  const inner = `
    <p style="font-family:Georgia,'Times New Roman',serif;font-size:19px;line-height:1.4;color:${ink};margin:0 0 6px;">Hi ${esc(first)},</p>
    <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.6;color:${inkSoft};margin:0 0 4px;">${intro}</p>
    ${promptBlock}
    ${updatesBlock}
    ${eventsBlock}
    ${rescoreBlock}
    <p style="margin:26px 0 0;">${button("/hub", "Open your community")}</p>`;

  const textParts = [
    `Hi ${first},`, intro, "",
    ...(opts.prompt ? [`THIS WEEK'S PROMPT: ${opts.prompt.title}`, opts.prompt.body, `Share your answer: ${abs("/hub/community")}`, ""] : []),
    ...(opts.updates.length ? ["WAITING FOR YOU:", ...opts.updates.slice(0, 6).map((u) => `• ${u.line} — ${abs(u.href)}`), ""] : []),
    ...(opts.events.length ? ["THIS WEEK:", ...opts.events.slice(0, 4).map((e) => `• ${e.when} — ${e.title} — ${abs(e.href)}`), ""] : []),
    ...(opts.rescoreDue ? ["Your Map is due for a re-score: " + abs("/hub/map"), ""] : []),
    `Open your community: ${abs("/hub")}`, "",
    `— ${SITE.communityName}`, `Manage email preferences: ${manageUrl}`,
  ];
  return { subject, html: shell(intro, inner), text: textParts.join("\n") };
}
