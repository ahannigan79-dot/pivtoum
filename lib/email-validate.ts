import { resolveMx } from "node:dns/promises";

/**
 * Lightweight email deliverability gate for the /map capture. The score reveals
 * on-screen the instant they submit, so a throwaway address would still peek —
 * but the collectible payload (the 28-career PDF, the Community guide, the
 * nurture sequence) lands in the inbox, so we require an address that can
 * actually receive it. Two cheap checks, both ~sub-100ms, no user friction:
 * block known disposable domains, and confirm the domain has MX records.
 */

/** Common throwaway / disposable-inbox domains. Not exhaustive — a pragmatic
 *  blocklist that catches the bulk of "just let me peek" signups. */
const DISPOSABLE = new Set<string>([
  "mailinator.com", "guerrillamail.com", "guerrillamail.info", "grr.la", "sharklasers.com",
  "10minutemail.com", "10minutemail.net", "tempmail.com", "temp-mail.org", "tempmailo.com",
  "yopmail.com", "yopmail.fr", "throwawaymail.com", "getnada.com", "nada.email",
  "trashmail.com", "trashmail.de", "mailnesia.com", "maildrop.cc", "dispostable.com",
  "fakeinbox.com", "fakemailgenerator.com", "mohmal.com", "emailondeck.com", "spamgourmet.com",
  "mytemp.email", "tempr.email", "mail-temp.com", "moakt.com", "tmpmail.org", "tmpmail.net",
  "1secmail.com", "1secmail.org", "1secmail.net", "burnermail.io", "mailsac.com",
  "temp-mail.io", "luxusmail.org", "inboxkitten.com", "test.com", "example.com", "email.com",
]);

export function isDisposableDomain(domain: string): boolean {
  return DISPOSABLE.has(domain.toLowerCase());
}

export type EmailVerdict = { ok: true } | { ok: false; reason: "format" | "disposable" | "undeliverable" };

/** Verdict on whether an address is worth revealing to. Format → disposable →
 *  MX. MX lookup failures that look transient (DNS error) pass, so a flaky
 *  resolver never blocks a real signup; only a clean "no MX records" rejects. */
export async function verifyEmail(email: string): Promise<EmailVerdict> {
  const trimmed = (email ?? "").trim().toLowerCase();
  const m = /^[^@\s]+@([^@\s]+\.[^@\s]+)$/.exec(trimmed);
  if (!m) return { ok: false, reason: "format" };
  const domain = m[1];
  if (isDisposableDomain(domain)) return { ok: false, reason: "disposable" };
  try {
    const mx = await resolveMx(domain);
    if (!mx || mx.length === 0) return { ok: false, reason: "undeliverable" };
  } catch (err) {
    // ENOTFOUND / ENODATA = the domain can't receive mail → reject. Any other
    // error (timeout, SERVFAIL) is treated as transient → let it through.
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code === "ENOTFOUND" || code === "ENODATA") return { ok: false, reason: "undeliverable" };
  }
  return { ok: true };
}
