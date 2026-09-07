import Link from "next/link";
import type { Metadata } from "next";
import "@/app/hub/hub.css";
import { getSharedTransform } from "@/lib/workflow-transform";
import { TransformDocView } from "@/components/hub/build/TransformDocView";
import { AiDisclaimer } from "@/components/legal/AiDisclaimer";

export const metadata: Metadata = { title: "Workflow transformation — Pivotum", robots: { index: false } };

export default async function SharedTransformPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const shared = await getSharedTransform(token);

  if (!shared) {
    return (
      <main className="hub wtshare">
        <div className="wtshare-wrap">
          <p className="wtshare-brand">Pivotum</p>
          <div className="wtshare-gone">
            <h1>This link isn&rsquo;t available</h1>
            <p>The person who shared it may have turned sharing off, or the link is wrong. Ask them for a fresh link.</p>
            <Link href="/" className="wtshare-cta">About Pivotum →</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="hub wtshare">
      <div className="wtshare-wrap">
        <div className="wtshare-top">
          <p className="wtshare-brand">Pivotum</p>
          <span className="wtshare-tag">Shared workflow transformation</span>
        </div>
        <TransformDocView title={shared.title} doc={shared.doc} when={shared.when} />
        <AiDisclaimer variant="full" />
        <div className="wtshare-foot">
          <p>Rebuilt with <b>Pivotum</b> — Winning in the Age of AI. Shared by its author, who owns it.</p>
          <Link href="/" className="wtshare-cta">See how it works →</Link>
          <p className="wtshare-legal" style={{ marginTop: "0.6rem", fontSize: "0.75rem", opacity: 0.75 }}>
            <Link href="/terms">Terms</Link> · <Link href="/privacy">Privacy</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
