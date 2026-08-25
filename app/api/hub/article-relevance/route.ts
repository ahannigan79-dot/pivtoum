import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCurrentPrompt } from "@/lib/ritual";
import { resolvePromptArticle } from "@/lib/brief";
import { getArticleRelevance } from "@/lib/article-relevance";
import { aiConfigured } from "@/lib/ai";

// "Why this week's article matters to your lane" — personalised, grounded in the
// member's Map, cached per (member, article). Derives the current article
// server-side; fetched client-side so generation never blocks the dashboard.
export const maxDuration = 45;

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });
  if (!aiConfigured()) return NextResponse.json({ note: null });

  const prompt = await getCurrentPrompt();
  const note = await getArticleRelevance(userId, resolvePromptArticle(prompt));
  return NextResponse.json({ note });
}
