import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Nurture email HTML for the two Career Map flows (planning + already-in),
 * matching the branded transactional emails. Paste each file's contents into the
 * matching Resend automation step. Resend merge tags:
 *   {{{contact.promo_code|FOUNDING10}}}  — the per-lead discount code
 *   {{{RESEND_UNSUBSCRIBE_URL}}}         — unsubscribe (automations/broadcasts only)
 *
 *   node scripts/emails/generate-nurture.mjs <outdir>
 */
const URL = "https://pivotum.ai";
const FOUNDER = "Adam";
const ADDRESS = "8063 Challis Rd. #1078, Brighton, MI 48116";
const ink = "#211E1B", inkSoft = "#57534D", pencil = "#8C857A", rule = "#E7E4DC", pen = "#AC3A34", hl = "#FFE26E";

const button = (label, url = `${URL}/buy`, bg = ink) =>
  `<a href="${url}" style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;letter-spacing:.04em;text-transform:uppercase;color:#ffffff;background:${bg};text-decoration:none;padding:13px 26px;border-radius:3px;">${label} &rarr;</a>`;

const offerBox = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${hl};border-radius:4px;margin:6px 0;"><tr><td style="padding:18px 20px;">
  <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:.1em;text-transform:uppercase;color:${ink};margin:0 0 6px;">Founding Subscriber Discount</div>
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.5;color:${ink};margin:0 0 14px;"><strong>10% off</strong> any pack with code <strong>{{{contact.promo_code|FOUNDING10}}}</strong>. Expires in 7 days.</p>
  <p style="margin:0;">${button("Get the Career Value Guide", `${URL}/buy`, pen)}</p>
</td></tr></table>`;

const p = (t) => `<p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:${ink};margin:0 0 16px;">${t}</p>`;
const signoff = `<p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.6;color:${inkSoft};margin:6px 0 0;">&mdash; ${FOUNDER}, founder, Pivotum</p>`;
const cta = (label) => `<p style="margin:0 0 20px;">${button(label)}</p>`;

