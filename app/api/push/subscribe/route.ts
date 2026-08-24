import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { saveSubscription, deleteSubscription, pushConfigured } from "@/lib/push";

export const dynamic = "force-dynamic";

/** Save this device's push subscription for the signed-in member. */
export async function POST(req: Request): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!pushConfigured()) return NextResponse.json({ error: "push not configured" }, { status: 503 });
  try {
    const sub = await req.json();
    await saveSubscription(userId, sub);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}

/** Remove this device's subscription. */
export async function DELETE(req: Request): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const { endpoint } = await req.json();
    await deleteSubscription(String(endpoint ?? ""));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}
