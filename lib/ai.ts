import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * The single Claude entry point for the app. Server-only, best-effort: every
 * helper returns null on any failure and never throws — callers treat AI output
 * as an enhancement, never a dependency (mirrors lib/mailer.ts).
 *
 * The rule everywhere Claude is used in Pivotum: we compute the facts in code
 * (exposure scores, bands, strategy, grading) and hand them to Claude to
 * explain, personalise, and coach around — never to re-derive. Prompts state the
 * numbers as given and forbid recomputing them.
 */

// Opus for reasoning/voice; Haiku for cheap, mechanical passes.
const OPUS = "claude-opus-5";
const HAIKU = "claude-haiku-4-5";

export function aiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let _client: Anthropic | null = null;
function client(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  if (!_client) _client = new Anthropic({ apiKey });
  return _client;
}

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type CompleteOpts = {
  /** Stable prefix — the framework/voice/methodology. Prompt-cached by default. */
  system: string;
  messages: ChatTurn[];
  maxTokens?: number;
  /** Adaptive extended thinking — default on (turn off for trivial jobs). */
  thinking?: boolean;
  model?: "opus" | "haiku";
  /** Cache the system prefix so repeat calls are cheap+fast. Default true. */
  cacheSystem?: boolean;
};

/** Non-streaming text completion. Returns the assistant text, or null on failure. */
export async function complete(opts: CompleteOpts): Promise<string | null> {
  const c = client();
  if (!c) return null;
  const thinking = opts.thinking ?? true;
  const cacheSystem = opts.cacheSystem ?? true;
  const model = opts.model === "haiku" ? HAIKU : OPUS;

  const system: Anthropic.TextBlockParam[] = [
    { type: "text", text: opts.system, ...(cacheSystem ? { cache_control: { type: "ephemeral" } } : {}) },
  ];

  try {
    const res = await c.messages.create({
      model,
      max_tokens: opts.maxTokens ?? 1400,
      system,
      ...(thinking ? { thinking: { type: "adaptive" } } : {}),
      messages: opts.messages.map((m) => ({ role: m.role, content: m.content })),
    });
    if (process.env.NODE_ENV !== "production") {
      const u = res.usage;
      console.info("[ai]", model, "in", u.input_tokens, "out", u.output_tokens,
        "cache_read", u.cache_read_input_tokens ?? 0);
    }
    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    return text || null;
  } catch (err) {
    console.error("[ai] complete threw", String(err));
    return null;
  }
}

/**
 * Completion with Anthropic's server-side web search (the searching runs on
 * Anthropic's infra, not ours). Streams to the final message so long reports
 * don't hit request timeouts. Opus only. Returns the assistant text, or null.
 */
export async function completeWithSearch(opts: {
  system: string;
  messages: ChatTurn[];
  maxTokens?: number;
  maxSearches?: number;
}): Promise<string | null> {
  const c = client();
  if (!c) return null;
  try {
    const stream = c.messages.stream({
      model: OPUS,
      max_tokens: opts.maxTokens ?? 8000,
      thinking: { type: "adaptive" },
      system: [{ type: "text", text: opts.system, cache_control: { type: "ephemeral" } }],
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: opts.maxSearches ?? 8 }],
      messages: opts.messages.map((m) => ({ role: m.role, content: m.content })),
    });
    const msg = await stream.finalMessage();
    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    return text || null;
  } catch (err) {
    console.error("[ai] completeWithSearch threw", String(err));
    return null;
  }
}

/** Completion that expects JSON — parses the model's output. Null on any failure. */
export async function completeJSON<T>(opts: CompleteOpts): Promise<T | null> {
  const raw = await complete(opts);
  if (!raw) return null;
  return parseJSON<T>(raw);
}

/** Tolerant JSON extraction: handles ```json fences and leading/trailing prose. */
export function parseJSON<T>(raw: string): T | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = (fenced ? fenced[1] : raw).trim();
  try {
    return JSON.parse(body) as T;
  } catch {
    // Fall back to the outermost {...} or [...] span.
    for (const [open, close] of [["{", "}"], ["[", "]"]] as const) {
      const s = body.indexOf(open);
      const e = body.lastIndexOf(close);
      if (s >= 0 && e > s) {
        try {
          return JSON.parse(body.slice(s, e + 1)) as T;
        } catch {
          /* keep trying */
        }
      }
    }
    return null;
  }
}
