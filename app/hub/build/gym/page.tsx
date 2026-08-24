import Link from "next/link";
export const metadata = { title: "Judgment Gym — Pivotum" };

export default function GymLanding() {
  return (
    <>
      <div className="hub-top"><h1>Judgment Gym</h1><span className="sp" /></div>
      <div className="hub-body">
        <p className="hub-lead">
          Pick a rep. The AI hands you polished work with something <b>subtly wrong</b> — judge it at speed,
          then get scored on what you caught and missed. The full Gym rotates fresh scenarios; more careers coming.
        </p>
        <div className="hub-grid">
          <Link href="/hub/build/gym/marketing" className="card">
            <p className="ck">🥊 Rep</p>
            <h3>Marketing</h3>
            <p>Judge an AI-built paid campaign against the brief — targeting, budget, claims, creative.</p>
          </Link>
          <Link href="/hub/build/gym/nursing" className="card">
            <p className="ck">🥊 Rep</p>
            <h3>Nursing</h3>
            <p>Sign off an AI-drafted patient handover against the chart — meds, obs, falls, escalation.</p>
          </Link>
        </div>
      </div>
    </>
  );
}
