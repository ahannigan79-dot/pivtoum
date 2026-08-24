import { Resend } from "resend";

/**
 * Best-effort transactional send, centralising the Resend pattern used across
 * the funnel routes. No-ops (returns false) when email isn't configured, and
 * never throws — callers treat delivery as best-effort.
 */
export async function sendMail(opts: { to: string; subject: string; html: string; text: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from || !opts.to) return false;
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({ from, ...opts });
    if (error) { console.error("[mail]", opts.subject, error); return false; }
    return true;
  } catch (err) {
    console.error("[mail] threw", opts.subject, String(err));
    return false;
  }
}

export function mailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}
