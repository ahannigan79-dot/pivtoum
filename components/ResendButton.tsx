"use client";

import { useState } from "react";

export function ResendButton({ token }: { token: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function resend() {
    setStatus("sending");
    const res = await fetch("/api/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    setStatus(res.ok ? "done" : "error");
  }

  if (status === "done") return <span className="claim-note">Re-sent. Check your inbox.</span>;
  return (
    <button className="claim-submit" onClick={resend} disabled={status === "sending"}>
      {status === "sending" ? "Sending…" : "Re-send my download links"}
    </button>
  );
}
