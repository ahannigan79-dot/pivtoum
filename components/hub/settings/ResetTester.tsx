"use client";

/** Founder-only "reset to new user" button — confirms before firing the
 *  server action, so a stray click can't wipe onboarding state. */
export function ResetTester({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Reset your account to a brand-new member?\n\nThis clears YOUR Map, moves, pod, learn progress and credentials so you can re-run the guided onboarding. It only affects you.")) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="btn btn-ghost">Reset me to a new user →</button>
    </form>
  );
}
