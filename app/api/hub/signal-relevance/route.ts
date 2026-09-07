import { NextResponse } from "next/server";
import { memberSignals } from "@/lib/signals";
import { getArticleRelevance } from "@/lib/article-relevance";
import { requireMember } from "@/lib/gate";
import { aiConfigured } from "@/lib/ai";

// "Why this matters to you" for the top signal on the dashboard. One cached call
// per member (keyed by the article URL), fetched client-side so it never blocks
// the dashboard render. Only the lead pick is personalised — cost stays bounded.
export const maxDuration = 30;

export async function GET() {
  const userId = await requireMember();
  if (!userId) return NextResponse.json({ note: null });
  if (!aiConfigured()) return NextResponse.json({ note: null });

  const sig = await memberSignals(userId, 5);
  const top = sig?.items[0];
  if (!top) return NextResponse.json({ note: null });

  const note = await getArticleRelevance(userId, {
    key: top.url, title: top.title, description: top.summary, url: top.url, external: true,
  });
  return NextResponse.json({ note: note ?? null });
}
