import Link from "next/link";

export const metadata = { title: "Build — Pivotum" };

export default function BuildPage() {
  return (
    <>
      <div className="hub-top"><h1>Build</h1><span className="sp" /></div>
      <div className="hub-body">
        <p className="hub-lead">
          Your Map says where you stand and prescribes your mix. <b>Build is where you do the work</b> —
          renovate (master the machine, train your judgment) and, where you need it, relocate to protected ground.
        </p>

        <div className="hub-sectlabel">◆ Renovate — master the machine</div>
        <div className="hub-grid">
          <Link href="/hub/build/rebuild" className="card">
            <p className="ck">🔧 Workflow Rebuild</p>
            <h3>Your job, rebuilt AI-native</h3>
            <p>See a core workflow in your field done today vs rebuilt with AI — and the five moves that turn it into your own climb.</p>
          </Link>
          <Link href="/hub/build/operator" className="card">
            <p className="ck">🎯 The Operator</p>
            <h3>Become the operator</h3>
            <p>What judgment in the age of AI really is, why it&apos;s different, and the Operator Track that trains it.</p>
          </Link>
          <Link href="/hub/build/gym" className="card">
            <p className="ck">🥊 Judgment Gym</p>
            <h3>Train your judgment</h3>
            <p>The AI hands you polished work — some subtly wrong. Judge it at speed, then get scored. Return weekly.</p>
          </Link>
        </div>

        <div className="hub-sectlabel">✦ Relocate or Guard — protected ground</div>
        <div className="hub-grid">
          <Link href="/hub/build/protected-ground" className="card">
            <p className="ck">🛡 Protected Ground</p>
            <h3>Where the protected ground is</h3>
            <p>Understand what protects you, shift to a safer lane in your field, or watch whether your moat is holding.</p>
          </Link>
        </div>
      </div>
    </>
  );
}