function shell({ kicker, heading, preview, body }) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#FEFEFC;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FEFEFC;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid ${rule};border-radius:4px;">
        <tr><td style="padding:34px 36px 26px;">
          <img src="${URL}/brand/wordmark.png" alt="Pivotum" width="150" style="display:block;border:0;height:auto;outline:none;text-decoration:none;" />
          <span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preview}</span>
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:.12em;text-transform:uppercase;color:${pencil};margin:24px 0 6px;">${kicker}</div>
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.2;color:${ink};margin:0 0 16px;">${heading}</div>
          ${body}
        </td></tr>
        <tr><td style="padding:18px 36px 26px;border-top:1px solid ${rule};">
          <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.7;color:${pencil};margin:0 0 8px;">You're getting this because you built a Career Map at pivotum.ai. <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:${pencil};">Unsubscribe</a> any time.</p>
          <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.7;color:${pencil};margin:0;">Pivotum · ${ADDRESS}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
  </body></html>`;
}

const CONTENT = {
  planning: {
    letter: {
      subject: "The part the free reads leave out",
      preview: "You've got the scores. Here's what they can't decide for you.",
      kicker: "The Career Map · A note from Adam",
      heading: "The part the free reads leave out",
      body:
        p("Hi &mdash; it's Adam. You built your Career Map a couple of days ago, so you've got the 28-career index, the framework, and a free read on the careers you're weighing. Here's what those free reads deliberately stop short of.") +
        p("They show you <em>where</em> a career splits &mdash; the safe side and the exposed side. What they can't tell you is the part that actually decides it: which side your kid ends up on, how durable that safe side really is as AI keeps moving, and which specific programme delivers it.") +
        p("That's the <strong>Career Value Guide</strong>. For the one or two careers your family is seriously weighing, it's every sub-track scored, the honest downsides no admissions page lists, the routes in, and a version written directly to your kid &mdash; the difference between hoping you're right and knowing why.") +
        cta("See the Career Value Guide") +
        p("Reply any time &mdash; I read every one.") + signoff,
    },
    offer: {
      subject: "Your Founding Subscriber Discount (10% off)",
      preview: "10% off the Career Value Guide — for one of our first readers.",
      kicker: "The Career Map · Founding Subscriber Discount",
      heading: "A founding-reader thank-you: 10% off",
      body:
        p("Because you're one of the first families here, your Career Value Guide comes with a <strong>Founding Subscriber Discount</strong>.") +
        p("For the one or two careers you're seriously weighing, the Guide is how you decide on evidence, not a hunch. And <strong>this edition and the next are both included</strong> &mdash; we re-score every six months, so it stays current for a full year.") +
        offerBox +
        p("Reply if you'd like a hand choosing which careers to start with.") + signoff,
    },
    lastcall: {
      subject: "Last call on your founding discount",
      preview: "Your Founding Subscriber Discount expires soon.",
      kicker: "The Career Map",
      heading: "Last call on your founding discount",
      body:
        p("Quick one &mdash; your <strong>Founding Subscriber Discount</strong> is about to expire. If the careers on your family's shortlist still feel unresolved, this is the moment to get the Career Value Guide at the founding price and settle it.") +
        offerBox + signoff,
    },
    month1: {
      subject: "A month on — has the picture moved?",
      preview: "The exposure split shifts faster than most families expect.",
      kicker: "The Career Map · A note from Adam",
      heading: "A month on — has the picture moved?",
      body:
        p("Hi &mdash; it's Adam again. It's been about a month since you built your Career Map, so I wanted to check in.") +
        p("Here's the thing worth knowing: the safe-versus-exposed line inside a career doesn't hold still. In the time since you looked, the tools have moved, and the specialty that looked protected for your kid's shortlist may sit a notch differently now. That's exactly why we re-score every six months rather than writing something once and calling it done.") +
        p("If the decision on your family's two or three careers still feels open, the <strong>Career Value Guide</strong> is the current read &mdash; every sub-track scored, the honest downsides, and the routes in, with this edition and the next both included. Your founding code is still on your account whenever you're ready.") +
        cta("See the Career Value Guide") +
        p("And if now isn't the moment, no rush &mdash; reply and tell me where your thinking's landed. I read every one.") + signoff,
    },
    final: {
      subject: "Last note from me — then just the quarterly read",
      preview: "No more nudges. Steering Through Change keeps you current.",
      kicker: "The Career Map",
      heading: "Last note from me",
      body:
        p("This is the last you'll hear from me on the Career Value Guide &mdash; I'd rather leave you to it than keep knocking.") +
        p("You'll still get <strong>Steering Through Change</strong>, our quarterly read on where AI is shifting the ground under careers, so you stay current whether or not you ever buy a thing. And the Guide will be right here the day the decision on your kid's path gets real &mdash; your founding code doesn't disappear.") +
        cta("See the Career Value Guide") +
        p("Thanks for reading this far. It genuinely means a lot in these early days.") + signoff,
    },
  },
  active: {
    letter: {
      subject: "The part the Playbook can't give you",
      preview: "You've got the strategy. Here's the piece specific to your field.",
      kicker: "The Career Map · A note from Adam",
      heading: "The part the Playbook can't give you",
      body:
        p("Hi &mdash; it's Adam. You built your Career Map for someone already in it, so you've got the Playbook &mdash; the six moves &mdash; and a free read on the careers that matter to your family. Here's what the Playbook stops short of.") +
        p("It gives you the <em>strategy</em>: protect the value, steer toward the safe lane. What it can't give you is <em>your field's exact bridge</em> &mdash; which lane your kid is probably in right now, how durable the safe one really is, and the specific steps to get from one to the other.") +
        p("That's the <strong>Career Value Guide</strong>, built for the career rather than the general case: every sub-track scored, the honest downsides, the routes across, and the senior-role targets to start aiming at now.") +
        cta("See the Career Value Guide") +
        p("Reply any time &mdash; I read every one.") + signoff,
    },
    offer: {
      subject: "Your Founding Subscriber Discount (10% off)",
      preview: "10% off the Career Value Guide — for one of our first readers.",
      kicker: "The Career Map · Founding Subscriber Discount",
      heading: "A founding-reader thank-you: 10% off",
      body:
        p("Because you're one of the first families here, your Career Value Guide comes with a <strong>Founding Subscriber Discount</strong>.") +
        p("For the field your kid's already in, the Guide is the specific route the free Playbook points at &mdash; from the exposed lane to the safe one. And <strong>this edition and the next are both included</strong>; we re-score every six months, so it stays current for a full year.") +
        offerBox +
        p("Reply if you want a hand working out which move matters most.") + signoff,
    },
    lastcall: {
      subject: "Last call on your founding discount",
      preview: "Your Founding Subscriber Discount expires soon.",
      kicker: "The Career Map",
      heading: "Last call on your founding discount",
      body:
        p("Quick one &mdash; your <strong>Founding Subscriber Discount</strong> is about to expire. If your kid's next move still feels unclear, this is the moment to get the Career Value Guide at the founding price and draw the route.") +
        offerBox + signoff,
    },
    month1: {
      subject: "A month on — has the ground shifted?",
      preview: "The safe lane in your field doesn't stay put for long.",
      kicker: "The Career Map · A note from Adam",
      heading: "A month on — has the ground shifted?",
      body:
        p("Hi &mdash; it's Adam again. It's been about a month since you built your Career Map for someone already in their field, so I wanted to check in.") +
        p("The reason I'm writing: the lane that's safe inside a field keeps moving. In a month the tools have shifted, and the bridge from the exposed side to the protected one for your kid's field may look different now than it did when you first looked. That's why we re-score every six months rather than freezing a snapshot.") +
        p("If the next move still feels unclear, the <strong>Career Value Guide</strong> is the current route &mdash; every sub-track scored, the honest downsides, and the senior-role targets to aim at now, with this edition and the next both included. Your founding code is still on your account whenever you're ready.") +
        cta("See the Career Value Guide") +
        p("And if now isn't the moment, reply and tell me where things stand &mdash; I read every one.") + signoff,
    },
    final: {
      subject: "Last note from me — then just the quarterly read",
      preview: "No more nudges. Steering Through Change keeps you current.",
      kicker: "The Career Map",
      heading: "Last note from me",
      body:
        p("This is the last you'll hear from me on the Career Value Guide &mdash; I'd rather leave you to it than keep knocking.") +
        p("You'll still get <strong>Steering Through Change</strong>, our quarterly read on where AI is shifting the ground under careers, so you stay current whether or not you ever buy a thing. And the Guide will be right here the day your kid's next move has to be made &mdash; your founding code doesn't disappear.") +
        cta("See the Career Value Guide") +
        p("Thanks for reading this far. It genuinely means a lot in these early days.") + signoff,
    },
  },
};

function main() {
  const [outdir] = process.argv.slice(2);
  const dir = outdir || join(dirname(fileURLToPath(import.meta.url)), "out");
  mkdirSync(dir, { recursive: true });
  const index = [];
  for (const stage of Object.keys(CONTENT)) {
    for (const step of Object.keys(CONTENT[stage])) {
      const c = CONTENT[stage][step];
      const file = `nurture-${stage}-${step}.html`;
      writeFileSync(join(dir, file), shell(c));
      index.push(`${stage.padEnd(9)} ${step.padEnd(9)} subject: ${c.subject}`);
    }
  }
  console.log(`wrote ${index.length} files to ${dir}\n` + index.join("\n"));
}
main();
