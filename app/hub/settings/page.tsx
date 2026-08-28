import { SignOutButton } from "@clerk/nextjs";
import { getOrCreateProfile } from "@/lib/member";
import { updateEmailPrefs } from "./actions";
import { PrefsForm } from "@/components/hub/settings/PrefsForm";
import { PushToggle } from "@/components/hub/settings/PushToggle";

export const metadata = { title: "Settings — Winning in the Age of AI" };

export default async function SettingsPage() {
  const profile = await getOrCreateProfile();

  return (
    <>
      <div className="hub-top"><h1>Settings</h1><span className="sp" /></div>
      <div className="hub-body" style={{ maxWidth: 640 }}>
        <div className="hub-sectlabel">Email</div>
        <p className="settings-lead">Choose what lands in your inbox. Everything still shows up in the app under the 🔔 bell either way.</p>
        <PrefsForm
          action={updateEmailPrefs}
          initial={{
            emailInstant: profile?.emailInstant ?? true,
            emailDigest: profile?.emailDigest ?? true,
            dmPrivacy: (profile?.dmPrivacy as "all" | "pods" | "none") ?? "all",
            showMap: profile?.showMap ?? true,
          }}
          email={profile?.email ?? ""}
        />

        <div className="hub-sectlabel" style={{ marginTop: 26 }}>On this device</div>
        <div className="prefs">
          <PushToggle />
        </div>

        <div className="hub-sectlabel" style={{ marginTop: 26 }}>Session</div>
        <p className="settings-lead">
          Sign out to see the site as a logged-out visitor — the trial gate and the marketing funnel.
          You&rsquo;ll land back on the homepage; from there any &ldquo;Start your free trial&rdquo; link takes you to
          the sign-in page.
        </p>
        <SignOutButton>
          <button type="button" className="settings-signout">Sign out &rarr;</button>
        </SignOutButton>
      </div>
    </>
  );
}
